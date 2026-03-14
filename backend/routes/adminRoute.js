const express = require('express');
const AdminController = require('../controllers/AdminController');
const { authenticateAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', AdminController.loginAdmin);

// Example protected admin route using the role middleware
router.get('/dashboard-data', authenticateAdmin, (req, res) => {
  res.status(200).json({ message: "Secure admin data accessed successfully!", admin: req.user });
});

module.exports = router;

