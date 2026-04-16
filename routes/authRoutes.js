// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getCurrentUser 
} = require('../controllers/authController_enhanced');
const { protect, logAuthEvents } = require('../middleware/authMiddleware_enhanced');
const { validateCSRFToken } = require('../middleware/authMiddleware_enhanced');

// === AUTH ROUTES ===
// All auth routes use logging middleware
router.use(logAuthEvents);

// Public routes (rate limited at server level)
router.post('/register', validateCSRFToken, register);
router.post('/login', validateCSRFToken, login);
router.post('/logout', protect, logout);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router;