// server/controllers/postController.js
const Post = require('../models/Post');
const Chatroom = require('../models/Chatroom');

// Get posts for a chatroom
exports.getPosts = async (req, res) => {
  try {
    const { chatroomId } = req.params;
    const { limit = 50 } = req.query;

    const posts = await Post.find({ chatroom: chatroomId })
      .populate('author', 'username email')
      .populate('likes', 'username')
      .populate('comments.author', 'username email')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create a post
exports.createPost = async (req, res) => {
  try {
    const { chatroomId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Post content cannot be empty'
      });
    }

    // Verify chatroom exists
    const chatroom = await Chatroom.findById(chatroomId);
    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found'
      });
    }

    // Verify user is a member
    if (!chatroom.members.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this chatroom'
      });
    }

    const post = await Post.create({
      chatroom: chatroomId,
      author: req.user._id,
      authorName: req.user.username,
      content: content.trim(),
      likes: [],
      likeCount: 0,
      comments: []
    });

    await post.populate('author', 'username email');

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked
    if (post.likes.includes(req.user._id)) {
      // Remove like (unlike)
      post.likes = post.likes.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
    } else {
      // Add like
      post.likes.push(req.user._id);
    }

    post.likeCount = post.likes.length;
    await post.save();

    await post.populate('author', 'username email');
    await post.populate('likes', 'username');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

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
    await post.populate('author', 'username email');
    await post.populate('comments.author', 'username email');

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a post (only by owner or admin)
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
