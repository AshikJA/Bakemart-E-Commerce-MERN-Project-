import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  
  // Admin routes: use adminToken only
  if (config.url.includes('/admin')) {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } 
  // User routes: use user token only
  else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle token expired errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAdminRoute = error.config?.url?.includes('/admin');
      localStorage.removeItem(isAdminRoute ? 'adminToken' : 'token');
      toast.error('Session expired. Please login again.');
      window.location.href = isAdminRoute ? '/admin/login' : '/login';
    }
    return Promise.reject(error);
  }
);

export default api;