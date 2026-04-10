import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiHome } from 'react-icons/fi';

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <FiAlertCircle className="relative text-9xl text-purple-400 mx-auto drop-shadow-2xl" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-white tracking-tighter">404</h1>
          <h2 className="text-3xl font-bold text-purple-200">Page Not Found</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Oops! The page you're looking for seems to have vanished into the digital void.
          </p>
        </div>

        <div className="pt-8">
          <Link to="/">
            <button className="group relative w-full inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-purple-600 rounded-2xl hover:bg-purple-700 active:scale-95 shadow-lg shadow-purple-500/25">
              <FiHome className="mr-2 text-xl group-hover:scale-110 transition-transform" />
              Return Home
            </button>
          </Link>
        </div>

        <div className="pt-12 text-slate-500 text-sm font-medium uppercase tracking-[0.2em]">
          Bakemart E-Commerce
        </div>
      </div>
    </div>
  );
}

export default NotFound;