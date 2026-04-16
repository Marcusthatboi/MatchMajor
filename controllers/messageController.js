// server/controllers/messageController.js
const Message = require('../models/Message');
const Chatroom = require('../models/Chatroom');

// Get messages for a chatroom
exports.getMessages = async (req, res) => {
  try {
    const { chatroomId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await Message.find({ chatroom: chatroomId })
      .populate('user', 'username email')
      .sort('-createdAt')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatroomId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
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

    const message = await Message.create({
      chatroom: chatroomId,
      user: req.user._id,
      username: req.user.username,
      text: text.trim()
    });

    await message.populate('user', 'username email');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete a message (only by owner or admin)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
