import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiUser, FiSearch } from "react-icons/fi";
import { GiChocolateBar } from "react-icons/gi";
import { LogoutIcon } from "./Icons";
import { logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../utils/cartUtils';

const Navbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCount();
    const handleCartUpdate = () => updateCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateCount = () => {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-[#6B3F1F] text-[#FDF6EC] shadow-lg sticky top-0 z-50 py-1">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <GiChocolateBar className="text-[#FDF6EC] text-3xl transition-transform group-hover:rotate-12" />
          <span className="font-heading text-2xl font-black tracking-tighter">
            Backe<span className="text-[#D4A96A]">Mart</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 font-bold text-xs uppercase tracking-widest">
          {["Home", "Shop", "Hampers", "Cakes", "About"].map((item) => (
            <li key={item}>
              <Link
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="hover:text-[#D4A96A] transition-all duration-200 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#D4A96A] hover:after:w-full after:transition-all"
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xl">
             <FiSearch 
               onClick={() => {
                 navigate('/');
                 setTimeout(() => {
                   window.dispatchEvent(new Event('triggerSearchFocus'));
                 }, 100);
               }}
               className="cursor-pointer hover:text-[#D4A96A] transition-colors" 
             />
             
             <Link to="/cart" className="relative cursor-pointer group">
                <FiShoppingCart className="group-hover:text-[#D4A96A] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-3 -right-3 bg-[#D4A96A] text-[#6B3F1F] text-[10px] font-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-[#6B3F1F] animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
             </Link>

             <Link to="/profile" className="cursor-pointer">
                <FiUser className="hover:text-[#D4A96A] transition-colors" />
             </Link>
          </div>

          <div className="h-4 w-px bg-[#FDF6EC]/20 hidden sm:block"></div>

          <button 
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 bg-[#FDF6EC]/10 hover:bg-[#FDF6EC]/20 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            <LogoutIcon className="text-sm" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;