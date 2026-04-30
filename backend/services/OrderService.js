const WalletTransaction = require('../models/WalletTransactionModel');
const Product = require('../models/ProductModel');
const Coupon = require('../models/CouponModel');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const Cart = require('../models/CartModel');
const WalletController = require('../controllers/WalletController');
const config = require('../config/config');
const { sendOrderConfirmationEmail, 
        sendOrderCancelledEmail, 
        sendOrderShippedEmail, 
        sendOrderDeliveredEmail } = require('../utils/mailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
});

class OrderService {
    static async createOrder(req, res) {
        let itemsToRollback = [];
        let userEmail = '';
        try {
            const { items, shippingAddress, paymentMethod, subtotal, discount, totalAmount, remainingAmount, walletAmount, appliedCoupons } = req.body;
            const userId = req.userId;

            // 1. Wallet Validation
            let walletAmountToUse = Number(walletAmount) || 0;
            const user = await User.findById(userId).select('walletBalance email');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            userEmail = user.email;

            if (walletAmountToUse > 0) {
                const epsilon = 0.001;
                if (walletAmountToUse > (user.walletBalance + epsilon)) {
                    console.log(`[Order] Insufficient balance. Request: ${walletAmountToUse}, DB: ${user.walletBalance}`);
                    return res.status(400).json({ message: `Insufficient wallet balance. Available: ₹${user.walletBalance.toFixed(2)}` });
                }
                if (walletAmountToUse > (totalAmount + epsilon)) {
                    walletAmountToUse = totalAmount;
                }
            }

            const calcRemainingAmount = (typeof remainingAmount !== 'undefined') ? remainingAmount : (totalAmount - walletAmountToUse);

            const processedItems = [];

            for (const item of items) {
                const product = await Product.findById(item.product);
                if (!product) {
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
                    for (const rb of itemsToRollback) {
                        await Product.findByIdAndUpdate(rb.product, rb.query, rb.opts);
                    }
                    return res.status(400).json({
                        message: `Insufficient stock for ${product.name}${item.selectedVariant ? ` (${item.selectedVariant.name})` : ''}. Available: ${stockAvailable}`
                    });
                }

                let updateQuery = {};
                let options = {};
                if (item.selectedVariant) {
                    updateQuery = { $inc: { 'variants.$[v].stock': -item.quantity } };
                    options = { arrayFilters: [{ 'v.name': item.selectedVariant.name }] };
                } else {
                    updateQuery = { $inc: { stock: -item.quantity } };
                }

                await Product.findByIdAndUpdate(item.product, updateQuery, options);

                itemsToRollback.push({
                    product: item.product,
                    quantity: item.quantity,
                    query: item.selectedVariant ? { $inc: { 'variants.$[v].stock': item.quantity } } : { $inc: { stock: item.quantity } },
                    opts: item.selectedVariant ? { arrayFilters: [{ 'v.name': item.selectedVariant.name }] } : {}
                });

                processedItems.push({
                    ...item,
                    category: product.category || 'Uncategorized'
                });
            }

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

            if (walletAmountToUse > 0) {
                await WalletController.debitWallet(
                    userId,
                    walletAmountToUse,
                    `Used for Order #${order._id.toString()}`,
                    order._id
                );
            }

            if (calcRemainingAmount === 0) {
                order.isPaid = true;
                order.paidAt = new Date();
                order.paymentStatus = 'paid';
                order.paymentMethod = 'wallet';
                order.orderStatus = 'processing';
                await order.save();
                await sendOrderConfirmationEmail(userEmail, order);
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
                if (walletAmountToUse > 0) {
                    order.paymentMethod = `wallet+${paymentMethod.toLowerCase()}`;
                }
                await order.save();
                await sendOrderConfirmationEmail(userEmail, order);

                return res.status(201).json({
                    message: 'Order created',
                    order,
                    razorpayOrderId: rzpOrder.id,
                    amount_paise: options.amount
                });
            } else {
                if (walletAmountToUse > 0) {
                    return res.status(400).json({ message: 'COD is not allowed when using wallet balance' });
                }
                order.orderStatus = 'processing';
                await order.save();
                await sendOrderConfirmationEmail(userEmail, order);
                return res.status(201).json({ message: 'Order placed successfully (COD)', order });
            }
        } catch (error) {
            console.error('Error creating order:', error);

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

            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            const expectedSignature = crypto
                .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: 'Invalid payment signature' });
            }

            const expectedAmount = Math.round(order.remainingAmount * 100);
            const payment = await razorpay.payments.fetch(razorpay_payment_id);

            if (payment.amount !== expectedAmount) {
                return res.status(400).json({ message: 'Payment amount mismatch' });
            }

            order.paymentStatus = 'paid';
            order.razorpayPaymentId = razorpay_payment_id;
            order.isPaid = true;
            order.paidAt = new Date();
            order.orderStatus = 'processing';
            await order.save();
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
                .sort({ createdAt: -1 })
                .lean();
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
                .populate('returnRequest')
                .lean();
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
            const { orderId } = req.params;
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            if (order.orderStatus !== 'processing') {
                return res.status(400).json({ message: 'Order cannot be cancelled' });
            }
            const user = await User.findById(order.user).select('email');
            order.orderStatus = 'cancelled';
            await order.save();
            if (user?.email) {
                await sendOrderCancelledEmail(user.email, order);
            }
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

            const user = await User.findById(order.user).select('email');

            if (orderStatus) {
                order.orderStatus = orderStatus;

                if (orderStatus === 'shipped' && statusDate) {
                    order.shippedAt = new Date(statusDate);
                } else if (orderStatus === 'delivered' && statusDate) {
                    order.deliveredAt = new Date(statusDate);
                }
            } else if (req.body.status) {
                order.orderStatus = req.body.status;
            }

            await order.save();
            if (user?.email) {
                if (orderStatus === 'shipped') {
                    await sendOrderShippedEmail(user.email, order);
                } else if (orderStatus === 'delivered') {
                    await sendOrderDeliveredEmail(user.email, order);
                }
            }
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
                .sort({ createdAt: -1 })
                .lean();
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

            if (order.orderStatus !== 'cancelled') {
                for (const item of order.items) {
                    if (item.selectedVariant && item.selectedVariant.name) {
                        await Product.findByIdAndUpdate(
                            item.product,
                            { $inc: { 'variants.$[v].stock': item.quantity } },
                            { arrayFilters: [{ 'v.name': item.selectedVariant.name }] }
                        );
                    } else {
                        await Product.findByIdAndUpdate(
                            item.product,
                            { $inc: { stock: item.quantity } }
                        );
                    }
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

    static async reorder(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.userId;

            const order = await Order.findById(orderId);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.user.toString() !== userId) return res.status(403).json({ message: 'Unauthorized' });

            let cart = await Cart.findOne({ user: userId });
            if (!cart) {
                cart = new Cart({ user: userId, items: [] });
                await cart.save();
            }

            const addedItems = [];
            const failedItems = [];

            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (!product) {
                    console.log(`[Reorder] Product not found: ${item.product}`);
                    failedItems.push({ name: item.name, reason: 'Product no longer available' });
                    continue;
                }

                let stockAvailable = product.stock;
                let variantInfo = '';
                if (item.selectedVariant && item.selectedVariant.name) {
                    const variant = product.variants.find(v => v.name === item.selectedVariant.name);
                    if (variant) {
                        stockAvailable = variant.stock;
                        variantInfo = ` (${variant.name})`;
                    }
                }

                console.log(`[Reorder] ${product.name}${variantInfo}: requested=${item.quantity}, available=${stockAvailable}`);

                if (stockAvailable < item.quantity) {
                    if (stockAvailable === 0) {
                        failedItems.push({
                            name: product.name,
                            reason: `Out of stock`
                        });
                    } else {
                        failedItems.push({
                            name: product.name,
                            reason: `Only ${stockAvailable} left`
                        });
                    }
                    continue;
                }

                const existingIndex = cart.items.findIndex(
                    ci => ci.product.toString() === item.product.toString() &&
                          JSON.stringify(ci.selectedVariant) === JSON.stringify(item.selectedVariant)
                );

                if (existingIndex >= 0) {
                    const newQuantity = cart.items[existingIndex].quantity + item.quantity;
                    if (newQuantity > stockAvailable) {
                        failedItems.push({
                            name: product.name,
                            reason: `Only ${stockAvailable} available (${cart.items[existingIndex].quantity} already in cart)`
                        });
                        continue;
                    }
                    cart.items[existingIndex].quantity = newQuantity;
                } else {
                    cart.items.push({
                        product: item.product,
                        quantity: item.quantity,
                        selectedVariant: item.selectedVariant
                    });
                }
                addedItems.push(product.name);
            }

            await cart.save();

            let message;
            if (addedItems.length === 0 && failedItems.length > 0) {
                message = 'All items are unavailable';
            } else if (failedItems.length > 0) {
                message = `Added ${addedItems.length} items. ${failedItems.length} unavailable.`;
            } else {
                message = `Added ${addedItems.length} items to cart`;
            }

            res.status(200).json({
                success: addedItems.length > 0,
                message,
                addedItems,
                failedItems: failedItems.length ? failedItems : undefined
            });
        } catch (error) {
            console.error('Error reordering:', error);
            res.status(500).json({ message: 'Failed to reorder' });
        }
    }
}

module.exports = OrderService;
