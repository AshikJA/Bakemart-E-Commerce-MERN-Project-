const CouponService = require('../services/CouponService');

class CouponController {
  // --- Admin Methods ---

  static async createCoupon(req, res) {
    try {
      const result = await CouponService.createCoupon(req.body);
      return res.status(201).json(result);
    } catch (error) {
      console.error('Error in createCoupon:', error);
      res.status(400).json({ message: error.message || 'Failed to create coupon' });
    }
  }

  static async getAllCoupons(req, res) {
    try {
      const result = await CouponService.getAllCoupons();
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getAllCoupons:', error);
      res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
    }
  }

  static async updateCoupon(req, res) {
    try {
      const result = await CouponService.updateCoupon(req.params.id, req.body);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in updateCoupon:', error);
      res.status(500).json({ message: 'Failed to update coupon', error: error.message });
    }
  }

  static async deleteCoupon(req, res) {
    try {
      const result = await CouponService.deleteCoupon(req.params.id);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in deleteCoupon:', error);
      res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
    }
  }

  // --- User Methods ---

  static async validateCoupon(req, res) {
    try {
      const result = await CouponService.validateCoupon(req, res);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in validateCoupon:', error);
      res.status(400).json({ message: error.message || 'Failed to validate coupon' });
    }
  }
}

module.exports = CouponController;
