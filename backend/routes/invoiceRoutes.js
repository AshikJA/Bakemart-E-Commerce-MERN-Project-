const express = require('express');
const { getInvoicePDF } = require('../controllers/invoiceController');
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:id/invoice', authenticateUser, getInvoicePDF);

module.exports = router;