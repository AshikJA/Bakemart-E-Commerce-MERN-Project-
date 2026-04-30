const Banner = require('../models/BannerModel');
const { deleteImage } = require('../middlewares/multer');

class BannerService {
  static async addBanner(image, title, url) {
    if (!image) {
      throw { status: 400, message: 'Image is required' };
    }

    const banner = new Banner({
      title,
      url,
      image,
    });

    await banner.save();
    return banner;
  }

  static async getAllBanners() {
    const banners = await Banner.find().sort({ createdAt: -1 }).lean();
    return banners;
  }

  static async getActiveBanners() {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return banners;
  }

  static async getBannerById(id) {
    const banner = await Banner.findById(id).lean();
    if (!banner) {
      throw { status: 404, message: 'Banner not found' };
    }
    return banner;
  }

  static async updateBanner(id, title, url, image) {
    const banner = await Banner.findById(id);
    if (!banner) {
      throw { status: 404, message: 'Banner not found' };
    }

    if (title) banner.title = title;
    if (url !== undefined) banner.url = url;
    if (image) {
      await deleteImage(banner.image);
      banner.image = image;
    }

    await banner.save();
    return banner;
  }

  static async deleteBanner(id) {
    const banner = await Banner.findById(id);
    if (!banner) {
      throw { status: 404, message: 'Banner not found' };
    }

    await deleteImage(banner.image);
    await banner.deleteOne();
    return { message: 'Banner deleted successfully' };
  }

  static async toggleBannerStatus(id) {
    const banner = await Banner.findById(id);
    if (!banner) {
      throw { status: 404, message: 'Banner not found' };
    }

    banner.isActive = !banner.isActive;
    await banner.save();
    return banner;
  }
}

module.exports = BannerService;