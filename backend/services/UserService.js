const crypto = require('crypto');
const User = require('../models/UserModel');
const Address = require('../models/AddressModel');
const { generateToken } = require('../utils/jwt');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/mailer');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // "123456"
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

class UserService {
  static async registerUser(data) {
    try {
      const existingUser = await User.findByEmail(data.email);
      if (existingUser) {
        throw { status: 400, message: 'User already exists' };
      }
      if (data.password !== data.confirmPassword) {
        throw { status: 400, message: 'Passwords do not match' };
      }
      const user = await User.create(data);
      const otp = generateOtp();
      user.otpCode = otp;
      user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
      await sendOtpEmail(user.email, otp);
      return {
        message: 'Registration successful. OTP sent to your email.',
        email: user.email,
      };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error.status ? error : { status: 500, message: 'Error registering user' };
    }
  }
  static async loginUser(credentials) {
    try {
      const { email, password } = credentials;
  
      const user = await User.findByEmail(email).select('+password');
      if (!user) {
        throw { status: 401, message: 'Invalid email or password' };
      }
  
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw { status: 401, message: 'Invalid email or password' };
      }

      if (user.status === 'banned') {
        throw { 
          status: 403, 
          message: `Your account has been banned. Reason: ${user.banReason || 'Violation of terms of service'}. Please contact support.`
        };
      }

      user.lastLogin = new Date();
      await user.save();
      
      const token = generateToken({ id: user._id, email: user.email, role: user.role });
  
      return {
        message: 'Login successful.',
        user: user.getPublicProfile(),
        token,
      };
    } catch (error) {
      console.error('Error login user:', error);
      throw error.status ? error : { status: 500, message: 'Error login user' };
    }
  }
  
  static async verifyOtp({ email, otp }) {
    try {
      const user = await User.findByEmail(email);
      if (!user || !user.otpCode || !user.otpExpiresAt) {
        throw { status: 400, message: 'Invalid or expired code' };
      }
      const now = new Date();
      if (user.otpCode !== otp || now > user.otpExpiresAt) {
        throw { status: 400, message: 'Invalid or expired code' };
      }
      user.isEmailVerified = true;
      user.otpCode = null;
      user.otpExpiresAt = null;
      user.lastLogin = new Date();
      await user.save();
      const token = generateToken({ id: user._id, email: user.email, role: user.role });
      return {
        user: user.getPublicProfile(),
        token,
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error.status ? error : { status: 500, message: 'Error verifying OTP' };
    }
  }

  static async requestPasswordReset({ email }) {
    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return { message: 'If that email exists, a reset link has been sent.' };
      }

      const token = generateResetToken();
      user.resetPasswordToken = token;
      user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendBase}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;

      await sendPasswordResetEmail(user.email, resetLink);

      return { message: 'If that email exists, a reset link has been sent.' };
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error.status ? error : { status: 500, message: 'Error requesting password reset' };
    }
  }

  static async resetPassword({ email, token, password }) {
    try {
      const user = await User.findByEmail(email).select('+password');
      if (!user || !user.resetPasswordToken || !user.resetPasswordExpiresAt) {
        throw { status: 400, message: 'Invalid or expired reset link' };
      }

      const now = new Date();
      if (user.resetPasswordToken !== token || now > user.resetPasswordExpiresAt) {
        throw { status: 400, message: 'Invalid or expired reset link' };
      }

      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpiresAt = null;
      await user.save();

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error.status ? error : { status: 500, message: 'Error resetting password' };
    }
  }

  static async getProfile(userId) {
    try {
      if (!userId) throw { status: 401, message: 'User ID missing in token' };
      const user = await User.findById(userId);
      if (!user) throw { status: 404, message: 'User not found' };

      const addresses = await Address.find({ user: userId });
      return {
        user: user.getPublicProfile(),
        addresses
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw { status: 500, message: 'Error fetching profile' };
    }
  }

  static async updateProfile(userId, data) {
    try {
      if (!userId) throw { status: 401, message: 'User ID missing in token' };
      const user = await User.findById(userId);
      if (!user) throw { status: 404, message: 'User not found' };

      if (data.email && data.email !== user.email) {
        const existing = await User.findOne({ email: data.email });
        if (existing) throw { status: 400, message: 'Email already in use' };

        const otp = generateOtp();
        user.newEmail = data.email;
        user.otpCode = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        
        user.name = data.name || user.name;
        await user.save();
        await sendOtpEmail(data.email, otp);

        return {
          message: 'OTP sent to new email. Please verify to update.',
          requireEmailVerification: true,
          user: user.getPublicProfile()
        };
      }

      user.name = data.name || user.name;
      await user.save();

      return {
        message: 'Profile updated successfully',
        user: user.getPublicProfile()
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.status ? error : { status: 500, message: 'Error updating profile' };
    }
  }

  static async verifyEmailUpdate(userId, otp) {
    try {
      if (!userId) throw { status: 401, message: 'User ID missing in token' };
      const user = await User.findById(userId);
      if (!user) throw { status: 404, message: 'User not found' };

      if (!user.newEmail || !user.otpCode || !user.otpExpiresAt) {
        throw { status: 400, message: 'No pending email update or expired code' };
      }
      
      const now = new Date();
      if (user.otpCode !== otp || now > user.otpExpiresAt) {
        throw { status: 400, message: 'Invalid or expired code' };
      }

      user.email = user.newEmail;
      user.newEmail = null;
      user.otpCode = null;
      user.otpExpiresAt = null;
      await user.save();

      return {
        message: 'Email updated successfully',
        user: user.getPublicProfile()
      };
    } catch (error) {
      console.error('Error verifying email update:', error);
      throw error.status ? error : { status: 500, message: 'Error verifying email update' };
    }
  }

  static async addAddress(userId, data) {
    try {
      const address = await Address.create({ ...data, user: userId });
      return { message: 'Address added successfully', address };
    } catch (error) {
      console.error('Error adding address:', error);
      throw { status: 500, message: 'Error adding address' };
    }
  }

  static async deleteAddress(userId, addressId) {
    try {
      const result = await Address.findOneAndDelete({ _id: addressId, user: userId });
      if (!result) throw { status: 404, message: 'Address not found' };
      return { message: 'Address deleted successfully' };
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error.status ? error : { status: 500, message: 'Error deleting address' };
    }
  }

  static async updateAddress(userId, addressId, data) {
    try {
      if (!userId) throw { status: 401, message: 'User ID missing in token' };
      const address = await Address.findOneAndUpdate(
        { _id: addressId, user: userId },
        data,
        { new: true }
      );
      if (!address) throw { status: 404, message: 'Address not found' };
      return { message: 'Address updated successfully', address };
    } catch (error) {
      console.error('Error updating address:', error);
      throw error.status ? error : { status: 500, message: 'Error updating address' };
    }
  }
}

module.exports = UserService;