// server/routes/surveyRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOrUpdateSurvey,
  getUserSurvey,
  getSpecificUserSurvey,
  deleteSurvey,
  getAllSurveys
} = require('../controllers/surveyController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes (require authentication)
router.post('/', protect, createOrUpdateSurvey);
router.get('/', protect, getUserSurvey);
router.get('/all', protect, getAllSurveys); // Can add admin check later
router.delete('/', protect, deleteSurvey);

// Get a specific user's survey
router.get('/:userId', protect, getSpecificUserSurvey);

module.exports = router;
