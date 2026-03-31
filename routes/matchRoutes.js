// server/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getMatches, 
  getUserProfile,
  updateProfile 
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Update current user's profile/survey data (must be before /:userId to avoid conflicts)
router.put('/profile', updateProfile);

// Get match recommendations for current user
router.get('/', getMatches);

// Get specific user's profile
router.get('/:userId', getUserProfile);

module.exports = router;
