/**
 * Enhanced input validation and sanitization utilities
 * Provides comprehensive validation for common data types
 */

const AppError = require('./AppError');
const ERROR_CODES = require('./errorCodes');
const mongoose = require('mongoose');

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @param {string} fieldName - Field name for error message
 * @throws {AppError} If ID is invalid
 */
const validateMongoId = (id, fieldName = 'ID') => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = ERROR_CODES.INVALID_OBJECT_ID;
    throw new AppError(`${fieldName}: ${error.message}`, error.status, 'INVALID_OBJECT_ID');
  }
};

/**
 * Validate required fields exist and are not empty
 * @param {object} data - Object to check
 * @param {array} requiredFields - Array of field names
 * @throws {AppError} If any field is missing
 */
const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field] || String(data[field]).trim() === '');
  
  if (missing.length > 0) {
    const error = ERROR_CODES.MISSING_FIELDS;
    throw new AppError(
      `Missing required fields: ${missing.join(', ')}`,
      error.status,
      'MISSING_FIELDS'
    );
  }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {AppError} If email is invalid
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    const error = ERROR_CODES.INVALID_EMAIL;
    throw new AppError(error.message, error.status, 'INVALID_EMAIL');
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @throws {AppError} If password doesn't meet requirements
 */
const validatePassword = (password) => {
  if (!password) {
    const error = ERROR_CODES.PASSWORD_TOO_SHORT;
    throw new AppError(error.message, error.status, 'PASSWORD_TOO_SHORT');
  }
  
  if (password.length < 6) {
    const error = ERROR_CODES.PASSWORD_TOO_SHORT;
    throw new AppError(error.message, error.status, 'PASSWORD_TOO_SHORT');
  }
  
  if (password.length > 128) {
    const error = ERROR_CODES.PASSWORD_TOO_LONG;
    throw new AppError(error.message, error.status, 'PASSWORD_TOO_LONG');
  }
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @throws {AppError} If username is invalid
 */
const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  if (!username || !usernameRegex.test(username)) {
    const error = ERROR_CODES.INVALID_USERNAME;
    throw new AppError(error.message, error.status, 'INVALID_USERNAME');
  }
};

/**
 * Validate quantity is valid integer
 * @param {number} quantity - Quantity to validate
 * @param {number} max - Maximum allowed (optional)
 * @throws {AppError} If quantity is invalid
 */
const validateQuantity = (quantity, max = 1000) => {
  const q = parseInt(quantity);
  if (!Number.isInteger(q) || q < 1 || q > max) {
    const error = ERROR_CODES.INVALID_QUANTITY;
    throw new AppError(
      `Quantity must be between 1 and ${max}`,
      error.status,
      'INVALID_QUANTITY'
    );
  }
  return q;
};

/**
 * Validate price is non-negative number
 * @param {number} price - Price to validate
 * @param {number} max - Maximum allowed (optional)
 * @throws {AppError} If price is invalid
 */
const validatePrice = (price, max = 999999) => {
  const p = parseFloat(price);
  if (isNaN(p) || p < 0 || p > max) {
    const error = ERROR_CODES.INVALID_PRICE;
    throw new AppError(
      `Price must be between 0 and ${max}`,
      error.status,
      'INVALID_PRICE'
    );
  }
  return p;
};

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error
 * @throws {AppError} If string length is invalid
 */
const validateStringLength = (str, minLength, maxLength, fieldName = 'String') => {
  if (!str || str.length < minLength) {
    const error = ERROR_CODES.STRING_TOO_SHORT;
    throw new AppError(
      `${fieldName} must be at least ${minLength} characters`,
      error.status,
      'STRING_TOO_SHORT'
    );
  }
  
  if (str.length > maxLength) {
    const error = ERROR_CODES.STRING_TOO_LONG;
    throw new AppError(
      `${fieldName} cannot exceed ${maxLength} characters`,
      error.status,
      'STRING_TOO_LONG'
    );
  }
};

/**
 * Validate enum value is in allowed list
 * @param {string} value - Value to check
 * @param {array} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error
 * @throws {AppError} If value is not allowed
 */
const validateEnum = (value, allowedValues, fieldName = 'Value') => {
  if (!allowedValues.includes(value)) {
    const error = ERROR_CODES.INVALID_ENUM_VALUE;
    throw new AppError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}`,
      error.status,
      'INVALID_ENUM_VALUE'
    );
  }
};

/**
 * Validate zip code format
 * @param {string} zipCode - Zip code to validate
 * @throws {AppError} If zip code is invalid
 */
const validateZipCode = (zipCode) => {
  const zipRegex = /^[0-9]{5}(?:-[0-9]{4})?$/;
  if (!zipCode || !zipRegex.test(zipCode)) {
    const error = ERROR_CODES.INVALID_ZIP_CODE;
    throw new AppError(error.message, error.status, 'INVALID_ZIP_CODE');
  }
};

/**
 * Validate array is not empty
 * @param {array} arr - Array to validate
 * @param {string} fieldName - Field name for error
 * @throws {AppError} If array is empty
 */
const validateArrayNotEmpty = (arr, fieldName = 'Array') => {
  if (!Array.isArray(arr) || arr.length === 0) {
    const error = ERROR_CODES.ARRAY_EMPTY;
    throw new AppError(
      `${fieldName} cannot be empty`,
      error.status,
      'ARRAY_EMPTY'
    );
  }
};

/**
 * Sanitize and normalize email
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

/**
 * Sanitize and normalize username
 * @param {string} username - Username to sanitize
 * @returns {string} Sanitized username
 */
const sanitizeUsername = (username) => {
  return username.trim().toLowerCase();
};

/**
 * Sanitize text by removing XSS-prone content
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 5000); // Enforce length limit
};

module.exports = {
  validateMongoId,
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validateUsername,
  validateQuantity,
  validatePrice,
  validateStringLength,
  validateEnum,
  validateZipCode,
  validateArrayNotEmpty,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeText
};
