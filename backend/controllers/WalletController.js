const User = require('../models/UserModel');
const WalletTransaction = require('../models/WalletTransactionModel');

class WalletController {
  static async getWalletDetails(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const transactions = await WalletTransaction.find({ user: req.userId }).sort({ createdAt: -1 });

      res.status(200).json({
        balance: user.walletBalance || 0,
        transactions,
      });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = WalletController;
