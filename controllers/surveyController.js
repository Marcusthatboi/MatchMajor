// server/controllers/surveyController.js
const Survey = require('../models/Survey');
const User = require('../models/User');

/**
 * Create or update a user's survey/profile
 * POST/PUT /api/survey
 */
exports.createOrUpdateSurvey = async (req, res) => {
  try {
    const userId = req.user._id;
    const surveyData = req.body;

    // Check if survey already exists
    let survey = await Survey.findOne({ userId });

    if (survey) {
      // Update existing survey
      survey = await Survey.findByIdAndUpdate(
        survey._id,
        surveyData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new survey
      survey = await Survey.create({
        userId,
        ...surveyData
      });

      // Link survey to user
      await User.findByIdAndUpdate(userId, { survey: survey._id });
    }

    res.status(survey ? 201 : 200).json({
      success: true,
      message: survey ? 'Survey created' : 'Survey updated',
      survey
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating/updating survey',
      error: error.message
    });
  }
};

/**
 * Get current user's survey
 * GET /api/survey
 */
exports.getUserSurvey = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const survey = await Survey.findOne({ userId });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found for this user'
      });
    }

    res.json({
      success: true,
      survey
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching survey',
      error: error.message
    });
  }
};

/**
 * Get a specific user's survey (admin/matching)
 * GET /api/survey/:userId
 */
exports.getSpecificUserSurvey = async (req, res) => {
  try {
    const { userId } = req.params;

    const survey = await Survey.findOne({ userId }).populate('userId', 'username email profilePhoto');

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found for this user'
      });
    }

    res.json({
      success: true,
      survey
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching survey',
      error: error.message
    });
  }
};

/**
 * Delete user's survey
 * DELETE /api/survey
 */
exports.deleteSurvey = async (req, res) => {
  try {
    const userId = req.user._id;

    const survey = await Survey.findOneAndDelete({ userId });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: 'Survey not found'
      });
    }

    // Remove survey reference from user
    await User.findByIdAndUpdate(userId, { survey: null });

    res.json({
      success: true,
      message: 'Survey deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error deleting survey',
      error: error.message
    });
  }
};

/**
 * Get all surveys (excluding private user data)
 * GET /api/survey/all - Admin only
 */
exports.getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().populate('userId', 'username email profilePhoto');

    res.json({
      success: true,
      count: surveys.length,
      surveys
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching surveys',
      error: error.message
    });
  }
};
