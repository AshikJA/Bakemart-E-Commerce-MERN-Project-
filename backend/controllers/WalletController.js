const WalletService = require('../services/WalletService');

class WalletController {
  
  static async getWalletDetails(req, res) {
    const result = await WalletService.getWalletBalance(req.userId);
    return res.status(200).json(result);
  }

  static async getWalletTransactions(req, res) {
    const result = await WalletService.getWalletTransactions(req.userId);
    return res.status(200).json(result);
  }

  static async creditWallet(userId, amount, reason, orderId = null) {
   const result = await WalletService.creditWallet(userId, amount, reason, orderId);
   return result;
  }

  static async debitWallet(userId, amount, reason, orderId = null) {
    const result = await WalletService.debitWallet(userId, amount, reason, orderId);
    return result;
  }
}

module.exports = WalletController;
