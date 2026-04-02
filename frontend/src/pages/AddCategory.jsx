import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Link, useNavigate } from 'react-router-dom';    
import { toast } from 'react-toastify';
import { FiArrowLeft, FiPlus, FiFolder, FiLock, FiUnlock, FiEdit3 } from 'react-icons/fi';

function AddCategory() {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, category: null, newName: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, categoryId: null, isBlocked: false, categoryName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setLoading(true);
    try {
      await api.post('/admin/add-category', { name: categoryName });
      toast.success('Category successfully added!');
      setCategoryName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (cat) => {
    setConfirmModal({ isOpen: true, categoryId: cat._id, isBlocked: cat.isBlocked, categoryName: cat.name });
  };

  const confirmToggleStatus = async () => {
    try {
      await api.patch(`/admin/toggle-category/${confirmModal.categoryId}`);
      toast.success(`Category successfully ${confirmModal.isBlocked ? 'unhidden' : 'hidden'}.`);
      setConfirmModal({ isOpen: false, categoryId: null, isBlocked: false, categoryName: '' });
      fetchCategories();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleEdit = (category) => {
    setEditModal({ isOpen: true, category, newName: category.name });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editModal.newName.trim() || editModal.newName === editModal.category.name) return;
    
    try {
      await api.put(`/admin/update-category/${editModal.category._id}`, { name: editModal.newName });
      toast.success('Category renamed successfully');
      setEditModal({ isOpen: false, category: null, newName: '' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] font-sans p-6 sm:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-sm border border-[#D4A96A]/20">
          <div>
            <Link to="/admin/dashboard" className="inline-flex items-center text-[#A0522D] hover:text-[#6B3F1F] font-bold mb-3 transition-colors">
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-[#6B3F1F] flex items-center gap-4">
              <FiFolder className="text-[#D4A96A]" /> Category Management
            </h1>
            <p className="text-gray-500 font-medium mt-2 max-w-lg">
              Curate and organize your chocolate store collections. Categories dictate how elegantly products are grouped for your customers.
            </p>
          </div>

          <div className="bg-[#F5E6D3] p-6 rounded-[30px] w-full md:w-96 shadow-inner border border-[#D4A96A]/30">
            <h3 className="text-sm font-black text-[#6B3F1F] uppercase tracking-widest mb-4">Quick Add</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input 
                type="text" 
                className="w-full px-5 py-4 rounded-2xl bg-white border-none text-[#6B3F1F] placeholder:text-[#A0522D]/50 focus:ring-4 focus:ring-[#D4A96A]/30 outline-none transition-all font-bold"
                placeholder="E.g., Dark Chocolate, Truffles..." 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={loading}
              />
              <button 
                type='submit' 
                disabled={loading}
                className="w-full py-4 bg-[#6B3F1F] text-white font-black rounded-2xl shadow-xl hover:bg-[#A0522D] shadow-[#6B3F1F]/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? 'Processing...' : <><FiPlus size={20} /> Create Category</>}
              </button>
            </form>
          </div>
        </div>

        {/* Existing Categories */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-[#6B3F1F]">Active Collections</h2>
            <span className="text-sm font-bold bg-[#D4A96A]/20 text-[#A0522D] px-4 py-1.5 rounded-full">{categories.length} Categories</span>
          </div>

          {categories.length === 0 ? (
            <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-[#D4A96A] shadow-sm">
               <FiFolder className="text-6xl text-[#D4A96A]/50 mx-auto mb-4" />
               <p className="text-xl font-bold text-gray-400">Your store currently has no categories.</p>
               <p className="text-gray-500 mt-2">Create your first collection above to start organizing products.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat._id} className="bg-white rounded-[32px] p-6 shadow-sm border border-[#D4A96A]/10 hover:shadow-lg transition-all group relative overflow-hidden">
                  
                  {cat.isBlocked && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-bl-2xl opacity-90">
                      Hidden
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-8">
                    <div className="space-y-1">
                      <h3 className={`text-2xl font-black transition-colors ${cat.isBlocked ? 'text-gray-400 line-through' : 'text-[#6B3F1F]'}`}>
                        {cat.name}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                         Added {new Date(cat.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => handleToggleStatus(cat)}
                      className={`flex-1 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border ${
                        cat.isBlocked 
                          ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' 
                          : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100'
                      }`}
                    >
                      {cat.isBlocked ? <><FiUnlock /> Unhide</> : <><FiLock /> Hide</>}
                    </button>
                    
                    <button 
                      onClick={() => handleEdit(cat)}
                      className="px-5 py-3 bg-[#FDF6EC] text-[#A0522D] font-bold rounded-xl border border-[#D4A96A]/20 hover:bg-[#D4A96A]/20 transition-colors"
                      title="Edit Name"
                    >
                      <FiEdit3 size={18} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-[#6B3F1F] mb-2">Edit Category</h3>
            <p className="text-gray-500 mb-6 text-sm">Update the name for this category.</p>
            <form onSubmit={submitEdit} className="space-y-6">
              <input 
                autoFocus
                type="text" 
                value={editModal.newName}
                onChange={(e) => setEditModal({...editModal, newName: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-[#FDF6EC] border-none text-[#6B3F1F] focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all font-bold"
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-[#6B3F1F] text-white font-black rounded-2xl shadow-xl hover:bg-[#A0522D] transition-all">Save Changes</button>
                <button type="button" onClick={() => setEditModal({ isOpen: false, category: null, newName: '' })} className="px-6 py-4 bg-[#F5E6D3] text-[#6B3F1F] font-black rounded-2xl hover:bg-[#D4A96A] transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${confirmModal.isBlocked ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
               {confirmModal.isBlocked ? <FiUnlock size={32} /> : <FiLock size={32} />}
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">
              {confirmModal.isBlocked ? 'Unhide Category?' : 'Hide Category?'}
            </h3>
            <p className="text-gray-500 mb-8">
              Are you sure you want to {confirmModal.isBlocked ? 'unhide' : 'hide'} <strong>"{confirmModal.categoryName}"</strong>?
              {!confirmModal.isBlocked && " It will immediately disappear from the storefront."}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={confirmToggleStatus} 
                className={`flex-1 py-4 text-white font-black rounded-2xl shadow-xl transition-all ${confirmModal.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              >
                Yes, {confirmModal.isBlocked ? 'Unhide' : 'Hide'}
              </button>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, categoryId: null, isBlocked: false, categoryName: '' })} 
                className="px-6 py-4 bg-gray-100 text-gray-700 font-black rounded-2xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AddCategory;
