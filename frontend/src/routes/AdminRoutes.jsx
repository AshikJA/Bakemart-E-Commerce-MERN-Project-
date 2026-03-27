import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AdminLogin from '../pages/AdminLogin'
import AdminDasboard from '../pages/AdminDasboard'
import AddCategory from '../pages/AddCategory'
import ViewOrders from '../pages/ViewOrders'
import AddProducts from '../pages/AddProducts'
import NotFound from '../pages/404'
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import AddCoupon from '../pages/AddCoupon'

function AdminRoutes() {
  return (
    <div>
        <Routes>
            <Route path="login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
            <Route path="dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDasboard /></ProtectedRoute>} />
            <Route path="add-category" element={<ProtectedRoute requireAdmin={true}><AddCategory /></ProtectedRoute>} />
            <Route path="view-orders" element={<ProtectedRoute requireAdmin={true}><ViewOrders /></ProtectedRoute>} />
            <Route path="add-products" element={<ProtectedRoute requireAdmin={true}><AddProducts /></ProtectedRoute>} />
            <Route path="add-coupon" element={<ProtectedRoute requireAdmin={true}><AddCoupon /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </div>
  )
}

export default AdminRoutes