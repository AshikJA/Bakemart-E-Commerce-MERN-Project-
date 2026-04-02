import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { FiXCircle, FiRefreshCcw, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ isOpen: false, orderId: null, actionType: null, reason: '' });

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders || res.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch (e) {}
    };
  }, []);

  const openModal = (id, action) => {
    setModalState({ isOpen: true, orderId: id, actionType: action, reason: '' });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, orderId: null, actionType: null, reason: '' });
  };

  const submitAction = async (e) => {
    e.preventDefault();
    const { orderId, actionType, reason } = modalState;
    if (!reason.trim()) {
      return toast.warning('Please provide a reason');
    }

    try {
      await api.post(`/orders/${orderId}/${actionType}`, { reason });
      toast.success(`Order ${actionType} processed successfully! Refund sent to wallet if applicable.`);
      fetchOrders();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${actionType} order`);
    }
  };

  const handleRetryPayment = async (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      name: 'Bakemart',
      description: 'Order Payment Retry',
      order_id: order.razorpayOrderId,
      handler: async function (response) {
        try {
          await api.post('/orders/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          toast.success('Payment successful!');
          fetchOrders();
        } catch (err) {
          toast.error('Payment verification failed');
        }
      },
      prefill: {
        name: order.shippingAddress?.name,
        contact: order.shippingAddress?.phoneNumber,
      },
      theme: { color: '#6B3F1F' }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    return steps.indexOf(status);
  };

  const StatusTimeline = ({ order }) => {
    const stages = [
      { id: 'placed', label: 'Order Placed', date: order.createdAt },
      { id: 'confirmed', label: order.paymentMethod === 'COD' ? 'Confirmed' : 'Paid', date: order.paymentStatus === 'paid' || order.paymentMethod === 'COD' ? order.createdAt : null },
      { id: 'shipped', label: 'Shipped', date: order.shippedAt },
      { id: 'delivered', label: 'Delivered', date: order.deliveredAt },
    ];

    const currentStep = order.orderStatus === 'cancelled' || order.orderStatus === 'returned' ? -1 : getStatusStep(order.orderStatus);

    return (
      <div className="mt-8 mb-4">
        <div className="flex justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
          <div 
            className="absolute top-4 left-0 h-0.5 bg-[#D4A96A] transition-all duration-500 -z-10" 
            style={{ width: `${Math.max(0, currentStep) * 33.33}%` }}
          ></div>

          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentStep;
            
            return (
              <div key={stage.id} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-colors ${
                  isCompleted ? 'bg-[#6B3F1F] border-[#D4A96A] text-white' : 'bg-white border-gray-100 text-gray-300'
                }`}>
                  {isCompleted ? <FiCheckCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-tighter mt-2 text-center ${isCompleted ? 'text-[#6B3F1F]' : 'text-gray-400'}`}>
                  {stage.label}
                </p>
                {stage.date && isCompleted && (
                  <p className="text-[9px] text-gray-400 mt-0.5 font-bold">
                    {new Date(stage.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        
        {order.orderStatus === 'cancelled' && (
           <div className="mt-6 p-3 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 border border-red-100">
             <FiXCircle size={18} />
             <span className="text-xs font-bold uppercase tracking-widest">Order Cancelled</span>
           </div>
        )}
        {order.orderStatus === 'returned' && (
           <div className="mt-6 p-3 bg-red-50 rounded-xl flex items-center gap-3 text-red-600 border border-red-100">
             <FiRefreshCcw size={18} />
             <span className="text-xs font-bold uppercase tracking-widest">Order Returned</span>
           </div>
        )}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': 
      case 'returned': return 'text-red-600 bg-red-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center font-bold text-[#6B3F1F]">Loading Orders...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <Link to="/" className="inline-flex items-center text-[#A0522D] hover:text-[#6B3F1F] font-bold mb-4 transition-colors">
            <FiArrowLeft className="mr-2" /> Back to Shop
          </Link>
          <h1 className="text-3xl font-black text-[#6B3F1F]">My Orders</h1>
          <p className="text-gray-600 mt-2">Track, return, or cancel your recent purchases.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
            <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#D4A96A]/20">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div>
                    <h2 className="font-bold text-gray-800">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h2>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 font-black uppercase tracking-widest">{order.paymentMethod} • <span className={order.paymentStatus === 'paid' ? 'text-green-500' : 'text-gray-400'}>{order.paymentStatus}</span></p>
                  </div>
                </div>

                <StatusTimeline order={order} />

                <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mt-6">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Order Items</h3>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <img src={item.image ? (item.image.startsWith('http') ? item.image : `${api.defaults.baseURL.replace('/api', '')}/uploads/${item.image}`) : 'https://via.placeholder.com/50'} className="w-12 h-12 rounded-lg object-cover bg-white shadow-sm" alt="" />
                        <div>
                          <p className="font-bold text-[#6B3F1F]">{item.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black text-[#6B3F1F]">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-lg font-black text-[#6B3F1F]">
                    Total: ₹{order.totalAmount}
                  </div>
                  
                  <div className="flex gap-3 w-full sm:w-auto">
                    {order.paymentStatus === 'failed' && order.paymentMethod !== 'COD' && (
                      <button 
                         onClick={() => handleRetryPayment(order)}
                         className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-[#6B3F1F] text-white rounded-xl font-bold hover:bg-[#A0522D] transition-all shadow-lg active:scale-95"
                      >
                        <FiCheckCircle size={18} /> Pay Now
                      </button>
                    )}
                    {['pending', 'processing'].includes(order.orderStatus) && (
                      <button 
                        onClick={() => openModal(order._id, 'cancel')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                      >
                        <FiXCircle /> {order.paymentStatus === 'failed' ? 'Dismiss Order' : 'Cancel Order'}
                      </button>
                    )}
                    {order.orderStatus === 'delivered' && (
                      <button 
                        onClick={() => openModal(order._id, 'return')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                      >
                        <FiRefreshCcw /> Request Return
                      </button>
                    )}
                  </div>
                </div>

                {order.paymentStatus === 'failed' && (
                  <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-red-600 text-xs font-bold leading-relaxed">
                       ⚠️ Payment for this order failed or was cancelled. If you still want these delicious treats, please click "Pay Now" above to complete your purchase!
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-black text-[#6B3F1F] mb-2 capitalize">{modalState.actionType} Order</h3>
            <p className="text-gray-500 mb-6">Please provide a reason why you wish to {modalState.actionType} this order.</p>
            
            <form onSubmit={submitAction} className="space-y-6">
              <textarea 
                required
                rows={4}
                placeholder="Enter your reason here..."
                className="w-full px-5 py-4 rounded-2xl bg-[#FDF6EC] border-none text-[#6B3F1F] focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all resize-none"
                value={modalState.reason}
                onChange={(e) => setModalState({ ...modalState, reason: e.target.value })}
              ></textarea>
              
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-[#6B3F1F] text-white font-black rounded-2xl shadow-xl hover:bg-[#A0522D] transition-all capitalize">
                  Confirm {modalState.actionType}
                </button>
                <button type="button" onClick={closeModal} className="px-8 py-4 bg-[#F5E6D3] text-[#6B3F1F] font-black rounded-2xl border border-[#D4A96A]/20 hover:bg-[#D4A96A] transition-all">
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}