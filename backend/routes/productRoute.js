const express = require('express');
const ProductController = require('../controllers/ProductController');
const { searchLimiter } = require('../middlewares/rateLimiter');
const { authenticateUser } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { filterProductsValidator, reviewValidator } = require('../validators/productValidators');

const router = express.Router();

router.get('/',                searchLimiter,  ProductController.getAllProducts);
router.get('/wishlist',        authenticateUser, searchLimiter, ProductController.getWishlistController);
router.put('/wishlist/:id',    authenticateUser, searchLimiter, ProductController.toggleWishlistController);

router.post('/filter',         searchLimiter, filterProductsValidator, validate, ProductController.filterProducts);

router.get('/:id',             searchLimiter, ProductController.getProductById);
router.post('/:id/reviews',    authenticateUser, reviewValidator, validate, ProductController.createProductReview);
router.put('/:id/reviews/:reviewId',    authenticateUser, reviewValidator, validate, ProductController.updateProductReview);
router.delete('/:id/reviews/:reviewId', authenticateUser, ProductController.deleteProductReview);

router.get('/related-product/:pid/:cid', ProductController.getRelatedProducts);

module.exports = router;
