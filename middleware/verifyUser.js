import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.username = decoded.username;
    req.email = decoded.email;
    req.role = decoded.role;
    req.firebaseUid = decoded.firebaseUid;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: err.message
    });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

export const verifyBaker = (req, res, next) => {
  if (req.role !== 'baker') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Baker role required.'
    });
  }
  next();
};

export const verifyAdminOrBaker = (req, res, next) => {
  if (req.role !== 'admin' && req.role !== 'baker') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Baker role required.'
    });
  }
  next();
};

export const verifyStaff = (req, res, next) => {
  const allowedRoles = ['admin', 'account_staff', 'complaint_handler'];
  if (!allowedRoles.includes(req.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff role required.'
    });
  }
  next();
};
