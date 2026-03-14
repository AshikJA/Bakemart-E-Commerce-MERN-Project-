const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const adminSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
      immutable: true,
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

adminSchema.pre('validate', function () {
  if (this.email && typeof this.email === 'string') {
    this.email = this.email.trim().toLowerCase();
  }
});

adminSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

adminSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.getPublicProfile = function () {
  const adminObject = this.toObject();
  delete adminObject.password;
  return adminObject;
};

adminSchema.statics.findByEmail = function (email) {
  if (typeof email !== 'string') return null;
  return this.findOne({ email: email.trim().toLowerCase() });
};

module.exports = mongoose.model('Admin', adminSchema);

