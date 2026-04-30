import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { LuHeart } from "react-icons/lu";
import { FiShoppingCart, FiArrowLeft, FiPlus, FiMinus, FiTruck, FiShield, FiZap, FiRefreshCw, FiLock, FiStar, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { addToCart } from '../../utils/cartUtils';
import { toast } from 'react-toastify';
import { isUserAuthenticated, getUserId } from '../../utils/auth';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Tooltip } from 'react-tooltip';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [pincode, setPincode] = useState('');
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);
  const [deliveryError, setDeliveryError] = useState('');

  const loggedInUserId = getUserId();
  const isLoggedIn = isUserAuthenticated();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultVariant);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  useEffect(() => {
    if (product?._id && product?.category) {
      const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
      const pid = typeof product._id === 'object' ? product._id : product._id;
      fetchRelatedProducts(pid, categoryId);
    }
  }, [product]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/products/wishlist');
      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

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
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (currentStock < quantity) {
      toast.error('Insufficient stock');
      return;
    }
    addToCart(product, quantity, selectedVariant);
    toast.success(`${quantity} ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (currentStock < quantity) {
      toast.error('Insufficient stock');
      return;
    }
    addToCart(product, quantity, selectedVariant);
    // toast.success(`${quantity} ${product.name} added to cart!`);
    navigate('/checkout');
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
          i <= rating ? (
            <FaStar key={i} className="text-yellow-500" />
          ) : (
            <FiStar key={i} className="text-gray-300" />
          )
        );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setIsReviewSubmitting(true);
      if (editingReviewId) {
        await api.put(`/products/${id}/reviews/${editingReviewId}`, {
          rating: reviewRating,
          comment: reviewComment
        });
        toast.success("Review updated successfully");
      } else {
        await api.post(`/products/${id}/reviews`, {
          rating: reviewRating,
          comment: reviewComment
        });
        toast.success("Review submitted successfully");
      }
      setReviewRating(5);
      setReviewComment("");
      setEditingReviewId(null);
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewRating(review.rating);
    setReviewComment(review.comment);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
        setReviewRating(5);
        setReviewComment("");
      }
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const fetchRelatedProducts = async (pid, cid) => {
    try {
      const response = await api.get(`/products/related-product/${pid}/${cid}`);
      setRelatedProducts(response.data?.related || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleToggleWishlist = async (pid) => {
    try {
      const {data} = await api.put(`/products/wishlist/${pid}`)
      toast.success(data.message)
      fetchWishlist();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  }

  const checkDeliveryByPincode = async (p) => {
    const currentPincode = String(p || '').trim();
    
    if (!currentPincode || currentPincode.length !== 6) {
      setDeliveryError('Please enter a valid 6-digit pincode');
      return;
    }

    setDeliveryError('');
    setDeliveryEstimate(null);
    setCheckingDelivery(true);
    
    try {
      const response = await api.post('/shipping/check-delivery', { 
        pincode: currentPincode, 
        weight: product.weight  
      });
      
      if (response.data.success) {
        if (response.data.available) {
          setDeliveryEstimate(response.data.deliveryEstimate);
        } else {
          setDeliveryError(response.data.message || 'Delivery not available');
        }
      } else {
        setDeliveryError('Unable to check delivery. Please try again.');
      }
    } catch (error) {
      setDeliveryError(error.response?.data?.message || 'Failed to check delivery');
    } finally {
      setCheckingDelivery(false);
    }
  };

  const checkDelivery = async (e) => {
    if (e) e.preventDefault();
    checkDeliveryByPincode(pincode);
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
            
            <div className="flex items-center gap-3">
              {renderStars(product.rating || 0)}
              <span className="text-sm font-bold text-gray-500">
                ({product.numReviews || 0} customer reviews)
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-[#A0522D]">
              {selectedVariant ? `₹${selectedVariant.price}` : `₹${product.price}`}
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#6B3F1F] uppercase tracking-wider">
                Select {product.variantType || 'Option'}:
              </label>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => variant.stock > 0 && setSelectedVariant(variant)}
                    disabled={variant.stock === 0}
                    className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                      selectedVariant?.name === variant.name
                        ? 'bg-[#6B3F1F] text-[#FDF6EC]'
                        : 'border border-[#6B3F1F] text-[#6B3F1F] hover:bg-[#FDF6EC]'
                    } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {variant.name} ₹{variant.price}
                    {variant.stock === 0 && ' (Out of Stock)'}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <p className="text-xs text-gray-500 font-medium">
                  Selected: {selectedVariant.name} • Stock: {selectedVariant.stock > 0 ? selectedVariant.stock : 'Out of Stock'}
                </p>
              )}
            </div>
          )}

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
                     onClick={() => {
                       const maxStock = selectedVariant ? selectedVariant.stock : product.stock;
                       setQuantity(prev => Math.min(maxStock, prev + 1));
                     }}
                     className="p-2 text-[#6B3F1F] hover:bg-[#FDF6EC] rounded-xl transition-colors"
                   >
                     <FiPlus strokeWidth={3} />
                   </button>
                </div>
                
                <div className="text-xs sm:text-sm font-bold text-[#A0522D] uppercase tracking-wider text-center sm:text-left">
                   {(selectedVariant ? selectedVariant.stock : product.stock) > 0 ? (
                     <span className="flex items-center justify-center sm:justify-start gap-2 text-green-600">
                       <div className="w-2 h-2 rounded-full bg-green-600 animate-ping"></div>
                       In Stock
                     </span>
                   ) : (
                     <span className="text-red-500">Currently Out of Stock</span>
                   )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    disabled={(selectedVariant ? selectedVariant.stock : product.stock) === 0}
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#6B3F1F] text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[25px] font-black text-lg sm:text-xl shadow-xl hover:bg-[#A0522D] transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                >
                    <FiShoppingCart size={24} />
                    Add to Cart
                </button>
                <button 
                    disabled={(selectedVariant ? selectedVariant.stock : product.stock) === 0}
                    onClick={handleBuyNow}
                    className="flex-1 bg-green-600 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[25px] font-black text-lg sm:text-xl shadow-xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                >
                    <FiZap size={24} />
                    Buy Now
                </button>
                <button data-tooltip-id="wishlist-tooltip" data-tooltip-content="Wishlist" onClick={() => handleToggleWishlist(product._id)} className="p-4 sm:p-5 bg-white text-[#6B3F1F] rounded-2xl sm:rounded-[25px] shadow-lg border border-[#D4A96A]/20 hover:text-red-500 transition-colors flex items-center justify-center">
                    {wishlist.find(iteam => iteam._id === product._id) ? (
                        <LuHeart size={24} className="text-red-500 fill-red-500" />
                    ) : (
                        <LuHeart size={24} className="text-red-500" />
                    )}
                </button>
                <Tooltip id="wishlist-tooltip" />
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-4 sm:pt-6">
             <div className="flex items-center gap-2 p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white/50 border border-[#D4A96A]/10">
                <div className="p-2 sm:p-2.5 bg-blue-100 text-blue-600 rounded-xl sm:rounded-2xl flex-shrink-0"><FiTruck size={18} /></div>
                <div className="text-center">
                    <h4 className="font-bold text-[#6B3F1F] text-[10px] sm:text-xs">Fast Delivery</h4>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 hidden sm:block">Scheduled Shipping</p>
                </div>
             </div>
             <div className="flex items-center gap-2 p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white/50 border border-[#D4A96A]/10">
               <div className="p-2 sm:p-2.5 bg-yellow-100 text-yellow-600 rounded-xl sm:rounded-2xl flex-shrink-0"><FiShield size={18} /></div>
                 <div className="text-center">
                    <h4 className="font-bold text-[#6B3F1F] text-[10px] sm:text-xs">Quality</h4>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 hidden sm:block">Handcrafted Excellence</p>
                </div>
             </div>
             <div className="flex items-center gap-2 p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white/50 border border-[#D4A96A]/10">
               <div className="p-2 sm:p-2.5 bg-red-100 text-red-600 rounded-xl sm:rounded-2xl flex-shrink-0"><FiRefreshCw size={18} /></div>
                 <div className="text-center">
                    <h4 className="font-bold text-[#6B3F1F] text-[10px] sm:text-xs">7 Days Return</h4>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 hidden sm:block">Eligible for return</p>
                </div>
             </div>
             <div className="flex items-center gap-2 p-2 sm:p-3 rounded-2xl sm:rounded-3xl bg-white/50 border border-[#D4A96A]/10">
               <div className="p-2 sm:p-2.5 bg-green-100 text-green-600 rounded-xl sm:rounded-2xl flex-shrink-0"><FiLock size={18} /></div>
                 <div className="text-center">
                    <h4 className="font-bold text-[#6B3F1F] text-[10px] sm:text-xs">Secure Payment</h4>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 hidden sm:block">Encrypted</p>
                </div>
             </div>
          </div>

          {/* Check Delivery Estimate */}
          <div className="mt-6 p-4 bg-white rounded-2xl border border-[#D4A96A]/20">
            <div className="flex items-center gap-2 mb-3">
              <FiMapPin className="text-[#6B3F1F]" size={18} />
              <h4 className="font-bold text-[#6B3F1F] text-sm">Check Delivery</h4>
            </div>
            <form onSubmit={checkDelivery} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincode(val);
                    if (val.length === 6) {
                      checkDeliveryByPincode(val);
                    }
                  }}
                  placeholder="Enter 6-digit pincode"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D4A96A]/30 bg-[#FDF6EC] text-[#6B3F1F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A96A] text-sm font-medium"
                  maxLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={checkingDelivery || pincode.length !== 6}
                className="px-6 py-2.5 bg-[#6B3F1F] text-white rounded-xl font-bold text-sm hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkingDelivery ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking...
                  </span>
                ) : (
                  'Check'
                )}
              </button>
            </form>

            {deliveryError && (
              <p className="mt-3 text-red-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {deliveryError}
              </p>
            )}

            {deliveryEstimate && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <FiTruck className="text-white" size={14} />
                  </div>
                  <span className="font-bold text-green-700 text-sm">Estimated Delivery</span>
                </div>
                <p className="text-green-800 font-black text-lg">
                  {deliveryEstimate.dateRange}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                    {deliveryEstimate.courierName}
                  </span>
                  {deliveryEstimate.deliveryInfo && (
                    <span className="text-xs text-green-600 font-medium">
                      {deliveryEstimate.deliveryInfo}
                    </span>
                  )}
                  {deliveryEstimate.isCODAvailable && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                      COD Available
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 lg:mt-24">
          <h3 className="text-2xl sm:text-3xl font-black text-[#6B3F1F] mb-8">Similar Products</h3>
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            spaceBetween={16}
            slidesPerView={1.5}
            breakpoints={{
              640: { slidesPerView: 2.5, spaceBetween: 24 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="pb-4"
          >
            {relatedProducts.map((p) => (
              <SwiperSlide key={p._id}>
                <div 
                  onClick={() => navigate(`/product/${p.slug || p._id}`)}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-[#D4A96A]/20 cursor-pointer hover:shadow-xl hover:scale-105 transition-all group h-full flex flex-col"
                >
                  <div className="relative bg-[#FDF6EC] p-4 sm:p-6">
                    <img
                      src={
                        (p.images && p.images.length > 0)
                          ? (p.images[0].startsWith('http') ? p.images[0] : `${api.defaults.baseURL.replace('/api', '')}/uploads/${p.images[0]}`)
                          : (p.image ? (p.image.startsWith('http') ? p.image : `${api.defaults.baseURL.replace('/api', '')}/uploads/${p.image}`) : 'https://via.placeholder.com/400x400?text=Chocolate')
                      }
                      alt={p.name}
                      className="w-full h-32 sm:h-48 object-cover rounded-xl sm:rounded-2xl"
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h5 className="font-bold text-[#6B3F1F] text-sm sm:text-base truncate">{p.name}</h5>
                    <p className="text-gray-500 text-[10px] sm:text-xs mt-1 line-clamp-2">{p.description?.substring(0, 50)}...</p>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="font-black text-[#A0522D] text-lg sm:text-xl">₹{p.price}</span>
                      <span className="text-xs font-bold text-gray-400 group-hover:text-[#A0522D] transition-colors">View</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 lg:mt-24">
        <div className="bg-white rounded-[30px] sm:rounded-[40px] p-6 sm:p-12 shadow-xl border border-[#D4A96A]/20">
            <h2 className="text-2xl sm:text-3xl font-black text-[#6B3F1F] mb-8">Customer Reviews</h2>
            
            {/* Reviews List */}
            <div className="space-y-6 mb-12">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map(review => (
                  <div key={review._id} className="p-6 rounded-2xl bg-[#FDF6EC] border border-[#D4A96A]/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-[#6B3F1F] text-lg">{review.name}</div>
                        <div className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         {renderStars(review.rating)}
                         {loggedInUserId === review.user && (
                           <div className="flex gap-2 text-sm">
                             <button onClick={() => handleEditReview(review)} className="text-blue-500 hover:text-blue-700 p-1 bg-white rounded-lg shadow-sm border border-blue-100"><FiEdit2 /></button>
                             <button onClick={() => handleDeleteReview(review._id)} className="text-red-500 hover:text-red-700 p-1 bg-white rounded-lg shadow-sm border border-red-100"><FiTrash2 /></button>
                           </div>
                         )}
                      </div>
                    </div>
                    <p className="text-gray-700 italic">"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic py-4">No reviews yet. Be the first to share your experience!</div>
              )}
            </div>

            {/* Write a Review Form */}
            {isLoggedIn ? (
              <div className="bg-[#FDF6EC] p-6 sm:p-8 rounded-3xl border border-[#D4A96A]/20">
                <h3 className="text-xl font-bold text-[#6B3F1F] mb-6">
                  {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#6B3F1F] mb-2">Rating</label>
                    <div className="flex gap-2 cursor-pointer">
                       {[1, 2, 3, 4, 5].map(star => (
                         <button 
                           type="button" 
                           key={star} 
                           onClick={() => setReviewRating(star)}
                           className="text-2xl focus:outline-none focus:ring-0 transition-transform hover:scale-110 active:scale-95"
                         >
                           {star <= reviewRating ? <FaStar className="text-yellow-500 drop-shadow-sm" /> : <FiStar className="text-gray-400" />}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#6B3F1F] mb-2">Your Review</label>
                    <textarea 
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full rounded-2xl border border-[#D4A96A]/30 bg-white p-4 text-gray-700 focus:ring-2 focus:ring-[#D4A96A] focus:outline-none resize-none"
                      rows="4"
                      placeholder="Share your thoughts about this delicious item..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      type="submit" 
                      disabled={isReviewSubmitting}
                      className="bg-[#6B3F1F] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#A0522D] transition-colors shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      {isReviewSubmitting ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                    </button>
                    {editingReviewId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingReviewId(null);
                          setReviewRating(5);
                          setReviewComment("");
                        }}
                        className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors shadow-md active:scale-95"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="mt-8 bg-[#FDF6EC] p-6 text-center rounded-3xl border border-[#D4A96A]/20">
                <p className="text-[#6B3F1F] font-bold mb-4">Please log in to write a review for this product.</p>
                <Link to="/login" className="inline-block bg-[#D4A96A] text-[#6B3F1F] px-8 py-3 rounded-xl font-bold hover:bg-[#A0522D] hover:text-white transition-colors shadow-lg">
                  Login
                </Link>
              </div>
            )}
        </div>
      </div>

    </div>
  );
}

export default ProductDetails;
