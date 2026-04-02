import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiPocket } from "react-icons/fi";
import { GiChocolateBar } from "react-icons/gi";
import { LogoutIcon } from "./Icons";
import { logout, isUserAuthenticated, isAdminAuthenticated } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../utils/cartUtils';

const Navbar = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [auth, setAuth] = useState({ loggedIn: isUserAuthenticated(), isAdmin: isAdminAuthenticated() });

  useEffect(() => {
    updateCount();
    const handleAuthUpdate = () => {
        setAuth({ loggedIn: isUserAuthenticated(), isAdmin: isAdminAuthenticated() });
        updateCount();
    };
    window.addEventListener('cartUpdated', handleAuthUpdate);
    window.addEventListener('authChange', handleAuthUpdate);
    return () => {
        window.removeEventListener('cartUpdated', handleAuthUpdate);
        window.removeEventListener('authChange', handleAuthUpdate);
    };
  }, []);

  const updateCount = async () => {
    const cart = await getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    setIsMenuOpen(false);
  };

  const navLinks = ["Home", "Shop", "Hampers", "Cakes", "About"];

  return (
    <nav className="bg-[#6B3F1F] text-[#FDF6EC] shadow-lg sticky top-0 z-50 py-1">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <GiChocolateBar className="text-[#FDF6EC] text-3xl transition-transform group-hover:rotate-12" />
          <span className="font-heading text-2xl font-black tracking-tighter">
            Bake<span className="text-[#D4A96A]">Mart</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex gap-8 font-bold text-xs uppercase tracking-widest">
          {navLinks.map((item) => (
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
        <div className="flex items-center gap-4 sm:gap-6">
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

              {auth.loggedIn && (
                <>
                  <Link to="/wallet" className="cursor-pointer hidden sm:block">
                    <FiPocket className="hover:text-[#D4A96A] transition-colors" />
                  </Link>
                  <Link to="/profile" className="cursor-pointer hidden sm:block">
                    <FiUser className="hover:text-[#D4A96A] transition-colors" />
                  </Link>
                </>
              )}
          </div>

          <div className="h-4 w-px bg-[#FDF6EC]/20 hidden lg:block"></div>

          {auth.loggedIn ? (
            <button 
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-2 bg-[#FDF6EC]/10 hover:bg-[#FDF6EC]/20 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <LogoutIcon className="text-sm" />
              Logout
            </button>
          ) : (
            <Link 
              to="/login"
              className="hidden lg:flex items-center gap-2 bg-[#D4A96A] text-[#6B3F1F] hover:bg-[#FDF6EC] px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <FiUser className="text-sm" />
              Login
            </Link>
          )}

          {/* Hamburger Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-2xl hover:text-[#D4A96A] transition-colors"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 top-[60px] bg-[#6B3F1F] z-40 transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-8 space-y-8 h-full">
          <ul className="space-y-6">
            {navLinks.map((item) => (
              <li key={item}>
                <Link
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black hover:text-[#D4A96A] transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
            {auth.loggedIn && (
              <>
                <li>
                  <Link to="/wallet" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black hover:text-[#D4A96A] transition-colors">
                    My Wallet
                  </Link>
                </li>
                <li>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black hover:text-[#D4A96A] transition-colors">
                    Profile
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          {auth.loggedIn ? (
            <div className="mt-auto pb-12">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-[#FDF6EC]/10 hover:bg-red-500/20 px-6 py-4 rounded-2xl text-lg font-bold transition-all"
              >
                <LogoutIcon className="text-xl" />
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-auto pb-12">
              <Link 
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#D4A96A] text-[#6B3F1F] hover:bg-[#FDF6EC] px-6 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg"
              >
                <FiUser className="text-xl" />
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
