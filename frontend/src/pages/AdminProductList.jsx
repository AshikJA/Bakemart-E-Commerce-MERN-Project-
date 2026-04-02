import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit3, FiTrash2, FiX, FiSearch, FiPackage, FiUpload } from 'react-icons/fi';

export default function AdminProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  // Edit Modal
  const [editModal, setEditModal] = useState({ isOpen: false, product: null });
  const [editForm, setEditForm] = useState({ name: '', price: '', description: '', category: '', stock: '', weight: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });


  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data.products || res.data);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data.filter(c => !c.isBlocked));
    } catch (err) { /* ignore */ }
  };

  // Edit
  const openEditModal = (product) => {
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      weight: product.weight || '',
    });
    setEditModal({ isOpen: true, product });
    setNewImages([]);
    setNewPreviews([]);
  };

  const onEditFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setNewImages(files);
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) setNewPreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (idx) => {
    const updated = newImages.filter((_, i) => i !== idx);
    setNewImages(updated);
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      if (newImages.length > 0) {
        const formData = new FormData();
        Object.entries(editForm).forEach(([key, val]) => formData.append(key, val));
        newImages.forEach(img => formData.append('images', img));
        await api.put(`/admin/update-product/${editModal.product._id}`, formData);
      } else {
        await api.put(`/admin/update-product/${editModal.product._id}`, editForm);
      }
      toast.success('Product updated successfully!');
      setEditModal({ isOpen: false, product: null });
      setNewImages([]); setNewPreviews([]);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete
  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/delete-product/${deleteModal.product._id}`);
      toast.success('Product deleted successfully!');
      setDeleteModal({ isOpen: false, product: null });
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImageSrc = (product) => {
    const img = (product.images && product.images.length > 0) ? product.images[0] : product.image;
    if (!img) return 'https://via.placeholder.com/100?text=No+Img';
    return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium mb-3 transition-colors text-sm">
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FiPackage className="text-blue-500" /> Product Inventory
            </h1>
            <p className="text-slate-500 text-sm mt-1">{products.length} total products</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-sm"
              />
            </div>
            <Link to="/admin/add-products">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm">
                + Add Product
              </button>
            </Link>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 font-bold">Product</th>
                  <th className="px-6 py-5 font-bold">Category</th>
                  <th className="px-6 py-5 font-bold text-right">Price</th>
                  <th className="px-6 py-5 font-bold text-center">Stock</th>
                  <th className="px-6 py-5 font-bold text-center">Weight</th>
                  <th className="px-6 py-5 font-bold text-center">Images</th>
                  <th className="px-6 py-5 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-medium">Loading products…</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-medium">No products found.</td></tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageSrc(product)}
                            alt={product.name}
                            className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-100 shadow-sm"
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 leading-tight">{product.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{product.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-800">₹{product.price}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">{product.weight || '—'}</td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">{product.images?.length || (product.image ? 1 : 0)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Edit"
                          >
                            <FiEdit3 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, product })}
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
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

      {/* Edit Product Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 flex justify-between items-center bg-slate-50 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Edit Product</h2>
                <p className="text-slate-500 text-sm mt-1">Update the details for <strong>{editModal.product?.name}</strong></p>
              </div>
              <button onClick={() => setEditModal({ isOpen: false, product: null })} className="p-2 bg-white text-slate-400 hover:text-red-500 rounded-full transition-colors shadow-sm border border-slate-100">
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={submitEdit} className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (₹)</label>
                <input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium cursor-pointer">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</label>
                <input type="number" value={editForm.stock} onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</label>
                <input type="number" value={editForm.weight} onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium resize-none" />
              </div>

              {/* Current Images Preview */}
              {editModal.product?.images?.length > 0 && newImages.length === 0 && (
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Images</label>
                  <div className="flex gap-3 overflow-x-auto p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {editModal.product.images.map((img, idx) => (
                      <img key={idx}
                        src={img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`}
                        alt={`img ${idx}`}
                        className="h-20 w-20 object-cover rounded-lg flex-shrink-0 shadow-sm border border-slate-100"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <FiUpload size={14} /> {newImages.length > 0 ? 'New Images (will replace current)' : 'Replace Images (optional)'}
                </label>
                <input type="file" multiple accept="image/*" onChange={onEditFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer" />
                {newPreviews.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto p-3 bg-blue-50/50 rounded-xl border border-blue-100 mt-2">
                    {newPreviews.map((prev, idx) => (
                      <div key={idx} className="relative group flex-shrink-0">
                        <img src={prev} alt={`new ${idx}`} className="h-20 w-20 object-cover rounded-lg shadow-sm border border-blue-100" />
                        <button type="button" onClick={() => removeNewImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex gap-4 pt-4">
                <button type="submit" disabled={editLoading}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all disabled:opacity-70">
                  {editLoading ? 'Updating…' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditModal({ isOpen: false, product: null })}
                  className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-6">
              <FiTrash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-gray-500 mb-2">Are you sure you want to permanently delete</p>
            <p className="text-lg font-bold text-slate-800 mb-8">"{deleteModal.product?.name}"</p>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl shadow-xl hover:bg-red-600 transition-all">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteModal({ isOpen: false, product: null })} className="px-8 py-4 bg-gray-100 text-gray-700 font-black rounded-2xl hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}