import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { addToCart } from '../utils/cartUtils';
import { toast } from 'react-toastify';
import api from '../api/client';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className="group bg-white rounded-[32px] overflow-hidden shadow-sm border border-[#D4A96A]/10 transition-all duration-500 hover:shadow-2xl hover:translate-y-[-8px] cursor-pointer flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-[#FDF6EC]/50">
        <img 
          src={product.image ? (product.image.startsWith('http') ? product.image : `${api.defaults.baseURL.replace('/api', '')}/uploads/${product.image}`) : 'https://via.placeholder.com/400x400?text=Chocolate'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg animate-pulse">
            Only {product.stock} Left!
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-[#6B3F1F] text-white text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="mb-4 flex-1">
          <span className="text-[#D4A96A] text-[10px] font-black uppercase tracking-[0.2em]">{product.category}</span>
          <h3 className="text-[#6B3F1F] text-lg sm:text-xl font-bold truncate mt-1 group-hover:text-[#A0522D] transition-colors">{product.name}</h3>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#D4A96A]/10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</span>
            <div className="text-xl sm:text-2xl font-black text-[#6B3F1F]">
              ₹{product.price}
            </div>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-3.5 bg-[#6B3F1F] text-[#FDF6EC] rounded-2xl hover:bg-[#A0522D] transition-all active:scale-95 shadow-md hover:shadow-xl disabled:opacity-50 disabled:grayscale"
          >
            <FiShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
