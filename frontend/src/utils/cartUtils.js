import api from '../api/client';

export const getCart = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const res = await api.get('/cart');
      const cartItems = res.data.items.map(item => ({
        ...item.product,
        quantity: item.quantity
      }));
      return cartItems;
    } catch (err) {
      console.error('Error fetching cart from DB:', err);
      return getLocalCart();
    }
  }
  return getLocalCart();
};

const getLocalCart = () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

export const addToCart = async (product, quantity = 1) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await api.post('/cart/add', { productId: product._id, quantity });
    } catch (err) {
      console.error('Error adding to DB cart:', err);
    }
  } else {
    const cart = getLocalCart();
    const existingItemIndex = cart.findIndex(item => item._id === product._id);
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  window.dispatchEvent(new Event('cartUpdated'));
};

export const removeFromCart = async (productId) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await api.delete(`/cart/remove/${productId}`);
    } catch (err) {
      console.error('Error removing from DB cart:', err);
    }
  } else {
    const cart = getLocalCart();
    const updatedCart = cart.filter(item => item._id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }
  window.dispatchEvent(new Event('cartUpdated'));
};

export const updateQuantityInCart = async (productId, quantity) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/cart/update', { productId, quantity });
      } catch (err) {
        console.error('Error updating quantity in DB cart:', err);
      }
    } else {
      const cart = getLocalCart();
      const itemIndex = cart.findIndex(item => item._id === productId);
      if (itemIndex > -1) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
      }
    }
    window.dispatchEvent(new Event('cartUpdated'));
}

export const clearCart = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await api.delete('/cart/clear');
    } catch (err) {
      console.error('Error clearing DB cart:', err);
    }
  }
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
};

export const mergeLocalCartOnLogin = async () => {
    const localCart = getLocalCart();
    if (localCart.length > 0) {
        try {
            await api.post('/cart/merge', { localCart });
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            console.error('Error merging local cart:', err);
        }
    }
}
