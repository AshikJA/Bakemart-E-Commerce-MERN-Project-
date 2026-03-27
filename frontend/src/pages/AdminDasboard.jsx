import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { LogoutIcon } from '../components/Icons';


export default function AdminDasboard() {
  const [stats, setStats] = useState({
    users: { count: 0, change: '' },
    products: { count: 0, change: '' },
    orders: { count: 0, change: '' },
    categories: { count: 0, change: '' },
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);   
  const [usersCount, setUsersCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []); 

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard-data', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const { stats, recentOrders, recentProducts, recentUsers } = response.data;
      setStats(stats);
      setRecentOrders(recentOrders || []);
      setUsersCount(stats.users.count);
      setProductsCount(stats.products.count);
      setCategoriesCount(stats.categories.count);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Logo Placeholder */}
          <span className="font-semibold text-lg text-slate-700">Admin User</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
        >
          <LogoutIcon />
          Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="mt-2 text-slate-500">Welcome back, Admin User! Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{usersCount}</h3>
              <p className="text-xs text-slate-400 mt-1">{stats.users.change}</p>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Products</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{productsCount}</h3>
              <p className="text-xs text-slate-400 mt-1">{stats.products.change}</p>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start space-x-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{recentOrders.length}</h3>
              <p className="text-xs text-slate-400 mt-1">{stats.orders.change}</p>
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-start space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Categories</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{categoriesCount}</h3>
              <p className="text-xs text-slate-400 mt-1">{stats.categories.change}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">Order ID</th>
                    <th scope="col" className="px-6 py-3 font-medium">Customer</th>
                    <th scope="col" className="px-6 py-3 font-medium">Status</th>
                    <th scope="col" className="px-6 py-3 font-medium">Total</th>
                    <th scope="col" className="px-6 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.length > 0 ? recentOrders.map((order) => (
                    <tr key={order._id || order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-blue-600 whitespace-nowrap">
                        {order._id || order.id}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{order.customer?.name || order.customer || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">₹{order.total || '0'}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt || order.date).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                        No recent orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center">
                View all orders 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Actions Side Panel */}
          <div className="space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/admin/add-products" className="w-full block">
                <button className="w-full flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Product
                </button>
                </Link>

                <Link to="/admin/add-category" className="w-full block">
                <button className="w-full flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Category
                </button>
                </Link>

                <Link to="/admin/add-coupon" className="w-full block">
                <button className="w-full flex items-center justify-center px-4 py-2.5 bg-[#D4A96A] text-[#6B3F1F] rounded-lg text-sm font-medium hover:bg-slate-200 transition">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  + Add Coupon
                </button>
                </Link>

                <Link to="/admin/view-orders" className="w-full block">
                <button className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-100  text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View Orders
                </button>
                </Link>
              </div>
            </div>

            {/* Recent Activity Card (Placeholder for now) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
               <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
               <div className="space-y-4">
                 <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="text-sm text-slate-700">New user registered: <span className="font-medium">john_doe</span></p>
                      <p className="text-xs text-slate-400 mt-0.5">2 hours ago</p>
                    </div>
                 </div>
                 <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500"></div>
                    <div>
                      <p className="text-sm text-slate-700">Order <span className="font-medium">#ORD-6949...</span> placed</p>
                      <p className="text-xs text-slate-400 mt-0.5">5 hours ago</p>
                    </div>
                 </div>
                 <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm text-slate-700">Product "Wireless Headphones" updated</p>
                      <p className="text-xs text-slate-400 mt-0.5">Yesterday</p>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}