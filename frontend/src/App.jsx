import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UsersRoutes from './routes/UsersRoutes'
import AdminRoutes from './routes/AdminRoutes'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/*" element={<UsersRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </div>
  )
}

export default App