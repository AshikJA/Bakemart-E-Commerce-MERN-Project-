const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/verify-otp', UserController.verifyOtp);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.get('/profile', authenticateUser, UserController.getProfile);
router.put('/profile', authenticateUser, UserController.updateProfile);
router.post('/profile/verify-email', authenticateUser, UserController.verifyEmailUpdate);
router.post('/address', authenticateUser, UserController.addAddress);
router.delete('/address/:id', authenticateUser, UserController.deleteAddress);
router.patch('/address/:id', authenticateUser, UserController.updateAddress);

router.get('/dashboard-data', authenticateUser, (req, res) => {
  res.status(200).json({ message: "Secure user data accessed successfully!", user: req.user });
}); 

module.exports = router;    