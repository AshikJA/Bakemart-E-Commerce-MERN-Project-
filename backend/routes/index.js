const authRoutes = require('./userRoute');
const adminRoutes = require('./adminRoute');

const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
};

module.exports = setupRoutes;