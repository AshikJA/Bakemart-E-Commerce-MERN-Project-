const express = require('express');
const OrderController = require('../controllers/OrderController');
const { authenticateUser, authenticateAdmin } = require('../middlewares/authMiddleware');
const { searchLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// User facing order routes
router.post('/create', authenticateUser, searchLimiter, OrderController.createOrder);
router.post('/verify-payment', authenticateUser, searchLimiter, OrderController.verifyPayment);
router.get('/my-orders', authenticateUser, searchLimiter, OrderController.getUserOrders);
router.post('/:orderId/cancel', authenticateUser, searchLimiter, OrderController.cancelOrder);
router.post('/:orderId/return', authenticateUser, searchLimiter, OrderController.requestReturn);
router.post('/:id/fail', authenticateUser, searchLimiter, OrderController.failOrder);

// Admin Routes
router.get('/admin/all', authenticateAdmin, searchLimiter, OrderController.getAllOrders);
router.put('/admin/:id/status', authenticateAdmin, searchLimiter, OrderController.updateOrderStatus);
router.put('/admin/:id/payment-status', authenticateAdmin, searchLimiter, OrderController.updatePaymentStatus);

module.exports = router;
