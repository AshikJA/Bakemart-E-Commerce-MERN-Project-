import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiShoppingBag, FiTrendingUp, FiCreditCard } from 'react-icons/fi';

export default function RevenueOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'refunded'


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/admin/all');
      setOrders(res.data.orders || res.data);
    } catch (err) {
      toast.error('Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  // All revenue calculations
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const refundedOrders = orders.filter(o => o.paymentStatus === 'refunded');
  const codOrders = orders.filter(o => o.paymentMethod === 'COD' && o.orderStatus === 'delivered');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRefunded = refundedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const codRevenue = codOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const netRevenue = totalRevenue - totalRefunded;

  const filteredOrders = orders.filter(o => {
    if (filter === 'paid') return o.paymentStatus === 'paid';
    if (filter === 'refunded') return o.paymentStatus === 'refunded';
    if (filter === 'cod') return o.paymentMethod === 'COD';
    return true;
  });

  const getPaymentBadge = (o) => {
    const map = {
      paid: 'bg-green-50 text-green-700',
      refunded: 'bg-orange-50 text-orange-700',
      pending: 'bg-yellow-50 text-yellow-700',
      failed: 'bg-red-50 text-red-700',
    };
    return map[o.paymentStatus] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium mb-3 transition-colors text-sm">
            <FiArrowLeft className="mr-2" /> Back
          </button>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FiTrendingUp className="text-purple-500" /> Revenue Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track income, refunds, and payment breakdown</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Gross Revenue', value: totalRevenue, icon: FiDollarSign, color: 'bg-green-50 text-green-600', desc: 'From all paid online orders' },
            { label: 'Refunded', value: totalRefunded, icon: FiCreditCard, color: 'bg-orange-50 text-orange-600', desc: 'Returned to wallets' },
            { label: 'COD Collected', value: codRevenue, icon: FiShoppingBag, color: 'bg-blue-50 text-blue-600', desc: 'Cash on delivery, delivered' },
            { label: 'Net Online Revenue', value: netRevenue, icon: FiTrendingUp, color: 'bg-purple-50 text-purple-600', desc: 'Gross minus refunds' },
          ].map(({ label, value, icon: Icon, color, desc }) => (
            <div key={label} className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex gap-4 items-start">
              <div className={`p-3 rounded-2xl ${color}`}><Icon size={22} /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-black text-slate-800 mt-1">₹{value.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs + Orders Table */}
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800">Order Transactions</h2>
            <div className="flex gap-2 flex-wrap">
              {[['all', 'All'], ['paid', 'Paid'], ['refunded', 'Refunded'], ['cod', 'COD']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === val ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Method</th>
                  <th className="px-6 py-4 font-bold">Payment</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-16 text-slate-400">Loading revenue data…</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-16 text-slate-400">No orders found.</td></tr>
                ) : filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{order.user?.name || order.shippingAddress?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.paymentMethod === 'COD' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getPaymentBadge(order)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700' :
                        order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-50 text-yellow-700'
                      }`}>{order.orderStatus}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${order.paymentStatus === 'refunded' ? 'text-orange-500' : 'text-slate-800'}`}>
                      {order.paymentStatus === 'refunded' ? '-' : ''}₹{order.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Totals Footer */}
              {!loading && filteredOrders.length > 0 && (
                <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-sm font-bold text-slate-600 text-right">
                      Total ({filteredOrders.length} orders)
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 text-base">
                      ₹{filteredOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
