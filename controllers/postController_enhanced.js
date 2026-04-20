// server/controllers/postController_enhanced.js
/**
 * Post Controller with comprehensive edge case handling
 */

const Post = require('../models/Post');
const User = require('../models/User');
const AppError = require('../server/utils/AppError');
const asyncHandler = require('../server/utils/asyncHandler');
const ERROR_CODES = require('../server/utils/errorCodes');
const {
  validateMongoId,
  validateRequiredFields,
  validateStringLength,
  sanitizeText
} = require('../server/utils/inputValidation');

/**
 * Create post
 * POST /api/posts
 */
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE REQUIRED FIELDS ===
  validateRequiredFields({ title, content }, ['title', 'content']);

  // === VALIDATE TITLE ===
  validateStringLength(title, 5, 200, 'Title');
  const sanitizedTitle = sanitizeText(title);

  // === VALIDATE CONTENT ===
  validateStringLength(content, 1, 5000, 'Content');
  const sanitizedContent = sanitizeText(content);

  // === VALIDATE CATEGORY ===
  let sanitizedCategory = '';
  if (category) {
    validateStringLength(category, 2, 50, 'Category');
    sanitizedCategory = sanitizeText(category);
  }

  // === VALIDATE TAGS ===
  let validatedTags = [];
  if (tags && Array.isArray(tags)) {
    if (tags.length > 10) {
      throw new AppError('Maximum 10 tags allowed', 400, 'TOO_MANY_TAGS');
    }
    validatedTags = tags.map(tag => {
      validateStringLength(tag, 2, 30, 'Tag');
      return sanitizeText(tag).toLowerCase();
    });
    // Remove duplicates
    validatedTags = [...new Set(validatedTags)];
  }

  // === CREATE POST ===
  const post = await Post.create({
    author: req.user._id,
    title: sanitizedTitle,
    content: sanitizedContent,
    category: sanitizedCategory,
    tags: validatedTags
  });

  await post.populate('author', 'username avatar');

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Post created successfully',
    data: post
  });
});

/**
 * Get all posts with filtering and pagination
 * GET /api/posts
 */
exports.getPosts = asyncHandler(async (req, res) => {
  const { category, search, sort = 'recent', page = 1, limit = 10 } = req.query;

  // === BUILD FILTER ===
  const filter = { isDeleted: false };

  if (category) {
    validateStringLength(category, 2, 50, 'Category');
    filter.category = sanitizeText(category);
  }

  if (search) {
    validateStringLength(search, 1, 100, 'Search query');
    const sanitizedSearch = sanitizeText(search);
    filter.$or = [
      { title: { $regex: sanitizedSearch, $options: 'i' } },
      { content: { $regex: sanitizedSearch, $options: 'i' } },
      { tags: { $in: [sanitizedSearch] } }
    ];
  }

  // === BUILD SORT ===
  let sortObj = { createdAt: -1 }; // default: recent
  if (sort === 'popular') {
    sortObj = { likes: -1, createdAt: -1 };
  } else if (sort === 'trending') {
    sortObj = { 'engagement.score': -1, createdAt: -1 };
  }

  // === PAGINATION ===
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // === FETCH POSTS ===
  const posts = await Post.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .populate('author', 'username avatar')
    .populate('comments.author', 'username avatar');

  const total = await Post.countDocuments(filter);
  const pages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: posts,
    pagination: {
      current: pageNum,
      total: pages,
      perPage: limitNum,
      totalItems: total
    }
  });
});

/**
 * Get single post
 * GET /api/posts/:postId
 */
exports.getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  // === VALIDATE ID ===
  validateMongoId(postId, 'Post ID');

  // === FETCH POST ===
  const post = await Post.findById(postId)
    .populate('author', 'username avatar')
    .populate('comments.author', 'username avatar')
    .populate('likes', 'username');

  if (!post || post.isDeleted) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    statusCode: 200,
    data: post
  });
});

/**
 * Edit post
 * PUT /api/posts/:postId
 */
