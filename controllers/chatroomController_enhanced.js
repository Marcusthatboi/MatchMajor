// server/controllers/chatroomController_enhanced.js
/**
 * Chatroom Controller with comprehensive edge case handling
 */

const Chatroom = require('../models/Chatroom');
const Message = require('../models/Message');
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

const VALID_CATEGORIES = ['study', 'social', 'project', 'homework', 'general'];

/**
 * Create new chatroom
 * POST /api/chatrooms
 */
exports.createChatroom = asyncHandler(async (req, res) => {
  const { name, description, category, color, members } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE REQUIRED FIELDS ===
  validateRequiredFields({ name, category }, ['name', 'category']);

  // === VALIDATE NAME ===
  validateStringLength(name, 3, 100, 'Chatroom name');
  const sanitizedName = sanitizeText(name);

  // === VALIDATE CATEGORY ===
  validateEnum(category, VALID_CATEGORIES, 'Category');

  // === VALIDATE DESCRIPTION ===
  let sanitizedDescription = '';
  if (description) {
    validateStringLength(description, 0, 500, 'Description');
    sanitizedDescription = sanitizeText(description);
  }

  // === VALIDATE COLOR (HEX) ===
  let validatedColor = '#3498db'; // default blue
  if (color) {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(color)) {
      throw new AppError('Color must be valid hex code (#RRGGBB)', 400, 'INVALID_COLOR');
    }
    validatedColor = color.toUpperCase();
  }

  // === VALIDATE MEMBERS ===
  let validMembers = [req.user._id];
  if (members && Array.isArray(members)) {
    if (members.length > 50) {
      throw new AppError('Maximum 50 members allowed', 400, 'TOO_MANY_MEMBERS');
    }
    for (const memberId of members) {
      try {
        validateMongoId(memberId, 'Member ID');
      } catch (error) {
        throw new AppError(`Invalid member ID: ${memberId}`, 400, 'INVALID_OBJECT_ID');
      }
    }
    validMembers = [...new Set([req.user._id, ...members])]; // Add creator + remove duplicates
  }

  // === CREATE CHATROOM ===
  const chatroom = await Chatroom.create({
    name: sanitizedName,
    description: sanitizedDescription,
    category,
    color: validatedColor,
    admin: req.user._id,
    members: validMembers
  });

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Chatroom created successfully',
    data: chatroom
  });
});

/**
 * Get chatrooms with filtering
 * GET /api/chatrooms
 */
exports.getChatrooms = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;

  // === BUILD FILTER ===
  const filter = {};

  if (category) {
    validateEnum(category, VALID_CATEGORIES, 'Category');
    filter.category = category;
  }

  if (search) {
    validateStringLength(search, 1, 100, 'Search query');
    const sanitizedSearch = sanitizeText(search);
    filter.$or = [
      { name: { $regex: sanitizedSearch, $options: 'i' } },
      { description: { $regex: sanitizedSearch, $options: 'i' } }
    ];
  }

  // === PAGINATION ===
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // === FETCH CHATROOMS ===
  const chatrooms = await Chatroom.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('admin', 'username')
    .populate('members', 'username email');

  const total = await Chatroom.countDocuments(filter);
  const pages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: chatrooms,
    pagination: {
      current: pageNum,
      total: pages,
      perPage: limitNum,
      totalItems: total
    }
  });
});

/**
 * Get single chatroom
 * GET /api/chatrooms/:chatroomId
 */
exports.getChatroom = asyncHandler(async (req, res) => {
  const { chatroomId } = req.params;

  // === VALIDATE ID ===
  validateMongoId(chatroomId, 'Chatroom ID');

  // === FETCH CHATROOM ===
  const chatroom = await Chatroom.findById(chatroomId)
    .populate('admin', 'username')
    .populate('members', 'username email');

  if (!chatroom) {
    throw new AppError('Chatroom not found', 404, 'CHATROOM_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: chatroom
  });
});

/**
 * Add member to chatroom
 * POST /api/chatrooms/:chatroomId/members
 */
