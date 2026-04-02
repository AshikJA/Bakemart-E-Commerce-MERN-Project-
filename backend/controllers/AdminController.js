const BaseController = require('./BaseController');
const AdminService = require('../services/AdminService');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');

class AdminController extends BaseController {
  static loginAdmin = BaseController.asyncHandler(async (req, res) => {
    const validatedData = BaseController.loginValidation(req.body);
    const result = await AdminService.loginAdmin(validatedData);
    return res.status(200).json(result);
  });

  static addProduct = BaseController.asyncHandler(async (req, res) => {
    console.group('--- Add Product Debug ---');
    console.log('Body:', { 
      ...req.body, 
      images: Array.isArray(req.body.images) 
        ? `[Array of ${req.body.images.length}]` 
        : (req.body.images ? `[${typeof req.body.images}]` : '(none)') 
    });
    console.log('Files:', req.files?.map(f => ({ name: f.originalname, size: f.size })));
    const data = { ...req.body };
    if (data.weight === '') delete data.weight; 
    
    // Priority 1: Handle uploaded files (multer)
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => f.filename);
      data.image = req.files[0].filename;
    } 
    // Priority 2: Handle single string (URL/Already uploaded)
    else if (data.images && typeof data.images === 'string') {
      data.images = [data.images];
      data.image = data.images[0];
    }
    // Priority 3: Handle array of strings (if sent as array of URLs)
    else if (Array.isArray(data.images) && data.images.every(img => typeof img === 'string')) {
      data.image = data.images[0];
    }
    // Fallback: If images are not strings, they are likely File objects that multer failed to process
    else {
      data.images = [];
      data.image = '';
    }

    const validatedData = BaseController.addproductValidation(data);
    const result = await AdminService.addProduct(validatedData);
    return res.status(200).json(result);
  });

  static getAllProducts = BaseController.asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments()
    ]);

    return res.status(200).json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    let query = { role: 'user' };
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(query)
    ]);

    return res.status(200).json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  static toggleUserBan = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await User.findById(id);
    if (!user) throw { status: 404, message: 'User not found' };
    
    if (user.status === 'active') {
      user.status = 'banned';
      user.banReason = reason || 'Banned by admin';
      user.bannedAt = new Date();
      user.bannedBy = req.userId;
    } else {
      user.status = 'active';
      user.banReason = null;
      user.bannedAt = null;
      user.bannedBy = null;
    }
    await user.save();
    return res.status(200).json(user);
  });
}

module.exports = AdminController;

