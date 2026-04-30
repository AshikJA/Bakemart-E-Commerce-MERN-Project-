import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// ── Request interceptor: attach the right token ────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');

  const isAdminRoute = config.url.includes('/admin') || config.url.includes('/banners/');
  if (isAdminRoute) {
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ── Response interceptor: global error handling ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const data    = error.response?.data;
    const message = data?.message;
    const details = data?.details; // array of { field, message }

    // ── 401: Session expired / invalid token ──────────────────────────────
    if (status === 401) {
      const isAdminRoute = error.config?.url?.includes('/admin');

      // Don't redirect on "wrong current password" — let the form handle it
      if (message === 'Invalid current password') return Promise.reject(error);

      localStorage.removeItem(isAdminRoute ? 'adminToken' : 'token');
      toast.error('Session expired. Please login again.');
      window.location.href = isAdminRoute ? '/admin/login' : '/login';
      return Promise.reject(error);
    }

    // ── 422 / 400: Validation errors ──────────────────────────────────────
    // If the response carries field-level details, show each one as a toast.
    // The calling code can also access error.response.data.details directly
    // for inline field highlighting via the useFormErrors hook.
    if ((status === 422 || status === 400) && details && Array.isArray(details)) {
      // Show the first error as a prominent toast; rest are shown as additional
      details.forEach((err, idx) => {
        toast.error(err.message, {
          toastId: `validation-${err.field}-${idx}`, // prevent duplicate toasts
          position: 'top-right',
          autoClose: 5000,
        });
      });
      return Promise.reject(error);
    }

    // ── All other errors: show the top-level message ───────────────────────
    if (message && status !== 401) {
      // Suppress noisy "not found" errors from product detail pages, etc.
      const silent = error.config?._silent;
      if (!silent) {
        toast.error(message, { toastId: `api-error-${status}` });
      }
    }

    return Promise.reject(error);
  }
);

export default api;