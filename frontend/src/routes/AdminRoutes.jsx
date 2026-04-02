import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'

import Loading from '../components/Loading'
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute' 

const AdminLogin = lazy( () => import( '../pages/AdminLogin'))
const AdminDasboard = lazy( () => import( '../pages/AdminDasboard'))
const AddCategory = lazy( () => import( '../pages/AddCategory'))
const AdminOrders = lazy( () => import( '../pages/AdminOrders'))
const AddProducts = lazy( () => import( '../pages/AddProducts'))
const NotFound = lazy( () => import( '../pages/404'))
const AddCoupon = lazy( () => import( '../pages/AddCoupon'))
const AdminProductList = lazy( () => import( '../pages/AdminProductList'))
const AdminUsersLists = lazy( () => import( '../pages/AdminUsersLists'))
const RevenueOverview = lazy( () => import( '../pages/RevenueOverview'))  

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
            <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </div>
  )
}

export default AdminRoutes