exports.addMember = asyncHandler(async (req, res) => {
  const { chatroomId } = req.params;
  const { userId } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE IDS ===
  validateMongoId(chatroomId, 'Chatroom ID');
  validateMongoId(userId, 'User ID');

  // === FETCH CHATROOM ===
  const chatroom = await Chatroom.findById(chatroomId);

  if (!chatroom) {
    throw new AppError('Chatroom not found', 404, 'CHATROOM_NOT_FOUND');
  }

  // === CHECK IF ADMIN ===
  if (chatroom.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === CHECK IF USER EXISTS ===
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // === CHECK IF ALREADY MEMBER ===
  if (chatroom.members.includes(userId)) {
    throw new AppError('User is already a member', 409, 'ALREADY_MEMBER');
  }

  // === ADD MEMBER ===
  chatroom.members.push(userId);
  await chatroom.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Member added successfully',
    data: chatroom
  });
});

/**
 * Remove member from chatroom
 * DELETE /api/chatrooms/:chatroomId/members/:userId
 */
exports.removeMember = asyncHandler(async (req, res) => {
  const { chatroomId, userId } = req.params;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE IDS ===
  validateMongoId(chatroomId, 'Chatroom ID');
  validateMongoId(userId, 'User ID');

  // === FETCH CHATROOM ===
  const chatroom = await Chatroom.findById(chatroomId);

  if (!chatroom) {
    throw new AppError('Chatroom not found', 404, 'CHATROOM_NOT_FOUND');
  }

  // === CHECK IF ADMIN ===
  if (chatroom.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === CHECK IF MEMBER ===
  if (!chatroom.members.includes(userId)) {
    throw new AppError('User is not a member', 404, 'NOT_MEMBER');
  }

  // === PREVENT SELF-REMOVAL OF ADMIN ===
  if (chatroom.admin.toString() === userId && chatroom.members.length <= 1) {
    throw new AppError('Cannot remove the only admin from chatroom', 400, 'CANNOT_REMOVE_ADMIN');
  }

  // === REMOVE MEMBER ===
  chatroom.members = chatroom.members.filter(m => m.toString() !== userId);
  await chatroom.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Member removed successfully',
    data: chatroom
  });
});

/**
 * Update chatroom
 * PUT /api/chatrooms/:chatroomId
 */
exports.updateChatroom = asyncHandler(async (req, res) => {
  const { chatroomId } = req.params;
  const { name, description, category, color } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(chatroomId, 'Chatroom ID');

  // === FETCH CHATROOM ===
  const chatroom = await Chatroom.findById(chatroomId);

  if (!chatroom) {
    throw new AppError('Chatroom not found', 404, 'CHATROOM_NOT_FOUND');
  }

  // === CHECK AUTHORIZATION ===
  if (chatroom.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === UPDATE FIELDS ===
  if (name !== undefined) {
    validateStringLength(name, 3, 100, 'Chatroom name');
    chatroom.name = sanitizeText(name);
  }

  if (description !== undefined) {
    validateStringLength(description, 0, 500, 'Description');
    chatroom.description = sanitizeText(description);
  }

  if (category !== undefined) {
    validateEnum(category, VALID_CATEGORIES, 'Category');
    chatroom.category = category;
  }

  if (color !== undefined) {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(color)) {
      throw new AppError('Color must be valid hex code', 400, 'INVALID_COLOR');
    }
    chatroom.color = color.toUpperCase();
  }

  await chatroom.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Chatroom updated successfully',
    data: chatroom
  });
});

/**
 * Delete chatroom
 * DELETE /api/chatrooms/:chatroomId
 */
exports.deleteChatroom = asyncHandler(async (req, res) => {
  const { chatroomId } = req.params;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(chatroomId, 'Chatroom ID');

  // === FETCH CHATROOM ===
  const chatroom = await Chatroom.findById(chatroomId);

  if (!chatroom) {
    throw new AppError('Chatroom not found', 404, 'CHATROOM_NOT_FOUND');
  }

  // === CHECK AUTHORIZATION ===
  if (chatroom.admin.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === DELETE CHATROOM AND MESSAGES ===
  await Chatroom.findByIdAndDelete(chatroomId);
  await Message.deleteMany({ chatroom: chatroomId });

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Chatroom deleted successfully'
  });
});

module.exports = exports;
