import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import Loading from '../components/Loading'
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute' 

const AdminLogin = lazy( () => import( '../pages/admin/AdminLogin'))
const AdminDasboard = lazy( () => import( '../pages/admin/AdminDasboard'))
const AddCategory = lazy( () => import( '../pages/admin/AddCategory'))
const AdminOrders = lazy( () => import( '../pages/admin/AdminOrders'))
const AddProducts = lazy( () => import( '../pages/admin/AddProducts'))
const NotFound = lazy( () => import( '../pages/error/404'))
const AddCoupon = lazy( () => import( '../pages/admin/AddCoupon'))
const AdminProductList = lazy( () => import( '../pages/admin/AdminProductList'))
const AdminUsersLists = lazy( () => import( '../pages/admin/AdminUsersLists'))
const RevenueOverview = lazy( () => import( '../pages/admin/RevenueOverview'))  
const SalesReport = lazy( () => import( '../pages/admin/SalesReport'))
const ReturnRequests = lazy( () => import( '../pages/admin/ReturnRequests'))
const RefundsList = lazy( () => import( '../pages/admin/RefundsList'))

function AdminRoutes() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Routes>
            <Route path="login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
            <Route path="dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDasboard /></ProtectedRoute>} />
            <Route path="add-category" element={<ProtectedRoute requireAdmin={true}><AddCategory /></ProtectedRoute>} />
            <Route path="view-orders" element={<ProtectedRoute requireAdmin={true}><AdminOrders /></ProtectedRoute>} />
            <Route path="add-products" element={<ProtectedRoute requireAdmin={true}><AddProducts /></ProtectedRoute>} />
            <Route path="add-coupon" element={<ProtectedRoute requireAdmin={true}><AddCoupon /></ProtectedRoute>} />
            <Route path="admin-product-list" element={<ProtectedRoute requireAdmin={true}><AdminProductList /></ProtectedRoute>} />
            <Route path="admin-user-list" element={<ProtectedRoute requireAdmin={true}><AdminUsersLists /></ProtectedRoute>} /> 
            <Route path="revenue" element={<ProtectedRoute requireAdmin={true}><RevenueOverview /></ProtectedRoute>} />
            <Route path="sales-report" element={<ProtectedRoute requireAdmin={true}><SalesReport /></ProtectedRoute>} />
            <Route path="returns" element={<ProtectedRoute requireAdmin={true}><ReturnRequests /></ProtectedRoute>} />
            <Route path="refunds" element={<ProtectedRoute requireAdmin={true}><RefundsList /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </div>
  )
}

export default AdminRoutes