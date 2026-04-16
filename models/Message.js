// server/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    required: [true, 'Chatroom is required']
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  
  text: {
    type: String,
    required: [true, 'Message text is required'],
    minlength: [1, 'Message cannot be empty'],
    maxlength: [5000, 'Message cannot exceed 5000 characters'],
    trim: true
  },
  
  // Edited message tracking
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date,
    default: null
  },
  
  // Message status
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  // Reactions (for future use)
  reactions: {
    type: Map,
    of: [mongoose.Schema.Types.ObjectId],
    default: new Map()
  },
  
  // Replies/threading (for future use)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }
}, {
  timestamps: true
});

// Rename automatic createdAt to use as message timestamp
messageSchema.set('timestamps', { createdAt: 'sentAt', updatedAt: 'updatedAt' });

/**
 * Indexes for performance optimization
 */
messageSchema.index({ chatroom: 1, sentAt: -1 });
messageSchema.index({ user: 1 });
messageSchema.index({ sentAt: -1 });
messageSchema.index({ chatroom: 1, isDeleted: 1 });
messageSchema.index({ replyTo: 1 });

/**
 * Pre-save middleware: Validate message
 */
messageSchema.pre('save', async function(next) {
  // Check if chatroom exists
  const Chatroom = mongoose.model('Chatroom');
  const chatroom = await Chatroom.findById(this.chatroom);
  
  if (!chatroom) {
    throw new Error('Referenced chatroom does not exist');
  }
  
  next();
});

/**
 * Instance method: Edit message
 */
messageSchema.methods.editMessage = async function(newText) {
  if (this.isDeleted) {
    throw new Error('Cannot edit a deleted message');
  }
  
  this.text = newText;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
  return this;
};

/**
 * Instance method: Delete message (soft delete)
 */
messageSchema.methods.deleteMessage = async function() {
  this.isDeleted = true;
  this.text = '[Message deleted]';
  await this.save();
  return this;
};

/**
 * Instance method: Add reaction
 */
messageSchema.methods.addReaction = async function(userId, emoji) {
  if (!this.reactions.has(emoji)) {
    this.reactions.set(emoji, []);
  }
  
  const users = this.reactions.get(emoji);
  if (!users.includes(userId)) {
    users.push(userId);
  }
  
  await this.save();
  return this;
};

/**
 * Instance method: Get message details
 */
messageSchema.methods.getDetails = function() {
  return {
    _id: this._id,
    user: this.user,
    username: this.username,
    text: this.text,
    sentAt: this.sentAt,
    isEdited: this.isEdited,
    editedAt: this.editedAt,
    reactionCount: this.reactions.size,
    replyTo: this.replyTo
  };
};

/**
 * Static method: Get messages for chatroom
 */
messageSchema.statics.findByChatroom = function(chatroomId, limit = 50, skip = 0) {
  return this.find({ chatroom: chatroomId, isDeleted: false })
    .populate('user', 'username profilePhoto')
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Static method: Get message threads
 */
messageSchema.statics.getThreads = function(chatroomId) {
  return this.find({ chatroom: chatroomId, isDeleted: false, replyTo: { $ne: null } })
    .populate('replyTo')
    .sort({ sentAt: -1 });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
