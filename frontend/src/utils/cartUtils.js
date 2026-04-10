import api from '../api/client';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/200x200?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}/uploads/${imagePath}`;
};

export const getCart = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const res = await api.get('/cart');
      const cartItems = res.data.items
        .filter(item => item.product) // Filter out items where product is null
        .map((item, index) => ({
          ...item.product,
          cartItemId: item._id || `${item.product?._id}-${index}`,
          selectedVariant: item.selectedVariant || null,
          quantity: item.quantity,
          price: item.selectedVariant ? item.selectedVariant.price : item.product?.price,
          stock: item.product?.variants?.length > 0 
            ? (item.selectedVariant 
              ? (item.product.variants.find(v => v.name === item.selectedVariant.name)?.stock || item.product.stock)
              : item.product.stock)
            : item.product?.stock
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

export const addToCart = async (product, quantity = 1, selectedVariant = null) => {
  const cartItem = {
    ...product,
    quantity,
    selectedVariant: selectedVariant ? { name: selectedVariant.name, price: selectedVariant.price } : null,
    price: selectedVariant ? selectedVariant.price : product.price,
    stock: selectedVariant ? selectedVariant.stock : product.stock
  };
  
  const token = localStorage.getItem('token');
  if (token) {
    try {
      await api.post('/cart/add', { 
        productId: product._id, 
        quantity,
        variant: selectedVariant ? { name: selectedVariant.name, price: selectedVariant.price } : null
      });
    } catch (err) {
      console.error('Error adding to DB cart:', err);
    }
  } else {
    const cart = getLocalCart();
    const cartKey = product._id + (selectedVariant ? `-${selectedVariant.name}` : '');
    const existingItemIndex = cart.findIndex(item => item._id + (item.selectedVariant ? `-${item.selectedVariant.name}` : '') === cartKey);
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  window.dispatchEvent(new Event('cartUpdated'));
};

export const removeFromCart = async (productId, variant = null) => {
  console.log('removeFromCart called:', { productId, variant });
  const token = localStorage.getItem('token');
  if (token) {
    try {
      let url = `/cart/remove/${productId}`;
      if (variant && variant.name) {
        url += `?variant=${encodeURIComponent(variant.name)}`;
      }
      console.log('Calling API:', url);
      const res = await api.delete(url);
      window.dispatchEvent(new Event('cartUpdated'));
      return res.data;
    } catch (err) {
      console.error('Error removing from DB cart:', err.response || err.message);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  } else {
    const cart = getLocalCart();
    const updatedCart = cart.filter(item => 
      !(item._id === productId && (variant ? item.selectedVariant?.name === variant.name : !item.selectedVariant))
    );
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  }
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
