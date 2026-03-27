const Admin = require('../models/AdminModel');
const { generateAdminToken } = require('../utils/adminJwt');
const Product = require('../models/ProductModel');
const Category = require('../models/CategoryModel');
const User = require('../models/UserModel');

class AdminService {
  static async loginAdmin({ email, password }) {
    try {
      const admin = await Admin.findByEmail(email).select('+password');
      if (!admin) {
        throw { status: 401, message: 'Invalid email or password' };
      }

      if (admin.status !== 'active') {
        throw { status: 403, message: 'Admin account is disabled' };
      }

      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        throw { status: 401, message: 'Invalid email or password' };
      }

      const token = generateAdminToken({
        id: admin._id,
        email: admin.email,
        role: 'admin',
      });

      return {
        admin: admin.getPublicProfile(),
        token,
      };
    } catch (error) {
      console.error('Error logging in admin:', error);
      throw error.status ? error : { status: 500, message: 'Error logging in admin' };
    }
  }
  static async addProduct({ name, price, description, category, stock, image }) {
    try {
      const product = await Product.create({ name, price, description, category, stock, image });
      return product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error.status ? error : { status: 500, message: 'Error adding product' };
    }
  }

  static async addCategory({ name }) {
    try {
      const category = await Category.create({ name });
      return category;
    } catch (error) {
      if (error.code === 11000) {
        throw { status: 400, message: 'Category already exists' };
      }
      console.error('Error adding category:', error);
      throw error.status ? error : { status: 500, message: 'Error adding category' };
    }
  }

  static async getCategories() {
    try {
      const categories = await Category.find().sort({ createdAt: -1 });
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw { status: 500, message: 'Error fetching categories' };
    }
  }

  static async toggleCategoryStatus(id) {
    try {
      const category = await Category.findById(id);
      if (!category) {
        throw { status: 404, message: 'Category not found' };
      }
      category.isBlocked = !category.isBlocked;
      await category.save();
      return category;
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error.status ? error : { status: 500, message: 'Error updating category status' };
    }
  }

  static async getDashboardData() {
    try {
      const [userCount, productCount, categoryCount] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        Product.countDocuments(),
        Category.countDocuments(),
      ]);

      const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
      const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5);

      return {
        stats: {
          users: { count: userCount, change: 'Total registered users' },
          products: { count: productCount, change: 'Items in inventory' },
          orders: { count: 0, change: 'Order system pending' }, // Placeholder
          categories: { count: categoryCount, change: 'Active categories' },
        },
        recentProducts,
        recentUsers,
        recentOrders: [], // Placeholder since Order model is missing
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw { status: 500, message: 'Error fetching dashboard data' };
    }
  }
}

module.exports = AdminService;

