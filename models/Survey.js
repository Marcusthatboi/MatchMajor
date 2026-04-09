// server/models/Survey.js
const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Academic Information
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
  
  // Lifestyle & Living Preferences
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
  
  // Study Preferences
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
  }
}, {
  timestamps: true
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
