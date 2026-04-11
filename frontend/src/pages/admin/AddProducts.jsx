import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { FiArrowLeft, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

function AddProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const editProduct = location.state?.product;
  
  const [name, setName] = useState(editProduct?.name || '');
  const [price, setPrice] = useState(editProduct?.price || '');
  const [description, setDescription] = useState(editProduct?.description || '');
  const [category, setCategory] = useState(editProduct?.category || '');
  const [stock, setStock] = useState(editProduct?.stock || '');
  const [weight, setWeight] = useState(editProduct?.weight || ''); 
  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [variantType, setVariantType] = useState(editProduct?.variantType || 'none');
  const [variants, setVariants] = useState(editProduct?.variants || []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const onFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    setImages(prevImages => {
      const combinedFiles = [...prevImages, ...files].slice(0, 5); // Limit to 5
      if (combinedFiles.length > 0) {
        setImageUrl(''); 
        
        const newPreviews = [];
        combinedFiles.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews.push(reader.result);
            if (newPreviews.length === combinedFiles.length) {
              setPreviews([...newPreviews]); 
            }
          };
          reader.readAsDataURL(file);
        });
      }
      return combinedFiles;
    });
  };

  const removeImage = (indexToRemove) => {
    setImages(prevImages => {
      const remainingFiles = prevImages.filter((_, idx) => idx !== indexToRemove);
      
      if (remainingFiles.length === 0) {
        setPreviews([]);
        return [];
      }
      
      const newPreviews = [];
      remainingFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === remainingFiles.length) {
            setPreviews([...newPreviews]); 
          }
        };
        reader.readAsDataURL(file);
      });
      
      return remainingFiles;
    });
  };

  const onUrlChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImages([]); 
    setPreviews([url]);
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: '', stock: 0, isDefault: variants.length === 0 }]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, idx) => idx !== index);
    if (newVariants.length > 0 && !newVariants.some(v => v.isDefault)) {
      newVariants[0].isDefault = true;
    }
    setVariants(newVariants);
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    if (field === 'isDefault') {
      newVariants.forEach((v, idx) => { v.isDefault = idx === index; });
    } else {
      newVariants[index][field] = value;
    }
    setVariants(newVariants);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name || !price || !description || !category || !stock || (images.length === 0 && !imageUrl)) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (variantType !== 'none' && variants.length === 0) {
      setError('Please add at least one variant.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('stock', stock);
    formData.append('weight', weight);  
    formData.append('variantType', variantType);
    formData.append('variants', JSON.stringify(variants));
    
    if (images.length > 0) {
      images.forEach(img => formData.append('images', img));
    } else {
      formData.append('images', imageUrl);
    }

    try {
      if (editProduct) {
        await api.put(`/admin/products/${editProduct._id}`, formData);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/admin/add-product', formData);
        toast.success('Product saved successfully!');
      }
      navigate(-1);
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
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <FiArrowLeft size={24} />
                  </button>
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
          <label className="block text-sm font-semibold text-gray-700">Variant Type</label>
          <select
            value={variantType}
            onChange={(e) => { setVariantType(e.target.value); if (e.target.value === 'none') setVariants([]); }}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="none">None</option>
            <option value="weight">Weight</option>
            <option value="size">Size</option>
            <option value="flavor">Flavor</option>
          </select>
        </div>

        {variantType !== 'none' && (
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">Variants</label>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-1 text-sm text-green-600 font-semibold hover:text-green-700"
              >
                <FiPlus /> Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {variants.map((variant, idx) => (
                <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex-1 min-w-[100px]">
                  <label className="block text-sm font-semibold text-gray-700">Variant Name</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                      placeholder="Name (e.g. 500g)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-semibold text-gray-700">Price</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                      placeholder="Price"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-semibold text-gray-700">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                      placeholder="Stock"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="radio"
                        name={`default-${idx}`}
                        checked={variant.isDefault}
                        onChange={() => updateVariant(idx, 'isDefault', true)}
                        className="accent-green-600"
                      />
                      Default
                    </label>
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {variants.length === 0 && (
                <p className="text-sm text-gray-500 italic">Click "Add Variant" to add options</p>
              )}
            </div>
          </div>
        )}

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
                    multiple
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

              {previews.length > 0 && (
                <div className="w-full md:w-1/2 space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase flex justify-between">
                    <span>Previews ({previews.length}/5)</span>
                    {previews.length >= 5 && <span className="text-orange-500">Max limit reached</span>}
                  </p>
                  <div className="flex gap-3 overflow-x-auto p-4 border border-gray-200 rounded-xl bg-white custom-scrollbar">
                    {previews.map((preview, idx) => (
                      <div key={idx} className="relative group flex-shrink-0">
                         <img src={preview} alt={`preview ${idx}`} className="h-24 w-24 object-cover rounded-lg shadow-sm border border-gray-100" />
                         <button 
                           type="button" 
                           onClick={() => removeImage(idx)} 
                           className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 shadow-md"
                           title="Remove image"
                         >
                           <FiX size={14} strokeWidth={3} />
                         </button>
                      </div>
                    ))}
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-all active:scale-[0.99] disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? 'Creating Product...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProducts;
