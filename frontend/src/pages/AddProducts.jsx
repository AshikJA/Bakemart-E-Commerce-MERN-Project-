import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';  

function AddProducts() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/categories', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageUrl(''); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImage(null); 
    setPreview(url);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name || !price || !description || !category || !stock || (!image && !imageUrl)) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('stock', stock);
    
    if (image) {
      formData.append('image', image);
    } else {
      formData.append('image', imageUrl);
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Admin token missing. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/admin/add-product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Product saved successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(err.response?.data?.message || 'Failed to save product');
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Product</h2>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wider">Inventory</span>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded font-medium">{error}</div>}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2 md:col-span-1 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Product Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
            placeholder="e.g. Artisanal Espresso Beans"
          />
        </div>

        <div className="col-span-2 md:col-span-1 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            placeholder="0.00"
          />
        </div>

        <div className="col-span-2 md:col-span-1 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">Select category</option>
            {categories.filter(c => !c.isBlocked).map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
          </select>
        </div>

        <div className="col-span-2 md:col-span-1 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Stock Quantity</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            placeholder="0"
          />
        </div>

        <div className="col-span-2 space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Provide a detailed description of the product..."
          />
        </div>

        <div className="col-span-2 space-y-4">
          <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Product Image</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase mb-2">Upload File</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={onFileChange} 
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-green-50 file:text-green-700
                      hover:file:bg-green-100 cursor-pointer"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or use URL</span>
                  </div>
                </div>

                <div>
                  <input
                    value={imageUrl}
                    onChange={onUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {preview && (
                <div className="w-full md:w-1/3 space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase">Preview</p>
                  <div className="h-32 w-full overflow-hidden border border-gray-200 rounded-xl bg-white flex items-center justify-center p-2">
                    <img src={preview} alt="preview" className="max-h-full max-w-full object-contain rounded" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-2 pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-[0.99] disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? 'Creating Product...' : 'Save Product'}
          </button>
        </div>
        <div className="col-span-2 pt-4">
          <Link to="/admin/dashboard">
          <button 
            type="button" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-[0.99] disabled:opacity-70 disabled:active:scale-100"
          >
            Dashboard
          </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AddProducts;
