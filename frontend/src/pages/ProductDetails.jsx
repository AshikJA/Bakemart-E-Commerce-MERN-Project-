import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { FiShoppingCart, FiArrowLeft, FiPlus, FiMinus, FiTruck, FiShield, FiHeart } from 'react-icons/fi';
import { addToCart } from '../utils/cartUtils';
import { toast } from 'react-toastify';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      toast.error('Product not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      toast.error('Insufficient stock');
      return;
    }
    addToCart(product, quantity);
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">Loading deliciousness...</div>;
  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-20">
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6B3F1F] font-bold hover:text-[#A0522D] transition-colors"
        >
          <FiArrowLeft /> Back to Shop
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#A0522D]/5 rounded-[30px] sm:rounded-[50px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative bg-white rounded-[30px] sm:rounded-[40px] p-4 sm:p-8 shadow-2xl overflow-hidden border border-[#D4A96A]/20 flex items-center justify-center">
             <img 
               src={
                 (product.images && product.images.length > 0) 
                 ? (product.images[activeImageIdx].startsWith('http') ? product.images[activeImageIdx] : `${api.defaults.baseURL.replace('/api', '')}/uploads/${product.images[activeImageIdx]}`)
                 : (product.image ? (product.image.startsWith('http') ? product.image : `${api.defaults.baseURL.replace('/api', '')}/uploads/${product.image}`) : 'https://via.placeholder.com/800x800?text=Chocolate')
               }
               alt={product.name}
               className="w-full h-auto max-h-[300px] sm:max-h-[500px] object-contain rounded-2xl sm:rounded-3xl transition-all duration-300"
             />
          </div>

          {(product.images && product.images.length > 1) && (
            <div className="flex justify-start sm:justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-2 overflow-x-auto pb-4 custom-scrollbar whitespace-nowrap">
               {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-16 h-16 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 transition-all ${activeImageIdx === idx ? 'ring-4 ring-[#6B3F1F] shadow-lg scale-105' : 'ring-1 ring-[#D4A96A]/30 opacity-70 hover:opacity-100'}`}
                  >
                     <img 
                       src={img.startsWith('http') ? img : `${api.defaults.baseURL.replace('/api', '')}/uploads/${img}`} 
                       alt={`Thumbnail ${idx}`}
                       className="w-full h-full object-cover"
                     />
                  </button>
               ))}
            </div>
          )}

        </div>

        {/* Right: Info Container */}
        <div className="space-y-6 sm:space-y-8 py-2 sm:py-4">
          <div className="space-y-2 sm:space-y-3">
            <span className="inline-block px-4 py-1 rounded-full bg-[#D4A96A]/20 text-[#A0522D] text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#6B3F1F] tracking-tight leading-tight">{product.name}</h1>
            <div className="text-3xl sm:text-4xl font-black text-[#A0522D]">₹{product.price}</div>
          </div>

          <p className="text-base sm:text-lg text-gray-600 leading-relaxed italic">
            "{product.description}"
          </p>

          <div className="h-px bg-[#D4A96A]/20 w-full"></div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
               <div className="flex items-center justify-between sm:justify-start gap-4 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-sm border border-[#D4A96A]/20 max-w-fit self-center sm:self-start">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-2 text-[#6B3F1F] hover:bg-[#FDF6EC] rounded-xl transition-colors"
                  >
                    <FiMinus strokeWidth={3} />
                  </button>
                  <span className="text-xl sm:text-2xl font-black w-8 sm:w-10 text-center text-[#6B3F1F]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="p-2 text-[#6B3F1F] hover:bg-[#FDF6EC] rounded-xl transition-colors"
                  >
                    <FiPlus strokeWidth={3} />
                  </button>
               </div>
               
               <div className="text-xs sm:text-sm font-bold text-[#A0522D] uppercase tracking-wider text-center sm:text-left">
                  {product.stock > 0 ? (
                    <span className="flex items-center justify-center sm:justify-start gap-2 text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-600 animate-ping"></div>
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-red-500">Currently Out of Stock</span>
                  )}
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    disabled={product.stock === 0}
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#6B3F1F] text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[25px] font-black text-lg sm:text-xl shadow-xl hover:bg-[#A0522D] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                >
                    <FiShoppingCart size={24} />
                    Add to Cart
                </button>
                <button className="p-4 sm:p-5 bg-white text-[#6B3F1F] rounded-2xl sm:rounded-[25px] shadow-lg border border-[#D4A96A]/20 hover:text-red-500 transition-colors flex items-center justify-center">
                    <FiHeart size={24} />
                </button>
            </div>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 pt-4 sm:pt-6">
             <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/50 border border-[#D4A96A]/10">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl flex-shrink-0"><FiTruck size={24} /></div>
                <div>
                    <h4 className="font-bold text-[#6B3F1F] text-sm">Fast Delivery</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">Scheduled Shipping</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/50 border border-[#D4A96A]/10">
                <div className="p-3 bg-green-100 text-green-600 rounded-2xl flex-shrink-0"><FiShield size={24} /></div>
                <div>
                    <h4 className="font-bold text-[#6B3F1F] text-sm">Quality</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500">Handcrafted Excellence</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
