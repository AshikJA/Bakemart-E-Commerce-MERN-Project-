const express = require('express');
const AdminController = require('../controllers/AdminController');
const { authenticateAdmin } = require('../middlewares/authMiddleware');
const { uploadProductImage } = require('../middlewares/multer');
const { searchLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const {
  addProductValidator,
  categoryValidator,
  adminLoginValidator,
} = require('../validators/productValidators');

const router = express.Router();

router.post('/login',          searchLimiter, adminLoginValidator, validate, AdminController.loginAdmin);
router.post('/add-product',    authenticateAdmin, uploadProductImage, addProductValidator, validate, AdminController.addProduct);
router.get('/products',        authenticateAdmin, AdminController.getAllProducts);
router.put('/update-product/:id', authenticateAdmin, uploadProductImage, AdminController.updateProduct);
router.delete('/delete-product/:id', authenticateAdmin, AdminController.deleteProduct);

router.post('/add-category',      authenticateAdmin, categoryValidator, validate, AdminController.addCategory);
router.put('/update-category/:id', authenticateAdmin, categoryValidator, validate, AdminController.updateCategory);
router.get('/categories', AdminController.getCategories);
router.patch('/toggle-category/:id', authenticateAdmin, AdminController.toggleCategoryStatus);

router.get('/users',               authenticateAdmin, AdminController.getAllUsers);
router.patch('/toggle-user-ban/:id', authenticateAdmin, AdminController.toggleUserBan);

router.get('/dashboard-data',  authenticateAdmin, AdminController.getDashboardData);
router.get('/reports/sales',   authenticateAdmin, AdminController.getSalesReport);

module.exports = router;
