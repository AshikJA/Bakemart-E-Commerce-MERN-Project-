const Coupon = require('../models/CouponModel');

class CouponController {
  // --- Admin Methods ---

  static async createCoupon(req, res) {
    try {
      const { code, discountType, discountValue, expirationDate, isActive, usageLimit } = req.body;
      
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }

      const coupon = new Coupon({
        code,
        discountType,
        discountValue,
        expirationDate,
        isActive: isActive !== undefined ? isActive : true,
        usageLimit
      });

      await coupon.save();
      res.status(201).json({ message: 'Coupon created successfully', coupon });
    } catch (error) {
      console.error('Error in createCoupon:', error);
      res.status(500).json({ message: 'Failed to create coupon', error: error.message });
    }
  }

  static async getAllCoupons(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [coupons, total] = await Promise.all([
        Coupon.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Coupon.countDocuments()
      ]);

      res.status(200).json({
        coupons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error in getAllCoupons:', error);
      res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
    }
  }

  static async updateCoupon(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.code) {
        updates.code = updates.code.toUpperCase();
        const existing = await Coupon.findOne({ code: updates.code, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({ message: 'Another coupon with this code exists' });
        }
      }

      const coupon = await Coupon.findByIdAndUpdate(id, updates, { new: true });
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.status(200).json({ message: 'Coupon updated successfully', coupon });
    } catch (error) {
      console.error('Error in updateCoupon:', error);
      res.status(500).json({ message: 'Failed to update coupon', error: error.message });
    }
  }

  static async deleteCoupon(req, res) {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findByIdAndDelete(id);
      if (!coupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }
      res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
      console.error('Error in deleteCoupon:', error);
      res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
    }
  }

  // --- User Methods ---

  static async validateCoupon(req, res) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ message: 'Coupon code is required' });
      }

      const coupon = await Coupon.findOne({ code: code.toUpperCase() });
      
      if (!coupon) {
        return res.status(404).json({ message: 'Invalid coupon code' });
      }

      if (!coupon.isActive) {
        return res.status(400).json({ message: 'This coupon is no longer active' });
      }

      if (new Date(coupon.expirationDate) < new Date()) {
        return res.status(400).json({ message: 'This coupon has expired' });
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: 'Coupon usage limit reached' });
      }

      res.status(200).json({
        message: 'Coupon applied successfully',
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        }
      });

    } catch (error) {
      console.error('Error in validateCoupon:', error);
      res.status(500).json({ message: 'Failed to validate coupon', error: error.message });
    }
  }
}

module.exports = CouponController;
