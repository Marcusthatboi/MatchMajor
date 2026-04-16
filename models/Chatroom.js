// server/models/Chatroom.js
const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#09A6AD'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isCustom: {
    type: Boolean,
    default: false
  },
  memberCount: {
    type: Number,
    default: 1
  },
  activeNow: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const Chatroom = mongoose.model('Chatroom', chatroomSchema);

module.exports = Chatroom;
