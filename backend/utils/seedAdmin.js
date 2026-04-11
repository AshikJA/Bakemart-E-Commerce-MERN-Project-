const Admin = require('../models/AdminModel');

async function seedDefaultAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const name = process.env.ADMIN_NAME || 'Super Admin';

    if (!email || !password) {
      console.log('No ADMIN_EMAIL/ADMIN_PASSWORD provided; skipping admin seeding');
      return;
    }

    const existing = await Admin.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (existing) {
      console.log('Default admin already exists ');
      existing.password = password;
      await existing.save();
      return;
    }

    const admin = new Admin({
      name,
      email,
      password,
    });

    await admin.save();
    console.log(`Default admin created with email: ${email}`);
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
}

module.exports = { seedDefaultAdmin };

