const BaseController = require('./BaseController');
const CartService = require('../services/CartService');

class CartController extends BaseController {
  
  static getCart = BaseController.asyncHandler(async (req, res) => {
    const cart = await CartService.getCart(req.userId);
    return res.status(200).json(cart);
  });

  static addToCart = BaseController.asyncHandler(async (req, res) => {
    const cart = await CartService.addToCart(req.userId, req.body.productId, req.body.quantity);
    return res.status(200).json(cart);
  });

  static updateQuantity = BaseController.asyncHandler(async (req, res) => {
    const cart = await CartService.updateQuantity(req.userId, req.body.productId, req.body.quantity);
    return res.status(200).json(cart);
  });

  static removeFromCart = BaseController.asyncHandler(async (req, res) => {
    const cart = await CartService.removeFromCart(req.userId, req.params.productId, req.query.variant);
    return res.status(200).json(cart);
  });

  static clearCart = BaseController.asyncHandler(async (req, res) => {
    const cart = await CartService.clearCart(req.userId);
    return res.status(200).json(cart);
  });

  static mergeCart = BaseController.asyncHandler(async (req, res) => {
    const cart = await CartService.mergeCart(req.userId, req.body.localCart);
    return res.status(200).json(cart);
  });
}

module.exports = CartController;
