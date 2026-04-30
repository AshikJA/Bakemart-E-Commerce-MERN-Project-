import React, { lazy, Suspense } from 'react' 
import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'
import PublicRoute from '../components/PublicRoute'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer' 
import Chatbot from '../components/Chatbot'
import Loading from '../components/Loading' 

const Home = lazy( () => import( '../pages/user/Home'))
const Login = lazy( () => import( '../pages/user/Login'))
const Register = lazy( () => import( '../pages/user/Register'))
const Profile = lazy( () => import( '../pages/user/Profile'))
const NotFound = lazy( () => import( '../pages/error/404'))
const Cart = lazy( () => import( '../pages/user/Cart'))
const ForgotPassword = lazy( () => import( '../pages/user/ForgetPassword'))
const ResetPassword = lazy( () => import( '../pages/user/ResetPassword'))
const ProductDetails = lazy( () => import( '../pages/user/ProductDetails'))
const Checkout = lazy( () => import( '../pages/user/Checkout'))
const OrderConfirmation = lazy( () => import( '../pages/user/OrderConfirmation')) 
const ViewOrders = lazy( () => import( '../pages/user/ViewOrders'))  
const Wallet = lazy( () => import( '../pages/user/Wallet'))
const VerifyOtp = lazy( () => import( '../pages/user/VerifyOtp'))
const WishList = lazy( () => import( '../pages/user/WishList'))
const About = lazy( () => import( '../pages/user/About'))
const Contact = lazy( () => import( '../pages/user/Contact'))

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
            <Route path="wishlist" element={<ProtectedRoute><WishList /></ProtectedRoute>} />
            
            {/* Nav Links mapping to Home */}
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <Chatbot />
      </Suspense>
    </div>
  )
}

export default UsersRoutes