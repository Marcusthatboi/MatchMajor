// server/middleware/validationMiddleware.js
const AppError = require('../utils/AppError');

/**
 * Validation middleware factory
 * Creates a middleware that validates request data against a schema
 */
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Run schema validation
      const { value, error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const messages = error.details
          .map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }));
        
        throw new AppError(
          `Validation failed: ${messages.map(m => m.message).join('; ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }

      // Replace body with validated value
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Async error wrapper for route handlers
 * Catches errors thrown in async handlers and passes to error middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware to check if request body is not empty
 */
const validateNotEmpty = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError('Request body cannot be empty', 400, 'EMPTY_REQUEST_BODY');
  }
  next();
};

/**
 * Middleware to validate Content-Type
 */
const validateContentType = (req, res, next) => {
  const contentType = req.get('Content-Type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new AppError(
      'Content-Type must be application/json',
      415,
      'INVALID_CONTENT_TYPE'
    );
  }
  
  next();
};

module.exports = {
  validate,
  asyncHandler,
  validateNotEmpty,
  validateContentType
};
