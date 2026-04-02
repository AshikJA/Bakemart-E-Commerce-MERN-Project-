const express = require('express');
const WalletController = require('../controllers/WalletController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { searchLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();  

router.get('/', authenticateUser, searchLimiter, WalletController.getWalletDetails);

module.exports = router;
