import { LogoutIcon } from "./Icons"
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const navLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/add-products', label: 'Add Products' },
    { path: '/admin/add-category', label: 'Category' },
    { path: '/admin/view-orders', label: 'Orders' },
    { path: '/admin/returns', label: 'Returns' },
    { path: '/admin/refunds', label: 'Refunds' },
    { path: '/admin/banners', label: 'Banners' },
    { path: '/admin/add-coupon', label: 'Coupons' },
    { path: '/admin/sales-report', label: 'Sales' },
    { path: '/admin/revenue', label: 'Revenue' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand/Logo */}
          <div className="flex items-center">
            <NavLink to="/admin/dashboard" className="flex-shrink-0 flex items-center gap-3 group">
               <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
                 <span className="text-white font-bold text-xl">B</span>
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-lg text-slate-800 tracking-tight leading-none">
                   Bakemart
                 </span>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                   Admin Panel
                 </span>
               </div>
            </NavLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50/50 shadow-[inset_0_0_0_1px_rgba(79,70,229,0.1)]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* User/Actions Section */}
          <div className="flex items-center gap-4">
              
            <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
            
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 border border-transparent hover:border-rose-100"
            >
              <LogoutIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile/Compact Tablet Navigation - Horizontal Scroll */}
      <div className="xl:hidden border-t border-slate-100 bg-slate-50/30 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-2 px-4 py-3 min-w-max">
           {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "text-indigo-600 bg-white shadow-md shadow-indigo-100/50 border border-indigo-100"
                      : "text-slate-500 hover:text-indigo-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </div>
      </div>
    </nav>
  )
}
