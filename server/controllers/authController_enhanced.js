// server/controllers/authController.js
/**
 * Authentication Controller
 * Handles user registration, login, logout with comprehensive edge case handling
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const ERROR_CODES = require('../utils/errorCodes');
const {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validateUsername,
  sanitizeEmail,
  sanitizeUsername
} = require('../utils/inputValidation');

/**
 * Generate JWT token with security measures
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    {
      id,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
      issuer: 'matchmajor-app'
    }
  );
};

/**
 * Set secure cookie with token
 * @param {object} res - Express response object
 * @param {string} token - JWT token
 */
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
};

/**
 * Register a new user with comprehensive validation
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  console.log('[REGISTER] Request body:', { username, email, password: '***', confirmPassword: '***' });

  // === INPUT VALIDATION ===
  validateRequiredFields({ username, email, password }, ['username', 'email', 'password']);

  // Validate individual fields
  validateUsername(username);
  validateEmail(email);
  validatePassword(password);

  // Check password confirmation
  if (password !== confirmPassword) {
    const error = ERROR_CODES.MISSING_FIELDS;
    throw new AppError('Passwords do not match', error.status, 'PASSWORD_MISMATCH');
  }

  // === SANITIZE INPUTS ===
  const sanitizedUsername = sanitizeUsername(username);
  const sanitizedEmail = sanitizeEmail(email);

  // === CHECK FOR DUPLICATES ===
  const existingUser = await User.findOne({
    $or: [
      { email: sanitizedEmail },
      { username: sanitizedUsername }
    ]
  });

  if (existingUser) {
    if (existingUser.email === sanitizedEmail) {
      const error = ERROR_CODES.EMAIL_TAKEN;
      console.log('[REGISTER] Error: Email taken -', sanitizedEmail);
      throw new AppError(error.message, error.status, 'EMAIL_TAKEN');
    }
    if (existingUser.username === sanitizedUsername) {
      const error = ERROR_CODES.USERNAME_TAKEN;
      console.log('[REGISTER] Error: Username taken -', sanitizedUsername);
      throw new AppError(error.message, error.status, 'USERNAME_TAKEN');
    }
  }

  // === CREATE USER ===
  console.log('[REGISTER] Creating user with:', { username: sanitizedUsername, email: sanitizedEmail });
  const user = await User.create({
    username: sanitizedUsername,
    email: sanitizedEmail,
    password // Will be hashed by pre-save middleware
  });
  
  console.log('[REGISTER] User created successfully:', { _id: user._id, username: user.username, email: user.email });

  // === GENERATE TOKEN ===
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  // === RETURN RESPONSE ===
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'User registered successfully',
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  });
});

/**
 * Login user with credential validation
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // === INPUT VALIDATION ===
  validateRequiredFields({ email, password }, ['email', 'password']);
  validateEmail(email);

  // === FIND USER ===
  const sanitizedEmail = sanitizeEmail(email);
  const user = await User.findOne({ email: sanitizedEmail }).select('+password');

  if (!user) {
    const error = ERROR_CODES.INVALID_CREDENTIALS;
    throw new AppError(error.message, error.status, 'INVALID_CREDENTIALS');
  }

  // === VERIFY PASSWORD ===
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    const error = ERROR_CODES.INVALID_CREDENTIALS;
    throw new AppError(error.message, error.status, 'INVALID_CREDENTIALS');
  }

  // === CHECK IF USER IS ACTIVE ===
  if (!user.isActive) {
    const error = ERROR_CODES.USER_NOT_FOUND;
    throw new AppError('Account has been deactivated', error.status, 'ACCOUNT_DEACTIVATED');
  }

  // === UPDATE LAST LOGIN ===
  user.lastLogin = new Date();
  await user.save();

  // === GENERATE TOKEN ===
  const token = generateToken(user._id);
  setTokenCookie(res, token);

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Login successful',
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    }
  });
});

/**
 * Get current user from token
 * GET /api/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  // User is already populated by authMiddleware
  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    const error = ERROR_CODES.USER_NOT_FOUND;
    throw new AppError(error.message, error.status, 'USER_NOT_FOUND');
  }

  if (!user.isActive) {
    const error = ERROR_CODES.USER_NOT_FOUND;
    throw new AppError('Account has been deactivated', error.status, 'ACCOUNT_DEACTIVATED');
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    }
  });
});

/**
 * Logout user by clearing token cookie
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', { path: '/' });

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Logged out successfully'
  });
});

/**
 * Change password for authenticated user
 * POST /api/auth/change-password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // === INPUT VALIDATION ===
  validateRequiredFields(
    { currentPassword, newPassword, confirmPassword },
    ['currentPassword', 'newPassword', 'confirmPassword']
  );

  validatePassword(newPassword);

  // === CHECK PASSWORD MATCH ===
  if (newPassword !== confirmPassword) {
    const error = ERROR_CODES.MISSING_FIELDS;
    throw new AppError('New passwords do not match', error.status, 'PASSWORD_MISMATCH');
  }

  if (currentPassword === newPassword) {
    const error = ERROR_CODES.MISSING_FIELDS;
    throw new AppError('New password must be different from current password', error.status, 'SAME_PASSWORD');
  }

  // === GET USER WITH PASSWORD ===
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    const error = ERROR_CODES.USER_NOT_FOUND;
    throw new AppError(error.message, error.status, 'USER_NOT_FOUND');
  }

  // === VERIFY CURRENT PASSWORD ===
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    const error = ERROR_CODES.INVALID_CREDENTIALS;
    throw new AppError('Current password is incorrect', error.status, 'INVALID_PASSWORD');
  }

  // === UPDATE PASSWORD ===
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Password changed successfully'
  });
});

module.exports = exports;

exports.getCurrentUser = asyncHandler(async (req, res) => { res.status(200).json({ success: true, user: req.user }); });
