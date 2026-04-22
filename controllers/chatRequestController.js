const mongoose = require('mongoose');
const ChatRequest = require('../models/ChatRequest');
const Chatroom = require('../models/Chatroom');
const User = require('../models/User');

const idsMatch = (left, right) => left?.toString() === right?.toString();

const populateRequest = (query) => query
  .populate('requester', 'username email profilePhoto')
  .populate('recipient', 'username email profilePhoto')
  .populate('chatroom');

const findDirectChatroom = async (leftUserId, rightUserId) => {
  return Chatroom.findOne({
    isDirect: true,
    directParticipants: { $all: [leftUserId, rightUserId] }
  });
};

exports.getChatRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const [incoming, outgoing, accepted] = await Promise.all([
      populateRequest(ChatRequest.find({ recipient: userId, status: 'pending' }).sort('-createdAt')),
      populateRequest(ChatRequest.find({ requester: userId, status: 'pending' }).sort('-createdAt')),
      populateRequest(ChatRequest.find({
        status: 'accepted',
        $or: [{ requester: userId }, { recipient: userId }]
      }).sort('-respondedAt -updatedAt').limit(10))
    ]);

    res.status(200).json({
      success: true,
      data: { incoming, outgoing, accepted }
    });
  } catch (error) {
    console.error('Get chat requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createChatRequest = async (req, res) => {
  try {
    const requesterId = req.user._id;
    const { recipientId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient ID'
      });
    }

    if (idsMatch(requesterId, recipientId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request a chat with yourself'
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingDirectChatroom = await findDirectChatroom(requesterId, recipientId);
    if (existingDirectChatroom) {
      return res.status(200).json({
        success: true,
        message: 'Chat already exists',
        chatroom: existingDirectChatroom
      });
    }

    const existingPending = await ChatRequest.findOne({
      status: 'pending',
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingPending) {
      return res.status(200).json({
        success: true,
        message: 'Chat request already pending',
        request: await populateRequest(ChatRequest.findById(existingPending._id))
      });
    }

    const request = await ChatRequest.create({
      requester: requesterId,
      recipient: recipientId
    });

    res.status(201).json({
      success: true,
      message: 'Chat request sent',
      request: await populateRequest(ChatRequest.findById(request._id))
    });
  } catch (error) {
    console.error('Create chat request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.acceptChatRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const request = await ChatRequest.findById(requestId)
      .populate('requester', 'username')
      .populate('recipient', 'username');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Chat request not found'
      });
    }

    if (!idsMatch(request.recipient?._id || request.recipient, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can accept this request'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This chat request is no longer pending'
      });
    }

    let chatroom = await findDirectChatroom(request.requester._id, request.recipient._id);

    if (!chatroom) {
      chatroom = await Chatroom.create({
        name: `${request.requester.username} & ${request.recipient.username}`,
        description: 'Private chat',
        color: '#09A6AD',
        creator: request.recipient._id,
        members: [request.requester._id, request.recipient._id],
        memberCount: 2,
        activeNow: 0,
        isCustom: false,
        isPrivate: true,
        isDirect: true,
        directParticipants: [request.requester._id, request.recipient._id]
      });
    }

    request.status = 'accepted';
    request.chatroom = chatroom._id;
    request.respondedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Chat request accepted',
      request: await populateRequest(ChatRequest.findById(request._id)),
      chatroom
    });
  } catch (error) {
    console.error('Accept chat request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.declineChatRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }

    const request = await ChatRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Chat request not found'
      });
    }

    if (!idsMatch(request.recipient, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can decline this request'
      });
    }

    request.status = 'declined';
    request.respondedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Chat request declined',
      request: await populateRequest(ChatRequest.findById(request._id))
    });
  } catch (error) {
    console.error('Decline chat request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
