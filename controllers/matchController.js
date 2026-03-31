// server/controllers/matchController.js
const User = require('../models/User');
const { getMatchedUsers } = require('../server/utils/matchingAlgorithm');

/**
 * Get match recommendations for the current user
 * POST /api/matches
 */
const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get all other users
    const allUsers = await User.find({ _id: { $ne: userId } });

    // Calculate compatibility and get matches
    const matches = await getMatchedUsers(currentUser, allUsers);

    res.json({
      success: true,
      data: matches.map(match => ({
        _id: match._id,
        username: match.username,
        major: match.major,
        year: match.year,
        interests: match.interests,
        experience: match.experience,
        profilePhoto: match.profilePhoto,
        compatibilityScore: match.compatibilityScore
      }))
    });
  } catch (error) {
    console.error('Error getting matches:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get matches',
      error: error.message 
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
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { major, year, interests, experience, goals } = req.body;
    
    console.log('Updating profile for user:', userId);
    console.log('Profile data:', { major, year, interests, experience, goals });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        major,
        year,
        interests,
        experience,
        goals
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log('Profile updated successfully');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
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
