export const getCart = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => item._id === product._id);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const removeFromCart = (productId) => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item._id !== productId);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const clearCart = () => {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
};
