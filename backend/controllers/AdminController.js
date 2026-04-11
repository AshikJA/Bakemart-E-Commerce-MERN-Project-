const BaseController = require('./BaseController');
const AdminService = require('../services/AdminService');


class AdminController extends BaseController {
  static loginAdmin = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.loginValidation(req.body);
    const result = await AdminService.loginAdmin(validatedData);
    return res.status(200).json(result);
  });

  static addProduct = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.addproductValidation(req);
    const result = await AdminService.addProduct(validatedData.value);
    return res.status(200).json(result);
  });

  static getAllProducts = BaseController.asyncHandler(async (req, res) => {
    const result = await AdminService.getAllProducts(req.query);
    return res.status(200).json(result); 
  });

  static updateProduct = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => f.filename);
      data.image = req.files[0].filename;
    }
    const result = await AdminService.updateProduct(id, data);
    return res.status(200).json(result);
  });

  static deleteProduct = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await AdminService.deleteProduct(id);
    return res.status(200).json(result);
  });

  static addCategory = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.addCategoryValidation(req.body);
    const result = await AdminService.addCategory(validatedData);
    return res.status(201).json(result);
  });

  static updateCategory = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const validatedData = BaseController.addCategoryValidation(req.body);
    const result = await AdminService.updateCategory(id, validatedData);
    return res.status(200).json(result);
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

  static getAllUsers = BaseController.asyncHandler(async (req, res) => {
    const result = await AdminService.getAllUsers(req.query);
    return res.status(200).json(result);
  });

  static toggleUserBan = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await AdminService.toggleUserBan(id, reason, req.userId);
    return res.status(200).json(result);
  });

  static getSalesReport = BaseController.asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const result = await AdminService.getSalesReport({ startDate, endDate });
    return res.status(200).json(result);
  });
}

module.exports = AdminController;

