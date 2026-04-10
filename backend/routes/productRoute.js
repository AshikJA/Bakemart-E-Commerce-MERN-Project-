const express = require('express');
const ProductController = require('../controllers/ProductController');
const { searchLimiter } = require('../middlewares/rateLimiter');
const { authenticateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', searchLimiter, ProductController.getAllProducts);
router.get('/:id', searchLimiter, ProductController.getProductById);

router.post('/:id/reviews', authenticateUser, ProductController.createProductReview);
router.put('/:id/reviews/:reviewId', authenticateUser, ProductController.updateProductReview);
router.delete('/:id/reviews/:reviewId', authenticateUser, ProductController.deleteProductReview);
  
module.exports = router;
