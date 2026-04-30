import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { toast } from 'react-toastify';
import { FiTrash2, FiEdit2, FiCheckCircle, FiXCircle, FiArrowLeft, FiImage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function AdminBanners() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [previewModal, setPreviewModal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/banners/all');
      setBanners(res.data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage && !previewModal) {
      toast.error('Please select an image');
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('title', formData.title);
      if (formData.url) payload.append('url', formData.url);
      if (selectedImage) {
        payload.append('image', selectedImage);
      }

      await api.post('/banners/add', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Banner added successfully');
      setFormData({ title: '', url: '' });
      setSelectedImage(null);
      setPreview(null);
      fetchBanners();
    } catch (error) {
      console.error('Error adding banner:', error);
      toast.error(error.response?.data?.message || 'Failed to add banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/banners/${deleteId}`);
      toast.success('Banner deleted successfully');
      setConfirmModal(false);
      setDeleteId(null);
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/banners/toggle/${id}`);
      toast.success('Banner status updated');
      fetchBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 transition-colors">
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Banner Management</h1>
            <p className="text-slate-500 text-sm mt-1">Upload and manage homepage banners</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Banner Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Add New Banner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Summer Sale"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4A96A] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Redirect URL</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  placeholder="https://example.com/page"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#D4A96A] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banner Image *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#D4A96A] transition-colors">
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          setPreview(null);
                          setSelectedImage(null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <FiImage className="mx-auto text-slate-400 mb-2" size={32} />
                      <p className="text-sm text-slate-500">Click to upload image</p>
                      <p className="text-xs text-slate-400 mt-1">Recommended: 1920x600</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#6B3F1F] text-white font-bold py-3 rounded-xl hover:bg-[#A0522D] shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : 'Add Banner'}
              </button>
            </form>
          </div>

          {/* List of Banners */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Existing Banners</h2>
              <span className="bg-[#D4A96A]/20 text-[#6B3F1F] px-3 py-1 rounded-full text-xs font-bold">
                {banners.length} total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-bold">Image</th>
                    <th className="px-6 py-4 font-bold">Title</th>
                    <th className="px-6 py-4 font-bold">URL</th>
                    <th className="px-6 py-4 font-bold text-center">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Loading banners...</td>
                    </tr>
                  ) : banners.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-slate-400">No banners found. Add your first one!</td>
                    </tr>
                  ) : (
                    banners.map((banner) => (
                      <tr key={banner._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setPreviewModal(banner.image)}
                            className="w-20 h-12 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-[#D4A96A] transition-all"
                          >
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                          </button>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{banner.title}</td>
                        <td className="px-6 py-4 text-slate-500 max-w-[150px] truncate">
                          {banner.url ? (
                            <a href={banner.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {banner.url}
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(banner._id)}
                            className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#D4A96A] rounded-full"
                          >
                            {banner.isActive ? (
                              <FiCheckCircle className="text-green-500 hover:text-green-600 transition-colors mx-auto" size={24} title="Active - Click to disable" />
                            ) : (
                              <FiXCircle className="text-red-400 hover:text-red-500 transition-colors mx-auto" size={24} title="Inactive - Click to enable" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setDeleteId(banner._id);
                              setConfirmModal(true);
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Banner"
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

      {/* Delete Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-2xl font-black text-[#6B3F1F] mb-4">Delete Banner?</h3>
            <p className="text-gray-600 mb-8 font-medium">Are you sure you want to delete this banner? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewModal(null)}>
          <img src={previewModal} alt="Banner Preview" className="max-w-full max-h-[90vh] rounded-xl" />
        </div>
      )}
    </div>
  );
}

export default AdminBanners;