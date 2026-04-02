import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiEye, FiX, FiCalendar, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Modal states for status update
  const [showDateModal, setShowDateModal] = useState(false);
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/admin/all', { headers: getAuthHeaders() });
      setOrders(res.data.orders || res.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChangeInitiate = (orderId, newStatus) => {
    if (['shipped', 'delivered'].includes(newStatus)) {
      setPendingUpdate({ orderId, newStatus });
      setDateInput(new Date().toISOString().split('T')[0]);
      setShowDateModal(true);
    } else {
      performStatusUpdate(orderId, newStatus, null);
    }
  };

  const performStatusUpdate = async (orderId, newStatus, statusDate) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/admin/${orderId}/status`, 
        { orderStatus: newStatus, statusDate }, 
        { headers: getAuthHeaders() }
      );
      toast.success('Order status updated');
      setShowDateModal(false);
      setPendingUpdate(null);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/admin/${orderId}/payment-status`, 
        { paymentStatus: newPaymentStatus }, 
        { headers: getAuthHeaders() }
      );
      toast.success('Payment status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/admin/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors">
            <FiArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Order Management</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage delivery statuses and payment tracking.</p>
          </div>
        </div>

        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:row justify-between items-start sm:items-center gap-4">
             <h2 className="text-lg font-bold text-slate-800">All Orders</h2>
             <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-inner">
               {orders.length} total orders
             </span>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left align-middle min-w-[1000px]">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-50/80 tracking-widest">
                  <tr>
                    <th className="px-6 py-5 font-black">Order</th>
                    <th className="px-6 py-5 font-black">Customer</th>
                    <th className="px-6 py-5 font-black">Payment Status</th>
                    <th className="px-6 py-5 font-black">Delivery Status</th>
                    <th className="px-6 py-5 font-black text-right">Total</th>
                    <th className="px-6 py-5 font-black text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium italic animate-pulse">Fetching orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No orders found.</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <span className="font-bold text-blue-600 tracking-wider">
                            #{order._id.substring(order._id.length - 8).toUpperCase()}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase tracking-tighter">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-800">{order.user?.name || order.shippingAddress?.name || 'Guest'}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{order.shippingAddress?.city}</div>
                        </td>
                        <td className="px-6 py-5">
                          <select 
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(order._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer border transition-all ${
                              order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 
                              order.paymentStatus === 'refunded' ? 'bg-red-50 text-red-600 border-red-200' : 
                              'bg-orange-50 text-orange-600 border-orange-200'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="px-6 py-5">
                          <select 
                            value={order.orderStatus} 
                            onChange={(e) => handleStatusChangeInitiate(order._id, e.target.value)}
                            className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest outline-none cursor-pointer transition-all shadow-sm ${
                               order.orderStatus === 'delivered' ? 'bg-green-600 text-white border-green-600' :
                               order.orderStatus === 'cancelled' || order.orderStatus === 'returned' ? 'bg-slate-800 text-white border-slate-800' :
                               order.orderStatus === 'shipped' ? 'bg-blue-600 text-white border-blue-600' :
                               'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="returned">Returned</option>
                          </select>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-slate-800 text-base">
                          ₹{order.totalAmount}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center justify-center p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                            title="View Full Details"
                          >
                            <FiEye size={18} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
          </div>
        </div>

      </div>

      {/* Date Selection Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <FiCalendar size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Set Date</h2>
              <p className="text-slate-500 font-medium text-sm mt-2 leading-relaxed">
                Please select the {pendingUpdate?.newStatus} date for order <span className="text-blue-600 font-bold">#{pendingUpdate?.orderId.substring(pendingUpdate?.orderId.length - 8).toUpperCase()}</span>
              </p>
              
              <div className="mt-8 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Event Date</label>
                <input 
                  type="date" 
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                />
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setShowDateModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => performStatusUpdate(pendingUpdate.orderId, pendingUpdate.newStatus, dateInput)}
                  className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FiCheck /> Confirm Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 sm:p-8 flex justify-between items-center bg-slate-50 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Order Details</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">ID: <span className="font-bold text-slate-700">#{selectedOrder._id}</span></p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shadow-sm border border-slate-100"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 custom-scrollbar">
              
              {/* Product List */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Ordered Items ({selectedOrder.items.length})</h3>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100/50">
                        <img 
                          src={item.image ? `http://localhost:5000/uploads/${item.image}` : 'https://via.placeholder.com/80'} 
                          alt={item.name} 
                          className="w-20 h-20 object-cover rounded-lg bg-slate-100"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h4>
                          <p className="text-slate-500 text-sm mt-1">Quantity: <span className="font-bold text-slate-700">{item.quantity}</span></p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-800">₹{item.price * item.quantity}</div>
                          <div className="text-xs text-slate-400 mt-1">₹{item.price} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(selectedOrder.cancelReason || selectedOrder.returnReason) && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest mb-2">User Note / Reason</h3>
                    <p className="text-red-600 font-medium italic">"{selectedOrder.cancelReason || selectedOrder.returnReason}"</p>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shipping Address</h3>
                  </div>
                  <div className="p-5">
                    <p className="font-bold text-slate-800 text-lg">{selectedOrder.shippingAddress?.name || 'Unavailable'}</p>
                    <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                      {selectedOrder.shippingAddress?.street}<br/>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}<br/>
                      {selectedOrder.shippingAddress?.pincode}
                    </p>
                    <p className="text-slate-800 font-medium mt-3 text-sm flex items-center gap-2">
                       <span className="text-slate-400">📞</span> {selectedOrder.shippingAddress?.phoneNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-100">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Payment Summary</h3>
                  </div>
                  <div className="p-5 text-sm space-y-3 text-slate-600">
                    <div className="flex justify-between">
                      <span>Method</span>
                      <span className="font-bold text-slate-800">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <span className="font-bold text-slate-800 capitalize">{selectedOrder.paymentStatus}</span>
                    </div>
                    {selectedOrder.razorpayPaymentId && (
                      <div className="flex justify-between">
                        <span>Transaction ID</span>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{selectedOrder.razorpayPaymentId}</span>
                      </div>
                    )}
                    <div className="my-2 border-t border-slate-100 pt-2 flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium">₹{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discount {selectedOrder.appliedCoupon ? `(${selectedOrder.appliedCoupon})` : ''}</span>
                      <span className="font-medium">-₹{selectedOrder.discount}</span>
                    </div>
                    <div className="my-2 border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-500">
                      <span>Order Timeline</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span>Placed</span>
                        <span className="font-bold">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                      {selectedOrder.shippedAt && (
                        <div className="flex justify-between text-blue-600">
                          <span>Shipped</span>
                          <span className="font-bold">{new Date(selectedOrder.shippedAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedOrder.deliveredAt && (
                        <div className="flex justify-between text-green-600">
                          <span>Delivered</span>
                          <span className="font-bold">{new Date(selectedOrder.deliveredAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="my-2 border-t border-slate-100 pt-3 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total Paid</span>
                      <span className="font-black text-xl text-blue-600">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
