const BaseController = require('./BaseController');
const BannerService = require('../services/BannerService');

class BannerController extends BaseController {
  static getActiveBanners = BaseController.asyncHandler(async (req, res) => {
    const banners = await BannerService.getActiveBanners();
    return res.status(200).json(banners);
  });

  static getAllBanners = BaseController.asyncHandler(async (req, res) => {
    const banners = await BannerService.getAllBanners();
    return res.status(200).json(banners);
  });

  static addBanner = BaseController.asyncHandler(async (req, res) => {
    const { title, url } = req.body;
    const image = req.file ? req.file.path : null;
    const banner = await BannerService.addBanner(image, title, url);
    return res.status(201).json(banner);
  });

  static updateBanner = BaseController.asyncHandler(async (req, res) => {
    const { title, url } = req.body;
    const image = req.file ? req.file.path : null;
    const banner = await BannerService.updateBanner(req.params.id, title, url, image);
    return res.status(200).json(banner);
  });

  static deleteBanner = BaseController.asyncHandler(async (req, res) => {
    const result = await BannerService.deleteBanner(req.params.id);
    return res.status(200).json(result);
  });

  static toggleBannerStatus = BaseController.asyncHandler(async (req, res) => {
    const banner = await BannerService.toggleBannerStatus(req.params.id);
    return res.status(200).json(banner);
  });
}

module.exports = BannerController;