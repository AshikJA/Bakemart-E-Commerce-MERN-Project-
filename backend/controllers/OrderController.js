const OrderService = require('../services/OrderService');
const WalletController = require('./WalletController');

class OrderController {
  
  static async createOrder(req, res) {
    return await OrderService.createOrder(req, res);
  }

  static async verifyPayment(req, res) {
    return await OrderService.verifyPayment(req, res);
  }

  static async getUserOrders(req, res) {
    return await OrderService.getMyOrders(req, res);
  }

  static async cancelOrder(req, res) {
    return await OrderService.cancelOrder(req, res);
  }

  static async getAllOrders(req, res) {
    return await OrderService.getOrders(req, res);
  }

  static async updateOrderStatus(req, res) {
    return await OrderService.updateOrderStatus(req, res);
  }

  static async updatePaymentStatus(req, res) {
    return await OrderService.updatePaymentStatus(req, res);
  }

  static async failOrder(req, res) {
    return await OrderService.failOrder(req, res);
  }
}

module.exports = OrderController;
