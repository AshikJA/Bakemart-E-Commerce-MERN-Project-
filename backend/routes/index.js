require('dotenv').config();
const express = require('express');
const authRoutes = require('./userRoute');
const adminRoutes = require('./adminRoute');
const productRoutes = require('./productRoute');
const couponRoutes = require('./couponRoute');
const orderRoutes = require('./orderRoute');
const walletRoutes = require('./walletRoute');
const cartRoutes = require('./cartRoute');
const chatbotRoutes = require('./chatbotRoute');
const returnRoutes = require('./returnRoutes');
const adminReturnRoutes = require('./adminReturnRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const refundRoutes = require('./refundRoutes');

const setupRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/admin', adminReturnRoutes);
  app.use('/', refundRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/coupons', couponRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/orders', returnRoutes);
  app.use('/api/orders', invoiceRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/chatbot', chatbotRoutes);
};

module.exports = setupRoutes;
