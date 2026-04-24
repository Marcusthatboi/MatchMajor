const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    default: null
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

chatRequestSchema.index({ requester: 1, recipient: 1, status: 1 });
chatRequestSchema.index({ recipient: 1, status: 1, createdAt: -1 });

const ChatRequest = mongoose.model('ChatRequest', chatRequestSchema);

module.exports = ChatRequest;
