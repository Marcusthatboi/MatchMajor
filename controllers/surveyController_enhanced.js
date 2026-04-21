// server/controllers/surveyController_enhanced.js
/**
 * Survey Controller with comprehensive edge case handling
 */

const Survey = require('../models/Survey');
const User = require('../models/User');
const AppError = require('../server/utils/AppError');
const asyncHandler = require('../server/utils/asyncHandler');
const ERROR_CODES = require('../server/utils/errorCodes');
const {
  validateMongoId,
  validateRequiredFields,
  validateStringLength,
  validateEnum,
  sanitizeText,
  validateArrayNotEmpty
} = require('../server/utils/inputValidation');

const VALID_MAJORS = ['Computer Science', 'Engineering', 'Business', 'Arts', 'Sciences', 'Medicine', 'Law', 'Other'];
const VALID_YEARS = [1, 2, 3, 4];

/**
 * Create or update survey
 * POST/PUT /api/surveys
 */
exports.createOrUpdateSurvey = asyncHandler(async (req, res) => {
  const { major, year, bio, studyPreferences } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE REQUIRED FIELDS ===
  validateRequiredFields({ major, year }, ['major', 'year']);

  // === VALIDATE MAJOR ===
  validateStringLength(major, 2, 100, 'Major');
  validateEnum(major, VALID_MAJORS, 'Major');

  // === VALIDATE YEAR ===
  validateEnum(year, VALID_YEARS, 'Year');

  // === VALIDATE BIO ===
  if (bio !== undefined) {
    validateStringLength(bio, 0, 500, 'Bio');
    if (bio) {
      bio = sanitizeText(bio);
    }
  }

  // === CHECK EXISTING SURVEY ===
  const existingSurvey = await Survey.findOne({ author: req.user._id });

  let survey;
  if (existingSurvey) {
    // === UPDATE EXISTING ===
    existingSurvey.major = major;
    existingSurvey.year = year;
    if (bio !== undefined) existingSurvey.bio = bio;
    if (studyPreferences !== undefined) existingSurvey.studyPreferences = studyPreferences;

    survey = await existingSurvey.save();
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Survey updated successfully',
      data: survey
    });
  } else {
    // === CREATE NEW ===
    survey = await Survey.create({
      author: req.user._id,
      major,
      year,
      bio: bio || '',
      studyPreferences: studyPreferences || {}
    });

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Survey created successfully',
      data: survey
    });
  }
});

/**
 * Get current user's survey
 * GET /api/surveys/me
 */
exports.getUserSurvey = asyncHandler(async (req, res) => {
  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  const survey = await Survey.findOne({ author: req.user._id }).populate(
    'author',
    'username email'
  );

  if (!survey) {
    throw new AppError('Survey not found', 404, 'SURVEY_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: survey
  });
});

/**
 * Get specific user's survey
 * GET /api/surveys/user/:userId
 */
exports.getSpecificUserSurvey = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // === VALIDATE ID ===
  validateMongoId(userId, 'User ID');

  // === FETCH SURVEY ===
  const survey = await Survey.findOne({ author: userId })
    .populate('author', 'username email')
    .select('-__v');

  if (!survey) {
    throw new AppError('Survey not found', 404, 'SURVEY_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: survey
  });
});

/**
 * Delete survey
 * DELETE /api/surveys
 */
exports.deleteSurvey = asyncHandler(async (req, res) => {
  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  const survey = await Survey.findOneAndDelete({ author: req.user._id });

  if (!survey) {
    throw new AppError('Survey not found', 404, 'SURVEY_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Survey deleted successfully'
  });
});

/**
 * Get all surveys with filtering (admin only)
 * GET /api/surveys/all
 */
exports.getAllSurveys = asyncHandler(async (req, res) => {
  const { major, year, page = 1, limit = 10 } = req.query;

  // === BUILD FILTER ===
  const filter = {};

  if (major) {
    validateEnum(major, VALID_MAJORS, 'Major');
    filter.major = major;
  }

  if (year) {
    const yearNum = parseInt(year);
    validateEnum(yearNum, VALID_YEARS, 'Year');
    filter.year = yearNum;
  }

  // === PAGINATION ===
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // === FETCH SURVEYS ===
  const surveys = await Survey.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('author', 'username email');

  const total = await Survey.countDocuments(filter);
  const pages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: surveys,
    pagination: {
      current: pageNum,
      total: pages,
      perPage: limitNum,
      totalItems: total
    }
  });
});

/**
 * Find matching users
 * GET /api/surveys/matches
 */
exports.findMatches = asyncHandler(async (req, res) => {
  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === GET USER'S SURVEY ===
  const userSurvey = await Survey.findOne({ author: req.user._id });

  if (!userSurvey) {
    throw new AppError('Complete your survey first', 400, 'SURVEY_NOT_FOUND');
  }

  // === FIND MATCHING SURVEYS ===
  const matches = await Survey.find({
    author: { $ne: req.user._id },
    major: userSurvey.major,
    year: userSurvey.year
  })
    .populate('author', 'username email')
    .limit(20);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Matches found',
    data: matches
  });
});

module.exports = exports;
