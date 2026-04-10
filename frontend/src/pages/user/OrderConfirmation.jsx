import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

export default function OrderConfirmation() {
  const location = useLocation();
  const { orderId } = location.state || { orderId: 'Unknown' };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-green-100 max-w-md w-full">
        <FiCheckCircle className="text-8xl text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black text-[#6B3F1F] mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-6 font-medium">Your order <span className="text-[#A0522D] font-bold">#{orderId}</span> has been placed successfully.</p>
        <Link to="/view-orders">
          <button className="w-full bg-[#6B3F1F] text-white py-4 rounded-2xl font-bold hover:bg-[#A0522D] transition-all">
            View My Orders
          </button>
        </Link>
      </div>
    </div>
  );
}
