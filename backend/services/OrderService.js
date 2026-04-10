const WalletTransaction = require('../models/WalletTransactionModel');
const Product = require('../models/ProductModel');
const Coupon = require('../models/CouponModel');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const WalletController = require('../controllers/WalletController');
const config = require('../config/config');
const Razorpay = require('razorpay');
const crypto = require('crypto'); 

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

class OrderService {
    static async createOrder(req, res) {
        try {
            const { items, shippingAddress, paymentMethod, subtotal, discount, totalAmount, remainingAmount, walletAmount, appliedCoupons } = req.body;
            const userId = req.userId;

            // 1. Wallet Validation
            let walletAmountToUse = Number(walletAmount) || 0;
            const user = await User.findById(userId).select('walletBalance email');
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (walletAmountToUse > 0) {
                // Use a small epsilon for float comparison safety
                const epsilon = 0.001; 
                if (walletAmountToUse > (user.walletBalance + epsilon)) {
                console.log(`[Order] Insufficient balance. Request: ${walletAmountToUse}, DB: ${user.walletBalance}`);
                return res.status(400).json({ message: `Insufficient wallet balance. Available: ₹${user.walletBalance.toFixed(2)}` });
                }
                if (walletAmountToUse > (totalAmount + epsilon)) {
                walletAmountToUse = totalAmount; 
                }
            }

            // Use passed remainingAmount or calculate it
            const calcRemainingAmount = (typeof remainingAmount !== 'undefined') ? remainingAmount : (totalAmount - walletAmountToUse);

            // Check stock availability and capture category for all items
            const processedItems = [];
            const itemsToRollback = [];
            
            for (const item of items) {
                const product = await Product.findById(item.product);
                if (!product) {
                    // Rollback any stock changes before returning
                    for (const rb of itemsToRollback) {
                        await Product.findByIdAndUpdate(rb.product, rb.query, rb.opts);
                    }
                    return res.status(404).json({ message: `Product not found: ${item.product}` });
                }
                
                let stockAvailable = product.stock;
                if (item.selectedVariant) {
                    const variant = product.variants.find(v => v.name === item.selectedVariant.name);
                    stockAvailable = variant ? variant.stock : product.stock;
                }

                if (stockAvailable < item.quantity) {
                    // Rollback
                    for (const rb of itemsToRollback) {
                        await Product.findByIdAndUpdate(rb.product, rb.query, rb.opts);
                    }
                    return res.status(400).json({ 
                        message: `Insufficient stock for ${product.name}${item.selectedVariant ? ` (${item.selectedVariant.name})` : ''}. Available: ${stockAvailable}` 
                    });
                }

                // Decrement stock
                let updateQuery = {};
                let options = {};
                if (item.selectedVariant) {
                    updateQuery = { $inc: { 'variants.$[v].stock': -item.quantity } };
                    options = { arrayFilters: [{ 'v.name': item.selectedVariant.name }] };
                } else {
                    updateQuery = { $inc: { stock: -item.quantity } };
                }

                await Product.findByIdAndUpdate(item.product, updateQuery, options);
                
                // Track for rollback
                itemsToRollback.push({
                    product: item.product,
                    quantity: item.quantity,
                    query: item.selectedVariant ? { $inc: { 'variants.$[v].stock': item.quantity } } : { $inc: { stock: item.quantity } },
                    opts: item.selectedVariant ? { arrayFilters: [{ 'v.name': item.selectedVariant.name }] } : {}
                });

                // Prepare processed item for Order doc
                processedItems.push({
                    ...item,
                    category: product.category || 'Uncategorized'
                });
            }

            // Increment coupon usedCount if coupons are applied
            if (appliedCoupons && appliedCoupons.length > 0) {
                for (const couponCode of appliedCoupons) {
                    await Coupon.findOneAndUpdate(
                        { code: couponCode.toUpperCase() },
                        { $inc: { usedCount: 1 } }
                    );
                }
            }

            const order = new Order({
                user: userId,
                items: processedItems,
                shippingAddress,
                paymentMethod,
                subtotal,
                discount,
                totalAmount,
                walletAmountUsed: walletAmountToUse,
                remainingAmount: calcRemainingAmount,
                appliedCoupons: appliedCoupons || [],
                orderStatus: 'pending',
                paymentStatus: 'pending'
            });

            // 2. Handle Wallet Deduction
            if (walletAmountToUse > 0) {
                await WalletController.debitWallet(
                userId,
                walletAmountToUse,
                `Used for Order #${order._id.toString()}`,
                order._id
                );
            }

            // 3. Payment Flow
            if (calcRemainingAmount === 0) {
                // Fully covered by wallet
                order.isPaid = true;
                order.paidAt = new Date();
                order.paymentStatus = 'paid';
                order.paymentMethod = 'wallet';
                order.orderStatus = 'processing';
                await order.save();
                
                return res.status(201).json({
                success: true,
                message: 'Order placed successfully using wallet balance',
                order
                });
            }

            if (paymentMethod === 'Razorpay' || paymentMethod === 'UPI') {
                const options = {
                amount: Math.round(calcRemainingAmount * 100),
                currency: "INR",
                receipt: `receipt_order_${new Date().getTime()}`
                };
                const rzpOrder = await razorpay.orders.create(options);
                order.razorpayOrderId = rzpOrder.id;
                // If wallet was used partially, clarify payment mode
                if (walletAmountToUse > 0) {
                    order.paymentMethod = `wallet+${paymentMethod.toLowerCase()}`;
                }
                await order.save();
                
                return res.status(201).json({
                message: 'Order created',
                order,
                razorpayOrderId: rzpOrder.id,
                amount_paise: options.amount
                });
            } else {
                // COD logic (Only allowed if remainingAmount > 0 and no wallet used - as per business rules)
                if (walletAmountToUse > 0) {
                    return res.status(400).json({ message: 'COD is not allowed when using wallet balance' });
                }
                order.orderStatus = 'processing';
                await order.save();
                return res.status(201).json({ message: 'Order placed successfully (COD)', order });
            }
        } catch (error) {
            console.error('Error creating order:', error);
            
            // Mandatory Rollback if order creation failed after stock was decremented
            if (itemsToRollback && itemsToRollback.length > 0) {
                console.log('[Order Rollback] Restoring stock for failed order placement');
                for (const rollbackItem of itemsToRollback) {
                let rbQuery = {};
                let rbOpts = {};
                if (rollbackItem.selectedVariant) {
                    rbQuery = { $inc: { 'variants.$[v].stock': rollbackItem.quantity } };
                    rbOpts = { arrayFilters: [{ 'v.name': rollbackItem.selectedVariant.name }] };
                } else {
                    rbQuery = { $inc: { stock: rollbackItem.quantity } };
                }
                await Product.findByIdAndUpdate(rollbackItem.product, rbQuery, rbOpts);
                }
            }

            res.status(500).json({ message: error.message || 'Failed to create order' });
        }
    }

