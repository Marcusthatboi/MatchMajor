// server/models/Chatroom.js
const mongoose = require('mongoose');

const idsMatch = (left, right) => left?.toString() === right?.toString();

const chatroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chatroom name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  color: {
    type: String,
    default: '#09A6AD',
    match: [/^#[0-9A-F]{6}$/i, 'Invalid color format']
  },

  // Creator of the chatroom
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },

  // List of members in the chatroom
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Whether this is a custom study group or predefined
  isCustom: {
    type: Boolean,
    default: false
  },

  // Member count
  memberCount: {
    type: Number,
    default: 1
  },

  // Active users count
  activeNow: {
    type: Number,
    default: 1
  },

  // Category for predefined chatrooms
  category: {
    type: String,
    enum: {
      values: ['study', 'social', 'housing', 'sports', 'clubs', 'other'],       
      message: 'Invalid category'
    },
    default: 'other'
  },

  // Last message timestamp (for sorting)
  lastMessageAt: {
    type: Date,
    default: Date.now
  },

  // Privacy settings
  isPrivate: {
    type: Boolean,
    default: false
  },

  // Archived status
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

/**
 * Indexes for performance optimization
 */
chatroomSchema.index({ name: 'text', description: 'text' }); // Full-text search
chatroomSchema.index({ creator: 1 });
chatroomSchema.index({ category: 1 });
chatroomSchema.index({ isArchived: 1 });
chatroomSchema.index({ lastMessageAt: -1 });
chatroomSchema.index({ members: 1 });
chatroomSchema.index({ createdAt: -1 });

/**
 * Virtual: Member details (populated)
 */
chatroomSchema.virtual('memberDetails', {
  ref: 'User',
  localField: 'members',
  foreignField: '_id'
});

/**
 * Pre-save middleware: Update member count
 */
chatroomSchema.pre('save', function() {
  try {
    // Ensure creator is in members array
    if (!this.members.some(memberId => idsMatch(memberId, this.creator))) {
      this.members.push(this.creator);
    }
    this.memberCount = this.members.length;
return;
  } catch (error) {
throw error;
  }
});

/**
 * Instance method: Add member to chatroom
 */
chatroomSchema.methods.addMember = async function(userId) {
  if (this.members.some(memberId => idsMatch(memberId, userId))) {
    throw new Error('User is already a member of this chatroom');
  }

  this.members.push(userId);
  this.memberCount = this.members.length;
  await this.save();
  return this;
};

/**
 * Instance method: Remove member from chatroom
 */
chatroomSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(id => id.toString() !== userId.toString());
  this.memberCount = this.members.length;

  // If no members left, archive the chatroom
  if (this.memberCount === 0) {
    this.isArchived = true;
  }

  await this.save();
  return this;
};

/**
 * Instance method: Check if user is member
 */
chatroomSchema.methods.isMember = function(userId) {
  return this.members.some(id => idsMatch(id, userId));
};

/**
 * Instance method: Is user creator
 */
chatroomSchema.methods.isCreator = function(userId) {
  return idsMatch(this.creator, userId);
};

/**
 * Instance method: Update last message timestamp
 */
chatroomSchema.methods.updateLastMessage = async function() {
  this.lastMessageAt = new Date();
  await this.save();
  return this;
};

/**
 * Instance method: Get chatroom info
 */
chatroomSchema.methods.getInfo = function() {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    color: this.color,
    creator: this.creator,
    category: this.category,
    memberCount: this.memberCount,
    activeNow: this.activeNow,
    isCustom: this.isCustom,
    isPrivate: this.isPrivate,
    lastMessageAt: this.lastMessageAt,
    createdAt: this.createdAt
  };
};

/**
 * Static method: Find by category
 */
chatroomSchema.statics.findByCategory = function(category, limit = 20) {        
  return this.find({ category, isArchived: false })
    .sort({ lastMessageAt: -1 })
    .limit(limit);
};

/**
 * Static method: Find user's chatrooms
 */
chatroomSchema.statics.findUserChatrooms = function(userId) {
  return this.find({ members: userId, isArchived: false })
    .sort({ lastMessageAt: -1 });
};

/**
 * Static method: Search chatrooms
 */
chatroomSchema.statics.searchChatrooms = function(searchTerm) {
  return this.find(
    { $text: { $search: searchTerm }, isArchived: false },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Ensure virtuals are included in JSON output
 */
chatroomSchema.set('toJSON', { virtuals: true });

const Chatroom = mongoose.model('Chatroom', chatroomSchema);

module.exports = Chatroom;








