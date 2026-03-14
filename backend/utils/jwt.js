const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (userId) => {
  try {
    return jwt.sign({ userId }, config.JWT_SECRET, { 
      expiresIn: config.JWT_EXPIRATION || '1h' });
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