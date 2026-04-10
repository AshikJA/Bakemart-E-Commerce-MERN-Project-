import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { toast } from 'react-toastify';
import { FiXCircle, FiRefreshCcw, FiArrowLeft, FiCheckCircle, FiUpload, FiX, FiImage, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ 
    isOpen: false, 
    orderId: null, 
    actionType: null, 
    reason: '',
    images: []
  });
  const [choiceModal, setChoiceModal] = useState({
    isOpen: false,
    orderId: null,
    amount: 0,
    choice: '', // 'wallet' or 'bank'
    bankDetails: { accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' }
  });
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const fileInputRef = useRef(null);

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
    setModalState({ isOpen: true, orderId: id, actionType: action, reason: '', images: [] });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, orderId: null, actionType: null, reason: '', images: [] });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.warning('Maximum 5 images allowed');
      return;
    }
    
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.warning(`${file.name} is not a valid image type`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.warning(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (modalState.images.length + validFiles.length > 5) {
      toast.warning('Maximum 5 images allowed');
      return;
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setModalState(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const removeImage = (index) => {
    setModalState(prev => {
      const newImages = [...prev.images];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const submitAction = async (e) => {
    e.preventDefault();
    const { orderId, actionType, reason, images } = modalState;

    if (actionType === 'return') {
      if (!reason.trim()) {
        return toast.warning('Please provide a reason for return');
      }

      setSubmitting(true);
      try {
        const formData = new FormData();
        formData.append('reason', reason);
        images.forEach(img => {
          formData.append('images', img.file);
        });

        await api.post(`/orders/${orderId}/return`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Return request submitted successfully!');
        fetchOrders();
        closeModal();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to submit return request');
      } finally {
        setSubmitting(false);
      }
    } else {
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
    }
  };

  const handleRefundChoiceSubmit = async (e) => {
    e.preventDefault();
    const { orderId, choice, bankDetails } = choiceModal;

    if (!choice) return toast.warning('Please select a refund method');
    if (choice === 'bank' && (!bankDetails.accountNumber || !bankDetails.ifscCode)) {
      return toast.warning('Please fill in bank details');
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/orders/${orderId}/refund-choice`, { choice, bankDetails });
      toast.success(res.data.message);
      fetchOrders();
      setChoiceModal({ ...choiceModal, isOpen: false });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit refund choice');
    } finally {
      setSubmitting(false);
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

  const downloadInvoice = async (orderId) => {
    setDownloading(orderId);
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `BakeMart-Invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(null);
    }
  };

  const fetchRefundStatus = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/refund`);
      toast.info(`Refund Status: ${res.data.status}`);
      
      // Update local setOrders
      setOrders(prev => prev.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            refund: {
              ...order.refund,
              status: res.data.status,
              processedAt: res.data.processedAt,
              failureReason: res.data.failureReason
            }
          };
        }
        return order;
      }));
    } catch (error) {
      toast.error('Failed to fetch refund status');
    }
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

  const getReturnStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { class: 'bg-yellow-100 text-yellow-800', label: '⏳ Return Pending' };
      case 'approved': return { class: 'bg-green-100 text-green-800', label: '✅ Return Approved' };
      case 'rejected': return { class: 'bg-red-100 text-red-800', label: '❌ Return Rejected' };
      default: return null;
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
            {orders.map((order) => {
              const returnBadge = order.returnRequest?.requested ? getReturnStatusBadge(order.returnRequest?.status) : null;
              
              return (
                <div key={order._id} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#D4A96A]/20">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                    <div>
                      <h2 className="font-bold text-gray-800">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h2>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                        {returnBadge && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${returnBadge.class}`}>
                            {returnBadge.label}
                          </span>
                        )}
                      </div>
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
                    
                    <div className="flex gap-3 w-full sm:w-auto flex-wrap">
                      {order.paymentStatus === 'paid' && (
                        <button 
                          onClick={() => downloadInvoice(order._id)}
                          disabled={downloading === order._id}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-[#6B3F1F] text-[#6B3F1F] rounded-full font-bold text-sm hover:bg-[#FDF6EC] transition-colors disabled:opacity-60"
                        >
                          {downloading === order._id ? (
                            <span className="w-4 h-4 border-2 border-[#6B3F1F]/30 border-t-[#6B3F1F] rounded-full animate-spin" />
                          ) : (
                            <FiDownload size={16} />
                          )}
                          Download Invoice
                        </button>
                      )}
                      {order.paymentStatus === 'failed' && order.paymentMethod !== 'COD' && (
                        <>
                          <button 
                            onClick={() => handleRetryPayment(order)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-[#6B3F1F] text-white rounded-xl font-bold hover:bg-[#A0522D] transition-all shadow-lg active:scale-95"
                          >
                            <FiCheckCircle size={18} /> Pay Now
                          </button>
                          <button 
                            onClick={() => openModal(order._id, 'cancel')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                          >
                            <FiXCircle /> Cancel Order
                          </button>
                        </>
                      )}
                      {['pending', 'processing'].includes(order.orderStatus) && order.paymentStatus !== 'failed' && (
                        <button 
                          onClick={() => openModal(order._id, 'cancel')}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                        >
                          <FiXCircle /> Cancel Order
                        </button>
                      )}
                      {order.orderStatus === 'delivered' && (
                        <>
                          {order.returnRequest?.requested ? (
                            <span className={`px-4 py-2 rounded-xl font-bold text-sm ${returnBadge?.class}`}>
                              {returnBadge?.label}
                            </span>
                          ) : (
                            <button 
                              onClick={() => openModal(order._id, 'return')}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors"
                            >
                              <FiRefreshCcw /> Request Return
                            </button>
                          )}
                        </>
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

                  {order.returnRequest?.adminNote && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-blue-600 text-xs font-bold">
                        <span className="uppercase">Admin Note:</span> {order.returnRequest.adminNote}
                      </p>
                    </div>
                  )}

                  {/* Refund Status Section */}
                  {order.refund?.initiated && (
                    <div className="mt-4 p-5 bg-[#FDF6EC] rounded-2xl border border-[#D4A96A]/30">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-[#6B3F1F] font-black text-sm flex items-center gap-2">
                          💰 Refund Status
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.refund.status === 'processed' ? 'bg-green-100 text-green-700' :
                          order.refund.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {order.refund.status}
                        </span>
                      </div>
                      
                      {order.refund.pendingMethod ? (
                        <div className="space-y-4">
                            <p className="text-xs text-[#6B3F1F] font-bold">
                                Your return for this COD order is approved! Please choose how you'd like to receive your refund.
                            </p>
                            <button 
                                onClick={() => setChoiceModal({
                                    isOpen: true,
                                    orderId: order._id,
                                    amount: order.totalAmount,
                                    choice: '',
                                    bankDetails: { accountHolder: '', accountNumber: '', ifscCode: '', bankName: '' }
                                })}
                                className="w-full py-3 bg-[#6B3F1F] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#A0522D] shadow-lg transition-all"
                            >
                                Choose Refund Method
                            </button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1.5 text-xs text-gray-600">
                            <div className="flex justify-between">
                              <span>Amount:</span>
                              <span className="font-bold">₹{order.refund.amount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Method:</span>
                              <span className="font-bold uppercase">{order.refund.method}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Initiated:</span>
                              <span className="font-medium">{new Date(order.refund.initiatedAt).toLocaleDateString()}</span>
                            </div>
                            {order.refund.processedAt && (
                              <div className="flex justify-between">
                                <span>Processed At:</span>
                                <span className="font-medium">{new Date(order.refund.processedAt).toLocaleString()}</span>
                              </div>
                            )}
                            {order.refund.failureReason && (
                              <div className="mt-2 p-2 bg-red-50 text-red-600 rounded-lg text-[10px]">
                                <strong>Reason:</strong> {order.refund.failureReason}
                              </div>
                            )}
                          </div>
                          {order.refund.method === 'razorpay' && (
                             <button 
                                onClick={() => fetchRefundStatus(order._id)}
                                className="w-full mt-4 py-2 bg-white border border-[#D4A96A] text-[#6B3F1F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F5E6D3] transition-all flex items-center justify-center gap-2"
                            >
                                <FiRefreshCcw size={12} /> Check Refund Status
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return/Cancel Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-8 max-w-lg w-full shadow-2xl my-8">
            <h3 className="text-2xl font-black text-[#6B3F1F] mb-2 capitalize">
              {modalState.actionType === 'return' ? 'Request Return' : 'Cancel Order'}
            </h3>
            <p className="text-gray-500 mb-6">
              {modalState.actionType === 'return' 
                ? 'Please provide a reason and upload photos of the product.'
                : 'Please provide a reason why you wish to cancel this order.'}
            </p>
            
            <form onSubmit={submitAction} className="space-y-6">
              {/* Reason Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#6B3F1F] uppercase tracking-wider">
                  Reason {modalState.actionType === 'return' ? 'for Return' : ''} *
                </label>
                <textarea 
                  required
                  rows={4}
                  placeholder={modalState.actionType === 'return' 
                    ? "Please describe the reason for returning this product..." 
                    : "Enter your reason for cancellation..."}
                  className="w-full px-5 py-4 rounded-2xl bg-[#FDF6EC] border-none text-[#6B3F1F] focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all resize-none"
                  value={modalState.reason}
                  onChange={(e) => setModalState({ ...modalState, reason: e.target.value })}
                />
              </div>

              {/* Image Upload - Only for Return */}
              {modalState.actionType === 'return' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#6B3F1F] uppercase tracking-wider">
                    Upload Product Images <span className="text-gray-400 font-normal">(optional, max 5)</span>
                  </label>
                  <p className="text-xs text-gray-500">Upload clear photos of damaged/wrong items</p>
                  
                  <div 
                    className="border-2 border-dashed border-[#D4A96A]/50 rounded-2xl p-6 text-center bg-[#FDF6EC]/50 cursor-pointer hover:border-[#D4A96A] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                    <FiUpload className="w-8 h-8 mx-auto text-[#D4A96A] mb-2" />
                    <p className="text-sm text-[#6B3F1F] font-medium">Click or drag to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">{modalState.images.length}/5 images</p>
                  </div>

                  {/* Image Previews */}
                  {modalState.images.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {modalState.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={img.preview} 
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-4 bg-[#6B3F1F] text-white font-black rounded-2xl shadow-xl hover:bg-[#A0522D] transition-all capitalize disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    `Confirm ${modalState.actionType}`
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-8 py-4 bg-[#F5E6D3] text-[#6B3F1F] font-black rounded-2xl border border-[#D4A96A]/20 hover:bg-[#D4A96A] transition-all"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Refund Choice Modal */}
      {choiceModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
            <header className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-2xl font-black text-[#6B3F1F]">Refund Options</h3>
                   <p className="text-sm text-gray-500 font-medium">Order Amount: ₹{choiceModal.amount}</p>
                </div>
                <button onClick={() => setChoiceModal({ ...choiceModal, isOpen: false })} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <FiX size={20} className="text-gray-400" />
                </button>
            </header>

            <form onSubmit={handleRefundChoiceSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={() => setChoiceModal({ ...choiceModal, choice: 'wallet' })}
                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${choiceModal.choice === 'wallet' ? 'border-[#6B3F1F] bg-[#6B3F1F]/5 shadow-inner' : 'border-gray-100 hover:border-[#D4A96A]/20'}`}
                    >
                        <span className="text-3xl">👛</span>
                        <div className="text-center">
                            <p className="font-black text-[#6B3F1F] text-sm">Wallet</p>
                            <p className="text-[10px] text-green-600 font-bold uppercase">Instant</p>
                        </div>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setChoiceModal({ ...choiceModal, choice: 'bank' })}
                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${choiceModal.choice === 'bank' ? 'border-[#6B3F1F] bg-[#6B3F1F]/5 shadow-inner' : 'border-gray-100 hover:border-[#D4A96A]/20'}`}
                    >
                        <span className="text-3xl">🏦</span>
                        <div className="text-center">
                            <p className="font-black text-[#6B3F1F] text-sm">Bank</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">5-7 Days</p>
                        </div>
                    </button>
                </div>

                {choiceModal.choice === 'bank' && (
                    <div className="space-y-4 bg-gray-50 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-500">
                        <p className="text-[10px] font-black text-[#6B3F1F]/60 uppercase tracking-widest ml-1">Account Information</p>
                        <input 
                            required 
                            placeholder="Account Holder Name" 
                            className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#D4A96A]/20"
                            value={choiceModal.bankDetails.accountHolder}
                            onChange={(e) => setChoiceModal({ ...choiceModal, bankDetails: { ...choiceModal.bankDetails, accountHolder: e.target.value } })}
                        />
                        <input 
                            required 
                            placeholder="Account Number" 
                            className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#D4A96A]/20"
                            value={choiceModal.bankDetails.accountNumber}
                            onChange={(e) => setChoiceModal({ ...choiceModal, bankDetails: { ...choiceModal.bankDetails, accountNumber: e.target.value } })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                required 
                                placeholder="IFSC Code" 
                                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#D4A96A]/20 uppercase"
                                value={choiceModal.bankDetails.ifscCode}
                                onChange={(e) => setChoiceModal({ ...choiceModal, bankDetails: { ...choiceModal.bankDetails, ifscCode: e.target.value } })}
                            />
                            <input 
                                required 
                                placeholder="Bank Name" 
                                className="w-full bg-white border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none focus:ring-4 focus:ring-[#D4A96A]/20"
                                value={choiceModal.bankDetails.bankName}
                                onChange={(e) => setChoiceModal({ ...choiceModal, bankDetails: { ...choiceModal.bankDetails, bankName: e.target.value } })}
                            />
                        </div>
                    </div>
                )}

                <button 
                  type="submit" 
                  disabled={submitting || !choiceModal.choice}
                  className="w-full py-5 bg-[#6B3F1F] text-white font-black rounded-[24px] shadow-xl hover:bg-[#A0522D] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <span className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Confirm Selection <FiArrowLeft className="rotate-180" /></>
                  )}
                </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
