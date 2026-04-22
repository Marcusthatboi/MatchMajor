// server/controllers/chatroomController.js
const Chatroom = require('../models/Chatroom');
const Message = require('../models/Message');
const Post = require('../models/Post');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all chatrooms (predefined + custom)
exports.getAllChatrooms = async (req, res) => {
  try {
    console.log('Fetching all chatrooms...');
    const chatrooms = await Chatroom.find({
      $or: [
        { isDirect: { $ne: true } },
        { isDirect: true, members: req.user._id }
      ]
    })
      .populate('creator', 'username')
      .populate('members', 'username')
      .sort('-createdAt');

    console.log(`Found ${chatrooms.length} chatrooms`);

    res.status(200).json({
      success: true,
      data: chatrooms
    });
  } catch (error) {
    console.error('Error in getAllChatrooms:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new chatroom
exports.createChatroom = async (req, res) => {
  try {
    const { name, description, color, isPrivate } = req.body;

    // Validate authentication
    if (!req.user || !req.user._id) {
      console.error('Authentication error: req.user not found', { user: req.user });
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Chatroom name is required'
      });
    }

    console.log('Creating chatroom with data:', { name, description, color, isPrivate, userId: req.user._id });

    // Create new chatroom
    const chatroom = await Chatroom.create({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#09A6AD',
      creator: req.user._id,
      members: [req.user._id],
      isCustom: true,
      memberCount: 1,
      activeNow: 1,
      isPrivate: isPrivate || false
    });

    console.log('Chatroom created successfully:', chatroom);

    await chatroom.populate('creator', 'username');

    res.status(201).json({
      success: true,
      data: chatroom
    });
  } catch (error) {
    console.error('Error in createChatroom:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Join a chatroom
exports.joinChatroom = async (req, res) => {
  try {
    const { chatroomId } = req.body;

    const chatroom = await Chatroom.findById(chatroomId);
    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found'
      });
    }

    // Check if user is already a member
    if (chatroom.members.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this chatroom'
      });
    }

    // Add user to members
    chatroom.members.push(req.user._id);
    chatroom.memberCount = chatroom.members.length;
    await chatroom.save();

    await chatroom.populate('members', 'username');

    res.status(200).json({
      success: true,
      data: chatroom
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Leave a chatroom
exports.leaveChatroom = async (req, res) => {
  try {
    const { chatroomId } = req.body;

    const chatroom = await Chatroom.findById(chatroomId);
    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found'
      });
    }

    // Remove user from members
    chatroom.members = chatroom.members.filter(
      memberId => memberId.toString() !== req.user._id.toString()
    );
    chatroom.memberCount = chatroom.members.length;
    await chatroom.save();

    res.status(200).json({
      success: true,
      message: 'Left chatroom successfully',
      data: chatroom
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a chatroom and its content. Only the creator or an admin can delete.
exports.deleteChatroom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chatroom ID'
      });
    }

    const chatroom = await Chatroom.findById(id);
    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found'
      });
    }

    const isCreator = chatroom.isCreator(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the chatroom creator can delete this chatroom'
      });
    }

    await Promise.all([
      Message.deleteMany({ chatroom: id }),
      Post.deleteMany({ chatroom: id }),
      Chatroom.findByIdAndDelete(id)
    ]);

    res.status(200).json({
      success: true,
      message: 'Chatroom deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteChatroom:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get chatroom details
exports.getChatroom = async (req, res) => {
  try {
    const { id } = req.params;

    const chatroom = await Chatroom.findById(id)
      .populate('creator', 'username email')
      .populate('members', 'username');

    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found'
      });
    }

    if (chatroom.isDirect && !chatroom.members.some(memberId => memberId.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this private chat'
      });
    }

    res.status(200).json({
      success: true,
      data: chatroom
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
