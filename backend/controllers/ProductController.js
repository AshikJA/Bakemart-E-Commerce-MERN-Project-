const BaseController = require('./BaseController');
const Product = require('../models/ProductModel');

class ProductController extends BaseController {
  
  static getAllProducts = BaseController.asyncHandler(async (req, res) => {
    const { category, search, minPrice, maxPrice, sort = '-createdAt' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escapedSearch, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
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

  static getProductById = BaseController.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      throw { status: 404, message: 'Product not found' };
    }
    
    return res.status(200).json(product);
  });
}

module.exports = ProductController;
