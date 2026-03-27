import React from 'react';
import { Link } from 'react-router-dom';
import { FiServer, FiHome, FiRefreshCw } from 'react-icons/fi';

function InternalServerError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-rose-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
          <FiServer className="relative text-9xl text-rose-400 mx-auto drop-shadow-2xl" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-white tracking-tighter">500</h1>
          <h2 className="text-3xl font-bold text-rose-200">Server Error</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Something went wrong on our end. Our technical bakers are working on it!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 inline-flex items-center justify-center px-6 py-4 font-bold text-slate-200 transition-all duration-200 bg-slate-800/50 border border-slate-700 rounded-2xl hover:bg-slate-800 hover:text-white active:scale-95"
          >
            <FiRefreshCw className="mr-2 text-xl" />
            Try Again
          </button>
          <Link to="/" className="flex-1">
            <button className="w-full inline-flex items-center justify-center px-6 py-4 font-bold text-white transition-all duration-200 bg-rose-600 rounded-2xl hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-500/25">
              <FiHome className="mr-2 text-xl" />
              Home
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

export default InternalServerError;