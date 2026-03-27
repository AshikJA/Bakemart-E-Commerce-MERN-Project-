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

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">
        {/* Left: Image Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#A0522D]/5 rounded-[50px] blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-white rounded-[50px] p-8 shadow-2xl overflow-hidden border border-[#D4A96A]/20">
             <img 
               src={product.image ? `http://localhost:5000/uploads/${product.image}` : 'https://via.placeholder.com/800x800?text=Chocolate'} 
               alt={product.name}
               className="w-full h-auto object-contain rounded-3xl"
             />
          </div>
        </div>

        {/* Right: Info Container */}
        <div className="space-y-8 py-4">
          <div className="space-y-3">
            <span className="inline-block px-4 py-1 rounded-full bg-[#D4A96A]/20 text-[#A0522D] text-xs font-black uppercase tracking-widest leading-none">
              {product.category}
            </span>
            <h1 className="text-5xl font-black text-[#6B3F1F] tracking-tight">{product.name}</h1>
            <div className="text-4xl font-black text-[#A0522D]">₹{product.price}</div>
          </div>

          <p className="text-lg text-gray-600 leading-relaxed italic">
            "{product.description}"
          </p>

          <div className="h-px bg-[#D4A96A]/20 w-full"></div>

          {/* Controls */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
               <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-sm border border-[#D4A96A]/20">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="p-2 text-[#6B3F1F] hover:bg-[#FDF6EC] rounded-xl transition-colors"
                  >
                    <FiMinus strokeWidth={3} />
                  </button>
                  <span className="text-2xl font-black w-10 text-center text-[#6B3F1F]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="p-2 text-[#6B3F1F] hover:bg-[#FDF6EC] rounded-xl transition-colors"
                  >
                    <FiPlus strokeWidth={3} />
                  </button>
               </div>
               
               <div className="text-sm font-bold text-[#A0522D] uppercase tracking-wider">
                  {product.stock > 0 ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 rounded-full bg-green-600 animate-ping"></div>
                      In Stock ({product.stock} units)
                    </span>
                  ) : (
                    <span className="text-red-500">Currently Out of Stock</span>
                  )}
               </div>
            </div>

            <div className="flex gap-4">
                <button 
                    disabled={product.stock === 0}
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#6B3F1F] text-white px-8 py-5 rounded-[25px] font-black text-xl shadow-xl hover:bg-[#A0522D] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                >
                    <FiShoppingCart size={24} />
                    Add to Cart
                </button>
                <button className="p-5 bg-white text-[#6B3F1F] rounded-[25px] shadow-lg border border-[#D4A96A]/20 hover:text-red-500 transition-colors">
                    <FiHeart size={24} />
                </button>
            </div>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 gap-4 pt-6">
             <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/50 border border-[#D4A96A]/10">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><FiTruck size={24} /></div>
                <div>
                    <h4 className="font-bold text-[#6B3F1F] text-sm">Fast Delivery</h4>
                    <p className="text-xs text-gray-500">Within 24-48 Hours</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/50 border border-[#D4A96A]/10">
                <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><FiShield size={24} /></div>
                <div>
                    <h4 className="font-bold text-[#6B3F1F] text-sm">Guaranteed Quality</h4>
                    <p className="text-xs text-gray-500">100% Original</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
