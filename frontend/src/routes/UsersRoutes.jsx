import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import NotFound from '../pages/404'
import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import Cart from '../pages/Cart'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer' 
import ForgotPassword from '../pages/ForgetPassword'
import ResetPassword from '../pages/ResetPassword'
import ProductDetails from '../pages/ProductDetails'
import Checkout from '../pages/Checkout'

function UsersRoutes() {
  return (
    <div>
      <Navbar />
        <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path='forgot-password' element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path='reset-password' element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />  
            <Route path="*" element={<NotFound />} />
        </Routes>
      <Footer />
    </div>
  )
}

export default UsersRoutes