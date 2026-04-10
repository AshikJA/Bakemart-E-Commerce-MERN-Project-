const User = require('../models/UserModel');
const WalletTransaction = require('../models/WalletTransactionModel');

class WallerService {
    static async getWalletBalance(userId) { 
        const user = await User.findById(userId).select('walletBalance');
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }
        return { balance: user.walletBalance || 0 };
    }
    
    static async getWalletTransactions(userId) {
        const transactions = await WalletTransaction.find({ user: userId })
            .populate('orderId', '_id createdAt totalAmount')
            .sort({ createdAt: -1 });
        return transactions;
    }

    static async creditWallet(userId, amount, reason, orderId = null) {
        try {
          const user = await User.findById(userId);
          if (!user) throw new Error('User not found');
    
          user.walletBalance = (user.walletBalance || 0) + Number(amount);
          await user.save();
    
          await WalletTransaction.create({
            user: userId,
            amount,
            type: 'credit',
            description: reason,
            orderId
          });
    
          return user.walletBalance;
        } catch (error) {
          console.error('Error crediting wallet:', error);
          throw error;
        }
      }
    
      // Internal Helper: debitWallet
      static async debitWallet(userId, amount, reason, orderId = null) {
        try {
          const user = await User.findById(userId);
          if (!user) throw new Error('User not found');
    
          if ((user.walletBalance || 0) < amount) {
            throw new Error('Insufficient wallet balance');
          }
    
          user.walletBalance -= Number(amount);
          await user.save();
    
          await WalletTransaction.create({
            user: userId,
            amount,
            type: 'debit',
            description: reason,
            orderId
          });
    
          return user.walletBalance;
        } catch (error) {
          console.error('Error debiting wallet:', error);
          throw error;
        }
      }
} 

module.exports = WallerService;
