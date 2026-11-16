const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHelper');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_changeme');
    
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.userRole || (req.user && req.user.role);
    if (!userRole || !roles.includes(userRole)) {
      return errorResponse(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
