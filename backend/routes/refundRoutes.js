const express = require('express');
const { initiateRefund, getRefundStatus, getAllRefunds, webhookHandler } = require('../controllers/refundController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin routes
router.post('/api/admin/refund/:orderId', protect, admin, initiateRefund);
router.get('/api/admin/refunds', protect, admin, getAllRefunds);

// User routes
router.get('/api/orders/:orderId/refund', protect, getRefundStatus);

// Webhook route (No auth, signature verification inside controller)
// The raw body middleware in setup.js specifically looks for /api/payment/webhook
router.post('/api/payment/webhook', webhookHandler);

module.exports = router;
