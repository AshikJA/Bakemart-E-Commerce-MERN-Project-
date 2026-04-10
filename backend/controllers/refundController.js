const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/OrderModel');
const { sendRefundEmail, sendRefundSuccessEmail } = require('../utils/mailer');
const config = require('../config/config');

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET
});

const initiateRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'paid' && order.paymentMethod !== 'COD') {
      return res.status(400).json({ message: 'Only paid orders can be refunded' });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({ message: 'No Razorpay payment ID found for this order' });
    }

    if (order.refund && order.refund.initiated) {
      return res.status(400).json({ message: 'Refund already initiated for this order' });
    }

    if (order.returnRequest.status !== 'approved') {
      return res.status(400).json({ message: 'Return request must be approved before initiating refund' });
    }

    const refundAmount = Math.round(order.totalAmount * 100); // amount in paise

    const refundResponse = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: refundAmount,
      speed: 'normal',
      notes: {
        orderId: order._id.toString(),
        reason: order.returnRequest.reason || 'Customer requested return'
      },
      receipt: order._id.toString()
    });

    order.refund = {
      initiated: true,
      razorpayRefundId: refundResponse.id,
      amount: order.totalAmount,
      status: 'processing',
      initiatedAt: new Date()
    };
    order.paymentStatus = 'refunded';
    order.orderStatus = 'returned';

    await order.save();

    // Send email to customer
    try {
      await sendRefundEmail(order.user.email, order.totalAmount, refundResponse.id);
    } catch (emailError) {
      console.error('Error sending refund email:', emailError);
    }

    res.status(200).json({ message: 'Refund initiated successfully', order });
  } catch (error) {
    console.error('Error initiating refund:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

const getRefundStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions: user must own the order or be an admin
    const isAdmin = (req.tokenType === 'admin') || (req.user && req.user.role === 'admin');
    if (order.user.toString() !== req.userId && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this refund status' });
    }

    if (!order.refund || !order.refund.initiated) {
      return res.status(200).json({ initiated: false });
    }

    // Fetch live status from Razorpay
    const refund = await razorpay.refunds.fetch(order.refund.razorpayRefundId);

    // Update internal status if changed
    let updated = false;
    if (refund.status === 'processed' && order.refund.status !== 'processed') {
      order.refund.status = 'processed';
      order.refund.processedAt = new Date();
      updated = true;
    } else if (refund.status === 'failed' && order.refund.status !== 'failed') {
      order.refund.status = 'failed';
      order.refund.failureReason = refund.notes?.reason || 'Unknown failure';
      updated = true;
    }

    if (updated) {
      await order.save();
    }

    res.status(200).json({
      initiated: true,
      status: order.refund.status,
      razorpayRefundId: order.refund.razorpayRefundId,
      amount: order.refund.amount,
      initiatedAt: order.refund.initiatedAt,
      processedAt: order.refund.processedAt,
      failureReason: order.refund.failureReason
    });
  } catch (error) {
    console.error('Error fetching refund status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllRefunds = async (req, res) => {
  try {
    const orders = await Order.find({ 'refund.initiated': true })
      .populate('user', 'name email')
      .sort({ 'refund.initiatedAt': -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching all refunds:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const webhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    // For signature verification, we need the raw body
    // Since we'll configure server.js to provide raw body for this route
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(req.body); // req.body should be the raw buffer
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(req.body.toString());
    const eventType = event.event;

    if (eventType === 'refund.processed' || eventType === 'refund.failed') {
      const refundData = event.payload.refund.entity;
      const orderId = refundData.notes.orderId;
      const order = await Order.findById(orderId).populate('user');

      if (order) {
        if (eventType === 'refund.processed') {
          order.refund.status = 'processed';
          order.refund.processedAt = new Date();
          await order.save();
          
          try {
            await sendRefundSuccessEmail(order.user.email, order.refund.amount, order.refund.razorpayRefundId);
          } catch (e) {
            console.error('Webhook: Error sending success email:', e);
          }
        } else {
          order.refund.status = 'failed';
          order.refund.failureReason = refundData.failure_reason;
          await order.save();
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Handler Error:', error);
    res.status(500).send('Webhook error');
  }
};

module.exports = { initiateRefund, getRefundStatus, getAllRefunds, webhookHandler };
