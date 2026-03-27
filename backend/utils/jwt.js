const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (payload) => {
  try {
    return jwt.sign(payload, config.JWT_SECRET, { 
      expiresIn: config.JWT_EXPIRATION || '30d' });
  } catch (error) {
    console.log('Error generating token:', error);
    throw new Error('Error generating token');
  }
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    console.log('Error verifying token:', error);
    throw new Error('Error verifying token');
  }
}

module.exports = { generateToken, verifyToken };