exports.editPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { title, content, category, tags } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(postId, 'Post ID');

  // === FETCH POST ===
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  if (post.isDeleted) {
    throw new AppError('Cannot edit deleted post', 410, 'POST_DELETED');
  }

  // === CHECK AUTHORIZATION ===
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === UPDATE FIELDS ===
  if (title !== undefined) {
    validateStringLength(title, 5, 200, 'Title');
    post.title = sanitizeText(title);
  }

  if (content !== undefined) {
    validateStringLength(content, 1, 5000, 'Content');
    post.content = sanitizeText(content);
  }

  if (category !== undefined) {
    validateStringLength(category, 2, 50, 'Category');
    post.category = sanitizeText(category);
  }

  if (tags !== undefined) {
    if (Array.isArray(tags)) {
      if (tags.length > 10) {
        throw new AppError('Maximum 10 tags allowed', 400, 'TOO_MANY_TAGS');
      }
      post.tags = tags.map(tag => {
        validateStringLength(tag, 2, 30, 'Tag');
        return sanitizeText(tag).toLowerCase();
      });
      post.tags = [...new Set(post.tags)];
    }
  }

  post.isEdited = true;
  post.editedAt = new Date();
  await post.save();

  await post.populate('author', 'username avatar');
  await post.populate('comments.author', 'username avatar');

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Post updated successfully',
    data: post
  });
});

/**
 * Delete post (soft delete)
 * DELETE /api/posts/:postId
 */
exports.deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(postId, 'Post ID');

  // === FETCH POST ===
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  if (post.isDeleted) {
    throw new AppError('Post already deleted', 410, 'POST_ALREADY_DELETED');
  }

  // === CHECK AUTHORIZATION ===
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === SOFT DELETE ===
  post.isDeleted = true;
  post.deletedAt = new Date();
  await post.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Post deleted successfully'
  });
});

/**
 * Toggle like on post
 * POST /api/posts/:postId/likes
 */
exports.toggleLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(postId, 'Post ID');

  // === FETCH POST ===
  const post = await Post.findById(postId);

  if (!post || post.isDeleted) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  // === CHECK IF ALREADY LIKED ===
  const likeIndex = post.likes.indexOf(req.user._id);

  if (likeIndex === -1) {
    // === ADD LIKE ===
    post.likes.push(req.user._id);
  } else {
    // === REMOVE LIKE ===
    post.likes.splice(likeIndex, 1);
  }

  await post.save();
  await post.populate('author', 'username avatar');

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: likeIndex === -1 ? 'Post liked' : 'Post unliked',
    data: post
  });
});

/**
 * Add comment to post
 * POST /api/posts/:postId/comments
 */
exports.addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE REQUIRED FIELDS ===
  validateRequiredFields({ text }, ['text']);

  // === VALIDATE ID ===
  validateMongoId(postId, 'Post ID');

  // === VALIDATE TEXT ===
  validateStringLength(text, 1, 1000, 'Comment text');
  const sanitizedText = sanitizeText(text);

  // === FETCH POST ===
  const post = await Post.findById(postId);

  if (!post || post.isDeleted) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  // === ADD COMMENT ===
  const comment = {
    author: req.user._id,
    text: sanitizedText,
    createdAt: new Date()
  };

  post.comments.push(comment);
  await post.save();

  await post.populate('author', 'username avatar');
  await post.populate('comments.author', 'username avatar');

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Comment added successfully',
    data: post
  });
});

/**
 * Remove comment from post
 * DELETE /api/posts/:postId/comments/:commentId
 */
exports.removeComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE IDS ===
  validateMongoId(postId, 'Post ID');
  validateMongoId(commentId, 'Comment ID');

  // === FETCH POST ===
  const post = await Post.findById(postId);

  if (!post || post.isDeleted) {
    throw new AppError('Post not found', 404, 'POST_NOT_FOUND');
  }

  // === FIND COMMENT ===
  const comment = post.comments.find(c => c._id.toString() === commentId);

  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  // === CHECK AUTHORIZATION ===
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === REMOVE COMMENT ===
  post.comments = post.comments.filter(c => c._id.toString() !== commentId);
  await post.save();

  await post.populate('author', 'username avatar');
  await post.populate('comments.author', 'username avatar');

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comment removed successfully',
    data: post
  });
});

module.exports = exports;
