const Order = require('../models/OrderModel');
const User = require('../models/UserModel');
const WalletController = require('./WalletController');
const { sendRefundToWalletEmail, sendRefundChoiceEmail, sendBankRefundEmail } = require('../utils/mailer');

const submitReturnRequest = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId;
    const { reason } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to return this order' });
    }
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }
    if (order.paymentStatus !== 'paid' && order.paymentStatus !== 'refunded') {
      return res.status(400).json({ message: 'Only paid orders can be returned' });
    }
    if (order.returnRequest && order.returnRequest.requested) {
      return res.status(400).json({ message: 'Return request already submitted for this order' });
    }
    const images = req.files ? req.files.map(file => file.path || `/uploads/${file.filename}`) : [];
    order.returnRequest = {
      requested: true,
      reason: reason || 'No reason provided',
      images: images,
      status: 'pending',
      requestedAt: new Date()
    };

    await order.save();

    res.status(200).json({
      message: 'Return request submitted successfully',
      returnRequest: order.returnRequest
    });
  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({ message: 'Server error submitting return request' });
  }
};

const getReturnRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { 'returnRequest.requested': true };
    if (status && status !== 'all') {
      query['returnRequest.status'] = status;
    }
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .select('user items totalAmount shippingAddress paymentStatus orderStatus returnRequest createdAt')
      .sort({ 'returnRequest.requestedAt': -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      returns: orders
    });
  } catch (error) {
    console.error('Get return requests error:', error);
    res.status(500).json({ message: 'Server error fetching return requests' });
  }
};

const updateReturnStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.returnRequest || !order.returnRequest.requested) {
      return res.status(400).json({ message: 'No return request found for this order' });
    }
    order.returnRequest.status = status;
    order.returnRequest.adminNote = adminNote || '';
    order.returnRequest.resolvedAt = new Date();
    if (status === 'approved') {
      order.orderStatus = 'returned';
      if (order.paymentMethod !== 'COD') {
        try {
          const refundAmount = order.totalAmount;
          await WalletController.creditWallet(
            order.user,
            refundAmount,
            `Refund for Order #${order._id.toString()}`,
            order._id
          );
          order.refund = {
            initiated: true,
            method: 'wallet',
            status: 'processed',
            amount: refundAmount,
            initiatedAt: new Date(),
            processedAt: new Date()
          };
          order.paymentStatus = 'refunded';
          const userObj = await User.findById(order.user).select('email name walletBalance');
          if (userObj) {
            await sendRefundToWalletEmail(userObj.email, refundAmount, userObj.walletBalance, order._id);
          }
        } catch (walletError) {
          console.error('Error auto-crediting wallet:', walletError);
          order.refund.status = 'failed';
          order.refund.failureReason = 'Internal wallet credit failure';
        }
      } else {
        // COD orders: credit wallet as refund (cash can't be returned)
        try {
          const refundAmount = order.totalAmount;
          await WalletController.creditWallet(
            order.user,
            refundAmount,
            `Refund for COD Order #${order._id.toString()}`,
            order._id
          );
          order.refund = {
            initiated: true,
            method: 'wallet',
            status: 'processed',
            amount: refundAmount,
            initiatedAt: new Date(),
            processedAt: new Date()
          };
          order.paymentStatus = 'refunded';
          const userObj = await User.findById(order.user).select('email name walletBalance');
          if (userObj) {
            await sendRefundToWalletEmail(userObj.email, refundAmount, userObj.walletBalance, order._id);
          }
        } catch (walletError) {
          console.error('Error crediting wallet for COD return:', walletError);
          if (!order.refund) order.refund = {};
          order.refund.status = 'failed';
          order.refund.failureReason = 'Wallet credit failure';
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Return request ${status}`,
      order: {
        _id: order._id,
        returnRequest: order.returnRequest,
        orderStatus: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Update return status error:', error);
    res.status(500).json({ message: 'Server error updating return status' });
  }
};

const handleRefundChoice = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { choice, bankDetails } = req.body;
    const userId = req.userId;

    if (!['wallet', 'bank'].includes(choice)) {
      return res.status(400).json({ message: 'Invalid refund choice' });
    }

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.returnRequest?.status !== 'approved' || !order.refund?.pendingMethod) {
      return res.status(400).json({ message: 'No pending refund choice for this order' });
    }

    if (choice === 'wallet') {
      const refundAmount = order.totalAmount;
      const newBalance = await WalletController.creditWallet(
        userId,
        refundAmount,
        `Refund for Order #${order._id.toString()}`,
        order._id
      );

      order.refund.method = 'wallet';
      order.refund.status = 'processed';
      order.refund.processedAt = new Date();
      order.refund.pendingMethod = false;
      order.paymentStatus = 'refunded';

      const userObj = await User.findById(userId).select('email');
      await sendRefundToWalletEmail(userObj.email, refundAmount, newBalance, order._id);

      await order.save();
      return res.status(200).json({ success: true, message: 'Refund credited to your wallet!', balance: newBalance });
    } else {
      if (!bankDetails || !bankDetails.accountNumber) {
        return res.status(400).json({ message: 'Bank details are required for bank transfer' });
      }

      order.refund.method = 'bank';
      order.refund.status = 'processing';
      order.refund.bankDetails = bankDetails;
      order.refund.pendingMethod = false;

      const userObj = await User.findById(userId).select('email');
      await sendBankRefundEmail(userObj.email, order.totalAmount, order._id);

      await order.save();
      return res.status(200).json({ 
        success: true, 
        message: 'Your bank refund request has been received. Admin will process it within 5-7 business days.' 
      });
    }
  } catch (error) {
    console.error('Handle refund choice error:', error);
    res.status(500).json({ message: 'Server error processing refund choice' });
  }
};

const getMyReturns = async (req, res) => {
  try {
    const userId = req.userId;
    const returns = await Order.find({ 
      user: userId, 
      'returnRequest.requested': true 
    }).sort({ 'returnRequest.requestedAt': -1 });

    res.status(200).json({
      success: true,
      count: returns.length,
      returns
    });
  } catch (error) {
    console.error('Get my returns error:', error);
    res.status(500).json({ message: 'Server error fetching your returns' });
  }
};

module.exports = {
  submitReturnRequest,
  getReturnRequests,
  updateReturnStatus,
  getMyReturns,
  handleRefundChoice
};
