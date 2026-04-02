const BaseController = require('./BaseController');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');

class CartController extends BaseController {
  
  static getCart = BaseController.asyncHandler(async (req, res) => {
    const userId = req.userId;
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart) {
      try {
        cart = await Cart.create({ user: userId, items: [] });
      } catch (err) {
        if (err.code === 11000) {
          cart = await Cart.findOne({ user: userId }).populate('items.product');
        } else {
          throw err;
        }
      }
    }
    
    return res.status(200).json(cart);
  });

  static addToCart = BaseController.asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      throw { status: 400, message: 'Product ID is required' };
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    
    return res.status(200).json(updatedCart);
  });

  static updateQuantity = BaseController.asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      throw { status: 400, message: 'Quantity must be at least 1' };
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw { status: 404, message: 'Cart not found' };
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      throw { status: 404, message: 'Item not found in cart' };
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    return res.status(200).json(updatedCart);
  });

  static removeFromCart = BaseController.asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw { status: 404, message: 'Cart not found' };
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    return res.status(200).json(updatedCart);
  });

  static clearCart = BaseController.asyncHandler(async (req, res) => {
    const userId = req.userId;
    const cart = await Cart.findOne({ user: userId });
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    return res.status(200).json({ message: 'Cart cleared', items: [] });
  });

  static mergeCart = BaseController.asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { localCart } = req.body;

    if (!localCart || !Array.isArray(localCart)) {
      return res.status(400).json({ message: 'Invalid local cart' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    for (const localItem of localCart) {
      if (!localItem._id || !localItem.quantity) continue;
      
      const qty = Number(localItem.quantity);
      if (isNaN(qty) || qty < 1) continue;

      const existingItemIndex = cart.items.findIndex(item => item.product.toString() === localItem._id);
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += qty;
      } else {
        cart.items.push({ product: localItem._id, quantity: qty });
      }
    }

    try {
      await cart.save();
    } catch (saveErr) {
      console.error('Cart Merge Save Error:', saveErr);
      throw { status: 400, message: 'Failed to save cart: ' + saveErr.message };
    }
    const updatedCart = await Cart.findById(cart._id).populate('items.product');
    return res.status(200).json(updatedCart);
  });
}

module.exports = CartController;
