const BaseController = require('./BaseController');
const AdminService = require('../services/AdminService');

class AdminController extends BaseController {
  static loginAdmin = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.loginValidation(req.body);
    const result = await AdminService.loginAdmin(validatedData);
    return res.status(200).json(result);
  });

  static addProduct = BaseController.asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (req.file) {
      data.image = req.file.filename;
    }
    const validatedData = BaseController.addproductValidation(data);
    const result = await AdminService.addProduct(validatedData);
    return res.status(200).json(result);
  });

  static addCategory = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.addCategoryValidation(req.body);
    const result = await AdminService.addCategory(validatedData);
    return res.status(201).json(result);
  });

  static getCategories = BaseController.asyncHandler(async (req, res) => {
    const result = await AdminService.getCategories();
    return res.status(200).json(result);
  });

  static toggleCategoryStatus = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await AdminService.toggleCategoryStatus(id);
    return res.status(200).json(result);
  });

  static getDashboardData = BaseController.asyncHandler(async (req, res) => {
    const result = await AdminService.getDashboardData();
    return res.status(200).json(result);
  });
}

module.exports = AdminController;

