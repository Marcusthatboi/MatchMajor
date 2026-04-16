// server/controllers/messageController_enhanced.js
/**
 * Message Controller with comprehensive edge case handling
 */

const Message = require('../models/Message');
const Chatroom = require('../models/Chatroom');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const ERROR_CODES = require('../utils/errorCodes');
const {
  validateMongoId,
  validateRequiredFields,
  validateStringLength,
  sanitizeText
} = require('../utils/inputValidation');

/**
 * Create message
 * POST /api/messages
 */
exports.createMessage = asyncHandler(async (req, res) => {
  const { chatroomId, text } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE REQUIRED FIELDS ===
  validateRequiredFields({ chatroomId, text }, ['chatroomId', 'text']);

  // === VALIDATE IDS ===
  validateMongoId(chatroomId, 'Chatroom ID');

  // === VALIDATE TEXT ===
  validateStringLength(text, 1, 5000, 'Message text');
  const sanitizedText = sanitizeText(text);

  // === VALIDATE CHATROOM EXISTS ===
  const chatroom = await Chatroom.findById(chatroomId);
  if (!chatroom) {
    throw new AppError('Chatroom not found', 404, 'CHATROOM_NOT_FOUND');
  }

  // === VALIDATE USER IS MEMBER ===
  if (!chatroom.members.includes(req.user._id)) {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(
      'You must be a member to post messages',
      error.status,
      'NOT_MEMBER'
    );
  }

  // === CREATE MESSAGE ===
  const message = await Message.create({
    chatroom: chatroomId,
    author: req.user._id,
    text: sanitizedText
  });

  // === POPULATE AND RETURN ===
  await message.populate('author', 'username avatar');

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Message sent successfully',
    data: message
  });
});

/**
 * Get messages for chatroom
 * GET /api/messages/chatroom/:chatroomId
 */
exports.getMessages = asyncHandler(async (req, res) => {
  const { chatroomId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(chatroomId, 'Chatroom ID');

  // === VALIDATE CHATROOM EXISTS ===
  const chatroom = await Chatroom.findById(chatroomId);
  if (!chatroom) {
    throw new AppError('Chatroom not found', 404, 'CHATROOM_NOT_FOUND');
  }

  // === VALIDATE USER IS MEMBER ===
  if (!chatroom.members.includes(req.user._id)) {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(
      'You must be a member to view messages',
      error.status,
      'NOT_MEMBER'
    );
  }

  // === PAGINATION ===
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
  const skip = (pageNum - 1) * limitNum;

  // === FETCH MESSAGES ===
  const messages = await Message.find({
    chatroom: chatroomId,
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('author', 'username avatar')
    .populate('reactions.user', 'username');

  const total = await Message.countDocuments({
    chatroom: chatroomId,
    isDeleted: false
  });
  const pages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: messages.reverse(), // Return chronologically
    pagination: {
      current: pageNum,
      total: pages,
      perPage: limitNum,
      totalItems: total
    }
  });
});

/**
 * Edit message
 * PUT /api/messages/:messageId
 */
exports.editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE REQUIRED FIELDS ===
  validateRequiredFields({ text }, ['text']);

  // === VALIDATE ID ===
  validateMongoId(messageId, 'Message ID');

  // === VALIDATE TEXT ===
  validateStringLength(text, 1, 5000, 'Message text');
  const sanitizedText = sanitizeText(text);

  // === FETCH MESSAGE ===
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  if (message.isDeleted) {
    throw new AppError('Cannot edit deleted message', 410, 'MESSAGE_DELETED');
  }

  // === CHECK AUTHORIZATION ===
  if (message.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === CHECK TIME LIMIT (15 minutes) ===
  const editTimeLimit = 15 * 60 * 1000; // 15 minutes
  if (Date.now() - message.createdAt.getTime() > editTimeLimit) {
    throw new AppError('Can only edit messages within 15 minutes', 410, 'EDIT_TIME_EXPIRED');
  }

  // === UPDATE MESSAGE ===
  message.text = sanitizedText;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  await message.populate('author', 'username avatar');

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Message updated successfully',
    data: message
  });
});

/**
 * Delete message (soft delete)
 * DELETE /api/messages/:messageId
 */
exports.deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(messageId, 'Message ID');

  // === FETCH MESSAGE ===
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  if (message.isDeleted) {
    throw new AppError('Message already deleted', 410, 'MESSAGE_ALREADY_DELETED');
  }

  // === CHECK AUTHORIZATION ===
  if (message.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === SOFT DELETE ===
  message.isDeleted = true;
  message.deletedAt = new Date();
  message.text = '[Message deleted]';
  await message.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Message deleted successfully'
  });
});

/**
 * Add reaction to message
 * POST /api/messages/:messageId/reactions
 */
exports.addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE REQUIRED FIELDS ===
  validateRequiredFields({ emoji }, ['emoji']);

  // === VALIDATE ID ===
  validateMongoId(messageId, 'Message ID');

  // === VALIDATE EMOJI ===
  validateStringLength(emoji, 1, 10, 'Emoji');
  const emojiRegex = /^[\p{Emoji_Presentation}\uFE0F]+$/u;
  if (!emojiRegex.test(emoji)) {
    throw new AppError('Invalid emoji provided', 400, 'INVALID_EMOJI');
  }

  // === FETCH MESSAGE ===
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  if (message.isDeleted) {
    throw new AppError('Cannot react to deleted message', 410, 'MESSAGE_DELETED');
  }

  // === CHECK IF ALREADY REACTED ===
  const existingReaction = message.reactions.find(
    r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
  );

  if (existingReaction) {
    throw new AppError('Already reacted with this emoji', 409, 'ALREADY_REACTED');
  }

  // === ADD REACTION ===
  message.reactions.push({
    user: req.user._id,
    emoji
  });

  await message.save();
  await message.populate('author', 'username avatar');
  await message.populate('reactions.user', 'username');

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Reaction added successfully',
    data: message
  });
});

/**
 * Remove reaction from message
 * DELETE /api/messages/:messageId/reactions
 */
exports.removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE REQUIRED FIELDS ===
  validateRequiredFields({ emoji }, ['emoji']);

  // === VALIDATE ID ===
  validateMongoId(messageId, 'Message ID');

  // === FETCH MESSAGE ===
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  // === CHECK IF REACTED ===
  const reactionIndex = message.reactions.findIndex(
    r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
  );

  if (reactionIndex === -1) {
    throw new AppError('You have not reacted with this emoji', 404, 'REACTION_NOT_FOUND');
  }

  // === REMOVE REACTION ===
  message.reactions.splice(reactionIndex, 1);
  await message.save();

  await message.populate('author', 'username avatar');
  await message.populate('reactions.user', 'username');

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Reaction removed successfully',
    data: message
  });
});

module.exports = exports;
