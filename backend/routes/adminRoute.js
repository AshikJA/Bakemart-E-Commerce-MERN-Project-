const express = require('express');
const AdminController = require('../controllers/AdminController');
const { authenticateAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');
const { searchLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/login', searchLimiter, AdminController.loginAdmin);
router.post('/add-product', authenticateAdmin, upload.array('images', 5), AdminController.addProduct); 
router.get('/products', authenticateAdmin, AdminController.getAllProducts);
router.put('/update-product/:id', authenticateAdmin, upload.array('images', 5), AdminController.updateProduct);
router.delete('/delete-product/:id', authenticateAdmin, AdminController.deleteProduct);
router.post('/add-category', authenticateAdmin, AdminController.addCategory);
router.put('/update-category/:id', authenticateAdmin, AdminController.updateCategory);
router.get('/categories', AdminController.getCategories);
router.patch('/toggle-category/:id', authenticateAdmin, AdminController.toggleCategoryStatus);
router.get('/users', authenticateAdmin, AdminController.getAllUsers);
router.patch('/toggle-user-ban/:id', authenticateAdmin, AdminController.toggleUserBan);


router.get('/dashboard-data', authenticateAdmin, AdminController.getDashboardData);  

module.exports = router;

