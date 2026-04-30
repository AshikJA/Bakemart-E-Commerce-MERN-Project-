const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const { uploadReturnImages } = require('../middlewares/multer');
const {
  submitReturnRequest,
  getReturnRequests,
  updateReturnStatus,
  getMyReturns,
  handleRefundChoice
} = require('../controllers/returnController');

// User routes (mounted at /api/orders)
// Submit return request
router.post('/:id/return', protect, uploadReturnImages, submitReturnRequest);

// User chooses refund method for COD return
router.post('/:id/refund-choice', protect, handleRefundChoice);

// Get user's return requests
router.get('/my-returns', protect, getMyReturns);

module.exports = router;
