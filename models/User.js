// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  // Survey/Profile data for matching
  major: {
    type: String,
    default: null
  },
  year: {
    type: String,
    enum: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'],
    default: null
  },
  interests: [{
    type: String
  }],
  experience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: null
  },
  goals: {
    type: String,
    default: null
  },
  sleepSchedule: {
    type: String,
    enum: ['Early Bird', 'Night Owl', 'Flexible'],
    default: null
  },
  cleanliness: {
    type: String,
    enum: ['Very Tidy', 'Tidy', 'Average', 'Messy'],
    default: null
  },
  visitorPolicy: {
    type: String,
    default: null
  },
  items: {
    type: String,
    default: null
  },
  pets: {
    type: String,
    default: null
  },
  allergies: {
    type: String,
    default: null
  },
  campusSelection: {
    type: String,
    default: null
  },
  socialBattery: {
    type: String,
    default: null
  },
  hobbies: {
    type: String,
    default: null
  },
  currentClasses: {
    type: String,
    default: null
  },
  studyGoals: {
    type: String,
    default: null
  },
  honors: {
    type: String,
    default: null
  },
  studyLocation: {
    type: String,
    default: null
  },
  studyTimes: {
    type: String,
    default: null
  },
  idealGroupSize: {
    type: String,
    default: null
  },
  virtualOrInPerson: {
    type: String,
    default: null
  },
  studyHabits: {
    type: String,
    default: null
  },
  studyStyle: {
    type: String,
    default: null
  },
  profilePhoto: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    // Increased salt rounds from 10 to 12 for stronger security
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;