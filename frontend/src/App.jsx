import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UsersRoutes from './routes/UsersRoutes'
import AdminRoutes from './routes/AdminRoutes'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chatbot from './components/Chatbot';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div>
        <ScrollToTop />
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/*" element={<UsersRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
        <Chatbot />
      </div>
    </AuthProvider>
  )
}

export default App