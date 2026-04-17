// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getCurrentUser 
} = require('../server/controllers/authController_enhanced');
const { protect, logAuthEvents } = require('../server/middleware/authMiddleware_enhanced');
const { validateCSRFToken } = require('../server/middleware/authMiddleware_enhanced');

// === AUTH ROUTES ===
// All auth routes use logging middleware
router.use(logAuthEvents);

// Public routes (rate limited at server level)
// No CSRF validation needed for public endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router;
