// server/middleware/securityMiddleware.js
/**
 * Comprehensive security middleware
 * - Input sanitization (prevent NoSQL injection)
 * - HTTP parameter pollution prevention
 * - Security headers validation
 * - Request validation
 */

const AppError = require('../utils/AppError');

/**
 * Sanitize user input to prevent NoSQL injection
 * Removes MongoDB operators from req.body, req.query, and req.params
 */
const sanitizeInput = (req, res, next) => {
  // Skip for GET requests with no body
  if (req.method === 'GET') {
    return next();
  }

  try {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    throw new AppError('Invalid request format', 400, 'INVALID_REQUEST');
  }
};

/**
 * Recursively sanitize objects to prevent NoSQL injection
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Remove MongoDB operators
    return obj
      .replace(/\$gt/g, '')
      .replace(/\$lt/g, '')
      .replace(/\$gte/g, '')
      .replace(/\$lte/g, '')
      .replace(/\$ne/g, '')
      .replace(/\$where/g, '')
      .replace(/\$nor/g, '')
      .replace(/\$and/g, '')
      .replace(/\$or/g, '')
      .replace(/\$regex/g, '');
  }

  if (typeof obj === 'object' && !Array.isArray(obj)) {
    // Check for MongoDB operators as keys
    Object.keys(obj).forEach(key => {
      if (key.startsWith('$')) {
        throw new Error(`Invalid field: ${key}`);
      }
      obj[key] = sanitizeObject(obj[key]);
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  return obj;
}

/**
 * Prevent HTTP Parameter Pollution (HPP)
 * Ensures parameters aren't duplicated maliciously
 */
const preventParameterPollution = (req, res, next) => {
  // Whitelist of fields that can have multiple values
  const whitelist = [
    'tags',
    'interests',
    'members',
    'items',
    'sort',
    'fields',
    'include'
  ];

  // Check for duplicate parameters (except whitelisted)
  const duplicates = {};

  Object.keys(req.query).forEach(key => {
    if (Array.isArray(req.query[key]) && !whitelist.includes(key)) {
      if (!duplicates[key]) {
        duplicates[key] = [];
      }
      duplicates[key].push(...req.query[key]);
    }
  });

  // If duplicates found, use the last value (most conservative approach)
  Object.keys(duplicates).forEach(key => {
    if (duplicates[key].length > 1) {
      // Keep only the last value
      req.query[key] = duplicates[key][duplicates[key].length - 1];
    }
  });

  next();
};

/**
 * Validate content type for POST/PUT requests
 */
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');

    if (!contentType) {
      throw new AppError('Content-Type header is required', 400, 'MISSING_CONTENT_TYPE');
    }

    // Only allow JSON for API requests
    if (!contentType.includes('application/json')) {
      throw new AppError(
        'Invalid Content-Type. Must be application/json',
        415,
        'UNSUPPORTED_MEDIA_TYPE'
      );
    }
  }

  next();
};

/**
 * Validate request size
 * Prevents buffer overflow attacks
 */
const validateRequestSize = (req, res, next) => {
  const contentLength = req.get('Content-Length');

  if (contentLength) {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || 5242880, 10); // 5MB default
    const size = parseInt(contentLength, 10);

    if (size > maxSize) {
      throw new AppError(
        `Request too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
        413,
        'PAYLOAD_TOO_LARGE'
      );
    }
  }

  next();
};

/**
 * Validate required headers for sensitive operations
 */
const validateRequiredHeaders = (req, res, next) => {
  const sensitiveOperations = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (sensitiveOperations.includes(req.method)) {
    // Check for User-Agent (basic bot detection)
    if (!req.get('User-Agent')) {
      throw new AppError('User-Agent header is required', 400, 'MISSING_USER_AGENT');
    }

    // Check for Origin/Referer for POST (CSRF protection)
    if (req.method === 'POST' && !req.get('Origin') && !req.get('Referer')) {
      // Allow if it's an API request with Authorization header
      if (!req.get('Authorization') && !req.cookies.token) {
        console.warn(`⚠️  Potential CSRF: POST without Origin/Referer from ${req.ip}`);
      }
    }
  }

  next();
};

/**
 * Add security headers to response
 */
const addSecurityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Click-jacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (formerly Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );

  // Cache control for sensitive content
  if (req.path.includes('/api/') && req.method !== 'GET') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Log security events
 */
const logSecurityEvents = (req, res, next) => {
  // Track suspicious patterns
  if (req.query && Object.keys(req.query).some(key => key.startsWith('$'))) {
    console.warn(`🚨 Potential injection attempt from ${req.ip}: ${req.originalUrl}`);
  }

  // Track large payloads
  const contentLength = req.get('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > 1048576) { // > 1MB
    console.warn(`⚠️  Large payload from ${req.ip}: ${contentLength} bytes`);
  }

  next();
};

/**
 * Combine all security middleware
 */
const securityMiddleware = [
  sanitizeInput,
  preventParameterPollution,
  validateContentType,
  validateRequestSize,
  validateRequiredHeaders,
  addSecurityHeaders,
  logSecurityEvents
];

module.exports = {
  securityMiddleware,
  sanitizeInput,
  preventParameterPollution,
  validateContentType,
  validateRequestSize,
  validateRequiredHeaders,
  addSecurityHeaders,
  logSecurityEvents,
  sanitizeObject
};
