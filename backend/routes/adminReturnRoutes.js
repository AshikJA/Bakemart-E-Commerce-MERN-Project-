const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  getReturnRequests,
  updateReturnStatus
} = require('../controllers/returnController');

// Admin routes (mounted at /api/admin)
// Get all return requests
router.get('/returns', protect, admin, getReturnRequests);

// Update return status
router.put('/returns/:id', protect, admin, updateReturnStatus);

module.exports = router;
