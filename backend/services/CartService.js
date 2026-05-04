const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');

class CartService { 
    static async getCart(userId) {
        try {
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
            return cart;
        } catch (error) {
            console.error('Error getting cart:', error);
            throw error.status ? error : { status: 500, message: 'Error getting cart' };
        }
    }
    static async addToCart(userId, productId, quantity = 1, variant = null) {
        try {
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                const newCart = new Cart({ user: userId, items: [{ product: productId, quantity, selectedVariant: variant }] });
                await newCart.save();
                return newCart;
            }
            
            const variantName = variant ? variant.name : null;
            const item = cart.items.find(item => 
                item.product.toString() === productId && 
                (variantName ? item.selectedVariant?.name === variantName : !item.selectedVariant?.name)
            );

            if (item) {
                item.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity, selectedVariant: variant });
            }
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error.status ? error : { status: 500, message: 'Error adding to cart' };
        }
    }

    static async updateQuantity(userId, productId, quantity = 1, variant = null) {
        try {
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                throw { status: 404, message: 'Cart not found' };
            }
            
            const variantName = variant ? variant.name : null;
            const item = cart.items.find(item => 
                item.product.toString() === productId && 
                (variantName ? item.selectedVariant?.name === variantName : !item.selectedVariant?.name)
            );

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

    static async removeFromCart(userId, productId, variantName = null) {
        try {
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                throw { status: 404, message: 'Cart not found' };
            }
            cart.items = cart.items.filter(item => 
                !(item.product.toString() === productId && 
                (variantName ? item.selectedVariant?.name === variantName : !item.selectedVariant?.name))
            );
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
            const validItems = localCart.filter(item => item.product).map(item => ({
                product: item.product?._id || item.product,
                quantity: item.quantity || 1,
                selectedVariant: item.selectedVariant || null
            }));
            const cart = await Cart.findOne({ user: userId });
            if (!cart) {
                const newCart = new Cart({ user: userId, items: validItems });
                await newCart.save();
                return newCart;
            }
            if (validItems.length === 0) {
                return cart;
            }
            for (const localItem of validItems) {
                const item = cart.items.find(item => 
                    item.product.toString() === localItem.product && 
                    (localItem.selectedVariant ? item.selectedVariant?.name === localItem.selectedVariant.name : !item.selectedVariant?.name)
                );
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