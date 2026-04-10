const { verifyToken } = require('../utils/jwt');
const { verifyAdminToken } = require('../utils/adminJwt');
const User = require('../models/UserModel');

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  let tokenType = 'user';
  
  // Try to verify as user token first
  try {
    decoded = verifyToken(token);
    tokenType = 'user';
  } catch (userError) {
    // If user token fails, try admin token
    try {
      decoded = verifyAdminToken(token);
      tokenType = 'admin';
    } catch (adminError) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
  
  try {
    req.user = decoded;
    req.userId = decoded.id || decoded._id || decoded.userId;
    req.tokenType = tokenType;
    
    // Only check ban status for regular users (not admins)
    if (tokenType === 'user') {
      const user = await User.findById(req.userId).select('status banReason');
      if (!user || user.status === 'banned') {
        return res.status(403).json({ 
          message: `Your account has been banned. Reason: ${user?.banReason || 'Violation of terms'}. Please contact support.`
        });
      }
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
  authenticateAdmin,
  protect: authenticateUser,
  admin: authenticateAdmin
};
