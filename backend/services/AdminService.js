const Admin = require('../models/AdminModel');
const { generateAdminToken } = require('../utils/adminJwt');

class AdminService {
  static async loginAdmin({ email, password }) {
    try {
      const admin = await Admin.findByEmail(email).select('+password');
      if (!admin) {
        throw { status: 401, message: 'Invalid email or password' };
      }

      if (admin.status !== 'active') {
        throw { status: 403, message: 'Admin account is disabled' };
      }

      const isPasswordValid = await admin.comparePassword(password);
      if (!isPasswordValid) {
        throw { status: 401, message: 'Invalid email or password' };
      }

      const token = generateAdminToken({
        id: admin._id,
        email: admin.email,
        role: 'admin',
      });

      return {
        admin: admin.getPublicProfile(),
        token,
      };
    } catch (error) {
      console.error('Error logging in admin:', error);
      throw error.status ? error : { status: 500, message: 'Error logging in admin' };
    }
  }
}

module.exports = AdminService;

