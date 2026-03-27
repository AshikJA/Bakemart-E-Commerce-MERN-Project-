import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { getCart, addToCart, removeFromCart, clearCart } from '../utils/cartUtils';
import { toast } from 'react-toastify';

function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    setCartItems(getCart());

    const handleCartUpdate = () => {
      setCartItems(getCart());
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleUpdateQuantity = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (delta > 0 && item.stock <= item.quantity) {
      toast.warning('Not enough stock available');
      return;
    }
    addToCart(item, delta);
  };

  const handleRemove = (id) => {
    removeFromCart(id);
    toast.info('Item removed from cart');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-[#D4A96A]/20 max-w-md w-full animate-in fade-in zoom-in duration-500">
          <FiShoppingBag className="text-8xl text-[#D4A96A] mx-auto mb-6 opacity-30" />
          <h2 className="text-3xl font-black text-[#6B3F1F] mb-2">Your cart is empty!</h2>
          <p className="text-gray-500 mb-8 font-medium italic">Seems like you haven't added any chocolate treats yet.</p>
          <Link to="/">
            <button className="w-full bg-[#6B3F1F] text-white py-4 rounded-2xl font-bold hover:bg-[#A0522D] transition-all shadow-lg active:scale-95">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-[#6B3F1F] tracking-tight">Shopping Bag</h1>
          <button 
            onClick={() => {
                if(window.confirm('Clear all items?')){
                    clearCart();
                    toast.info('Cart cleared');
                }
            }}
            className="text-red-500 font-bold text-sm hover:underline"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="relative bg-white p-5 rounded-[32px] shadow-sm border border-[#D4A96A]/10 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-shadow overflow-hidden">
                {/* Trash Icon - Absolute on mobile for better visibility */}
                <button 
                  onClick={() => handleRemove(item._id)}
                  className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 sm:relative sm:top-0 sm:right-0 sm:p-3 sm:text-red-100 sm:bg-transparent sm:group-hover:bg-red-50 sm:group-hover:text-red-500 rounded-2xl transition-all z-10"
                >
                  <FiTrash2 size={20} />
                </button>

                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                  <img 
                    src={item.image ? `http://localhost:5000/uploads/${item.image}` : 'https://via.placeholder.com/200x200?text=Choco'} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left min-w-0 w-full">
                  <span className="text-[10px] font-black text-[#D4A96A] uppercase tracking-[0.2em]">{item.category}</span>
                  <h3 className="text-lg font-bold text-[#6B3F1F] truncate pr-8 sm:pr-0">{item.name}</h3>
                  <p className="text-[#A0522D] font-black">₹{item.price}</p>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                  <button 
                    onClick={() => handleUpdateQuantity(item, -1)}
                    className="p-1 text-[#6B3F1F] hover:bg-white rounded-lg transition-colors"
                  >
                    <FiMinus size={16} strokeWidth={3} />
                  </button>
                  <span className="w-8 text-center font-black text-[#6B3F1F] text-lg">{item.quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(item, 1)}
                    className="p-1 text-[#6B3F1F] hover:bg-white rounded-lg transition-colors"
                  >
                    <FiPlus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="bg-[#6B3F1F] p-8 rounded-[40px] text-[#FDF6EC] shadow-2xl sticky top-24">
              <h2 className="text-2xl font-black mb-6">Order Summary</h2>
              <div className="space-y-4 text-sm opacity-90">
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Shipping</span>
                  <span className="text-green-400 font-bold uppercase tracking-widest text-[10px]">Free Delivery</span>
                </div>
                <div className="h-px bg-white/10 my-4"></div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-lg font-bold">Estimated Total</span>
                  <span className="text-3xl font-black text-[#D4A96A]">₹{subtotal}</span>
                </div>
              </div>

              <Link to="/checkout">
                <button className="w-full bg-[#D4A96A] text-[#6B3F1F] py-5 rounded-2xl font-black text-xl mt-10 shadow-xl hover:bg-[#FDF6EC] transition-all active:scale-95">
                  Proceed to Checkout
                </button>
              </Link>
              
              <p className="text-center text-[10px] opacity-40 mt-6 font-bold uppercase tracking-widest">
                Safe & Secure Payments Guaranteed
              </p>
            </div>
            
            <Link to="/" className="flex items-center justify-center gap-2 text-[#6B3F1F] font-bold hover:text-[#A0522D] transition-colors">
                <FiArrowLeft /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;