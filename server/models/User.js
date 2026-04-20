// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password by default in queries
  },
  
  profilePhoto: {
    type: String,
    default: null
  },
  
  // Reference to Survey collection for profile/matching data
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    default: null
  },
  
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either user or admin'
    },
    default: 'user'
  },
  
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last login timestamp
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

/**
 * Indexes for performance optimization
 */
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });

/**
 * Pre-save middleware: Hash password before saving
 */
userSchema.pre('save', async function() {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    // Generate salt and hash password with 12 rounds for stronger security
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

/**
 * Instance method: Compare password
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Instance method: Get user without sensitive data
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

/**
 * Query middleware: Always exclude password field unless explicitly selected
 */
userSchema.pre('find', function() {
  // Skip if password is already selected
  if (this.getOptions().select && this.getOptions().select.includes('password')) {
    return;
  }
  this.select('-password');
});

const User = mongoose.model('User', userSchema);

module.exports = User;