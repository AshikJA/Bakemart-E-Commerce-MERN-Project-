const authRoutes = require('./userRoute');
const adminRoutes = require('./adminRoute');
const productRoutes = require('./productRoute');
const couponRoutes = require('./couponRoute');
const orderRoutes = require('./orderRoute');
const walletRoutes = require('./walletRoute');
const cartRoutes = require('./cartRoute');

const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/cart', cartRoutes);
};

module.exports = setupRoutes;