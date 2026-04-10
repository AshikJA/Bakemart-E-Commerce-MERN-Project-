const Coupon = require('../models/CouponModel');
class CouponService {
  // --- Admin Methods ---
  static async createCoupon(data) {
    try {
      const { code, discountType, discountValue, expirationDate, isActive, usageLimit } = data;
      
      if (!code) {
        throw new Error('Coupon code is required');
      }

      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        throw new Error('Coupon code already exists');
      }

      const coupon = new Coupon({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        expirationDate,
        isActive: isActive !== undefined ? isActive : true,
        usageLimit
      });

      await coupon.save();
      return { message: 'Coupon created successfully', coupon };
    } catch (error) {
      console.error('Error in createCoupon:', error);
      throw error;
    }
  }   

    static async getAllCoupons() {
      try {
        const coupons = await Coupon.find();
        return coupons;
      } catch (error) {
        console.error('Error in getAllCoupons:', error);
      }
    }

    static async updateCoupon(id, data) {
      try {
        const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true });
        return coupon;
      } catch (error) {
        console.error('Error in updateCoupon:', error);
      }
    }

    static async deleteCoupon(id) {
      try {
        const coupon = await Coupon.findByIdAndDelete(id);
        return coupon;
      } catch (error) {
        console.error('Error in deleteCoupon:', error);
      }
    }
    // --- User Methods ---
    static async validateCoupon(req, res) {
      try {
        const { code } = req.body;
        if (!code) {
          throw new Error('Coupon code is required');
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
          throw new Error('Coupon not found');
        }

        if (!coupon.isActive) {
          throw new Error('This coupon is currently inactive');
        }

        if (new Date(coupon.expirationDate) < new Date()) {
          throw new Error('This coupon has expired');
        }

        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw new Error('Coupon usage limit reached');
        }

        return { message: 'Coupon applied successfully', coupon };
      } catch (error) {
        throw error;
      }
    }
}

module.exports = CouponService;