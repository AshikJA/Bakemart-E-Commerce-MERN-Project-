const express = require('express');
const ProductController = require('../controllers/ProductController');
const { searchLimiter } = require('../middlewares/rateLimiter');
const router = express.Router();

router.get('/', searchLimiter, ProductController.getAllProducts);
router.get('/:id', searchLimiter, ProductController.getProductById);
  
module.exports = router;
