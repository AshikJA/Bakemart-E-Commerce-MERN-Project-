import React from 'react';
import { GiChocolateBar } from 'react-icons/gi';

const Loading = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDF6EC]/80 backdrop-blur-md">
      <div className="relative">
        {/* Animated Rings */}
        <div className="absolute inset-0 rounded-full border-4 border-[#D4A96A]/20 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#6B3F1F]/10 animate-pulse scale-150"></div>
        
        {/* Main Icon */}
        <div className="relative bg-white p-8 rounded-[40px] shadow-2xl border border-[#D4A96A]/20 animate-bounce">
          <GiChocolateBar className="text-7xl text-[#6B3F1F]" />
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-black text-[#6B3F1F] tracking-tighter animate-pulse">
          Bake<span className="text-[#D4A96A]">Mart</span>
        </h2>
        <p className="text-[#A0522D] font-bold text-sm uppercase tracking-[0.3em] mt-2 opacity-60">
          Preparing Sweetness...
        </p>
      </div>

      {/* Floating Particles for extra flair */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-2 h-2 bg-[#D4A96A]/40 rounded-full animate-float-${i+1}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0% { transform: translateY(0) rotate(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        ${[1,2,3,4,5,6].map(i => `
          .animate-float-${i} {
            animation: float linear infinite;
          }
        `).join('')}
      `}} />
    </div>
  );
};

export default Loading;