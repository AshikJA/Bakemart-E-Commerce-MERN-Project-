const BaseController = require('./BaseController');
const Product = require('../models/ProductModel');

class ProductController extends BaseController {
  
  static getAllProducts = BaseController.asyncHandler(async (req, res) => {
    const { category, search } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.status(200).json(products);
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
