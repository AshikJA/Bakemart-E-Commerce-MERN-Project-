const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/WalletController');
const { protect } = require('../middlewares/authMiddleware');

// Get wallet balance and recent transactions
router.get('/', protect, WalletController.getWalletDetails);

// Get full transaction history
router.get('/transactions', protect, WalletController.getWalletTransactions);

module.exports = router;
