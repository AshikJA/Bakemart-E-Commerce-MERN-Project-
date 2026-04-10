import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi';

export default function RefundsList() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const res = await api.get('/admin/refunds');
      setRefunds(res.data || []);
    } catch (error) {
      toast.error('Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (orderId) => {
    setChecking(orderId);
    try {
      const res = await api.get(`/orders/${orderId}/refund`);
      toast.info(`Refund Status: ${res.data.status}`);
      
      // Update local state
      setRefunds(prev => prev.map(order => {
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
      toast.error('Failed to update refund status');
    } finally {
      setChecking(null);
    }
  };

  const stats = {
    totalCount: refunds.length,
    totalAmount: refunds.reduce((sum, r) => sum + (r.refund.amount || 0), 0),
    processing: refunds.filter(r => r.refund.status === 'processing' || r.refund.status === 'pending').length,
    processed: refunds.filter(r => r.refund.status === 'processed').length,
    failed: refunds.filter(r => r.refund.status === 'failed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6B3F1F]/30 border-t-[#6B3F1F] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B3F1F] font-bold">Loading refunds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Refunds Management 💰</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Track and manage Razorpay refunds</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Total Amount</p>
            <p className="text-2xl font-black text-[#6B3F1F]">₹{stats.totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-blue-600">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Processing</p>
            <p className="text-2xl font-black">{stats.processing}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-green-600">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Processed</p>
            <p className="text-2xl font-black">{stats.processed}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-red-600">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Failed</p>
            <p className="text-2xl font-black">{stats.failed}</p>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Order / Customer</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Razorpay ID</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {refunds.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No refunds found
                    </td>
                  </tr>
                ) : (
                  refunds.map(order => (
                    <tr key={order._id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-800">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-slate-500">{order.user?.name || 'Customer'}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-black text-[#A0522D]">₹{order.refund.amount}</p>
                      </td>
                      <td className="px-6 py-5">
                        <code className="bg-slate-100 px-2 py-1 rounded text-[10px] font-mono text-slate-600">
                          {order.refund.razorpayRefundId}
                        </code>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                          order.refund.status === 'processed' ? 'bg-green-100 text-green-700 border-green-200' :
                          order.refund.status === 'failed' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                          {order.refund.status === 'processed' ? <FiCheckCircle size={12} /> :
                           order.refund.status === 'failed' ? <FiAlertCircle size={12} /> :
                           <FiClock size={12} />}
                          {order.refund.status}
                        </span>
                        {order.refund.failureReason && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-[150px] truncate">{order.refund.failureReason}</p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-slate-500">
                          {new Date(order.refund.initiatedAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(order.refund.initiatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => checkStatus(order._id)}
                            disabled={checking === order._id || order.refund.status === 'processed'}
                            className="p-2 text-[#6B3F1F] hover:bg-[#6B3F1F]/5 rounded-lg transition-colors disabled:opacity-30"
                            title="Check Status"
                          >
                            <FiRefreshCw className={checking === order._id ? 'animate-spin' : ''} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/orders`)} // Placeholder for detail view
                            className="p-2 text-slate-400 hover:text-[#6B3F1F] rounded-lg transition-colors"
                            title="View Order"
                          >
                            <FiExternalLink />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
