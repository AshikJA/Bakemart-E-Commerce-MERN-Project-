const Admin = require('../models/AdminModel');
const { generateAdminToken } = require('../utils/adminJwt');
const Product = require('../models/ProductModel');
const Category = require('../models/CategoryModel');
const User = require('../models/UserModel');
const Order = require('../models/OrderModel');

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
  static async addProduct({ name, price, description, category, stock, image, images, weight, variantType, variants }) {
    try {
      const product = await Product.create({ name, price, description, category, stock, image, images, weight, variantType, variants });
      return product;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error.status ? error : { status: 500, message: 'Error adding product' };
    }
  }

  static async updateProduct(id, data) {
    try {
      const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!product) throw { status: 404, message: 'Product not found' };
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error.status ? error : { status: 500, message: 'Error updating product' };
    }
  }

  static async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) throw { status: 404, message: 'Product not found' };
      return { message: 'Product deleted successfully' };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error.status ? error : { status: 500, message: 'Error deleting product' };
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

  static async updateCategory(id, { name }) {
    try {
      const category = await Category.findById(id);
      if (!category) throw { status: 404, message: 'Category not found' };
      
      category.name = name;
      await category.save();
      return category;
    } catch (error) {
      if (error.code === 11000) {
        throw { status: 400, message: 'Category name already exists' };
      }
      console.error('Error updating category:', error);
      throw error.status ? error : { status: 500, message: 'Error updating category' };
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
      const [userCount, productCount, categoryCount, orderCount] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        Product.countDocuments(),
        Category.countDocuments(),
        Order.countDocuments(),
      ]);

      // Calculate total revenue from paid orders
      const revenueAgg = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      const totalRevenue = revenueAgg[0]?.total || 0;

      const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
      const recentUsers = await User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5);
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');

      return {
        stats: {
          users: { count: userCount, change: 'Total registered users' },
          products: { count: productCount, change: 'Items in inventory' },
          orders: { count: orderCount, change: 'Total orders placed' }, 
          revenue: { count: totalRevenue, change: 'From paid online orders' },
        },
        recentProducts,
        recentUsers,
        recentOrders,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw { status: 500, message: 'Error fetching dashboard data' };
    }
  }

  static async getAllProducts({ page: p, limit: l }) {
    const page = parseInt(p) || 1;
    const limit = parseInt(l) || 10;
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
          Product.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          Product.countDocuments()
        ]);
    
    return {
          products,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        };
  }

  static async toggleUserBan(id, reason, adminId) {
    try {
      const user = await User.findById(id);
      if (!user) throw { status: 404, message: 'User not found' };
      
      if (user.status === 'active') {
        user.status = 'banned';
        user.banReason = reason || 'Banned by admin';
        user.bannedAt = new Date();
        user.bannedBy = adminId;
      } else {
        user.status = 'active';
        user.banReason = null;
        user.bannedAt = null;
        user.bannedBy = null;
      }
      await user.save();
      return user;
    } catch (error) {
      console.error('Error toggling user ban:', error);
      throw error.status ? error : { status: 500, message: 'Error toggling user ban' };
    }
  }

  static async getAllUsers({ page: p, limit: l, search: s }) {
    const page = parseInt(p) || 1;
    const limit = parseInt(l) || 10;
    const skip = (page - 1) * limit;
    const search = s;

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
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getSalesReport({ startDate, endDate }) {
    try {
      const matchStage = {
        paymentStatus: 'paid',
        orderStatus: { $nin: ['cancelled', 'returned'] }
      };

      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
      } else {
        const defaultStart = new Date();
        defaultStart.setDate(defaultStart.getDate() - 30);
        defaultStart.setHours(0, 0, 0, 0);
        matchStage.createdAt = {
          $gte: defaultStart,
          $lte: new Date()
        };
      }

      const rootStats = await Order.aggregate([
        { $match: matchStage },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: '$totalAmount' }, 
            totalOrders: { $sum: 1 }
          } 
        }
      ]);

      const revenue = rootStats[0]?.totalRevenue || 0;
      const ordersCount = rootStats[0]?.totalOrders || 0;

      const salesByDate = await Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', revenue: 1, orders: 1 } }
      ]) || [];

      const productStats = await Order.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            qty: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $project: { _id: 0, name: '$_id', qty: 1, revenue: 1 } }
      ]) || [];

      const categoryStats = await Order.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            let: { productId: '$items.product' },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', { $toObjectId: '$$productId' }] } } }
            ],
            as: 'productDetails'
          }
        },
        { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { 
              $ifNull: [
                '$items.category', 
                { $ifNull: ['$productDetails.category', 'Uncategorized'] }
              ] 
            },
            qty: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $project: { _id: 0, category: '$_id', qty: 1, revenue: 1 } }
      ]) || [];

      const totalProductsSold = productStats.reduce((sum, item) => sum + item.qty, 0);

      return {
        totalRevenue: revenue,
        totalOrders: ordersCount,
        totalProductsSold,
        salesByDate,
        salesByProduct: productStats,
        salesByCategory: categoryStats
      };

    } catch (error) {
      console.error('Error in getSalesReport:', error);
      throw { status: 500, message: 'Error generating sales report data' };
    }
  }
}

module.exports = AdminService;

