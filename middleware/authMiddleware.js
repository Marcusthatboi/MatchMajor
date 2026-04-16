// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Middleware to protect routes - requires valid JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from cookies
    if (req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Check if token exists
    if (!token) {
      throw new AppError(
        'Not authorized to access this route',
        401,
        'NO_TOKEN_PROVIDED'
      );
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new AppError(
        'User associated with token no longer exists',
        401,
        'USER_NOT_FOUND'
      );
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError(
        'Invalid token format',
        401,
        'INVALID_TOKEN'
      ));
    }
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(
        'Token has expired',
        401,
        'TOKEN_EXPIRED'
      ));
    }
    
    // Pass through AppError
    if (error instanceof AppError) {
      return next(error);
    }
    
    // Unexpected error
    next(error);
  }
};

/**
 * Middleware to restrict access based on user role
 */
exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError(
        'User not authenticated',
        401,
        'NOT_AUTHENTICATED'
      );
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        `User role '${req.user.role}' is not authorized for this action. Required: ${allowedRoles.join(', ')}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }
    
    next();
  };
};