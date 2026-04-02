const express = require('express');
const CartController = require('../controllers/CartController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

// All cart routes require user authentication
router.use(authenticateUser);

router.get('/', CartController.getCart);
router.post('/add', CartController.addToCart);
router.put('/update', CartController.updateQuantity);
router.delete('/remove/:productId', CartController.removeFromCart);
router.delete('/clear', CartController.clearCart);
router.post('/merge', CartController.mergeCart);

module.exports = router;
