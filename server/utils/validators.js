// server/utils/validators.js
const AppError = require('./AppError');

/**
 * Email validation regex
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
const validateEmail = (email) => {
  if (!email) {
    throw new AppError('Email is required', 400, 'EMAIL_REQUIRED');
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  if (!emailRegex.test(trimmedEmail)) {
    throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
  }
  
  if (trimmedEmail.length > 255) {
    throw new AppError('Email is too long', 400, 'EMAIL_TOO_LONG');
  }
  
  return trimmedEmail;
};

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  if (!password) {
    throw new AppError('Password is required', 400, 'PASSWORD_REQUIRED');
  }
  
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400, 'PASSWORD_TOO_SHORT');
  }
  
  if (password.length > 128) {
    throw new AppError('Password is too long', 400, 'PASSWORD_TOO_LONG');
  }
  
  return password;
};

/**
 * Validate username
 */
const validateUsername = (username) => {
  if (!username) {
    throw new AppError('Username is required', 400, 'USERNAME_REQUIRED');
  }
  
  const trimmedUsername = username.trim();
  
  if (trimmedUsername.length < 3) {
    throw new AppError('Username must be at least 3 characters long', 400, 'USERNAME_TOO_SHORT');
  }
  
  if (trimmedUsername.length > 50) {
    throw new AppError('Username must not exceed 50 characters', 400, 'USERNAME_TOO_LONG');
  }
  
  // Only alphanumeric, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    throw new AppError('Username can only contain letters, numbers, underscores, and hyphens', 400, 'INVALID_USERNAME_FORMAT');
  }
  
  return trimmedUsername;
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (id, fieldName = 'ID') => {
  if (!id) {
    throw new AppError(`${fieldName} is required`, 400, `${fieldName.toUpperCase()}_REQUIRED`);
  }
  
  // MongoDB ObjectId is 24 hex characters
  if (!/^[0-9a-fA-F]{24}$/.test(id.toString())) {
    throw new AppError(`Invalid ${fieldName} format`, 400, 'INVALID_ID_FORMAT');
  }
  
  return id;
};

/**
 * Validate required fields
 */
const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      'MISSING_REQUIRED_FIELDS'
    );
  }
};

/**
 * Validate pagination parameters
 */
const validatePagination = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  
  if (isNaN(parsedPage) || parsedPage < 1) {
    throw new AppError('Page must be a positive integer', 400, 'INVALID_PAGE');
  }
  
  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new AppError('Limit must be between 1 and 100', 400, 'INVALID_LIMIT');
  }
  
  return {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit
  };
};

/**
 * Validate string length
 */
const validateStringLength = (str, min, max, fieldName = 'Field') => {
  if (!str) {
    throw new AppError(`${fieldName} is required`, 400, `${fieldName.toUpperCase()}_REQUIRED`);
  }
  
  const length = str.trim().length;
  
  if (length < min) {
    throw new AppError(
      `${fieldName} must be at least ${min} characters long`,
      400,
      `${fieldName.toUpperCase()}_TOO_SHORT`
    );
  }
  
  if (length > max) {
    throw new AppError(
      `${fieldName} must not exceed ${max} characters`,
      400,
      `${fieldName.toUpperCase()}_TOO_LONG`
    );
  }
  
  return str.trim();
};

/**
 * Validate enum values
 */
const validateEnum = (value, allowedValues, fieldName = 'Field') => {
  if (!value) {
    throw new AppError(`${fieldName} is required`, 400, `${fieldName.toUpperCase()}_REQUIRED`);
  }
  
  if (!allowedValues.includes(value)) {
    throw new AppError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      400,
      'INVALID_ENUM_VALUE'
    );
  }
  
  return value;
};

/**
 * Validate number range
 */
const validateNumberRange = (value, min, max, fieldName = 'Field') => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    throw new AppError(`${fieldName} must be a number`, 400, 'INVALID_NUMBER');
  }
  
  if (num < min || num > max) {
    throw new AppError(
      `${fieldName} must be between ${min} and ${max}`,
      400,
      'NUMBER_OUT_OF_RANGE'
    );
  }
  
  return num;
};

/**
 * Validate URL format
 */
const validateUrl = (url, fieldName = 'URL') => {
  if (!url) {
    throw new AppError(`${fieldName} is required`, 400, `${fieldName.toUpperCase()}_REQUIRED`);
  }
  
  try {
    new URL(url);
    return url;
  } catch (error) {
    throw new AppError(`Invalid ${fieldName} format`, 400, 'INVALID_URL');
  }
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateObjectId,
  validateRequiredFields,
  validatePagination,
  validateStringLength,
  validateEnum,
  validateNumberRange,
  validateUrl
};
