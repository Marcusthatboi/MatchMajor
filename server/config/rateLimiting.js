// server/config/rateLimiting.js
/**
 * Rate limiting configuration
 * Prevents brute force attacks and resource exhaustion
 */

const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

/**
 * Store for in-memory rate limiting
 * In production, use Redis for distributed rate limiting
 */
const store = new Map();

/**
 * Custom rate limit handler
 */
const handleRateLimit = (req, res) => {
  throw new AppError(
    'Too many requests, please try again later',
    429,
    'RATE_LIMIT_EXCEEDED'
  );
};

/**
 * Authentication rate limiter
 * Strict: 5 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW || 900000, 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX || 5, 10),
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false, // Count failed attempts
  keyGenerator: (req) => {
    // Use IP + user email if available for more precise tracking
    return `${req.ip}-${req.body?.email || 'unknown'}`;
  },
  handler: handleRateLimit
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per user/IP
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000, 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100, 10),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Prioritize authenticated user ID over IP
    if (req.user && req.user._id) {
      return `user-${req.user._id}`;
    }
    return req.ip;
  },
  handler: handleRateLimit
});

/**
 * Search/Query rate limiter
 * Stricter: 50 requests per 15 minutes per user/IP
 */
const searchLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000, 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_SEARCH_MAX || 50, 10),
  message: 'Too many search requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `search-user-${req.user._id}`;
    }
    return `search-ip-${req.ip}`;
  },
  handler: handleRateLimit
});

/**
 * Upload rate limiter
 * Very strict: 10 uploads per hour per user
 */
const uploadLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX || 10, 10),
  message: 'Too many uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `upload-${req.user._id}`;
    }
    return `upload-ip-${req.ip}`;
  },
  handler: handleRateLimit
});

/**
 * Password reset rate limiter
 * Very strict: 3 attempts per hour per email
 */
const passwordResetLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `reset-${req.body?.email || req.ip}`;
  },
  handler: handleRateLimit
});

/**
 * Create account rate limiter
 * Moderate: 5 accounts per hour per IP
 */
const createAccountLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 5,
  message: 'Too many accounts created, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `create-${req.ip}`;
  },
  handler: handleRateLimit
});

/**
 * Chatroom/Message rate limiter
 * Moderate: 30 messages per minute per user
 */
const messageLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 30,
  message: 'Too many messages, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `message-${req.user._id}`;
    }
    return `message-${req.ip}`;
  },
  handler: handleRateLimit
});

/**
 * Download rate limiter
 * Prevent resource exhaustion: 100 downloads per hour per user
 */
const downloadLimiter = rateLimit({
  windowMs: 3600000, // 1 hour
  max: 100,
  message: 'Too many downloads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `download-${req.user._id}`;
    }
    return `download-${req.ip}`;
  },
  handler: handleRateLimit
});

/**
 * Public endpoints rate limiter (no auth required)
 * Moderate: 200 requests per 15 minutes per IP
 */
const publicLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000, 10), // 15 minutes
  max: 200,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: handleRateLimit
});

/**
 * Combine multiple limiters for layered protection
 */
const combineLimiters = (...limiters) => {
  return async (req, res, next) => {
    for (const limiter of limiters) {
      await new Promise((resolve, reject) => {
        limiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
    next();
  };
};

module.exports = {
  authLimiter,
  apiLimiter,
  searchLimiter,
  uploadLimiter,
  passwordResetLimiter,
  createAccountLimiter,
  messageLimiter,
  downloadLimiter,
  publicLimiter,
  combineLimiters
};
