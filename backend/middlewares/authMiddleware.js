const { verifyToken } = require('../utils/jwt');
const { verifyAdminToken } = require('../utils/adminJwt');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Contains id, email, role
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
