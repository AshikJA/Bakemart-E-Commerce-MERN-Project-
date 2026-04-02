const express = require('express');
const CouponController = require('../controllers/CouponController');
const { authenticateAdmin, authenticateUser } = require('../middlewares/authMiddleware');
const { searchLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Admin Routes (Protected)
router.post('/admin/create', authenticateAdmin, searchLimiter, CouponController.createCoupon);
router.get('/admin/all', authenticateAdmin, searchLimiter, CouponController.getAllCoupons);
router.put('/admin/update/:id', authenticateAdmin, searchLimiter, CouponController.updateCoupon);
router.delete('/admin/delete/:id', authenticateAdmin, searchLimiter, CouponController.deleteCoupon);

// User Routes (Protected)
router.post('/apply', authenticateUser, searchLimiter, CouponController.validateCoupon);

module.exports = router;
