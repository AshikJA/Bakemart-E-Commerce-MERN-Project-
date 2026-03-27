const BaseController = require('./BaseController');
const { 
  registerUserSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  updateProfileSchema,
  addressSchema 
} = require('../utils/validation');
const UserService = require('../services/UserService');

class UserController extends BaseController {
  
  static registerUser = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(registerUserSchema, req.body);
    const result = await UserService.registerUser(validatedData);
    return res.status(201).json(result);
  })

  static loginUser = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.loginValidation(req.body)
    const result = await UserService.loginUser(validatedData)
    return res.status(201).json(result)
  })

  static verifyOtp = BaseController.asyncHandler(async (req, res) => {
    const result = await UserService.verifyOtp(req.body); 
    return res.status(200).json(result);
  });

  static forgotPassword = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(forgotPasswordSchema, req.body);
    const result = await UserService.requestPasswordReset(validatedData);
    return res.status(200).json(result);
  });

  static resetPassword = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(resetPasswordSchema, req.body);
    const result = await UserService.resetPassword(validatedData);
    return res.status(200).json(result);
  });

  static getProfile = BaseController.asyncHandler(async (req, res) => {
    const result = await UserService.getProfile(req.user.id);
    return res.status(200).json(result);
  });

  static updateProfile = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(updateProfileSchema, req.body);
    const result = await UserService.updateProfile(req.user.id, validatedData);
    return res.status(200).json(result);
  });

  static verifyEmailUpdate = BaseController.asyncHandler(async (req, res) => {
    const { otp } = req.body;
    if (!otp) throw { status: 400, message: 'OTP is required' };
    const result = await UserService.verifyEmailUpdate(req.user.id, otp);
    return res.status(200).json(result);
  });

  static addAddress = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(addressSchema, req.body);
    const result = await UserService.addAddress(req.user.id, validatedData);
    return res.status(201).json(result);
  });

  static deleteAddress = BaseController.asyncHandler(async (req, res) => {
    const result = await UserService.deleteAddress(req.user.id, req.params.id);
    return res.status(200).json(result);
  });

  static updateAddress = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(addressSchema, req.body);
    const result = await UserService.updateAddress(req.user.id, req.params.id, validatedData);
    return res.status(200).json(result);
  });
}

module.exports = UserController;