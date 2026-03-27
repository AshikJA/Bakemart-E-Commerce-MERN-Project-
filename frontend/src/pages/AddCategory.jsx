import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';    
import { toast } from 'react-toastify';

function AddCategory() {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:5000/api/admin/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
      setError('Failed to load categories');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setLoading(true);
    setError('');

    const token = localStorage.getItem('adminToken');
    if (!token) {
      setError('Admin token missing. Please log in again.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/admin/add-category', 
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      toast.success('Category added successfully!');
      setCategoryName('');
      fetchCategories();
    } catch (err) {
      console.error('Error adding category:', err);
      toast.error(err.response?.data?.message || 'Failed to add category');
      setError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Admin token missing. Please log in again.');
      return;
    }

    try {
      await axios.patch(`http://localhost:5000/api/admin/toggle-category/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Category status updated');
      fetchCategories();
    } catch (err) {
      console.error('Error toggling status:', err);
      toast.error('Failed to update status');
    }
  };

  const handleEdit = (category) => {
    const newName = prompt('Enter new category name:', category.name);
    if (newName && newName !== category.name) {
      alert('Edit functionality can be fully implemented with an update API.');
    }
  };

  return (
    <div className="max-w-[800px] mx-auto my-10 px-5 font-sans text-center">
      <h1 className="text-[48px] font-extrabold text-black mb-10 tracking-tighter">Add Category</h1>
      
      <form onSubmit={handleAddCategory}>
        <div className="mb-5">
          <input 
            type="text" 
            className="w-[60%] px-6 py-4 text-lg border-none rounded-xl bg-[#e0e0e0] text-[#333] outline-none transition-colors duration-300 focus:bg-[#d8d8d8]"
            placeholder='Type here to add category...' 
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            disabled={loading}
          />
        </div>
        <button 
          type='submit' 
          className="w-[50%] p-3.5 text-lg font-semibold text-white bg-green-500 rounded-xl cursor-pointer transition-all duration-300 shadow-md hover:bg-green-600 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2.5">{error}</p>}

      <div className="mt-[50px] bg-[#d1d1d1] rounded-2xl p-[30px] min-h-[400px]">
        <h2 className="text-xl font-medium text-[#333] mb-6">Recent Add Category</h2>
        <div className="flex flex-col gap-3 text-left">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-lg px-6 py-3 flex items-center justify-between shadow-sm">
              <span className="text-lg font-bold text-black">{cat.name}</span>
              <div className="flex gap-3">
                <button 
                  className="bg-blue-700 hover:bg-blue-800 text-white border-none rounded-lg px-6 py-2 text-base font-medium cursor-pointer transition-colors duration-200"
                  onClick={() => handleEdit(cat)}
                >
                  Edit
                </button>
                <button 
                  className={`border-none rounded-lg px-4.5 py-2 text-base font-medium cursor-pointer transition-colors duration-200 min-w-[90px] text-white ${cat.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                  onClick={() => handleToggleStatus(cat._id)}
                >
                  {cat.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="text-center text-gray-600">No categories added yet.</p>}
        </div>
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
    </div>
  );
}

export default AddCategory;

