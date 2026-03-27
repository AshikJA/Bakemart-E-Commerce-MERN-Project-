const cors = require('cors');
const helmet = require('helmet');
const express = require('express');
const path = require('path');

function setupMiddlewares(app) {
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  app.use(cors({
        origin: 'http://localhost:5173',
        credentials: false,
      }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

module.exports = setupMiddlewares;