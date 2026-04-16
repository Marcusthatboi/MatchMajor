// server/middleware/errorHandler.js
const AppError = require('../utils/AppError');

/**
 * Global error handling middleware
 * Must be registered LAST in middleware chain
 * Handles all error types: AppError, Mongoose, JWT, etc.
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // === MONGODB ERRORS ===
  // Handle Mongoose CastError (invalid MongoDB ID)
  if (err.name === 'CastError') {
    const message = `Invalid ID format: ${err.value}`;
    error = new AppError(message, 400, 'INVALID_OBJECT_ID');
  }

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    const fieldErrorMap = {
      email: 'EMAIL_TAKEN',
      username: 'USERNAME_TAKEN',
      name: 'DUPLICATE_ENTRY'
    };
    
    const errorCode = fieldErrorMap[field] || 'DUPLICATE_ENTRY';
    const message = `A ${field} with value "${value}" already exists`;
    error = new AppError(message, 409, errorCode);
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    const message = `Validation failed: ${messages}`;
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // === JWT ERRORS ===
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid or malformed token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token has expired';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // === SYNTAX ERRORS ===
  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'Invalid JSON in request body';
    error = new AppError(message, 400, 'INVALID_JSON');
  }

  // === NETWORK/TIMEOUT ERRORS ===
  if (err.name === 'MongoNetworkError') {
    const message = 'Database connection failed';
    error = new AppError(message, 503, 'DATABASE_CONNECTION_ERROR');
  }

  if (err.name === 'MongoTimeoutError') {
    const message = 'Database operation timed out';
    error = new AppError(message, 503, 'DATABASE_TIMEOUT');
  }

  // === AUTHENTICATION ERRORS (with safe defaults) ===
  if (err.message && err.message.includes('not found')) {
    error.statusCode = error.statusCode || 404;
    error.errorCode = error.errorCode || 'NOT_FOUND';
  }

  if (err.message && err.message.includes('unauthorized')) {
    error.statusCode = error.statusCode || 401;
    error.errorCode = error.errorCode || 'UNAUTHORIZED';
  }

  // === LOG ERROR ===
  const errorLog = {
    timestamp: new Date().toISOString(),
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    message: error.message,
    method: req.method,
    path: req.path,
    userId: req.user?._id || 'anonymous',
    userAgent: req.get('user-agent'),
  };

  // Add stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    errorLog.stack = err.stack;
    console.error('[DEV_ERROR]', errorLog);
  } else {
    // Production: log to file/service
    if (error.statusCode >= 500) {
      console.error('[PROD_ERROR]', errorLog);
    } else {
      console.warn('[VALIDATION_ERROR]', errorLog);
    }
  }

  // === SEND RESPONSE ===
  res.status(error.statusCode || 500).json({
    success: false,
    statusCode: error.statusCode || 500,
    errorCode: error.errorCode || 'INTERNAL_SERVER_ERROR',
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      debugInfo: {
        originalError: err.message,
        stack: err.stack
      }
    })
  });
};

module.exports = errorHandler;
