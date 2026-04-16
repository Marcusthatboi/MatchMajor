// server/utils/AppError.js
/**
 * Custom error class for API responses
 * Extends built-in Error class with HTTP status code and additional metadata
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  // Helper method to get error response object
  toJSON() {
    return {
      success: false,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      message: this.message,
      timestamp: this.timestamp
    };
  }
}

module.exports = AppError;
