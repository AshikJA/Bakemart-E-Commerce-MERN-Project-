const express = require('express');
const DeliveryController = require('../controllers/DeliveryController');

const router = express.Router();

router.post('/check-delivery', DeliveryController.checkDelivery);
router.post('/check-serviceability', DeliveryController.checkServiceability);
router.get('/default-estimate', DeliveryController.getDefaultEstimate);

module.exports = router;
