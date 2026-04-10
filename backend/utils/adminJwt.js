const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateAdminToken = (payload) => {
  try {
    return jwt.sign(payload, config.ADMIN_JWT_SECRET, {
      expiresIn: config.ADMIN_JWT_EXPIRATION || '1d',
    });
  } catch (error) {
    console.error('Error generating admin token:', error);
    throw new Error('Error generating admin token');
  }
};

const verifyAdminToken = (token) => {
  try {
    return jwt.verify(token, config.ADMIN_JWT_SECRET);
  } catch (error) {
    console.error('Error verifying admin token:', error);
    throw new Error('Error verifying admin token');
  }
};

module.exports = { generateAdminToken, verifyAdminToken };

