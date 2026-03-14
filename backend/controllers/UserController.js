const BaseController = require('./BaseController');
const { registerUserSchema, loginUserSchema, forgotPasswordSchema, resetPasswordSchema } = require('../utils/validation');
const UserService = require('../services/UserService');

class UserController extends BaseController {
  
  static registerUser = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(registerUserSchema, req.body);
    const result = await UserService.registerUser(validatedData);
    return res.status(201).json(result);
  })

  static loginUser = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.validateRequest(loginUserSchema, req.body)
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
}

module.exports = UserController;