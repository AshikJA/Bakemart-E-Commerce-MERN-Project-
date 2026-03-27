import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { addToCart } from '../utils/cartUtils';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="group bg-[#FDF6EC] rounded-[30px] overflow-hidden shadow-lg border border-[#D4A96A]/20 transition-all duration-300 hover:shadow-2xl hover:translate-y-[-8px]">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={product.image ? `http://localhost:5000/uploads/${product.image}` : 'https://via.placeholder.com/400x400?text=Chocolate'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <Link 
            to={`/product/${product._id}`}
            className="p-3 bg-white text-[#6B3F1F] rounded-full shadow-lg hover:bg-[#F5E6D3] transition-colors"
          >
            <FiEye size={24} />
          </Link>
        </div>
        {product.stock <= 5 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            Only {product.stock} Left!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-2">
          <span className="text-[#D4A96A] text-xs font-bold uppercase tracking-widest">{product.category}</span>
          <h3 className="text-[#6B3F1F] text-xl font-bold truncate mt-1">{product.name}</h3>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div className="text-2xl font-black text-[#A0522D]">
            ₹{product.price}
          </div>
          <button 
            onClick={handleAddToCart}
            className="p-3 bg-[#6B3F1F] text-[#FDF6EC] rounded-2xl hover:bg-[#A0522D] transition-all active:scale-90 shadow-md"
          >
            <FiShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
