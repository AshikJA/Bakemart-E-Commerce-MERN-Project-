const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');

class CartService { 
    static async getCart(userId) {
        try {
            const cart = await Cart.findOne({ user: userId }).populate('items.product');
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
            return cart;
        } catch (error) {
            console.error('Error getting cart:', error);
            throw error.status ? error : { status: 500, message: 'Error getting cart' };
        }
    }
    static async addToCart(userId, productId, quantity = 1) {
        try {
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                const newCart = new Cart({ user: userId, items: [{ product: productId, quantity }] });
                await newCart.save();
                return newCart;
            }
            const item = cart.items.find(item => item.product.toString() === productId);
            if (item) {
                item.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error.status ? error : { status: 500, message: 'Error adding to cart' };
        }
    }

    static async updateQuantity(userId, productId, quantity = 1) {
        try {
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                throw { status: 404, message: 'Cart not found' };
            }
            const item = cart.items.find(item => item.product.toString() === productId);
            if (!item) {
                throw { status: 404, message: 'Item not found in cart' };
            }
            item.quantity = quantity;
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error.status ? error : { status: 500, message: 'Error updating quantity' };
        }
    }

    static async removeFromCart(userId, productId) {
        try {
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                throw { status: 404, message: 'Cart not found' };
            }
            cart.items = cart.items.filter(item => item.product.toString() !== productId);
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error.status ? error : { status: 500, message: 'Error removing from cart' };
        }
    }

    static async clearCart(userId) {
        try {
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                throw { status: 404, message: 'Cart not found' };
            }
            cart.items = [];
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error.status ? error : { status: 500, message: 'Error clearing cart' };
        }
    }

    static async mergeCart(userId, localCart) {
        try {
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                const newCart = new Cart({ user: userId, items: localCart });
                await newCart.save();
                return newCart;
            }
            for (const localItem of localCart) {
                const item = cart.items.find(item => item.product.toString() === localItem.product);
                if (item) {
                    item.quantity += localItem.quantity;
                } else {
                    cart.items.push(localItem);
                }
            }
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error merging cart:', error);
            throw error.status ? error : { status: 500, message: 'Error merging cart' };
        }
    }
}

module.exports = CartService;