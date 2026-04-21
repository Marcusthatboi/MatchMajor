// server/controllers/matchController.js
const User = require('../models/User');
const Survey = require('../models/Survey');
const { getMatchedUsers } = require('../server/utils/matchingAlgorithm');

/**
 * Get match recommendations for the current user
 * POST /api/matches
 */
const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get current user with their survey
    const currentUser = await User.findById(userId).populate('survey');
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get all other users with their surveys
    const allUsers = await User.find({ _id: { $ne: userId } }).populate('survey');

    // Prepare users for matching algorithm
    const currentUserForMatching = currentUser.survey ? { 
      ...currentUser.toObject(),
      ...currentUser.survey.toObject()
    } : currentUser.toObject();
    
    const allUsersForMatching = allUsers.map(user => 
      user.survey ? { 
        ...user.toObject(),
        ...user.survey.toObject()
      } : user.toObject()
    );

    // Calculate compatibility and get matches
    const matches = await getMatchedUsers(currentUserForMatching, allUsersForMatching);

    res.json({
      success: true,
      data: matches.map(match => ({
        _id: match._id,
        username: match.username,
        name: match.name,
        major: match.major,
        year: match.year,
        experience: match.experience,
        bio: match.bio,
        profilePhoto: match.profilePhoto,
        compatibilityScore: match.compatibilityScore
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get matches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a specific user's profile for comparison
 * GET /api/matches/:userId
 */
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user profile',
      error: error.message 
    });
  }
};

/**
 * Update user profile/survey data
 * PUT /api/matches/profile
 * NOTE: This endpoint now updates the Survey collection instead of User collection
 */
const updateProfile = async (req, res) => {
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

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: survey
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile',
      error: error.message 
    });
  }
};

module.exports = {
  getMatches,
  getUserProfile,
  updateProfile
};
