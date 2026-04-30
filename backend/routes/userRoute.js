const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { authLimiter, searchLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  changePasswordValidator,
  addressValidator,
  verifyOtpValidator,
} = require('../validators/userValidators');

const router = express.Router();

router.post('/register',      authLimiter,  registerValidator,       validate, UserController.registerUser);
router.post('/login',         authLimiter,  loginValidator,          validate, UserController.loginUser);
router.post('/verify-otp',    authLimiter,  verifyOtpValidator,      validate, UserController.verifyOtp);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, UserController.forgotPassword);
router.post('/reset-password',  authLimiter, resetPasswordValidator,  validate, UserController.resetPassword);

router.get('/profile',  authenticateUser, searchLimiter, UserController.getProfile);
router.put('/profile',  authenticateUser, searchLimiter, updateProfileValidator, validate, UserController.updateProfile);
router.post('/profile/verify-email', authenticateUser, authLimiter, UserController.verifyEmailUpdate);

router.post('/address',     authenticateUser, searchLimiter, addressValidator, validate, UserController.addAddress);
router.delete('/address/:id', authenticateUser, searchLimiter, UserController.deleteAddress);
router.patch('/address/:id',  authenticateUser, searchLimiter, addressValidator, validate, UserController.updateAddress);

router.post('/change-password', authenticateUser, authLimiter, changePasswordValidator, validate, UserController.changePassword);

router.get('/dashboard-data', authenticateUser, (req, res) => {
  res.status(200).json({ message: 'Secure user data accessed successfully!', user: req.user });
});

module.exports = router;