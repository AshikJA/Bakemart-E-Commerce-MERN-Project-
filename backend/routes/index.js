const authRoutes = require('./userRoute');
const adminRoutes = require('./adminRoute');
const productRoutes = require('./productRoute');

const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/products', productRoutes);
};

module.exports = setupRoutes;