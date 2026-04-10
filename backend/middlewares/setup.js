const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const path = require('path');
const { generalLimiter, authLimiter, searchLimiter } = require('./rateLimiter');
const config = require('../config/config'); 

function requestLogger(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const start = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      timestamp: new Date().toISOString()
    };
    
    if (req.userId) {
      logData.userId = req.userId;
    }
    
    // Logging removed to declutter terminal
  });
  
  req.requestId = requestId;
  next();
}

function setupMiddlewares(app) {
  app.use(requestLogger);
  
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

  const corsOptions = {
    origin: config.CORS.ORIGIN,
    credentials: config.CORS.CREDENTIALS,
    methods: config.CORS.METHODS,
    allowedHeaders: config.CORS.ALLOWED_HEADERS
  };
  app.use(cors(corsOptions));
  app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());
  app.use(generalLimiter);
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

module.exports = setupMiddlewares;