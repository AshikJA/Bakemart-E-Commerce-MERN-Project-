const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { authLimiter, searchLimiter } = require('../middlewares/rateLimiter');
const router = express.Router();  

router.post('/register', authLimiter, UserController.registerUser);
router.post('/login', authLimiter, UserController.loginUser);
router.post('/verify-otp', authLimiter, UserController.verifyOtp);
router.post('/forgot-password', authLimiter, UserController.forgotPassword);
router.post('/reset-password', authLimiter, UserController.resetPassword);
router.get('/profile', authenticateUser, searchLimiter, UserController.getProfile);
router.put('/profile', authenticateUser, searchLimiter, UserController.updateProfile);
router.post('/profile/verify-email', authenticateUser, authLimiter, UserController.verifyEmailUpdate);
router.post('/address', authenticateUser, searchLimiter, UserController.addAddress);
router.delete('/address/:id', authenticateUser, searchLimiter, UserController.deleteAddress);
router.patch('/address/:id', authenticateUser, searchLimiter, UserController.updateAddress);

router.get('/dashboard-data', authenticateUser, (req, res) => {
  res.status(200).json({ message: "Secure user data accessed successfully!", user: req.user });
}); 

module.exports = router;    