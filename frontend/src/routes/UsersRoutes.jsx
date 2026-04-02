import React, { lazy, Suspense } from 'react' 
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer' 
import Loading from '../components/Loading' 

const Home = lazy( () => import( '../pages/Home'))
const Login = lazy( () => import( '../pages/Login'))
const Register = lazy( () => import( '../pages/Register'))
const Profile = lazy( () => import( '../pages/Profile'))
const NotFound = lazy( () => import( '../pages/404'))
const Cart = lazy( () => import( '../pages/Cart'))
const ForgotPassword = lazy( () => import( '../pages/ForgetPassword'))
const ResetPassword = lazy( () => import( '../pages/ResetPassword'))
const ProductDetails = lazy( () => import( '../pages/ProductDetails'))
const Checkout = lazy( () => import( '../pages/Checkout'))
const OrderConfirmation = lazy( () => import( '../pages/OrderConfirmation')) 
const ViewOrders = lazy( () => import( '../pages/ViewOrders'))  
const Wallet = lazy( () => import( '../pages/Wallet'))
const VerifyOtp = lazy( () => import( '../pages/VerifyOtp'))

function UsersRoutes() {
  return (
    <div>
      <Suspense fallback={<Loading />}>
        <Navbar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path='forgot-password' element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path='reset-password' element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
            <Route path="view-orders" element={<ProtectedRoute><ViewOrders /></ProtectedRoute>} />      
            <Route path="wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />      
            <Route path="verify-otp" element={<VerifyOtp />} />
            
            {/* Nav Links mapping to Home */}
            <Route path="shop" element={<Home />} />
            <Route path="hampers" element={<Home />} />
            <Route path="cakes" element={<Home />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Suspense>
    </div>
  )
}

export default UsersRoutes