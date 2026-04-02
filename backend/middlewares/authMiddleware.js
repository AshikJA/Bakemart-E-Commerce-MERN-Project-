const { verifyToken } = require('../utils/jwt');
const { verifyAdminToken } = require('../utils/adminJwt');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; 
    req.userId = decoded.id || decoded._id || decoded.userId;
    
    // Check if user is still active (not banned mid-session)
    const User = require('../models/UserModel');
    const user = await User.findById(req.userId).select('status banReason');
    if (!user || user.status === 'banned') {
      return res.status(403).json({ 
        message: `Your account has been banned. Reason: ${user?.banReason || 'Violation of terms'}. Please contact support.`
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAdminToken(token);
    req.user = decoded; 
    req.userId = decoded.id || decoded._id || decoded.userId;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin permissions required' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

module.exports = {
  authenticateUser,
  authenticateAdmin
};
