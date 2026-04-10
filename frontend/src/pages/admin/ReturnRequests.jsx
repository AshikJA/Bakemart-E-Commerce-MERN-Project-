import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiImage, FiX, FiCheck, FiClock } from 'react-icons/fi';

export default function ReturnRequests() {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [adminNote, setAdminNote] = useState({});
  const [processing, setProcessing] = useState(null);
  const [refunding, setRefunding] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await api.get('/admin/returns');
      setReturns(res.data.returns || []);
    } catch (error) {
      toast.error('Failed to fetch return requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setProcessing(orderId);
    try {
      await api.put(`/admin/returns/${orderId}`, {
        status,
        adminNote: adminNote[orderId] || ''
      });
      toast.success(`Return ${status} successfully!`);
      
      // Update local state
      setReturns(prev => prev.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            returnRequest: {
              ...order.returnRequest,
              status,
              resolvedAt: new Date()
            }
          };
        }
        return order;
      }));
      
      // Clear admin note
      setAdminNote(prev => ({ ...prev, [orderId]: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} return`);
    } finally {
      setProcessing(null);
    }
  };

  const handleInitiateRefund = async (orderId, amount, customerName) => {
    if (!window.confirm(`Are you sure you want to refund ₹${amount} to ${customerName}?`)) {
      return;
    }

    setRefunding(orderId);
    try {
      const res = await api.post(`/admin/refund/${orderId}`);
      toast.success(`Refund of ₹${amount} initiated successfully!`);
      
      // Update local state with refund info
      setReturns(prev => prev.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            refund: res.data.order.refund,
            paymentStatus: 'refunded'
          };
        }
        return order;
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate refund');
    } finally {
      setRefunding(null);
    }
  };

  const filteredReturns = returns.filter(order => {
    if (activeFilter === 'all') return true;
    return order.returnRequest?.status === activeFilter;
  });

  const pendingCount = returns.filter(r => r.returnRequest?.status === 'pending').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { class: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: '⏳ Pending' };
      case 'approved': return { class: 'bg-green-100 text-green-800 border-green-200', label: '✅ Approved' };
      case 'rejected': return { class: 'bg-red-100 text-red-800 border-red-200', label: '❌ Rejected' };
      default: return { class: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6B3F1F]/30 border-t-[#6B3F1F] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B3F1F] font-bold">Loading return requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Return Requests 📦</h1>
              {pendingCount > 0 && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Review and manage customer return requests</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                activeFilter === filter 
                  ? 'bg-[#6B3F1F] text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter === 'pending' && pendingCount > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === filter ? 'bg-white/20' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Return Requests */}
        {filteredReturns.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium text-lg">No return requests found</p>
            <p className="text-slate-400 text-sm mt-2">
              {activeFilter !== 'all' ? `No ${activeFilter} requests at the moment.` : 'Customer returns will appear here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map(order => {
              const badge = getStatusBadge(order.returnRequest?.status);
              const isResolved = order.returnRequest?.status !== 'pending';
              
              return (
                <div key={order._id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-800 text-lg">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.class}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          <p className="font-medium">{order.user?.name || 'Customer'}</p>
                          <p className="text-xs">{order.user?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-[#6B3F1F]">₹{order.totalAmount}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Ordered: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        {order.returnRequest?.requestedAt && (
                          <p className="text-xs text-slate-400">
                            Requested: {new Date(order.returnRequest.requestedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Return Reason */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Return Reason</h4>
                      <div className="bg-red-50/50 border border-red-100 rounded-xl p-4">
                        <p className="text-slate-700 italic">"{order.returnRequest?.reason}"</p>
                      </div>
                    </div>

                    {/* Product Images */}
                    {order.returnRequest?.images?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">
                          Product Images ({order.returnRequest.images.length})
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {order.returnRequest.images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImage(img)}
                              className="relative group"
                            >
                              <img 
                                src={`${api.defaults.baseURL.replace('/api', '')}${img.replace('/uploads/returns/', '/uploads/')}`}
                                alt={`Product image ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-xl border-2 border-slate-100 group-hover:border-[#D4A96A] transition-colors"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-xl transition-colors flex items-center justify-center">
                                <FiImage className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-3">Order Items</h4>
                      <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.image ? `${api.defaults.baseURL.replace('/api', '')}/uploads/${item.image}` : 'https://via.placeholder.com/40'}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-white"
                              />
                              <span className="font-medium text-slate-700">{item.name}</span>
                              <span className="text-slate-400 text-xs">x{item.quantity}</span>
                            </div>
                            <span className="font-bold text-[#6B3F1F]">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Admin Note & Actions - Only show for pending requests */}
                    {!isResolved ? (
                      <div className="border-t border-slate-100 pt-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2 block">
                              Admin Note <span className="text-slate-300 font-normal">(optional)</span>
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Add a note for the customer..."
                              value={adminNote[order._id] || ''}
                              onChange={(e) => setAdminNote(prev => ({ ...prev, [order._id]: e.target.value }))}
                              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-[#D4A96A]/30 focus:border-[#D4A96A] transition-all resize-none"
                            />
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'approved')}
                              disabled={processing === order._id}
                              className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {processing === order._id ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <FiCheck size={18} />
                              )}
                              Approve Return
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'rejected')}
                              disabled={processing === order._id}
                              className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {processing === order._id ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <FiX size={18} />
                              )}
                              Reject Return
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Resolved Status */
                      <div className="border-t border-slate-100 pt-6">
                        <div className={`p-4 rounded-xl ${order.returnRequest.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p className={`font-bold text-sm ${order.returnRequest.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                                  {order.returnRequest.status === 'approved' ? '✅ Return Approved' : '❌ Return Rejected'}
                                </p>
                                {order.returnRequest.adminNote && (
                                  <p className="text-sm text-slate-600 mt-2">
                                    <span className="font-medium">Note:</span> {order.returnRequest.adminNote}
                                  </p>
                                )}
                                {order.returnRequest.resolvedAt && (
                                  <p className="text-xs text-slate-400 mt-2">
                                    {new Date(order.returnRequest.resolvedAt).toLocaleString()}
                                  </p>
                                )}
                            </div>

                            {/* Refund Action/Status */}
                            {order.returnRequest.status === 'approved' && order.paymentMethod !== 'COD' && (
                              <div className="w-full sm:w-auto">
                                {!order.refund?.initiated ? (
                                  <button
                                    onClick={() => handleInitiateRefund(order._id, order.totalAmount, order.user?.name)}
                                    disabled={refunding === order._id}
                                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                    {refunding === order._id ? (
                                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                      '💰'
                                    )}
                                    Initiate Refund
                                  </button>
                                ) : (
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                      order.refund.status === 'processed' ? 'bg-green-100 text-green-700' :
                                      order.refund.status === 'failed' ? 'bg-red-100 text-red-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {order.refund.status === 'processed' ? '✅ Refund Processed' :
                                       order.refund.status === 'failed' ? '❌ Refund Failed' :
                                       '🔄 Refund Processing'}
                                    </span>
                                    {order.refund.razorpayRefundId && (
                                      <span className="text-[10px] text-slate-400 font-medium">ID: {order.refund.razorpayRefundId}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <FiX size={24} />
          </button>
          <img 
            src={`${api.defaults.baseURL.replace('/api', '')}${selectedImage.replace('/uploads/returns/', '/uploads/')}`}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
