// server/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  chatroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    required: [true, 'Chatroom is required']
  },
  
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  
  authorName: {
    type: String,
    required: [true, 'Author name is required']
  },
  
  content: {
    type: String,
    required: [true, 'Post content is required'],
    minlength: [1, 'Post cannot be empty'],
    maxlength: [5000, 'Post cannot exceed 5000 characters'],
    trim: true
  },

  roommateSlots: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },

  expiresAt: {
    type: Date,
    default: null
  },

  meetingTime: {
    type: String,
    trim: true,
    maxlength: [120, 'Meeting time cannot exceed 120 characters'],
    default: ''
  },

  meetingPlace: {
    type: String,
    trim: true,
    maxlength: [200, 'Meeting place cannot exceed 200 characters'],
    default: ''
  },

  roommateMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedAt: {
      type: Date,
      default: Date.now
    }
  }],

  roommateRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date,
      default: null
    }
  }],
  
  // Like tracking
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Comments/replies
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Post status
  isEdited: {
    type: Boolean,
    default: false
  },
  
  editedAt: {
    type: Date,
    default: null
  },
  
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

/**
 * Indexes for performance optimization
 */
postSchema.index({ chatroom: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likeCount: -1 });
postSchema.index({ chatroom: 1, isDeleted: 1 });

/**
 * Virtual: Comment count
 */
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

/**
 * Pre-save middleware: Validate chatroom and author
 */
postSchema.pre('save', async function() {
  if (this.isNew) {
    // Validate chatroom exists
    const Chatroom = mongoose.model('Chatroom');
    const chatroom = await Chatroom.findById(this.chatroom);
    
    if (!chatroom) {
      throw new Error('Referenced chatroom does not exist');
    }
  }
});

/**
 * Instance method: Like/Unlike post
 */
postSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  
  if (index > -1) {
    // Unlike
    this.likes.splice(index, 1);
    this.likeCount = Math.max(0, this.likeCount - 1);
  } else {
    // Like
    this.likes.push(userId);
    this.likeCount += 1;
  }
  
  await this.save();
  return this.likeCount;
};

/**
 * Instance method: Add comment
 */
postSchema.methods.addComment = async function(authorId, authorName, text) {
  const comment = {
    author: authorId,
    authorName,
    text,
    likes: []
  };
  
  this.comments.push(comment);
  await this.save();
  return this.comments[this.comments.length - 1];
};

/**
 * Instance method: Remove comment
 */
postSchema.methods.removeComment = async function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId.toString());
  await this.save();
  return this;
};

/**
 * Instance method: Edit post
 */
postSchema.methods.editPost = async function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
  return this;
};

/**
 * Instance method: Delete post (soft delete)
 */
postSchema.methods.deletePost = async function() {
  this.isDeleted = true;
  this.content = '[Post deleted]';
  await this.save();
  return this;
};

/**
 * Instance method: Get post details
 */
postSchema.methods.getDetails = function() {
  return {
    _id: this._id,
    author: this.author,
    authorName: this.authorName,
    content: this.content,
    roommateSlots: this.roommateSlots,
    expiresAt: this.expiresAt,
    meetingTime: this.meetingTime,
    meetingPlace: this.meetingPlace,
    roommateMembers: this.roommateMembers,
    roommateRequests: this.roommateRequests,
    likeCount: this.likeCount,
    commentCount: this.commentCount,
    isEdited: this.isEdited,
    editedAt: this.editedAt,
    createdAt: this.createdAt,
    comments: this.comments.map(c => ({
      _id: c._id,
      author: c.author,
      authorName: c.authorName,
      text: c.text,
      likes: c.likes.length,
      createdAt: c.createdAt
    }))
  };
};

/**
 * Static method: Find posts by chatroom
 */
postSchema.statics.findByChatroom = function(chatroomId, limit = 20, skip = 0) {
  return this.find({ chatroom: chatroomId, isDeleted: false })
    .populate('author', 'username profilePhoto')
    .populate('comments.author', 'username profilePhoto')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * Static method: Get trending posts
 */
postSchema.statics.getTrendingPosts = function(limit = 10) {
  return this.find({ isDeleted: false })
    .sort({ likeCount: -1, createdAt: -1 })
    .limit(limit);
};

/**
 * Ensure virtuals are included in JSON output
 */
postSchema.set('toJSON', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
