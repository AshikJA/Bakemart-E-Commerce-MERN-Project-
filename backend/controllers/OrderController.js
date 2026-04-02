const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const WalletTransaction = require('../models/WalletTransactionModel');
const Product = require('../models/ProductModel');
const Coupon = require('../models/CouponModel');

const config = require('../config/config');

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

class OrderController {
  
  static async createOrder(req, res) {
    try {
      const { items, shippingAddress, paymentMethod, subtotal, discount, totalAmount, appliedCoupons } = req.body;
      const userId = req.userId;

      // Check stock availability for all items before creating order
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product not found: ${item.product}` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
          });
        }
      }

      // Decrement stock for all items
      for (const item of items) {
        const result = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (result.stock < 0) {
          // Rollback: restore previously decremented stock
          for (const prevItem of items) {
            if (prevItem.product === item.product) break;
            await Product.findByIdAndUpdate(
              prevItem.product,
              { $inc: { stock: prevItem.quantity } }
            );
          }
          return res.status(400).json({ 
            message: `Insufficient stock for ${result.name}` 
          });
        }
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
        items,
        shippingAddress,
        paymentMethod,
        subtotal,
        discount,
        totalAmount,
        appliedCoupons: appliedCoupons || [],
        orderStatus: 'pending',
        paymentStatus: 'pending'
      });

      if (paymentMethod === 'Razorpay' || paymentMethod === 'UPI') {
        const options = {
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          receipt: `receipt_order_${new Date().getTime()}`
        };
        const rzpOrder = await razorpay.orders.create(options);
        order.razorpayOrderId = rzpOrder.id;
        await order.save();
        
        return res.status(201).json({
          message: 'Order created',
          order,
          razorpayOrderId: rzpOrder.id,
          amount_paise: options.amount
        });
      } else {
        order.orderStatus = 'processing';
        await order.save();
        return res.status(201).json({ message: 'Order placed successfully', order });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  }

  static async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', config.RAZORPAY_KEY_SECRET)
                                      .update(body.toString())
                                      .digest('hex');

      if (expectedSignature === razorpay_signature) {
        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        if (order) {
          order.paymentStatus = 'paid';
          order.razorpayPaymentId = razorpay_payment_id;
          order.orderStatus = 'processing';
          await order.save();
          return res.status(200).json({ message: 'Payment verified successfully' });
        }
      }
      
      return res.status(400).json({ message: 'Invalid payment signature' });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ message: 'Payment verification failed' });
    }
  }

  static async getUserOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find({ user: req.userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Order.countDocuments({ user: req.userId })
      ]);

      res.status(200).json({
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders' });
    }
  }

  static async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const order = await Order.findOne({ _id: orderId, user: req.userId });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      if (['shipped', 'delivered', 'cancelled', 'returned'].includes(order.orderStatus)) {
        return res.status(400).json({ message: `Cannot cancel an order that is ${order.orderStatus}` });
      }

      // Restore stock when order is cancelled
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }

      // Process refund to wallet if paid online
      if (order.paymentMethod === 'Razorpay' && order.paymentStatus === 'paid') {
        const user = await User.findById(req.userId);
        user.walletBalance = (user.walletBalance || 0) + order.totalAmount;
        await user.save();

        await WalletTransaction.create({
          user: req.userId,
          amount: order.totalAmount,
          type: 'credit',
          description: `Refund for Cancelled Order: ${order._id}`,
          orderId: order._id
        });
        
        order.paymentStatus = 'refunded';
      }

      order.orderStatus = 'cancelled';
      order.cancelReason = reason;
      await order.save();
      
      res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Failed to cancel order' });
    }
  }

  static async requestReturn(req, res) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const order = await Order.findOne({ _id: orderId, user: req.userId });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      if (order.orderStatus !== 'delivered') {
        return res.status(400).json({ message: 'Only delivered orders can be returned' });
      }

      order.orderStatus = 'returned';
      order.returnReason = reason;
      
      // Restore stock when order is returned
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } }
        );
      }
      
      // Refund to wallet immediately
      if (order.paymentStatus === 'paid') {
        const user = await User.findById(req.userId);
        user.walletBalance = (user.walletBalance || 0) + order.totalAmount;
        await user.save();

        await WalletTransaction.create({
          user: req.userId,
          amount: order.totalAmount,
          type: 'credit',
          description: `Refund for Returned Order: ${order._id}`,
          orderId: order._id
        });
        
        order.paymentStatus = 'refunded';
      }

      await order.save();
      res.status(200).json({ message: 'Return processed and refunded to wallet', order });
    } catch (error) {
      console.error('Error processing return:', error);
      res.status(500).json({ message: 'Failed to process return' });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        Order.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email'),
        Order.countDocuments()
      ]);

      res.status(200).json({
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching all orders:', error);
      res.status(500).json({ message: 'Error fetching all orders' });
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
      
      const previousStatus = order.orderStatus;
      order.orderStatus = orderStatus;
      
      const dateToSet = statusDate ? new Date(statusDate) : new Date();

      if (orderStatus === 'shipped') {
        order.shippedAt = dateToSet;
      } else if (orderStatus === 'delivered') {
        order.deliveredAt = dateToSet;
      } else if (orderStatus === 'cancelled' && !['cancelled', 'delivered'].includes(previousStatus)) {
        // Restore stock when order is cancelled (only if not already delivered)
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } }
          );
        }
      } else if (orderStatus === 'returned' && previousStatus === 'delivered') {
        // Restore stock when returned (only if was delivered)
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: item.quantity } }
          );
        }
      }

      await order.save();
      res.status(200).json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Error updating order status' });
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
      res.status(500).json({ message: 'Error updating payment status' });
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

module.exports = OrderController;
