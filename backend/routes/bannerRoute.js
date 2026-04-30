const express = require('express');
const BannerController = require('../controllers/BannerController');
const { authenticateAdmin } = require('../middlewares/authMiddleware');
const { uploadBannerImage } = require('../middlewares/multer');
const validate = require('../middlewares/validate');
const { addBannerValidator, updateBannerValidator } = require('../validators/bannerValidators');

const router = express.Router();

router.get('/', BannerController.getActiveBanners);

router.post('/add', authenticateAdmin, uploadBannerImage, addBannerValidator, validate, BannerController.addBanner);

router.get('/all', authenticateAdmin, BannerController.getAllBanners);

router.patch('/toggle/:id', authenticateAdmin, BannerController.toggleBannerStatus);

router.put('/:id', authenticateAdmin, uploadBannerImage, updateBannerValidator, validate, BannerController.updateBanner);

router.delete('/:id', authenticateAdmin, BannerController.deleteBanner);

module.exports = router;