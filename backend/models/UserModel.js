const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [emailRegex, 'Please provide a valid email'],
    },
    newEmail: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, 
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    otpCode: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
    banReason: { type: String, default: null },
    bannedAt: { type: Date, default: null },
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

userSchema.pre('validate', function () {
  if (this.email && typeof this.email === 'string') {
    this.email = this.email.trim().toLowerCase();
  }
});


userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.statics.findByEmail = function (email) {
  if (typeof email !== 'string') return null;
  return this.findOne({ email: email.trim().toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ status: 'active' });
};

module.exports = mongoose.model('User', userSchema);