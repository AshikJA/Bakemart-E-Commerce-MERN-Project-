const BaseController = require('./BaseController');
const ProductService = require('../services/ProductService');

class ProductController extends BaseController {
  
  static getAllProducts = BaseController.asyncHandler(async (req, res) => {
    const result = await ProductService.getAllProducts(req, res);
    return res.status(200).json(result);
  });

  static getProductById = BaseController.asyncHandler(async (req, res) => {
    const result = await ProductService.getProductById(req.params.id);
    return res.status(200).json(result);
  });

  static createProductReview = BaseController.asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const result = await ProductService.createProductReview(req.params.id, req.userId, rating, comment);
    return res.status(201).json(result);
  });

  static updateProductReview = BaseController.asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const result = await ProductService.updateProductReview(req.params.id, req.params.reviewId, req.userId, rating, comment);
    return res.status(200).json(result);
  });

  static deleteProductReview = BaseController.asyncHandler(async (req, res) => {
    const result = await ProductService.deleteProductReview(req.params.id, req.params.reviewId, req.userId);
    return res.status(200).json(result);
  });
}

module.exports = ProductController;
