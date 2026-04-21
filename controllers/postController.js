// server/controllers/postController.js
const Post = require('../models/Post');
const Chatroom = require('../models/Chatroom');
const User = require('../models/User');
const mongoose = require('mongoose');

const idsMatch = (left, right) => left?.toString() === right?.toString();

const authorPopulate = {
  path: 'author',
  select: 'username email profilePhoto survey',
  populate: {
    path: 'survey',
    select: [
      'name',
      'major',
      'year',
      'bio',
      'sleepSchedule',
      'cleanliness',
      'visitorPolicy',
      'campusSelection',
      'socialBattery',
      'hobbies',
      'studyGoals',
      'studyLocation',
      'studyTimes',
      'idealGroupSize',
      'virtualOrInPerson',
      'studyHabits',
      'studyStyle'
    ].join(' ')
  }
};

const commentAuthorPopulate = {
  path: 'comments.author',
  select: 'username email profilePhoto'
};

const sendPostError = (res, error, fallbackMessage = 'Server error') => {
  console.error('Post controller error:', error.message, error.stack);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(error.errors).map(err => err.message).join('; ')
    });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path || 'id'}`
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Get posts for a chatroom
exports.getPosts = async (req, res) => {
  try {
    const { chatroomId } = req.params;
    const { limit = 50 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(chatroomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chatroom ID'
      });
    }

    const posts = await Post.find({ chatroom: chatroomId })
      .populate(authorPopulate)
      .populate('likes', 'username')
      .populate(commentAuthorPopulate)
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    sendPostError(res, error);
  }
};

// Create a post
exports.createPost = async (req, res) => {
  const context = {
    stage: 'start',
    chatroomId: req.body?.chatroomId,
    userId: req.user?._id,
    hasContent: Boolean(req.body?.content?.trim())
  };

  try {
    const { chatroomId, content } = req.body;

    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(chatroomId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chatroom ID'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty'
      });
    }

    // Verify chatroom exists
    context.stage = 'find_chatroom';
    let chatroom = await Chatroom.findById(chatroomId);
    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found'
      });
    }

    // Auto-add user to members if not already a member
    context.stage = 'ensure_chatroom_member';
    if (!chatroom.members.some(memberId => idsMatch(memberId, req.user._id))) {
      chatroom.members.push(req.user._id);
      chatroom.memberCount = chatroom.members.length;
      await chatroom.save();
    }

    // Get user details for authorName
    context.stage = 'find_user';
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    context.stage = 'create_post';
    const post = await Post.create({
      chatroom: chatroomId,
      author: req.user._id,
      authorName: user.username || 'Anonymous',
      content: content.trim(),
      likes: [],
      likeCount: 0,
      comments: []
    });

    context.stage = 'populate_author';
    await post.populate(authorPopulate);

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Create post failed:', context);
    sendPostError(res, error);
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked
    if (post.likes.some(userId => idsMatch(userId, req.user._id))) {
      // Remove like (unlike)
      post.likes = post.likes.filter(
        userId => !idsMatch(userId, req.user._id)
      );
    } else {
      // Add like
      post.likes.push(req.user._id);
    }

    post.likeCount = post.likes.length;
    await post.save();

    await post.populate(authorPopulate);
    await post.populate('likes', 'username');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    sendPostError(res, error);
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      author: req.user._id,
      authorName: req.user.username,
      text: text.trim(),
      createdAt: new Date()
    });

    await post.save();
    await post.populate(authorPopulate);
    await post.populate(commentAuthorPopulate);

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    sendPostError(res, error);
  }
};

// Delete a post (only by owner or admin)
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    sendPostError(res, error);
  }
};
