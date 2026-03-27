const express = require('express');
const AdminController = require('../controllers/AdminController');
const { authenticateAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');

const router = express.Router();

router.post('/login', AdminController.loginAdmin);
router.post('/add-product', authenticateAdmin, upload.single('image'), AdminController.addProduct); 
router.post('/add-category', authenticateAdmin, AdminController.addCategory);
router.get('/categories', AdminController.getCategories);
router.patch('/toggle-category/:id', authenticateAdmin, AdminController.toggleCategoryStatus);

router.get('/dashboard-data', authenticateAdmin, AdminController.getDashboardData);  

module.exports = router;

