// server/controllers/messageController.js
const Message = require('../models/Message');
const Chatroom = require('../models/Chatroom');

// Get messages for a chatroom
exports.getMessages = async (req, res) => {
  try {
    const { chatroomId } = req.params;
    const { limit = 50 } = req.query;

    const chatroom = await Chatroom.findById(chatroomId);
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

    const messages = await Message.find({ chatroom: chatroomId })
      .populate('user', 'username email profilePhoto')
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
    console.log('📨 sendMessage called with body:', req.body);
    console.log('📨 User from token:', req.user);
    
    const { chatroomId, text } = req.body;

    if (!text || !text.trim()) {
      console.log('⚠️ Message text empty');
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Fetch full user from database
    console.log('👤 Fetching user from database:', req.user._id);
    const user = await require('../models/User').findById(req.user._id);
    if (!user) {
      console.log('❌ User not found in database:', req.user._id);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    console.log('✅ User found:', user.username);

    // Verify chatroom exists
    console.log('🔍 Finding chatroom:', chatroomId);
    let chatroom = await Chatroom.findById(chatroomId);
    if (!chatroom) {
      console.log('❌ Chatroom not found:', chatroomId);
      return res.status(404).json({
        success: false,
        message: 'Chatroom not found'
      });
    }
    console.log('✅ Chatroom found');

    if (chatroom.isDirect && !chatroom.members.some(memberId => memberId.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this private chat'
      });
    }

    // Auto-add user to members if not already a member
    if (!chatroom.members.includes(req.user._id)) {
      console.log('📝 Adding user to chatroom members');
      chatroom.members.push(req.user._id);
      chatroom.memberCount = chatroom.members.length;
      await chatroom.save();
      console.log('✅ User added to members');
    }

    console.log('💾 Creating message');
    const message = await Message.create({
      chatroom: chatroomId,
      user: req.user._id,
      username: user.username,
      text: text.trim()
    });
    console.log('✅ Message created:', message._id);

    console.log('📥 Populating user info');
    await message.populate('user', 'username email profilePhoto');
    console.log('✅ Message populated');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('❌ sendMessage error:', error.message);
    console.error('❌ Full error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
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
