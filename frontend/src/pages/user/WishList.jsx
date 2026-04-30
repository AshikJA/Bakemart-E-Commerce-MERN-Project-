import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiArrowLeft, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../api/client';
import { isUserAuthenticated } from '../../utils/auth';
import { addToCart } from '../../utils/cartUtils';

function WishList() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [navigate]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/products/wishlist');
      setWishlistItems(response.data.wishlist || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await api.put(`/products/wishlist/${productId}`);
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item, 1, null);
    toast.success('Added to cart');
    navigate('/cart');
  };

  const getImageUrl = (item) => {
    if (item.images && item.images.length > 0) {
      return item.images[0].startsWith('http') 
        ? item.images[0] 
        : `${api.defaults.baseURL.replace('/api', '')}/uploads/${item.images[0]}`;
    }
    if (item.image) {
      return item.image.startsWith('http') 
        ? item.image 
        : `${api.defaults.baseURL.replace('/api', '')}/uploads/${item.image}`;
    }
    return 'https://via.placeholder.com/400x400?text=No+Image';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6EC]">
        Loading wishlist...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] pb-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6B3F1F] font-bold hover:text-[#A0522D] transition-colors mb-6"
        >
          <FiArrowLeft /> Continue Shopping
        </button>

        <h1 className="text-3xl font-bold text-[#6B3F1F] mb-8">My Wishlist</h1>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
            <Link 
              to="/shop" 
              className="inline-block bg-[#6B3F1F] text-white px-6 py-3 rounded-lg hover:bg-[#A0522D] transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-white p-2 rounded-full shadow-md">
                    <FiHeart className="text-red-500 text-xl fill-red-500" />
                  </div>
                </div>
                <div 
                  className="cursor-pointer"
                  onClick={() => navigate(`/product/${item._id}`)}
                >
                  <img 
                    src={getImageUrl(item)} 
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 
                    className="font-semibold text-[#6B3F1F] cursor-pointer hover:text-[#A0522D]"
                    onClick={() => navigate(`/product/${item._id}`)}
                  >
                    {item.name}
                  </h3>
                  <p className="text-lg font-bold text-[#6B3F1F] mt-2">
                    Rs. {item.price?.toFixed(2)}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-[#6B3F1F] text-white py-2 rounded-lg hover:bg-[#A0522D] transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={() => handleRemoveFromWishlist(item._id)}
                      className="p-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WishList;