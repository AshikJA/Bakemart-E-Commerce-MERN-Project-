import React, { useState, useEffect } from 'react'; 
import api from '../api/client';
import { toast } from 'react-toastify';
import { FiTrash2, FiEdit2, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function AddCoupon() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expirationDate: '',
    usageLimit: '',
  });


  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons/admin/all');
      setCoupons(res.data.coupons || res.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      };
      
      if (editingId) {
        await api.put(`/coupons/admin/update/${editingId}`, payload);
        toast.success('Coupon updated successfully');
        setEditingId(null);
      } else {
        await api.post('/coupons/admin/create', payload);
        toast.success('Coupon created successfully');
      }
      
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expirationDate: '',
        usageLimit: '',
      });
      fetchCoupons(); // Refresh list
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon) => {
    setEditingId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      expirationDate: new Date(coupon.expirationDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      expirationDate: '',
      usageLimit: '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await api.delete(`/coupons/admin/delete/${id}`);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/coupons/admin/update/${id}`, 
        { isActive: !currentStatus }
      );
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/admin/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors">
            <FiArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Coupon Management</h1>
            <p className="text-slate-500 text-sm mt-1">Create and manage store discount codes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Coupon Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Create New Coupon</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. SUMMER20"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    placeholder="e.g. 20"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date *</label>
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  placeholder="Leave blank for unlimited"
                  min="1"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-[#6B3F1F] text-white font-bold py-3 rounded-xl hover:bg-[#A0522D] shadow-md transition-all active:scale-95"
                >
                  {editingId ? 'Update Coupon' : 'Create Coupon'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-300 shadow-md transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Coupons */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Existing Coupons</h2>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                {coupons.length} total
              </span>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                   <tr>
                     <th className="px-6 py-4 font-bold">Code</th>
                     <th className="px-6 py-4 font-bold">Discount</th>
                     <th className="px-6 py-4 font-bold">Expiry & Usage</th>
                     <th className="px-6 py-4 font-bold text-center">Status</th>
                     <th className="px-6 py-4 font-bold text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {loading ? (
                     <tr>
                       <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading coupons...</td>
                     </tr>
                   ) : coupons.length === 0 ? (
                     <tr>
                       <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No coupons found. Create your first one!</td>
                     </tr>
                   ) : (
                     coupons.map((coupon) => (
                       <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4">
                           <span className="font-bold text-slate-800 tracking-wider bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                             {coupon.code}
                           </span>
                         </td>
                         <td className="px-6 py-4 font-medium text-green-600">
                           {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                         </td>
                         <td className="px-6 py-4 text-xs text-slate-500 space-y-1">
                           <div>Exp: <span className="font-medium text-slate-700">{new Date(coupon.expirationDate).toLocaleDateString()}</span></div>
                           <div>Usage: <span className="font-medium text-slate-700">{coupon.usedCount}</span> / {coupon.usageLimit ? coupon.usageLimit : '∞'}</div>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <button onClick={() => handleToggleStatus(coupon._id, coupon.isActive)} className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-full">
                            {coupon.isActive ? (
                              <FiCheckCircle className="text-green-500 hover:text-green-600 transition-colors mx-auto" size={24} title="Active - Click to disable" />
                            ) : (
                              <FiXCircle className="text-red-400 hover:text-red-500 transition-colors mx-auto" size={24} title="Inactive - Click to enable" />
                            )}
                           </button>
                         </td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                           <button 
                             onClick={() => handleEdit(coupon)}
                             className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                             title="Edit Coupon"
                           >
                             <FiEdit2 size={18} />
                           </button>
                           <button 
                             onClick={() => handleDelete(coupon._id)}
                             className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all mx-auto"
                             title="Delete Coupon"
                           >
                             <FiTrash2 size={18} />
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

      </div>
    </div>
  );
}

export default AddCoupon;