    static async verifyPayment(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            const userId = req.userId;

            // 1. Fetch Order using Razorpay Order ID
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // 2. Security: Verify Signature
            const expectedSignature = crypto
                .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: 'Invalid payment signature' });
            }

            // 3. Verify Amount
            const expectedAmount = Math.round(order.remainingAmount * 100);
            const payment = await razorpay.payments.fetch(razorpay_payment_id);

            if (payment.amount !== expectedAmount) {
                return res.status(400).json({ message: 'Payment amount mismatch' });
            }

            // 4. Update Order Status
            order.paymentStatus = 'paid';
            order.razorpayPaymentId = razorpay_payment_id;
            order.isPaid = true;
            order.paidAt = new Date();
            order.orderStatus = 'processing';
            await order.save();

            // 5. Handle Wallet Credit (if applicable)
            if (order.walletAmountUsed > 0) {
                await WalletController.creditWallet(
                    userId,
                    order.walletAmountUsed,
                    `Refund for Order #${order._id.toString()}`,
                    order._id
                );
            }

            return res.status(200).json({ message: 'Payment verified successfully', order });

        } catch (error) {
            console.error('Error verifying payment:', error);
            return res.status(500).json({ message: 'Failed to verify payment' });
        }
    }

    static async getMyOrders(req, res) {
        try {
            const userId = req.userId;
            const orders = await Order.find({ user: userId })
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 });
            return res.status(200).json({ orders });
        } catch (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ message: 'Failed to fetch orders' });
        }
    }

    static async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id)
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .populate('returnRequest');
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            return res.status(200).json({ order });
        } catch (error) {
            console.error('Error fetching order:', error);
            return res.status(500).json({ message: 'Failed to fetch order' });
        }
    }

    static async cancelOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            if (order.orderStatus !== 'pending') {
                return res.status(400).json({ message: 'Order cannot be cancelled' });
            }
            order.orderStatus = 'cancelled';
            await order.save();
            return res.status(200).json({ message: 'Order cancelled successfully', order });
        } catch (error) {
            console.error('Error cancelling order:', error);
            return res.status(500).json({ message: 'Failed to cancel order' });
        }
    }

    static async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { orderStatus, statusDate } = req.body;
            const order = await Order.findById(id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            if (orderStatus) {
                order.orderStatus = orderStatus;
                
                if (orderStatus === 'shipped' && statusDate) {
                    order.shippedAt = new Date(statusDate);
                } else if (orderStatus === 'delivered' && statusDate) {
                    order.deliveredAt = new Date(statusDate);
                    // Ensure isPaid and paidAt are handled realistically if COD delivered? 
                    // Usually paymentStatus might be updated separately, but this is fine.
                }
            } else if (req.body.status) {
                // Fallback if some other place sends 'status'
                order.orderStatus = req.body.status;
            }
            
            await order.save();
            return res.status(200).json({ message: 'Order status updated successfully', order });
        } catch (error) {
            console.error('Error updating order status:', error);
            return res.status(500).json({ message: 'Failed to update order status' });
        }
    }

    static async getOrders(req, res) {
        try {
            const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 });
            return res.status(200).json({ orders });
        } catch (error) {
            console.error('Error fetching orders:', error);
            return res.status(500).json({ message: 'Failed to fetch orders' });
        }
    }

    static async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { paymentStatus } = req.body;
            const order = await Order.findById(id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            order.paymentStatus = paymentStatus;
            await order.save();
            res.status(200).json({ message: 'Payment status updated successfully', order });
        } catch (error) {
            console.error('Error updating payment status:', error);
            return res.status(500).json({ message: 'Error updating payment status' });
        }
    }

    static async failOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findById(id);

            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.paymentStatus === 'paid') {
                return res.status(400).json({ message: 'Cannot fail a paid order' });
            }

            // Restore stock when order fails payment
            if (order.orderStatus !== 'cancelled') {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: item.quantity } }
                    );
                }
            }

            order.paymentStatus = 'failed';
            order.orderStatus = 'cancelled';
            order.cancelReason = 'Payment failed or cancelled by user';
            await order.save();

            res.status(200).json({ message: 'Order marked as failed', order });
        } catch (error) {
            console.error('Error marking order as failed:', error);
            res.status(500).json({ message: 'Failed to update order status' });
        }
    }
}

module.exports = OrderService;