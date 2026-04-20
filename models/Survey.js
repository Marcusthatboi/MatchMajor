// server/models/Survey.js
const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  
  // === ACADEMIC INFORMATION ===
  major: {
    type: String,
    minlength: [2, 'Major must be at least 2 characters'],
    maxlength: [100, 'Major cannot exceed 100 characters'],
    default: null
  },
  
  year: {
    type: String,
    enum: {
      values: ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'],
      message: 'Invalid academic year'
    },
    default: null
  },
  
  interests: [{
    type: String,
    minlength: [2, 'Interest must be at least 2 characters'],
    maxlength: [50, 'Interest cannot exceed 50 characters']
  }],
  
  experience: {
    type: String,
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      message: 'Invalid experience level'
    },
    default: null
  },
  
  goals: {
    type: String,
    maxlength: [500, 'Goals cannot exceed 500 characters'],
    default: null
  },
  
  currentClasses: {
    type: String,
    maxlength: [500, 'Classes cannot exceed 500 characters'],
    default: null
  },
  
  studyGoals: {
    type: String,
    maxlength: [500, 'Study goals cannot exceed 500 characters'],
    default: null
  },
  
  honors: {
    type: String,
    maxlength: [500, 'Honors cannot exceed 500 characters'],
    default: null
  },
  
  // === LIFESTYLE & LIVING PREFERENCES ===
  sleepSchedule: {
    type: String,
    enum: {
      values: ['Early Bird', 'Night Owl', 'Flexible'],
      message: 'Invalid sleep schedule'
    },
    default: null
  },
  
  cleanliness: {
    type: String,
    enum: {
      values: ['Very Tidy', 'Tidy', 'Average', 'Messy'],
      message: 'Invalid cleanliness preference'
    },
    default: null
  },
  
  visitorPolicy: {
    type: String,
    maxlength: [300, 'Visitor policy cannot exceed 300 characters'],
    default: null
  },
  
  items: {
    type: String,
    maxlength: [300, 'Items cannot exceed 300 characters'],
    default: null
  },
  
  pets: {
    type: String,
    maxlength: [300, 'Pets cannot exceed 300 characters'],
    default: null
  },
  
  allergies: {
    type: String,
    maxlength: [300, 'Allergies cannot exceed 300 characters'],
    default: null
  },
  
  campusSelection: {
    type: String,
    maxlength: [200, 'Campus selection cannot exceed 200 characters'],
    default: null
  },
  
  socialBattery: {
    type: String,
    maxlength: [300, 'Social battery cannot exceed 300 characters'],
    default: null
  },
  
  hobbies: {
    type: String,
    maxlength: [300, 'Hobbies cannot exceed 300 characters'],
    default: null
  },
  
  // === STUDY PREFERENCES ===
  studyLocation: {
    type: String,
    maxlength: [200, 'Study location cannot exceed 200 characters'],
    default: null
  },
  
  studyTimes: {
    type: String,
    maxlength: [200, 'Study times cannot exceed 200 characters'],
    default: null
  },
  
  idealGroupSize: {
    type: String,
    maxlength: [100, 'Ideal group size cannot exceed 100 characters'],
    default: null
  },
  
  virtualOrInPerson: {
    type: String,
    enum: {
      values: ['Virtual', 'In-Person', 'Both'],
      message: 'Invalid study format'
    },
    default: null
  },
  
  studyHabits: {
    type: String,
    maxlength: [300, 'Study habits cannot exceed 300 characters'],
    default: null
  },
  
  studyStyle: {
    type: String,
    maxlength: [300, 'Study style cannot exceed 300 characters'],
    default: null
  },
  
  // === META INFO ===
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

/**
 * Indexes for performance optimization
 */
// userId index is created automatically via unique: true constraint
surveySchema.index({ major: 1 });
surveySchema.index({ year: 1 });
surveySchema.index({ interests: 1 });
surveySchema.index({ experience: 1 });
surveySchema.index({ updatedAt: -1 });
surveySchema.index({ major: 1, year: 1 }); // Compound index for common queries
surveySchema.index({ interests: 1, experience: 1 }); // Compound index for matching

/**
 * Virtual: Is complete
 */
surveySchema.virtual('isComplete').get(function() {
  return this.completionPercentage === 100;
});

/**
 * Pre-save middleware: Calculate completion percentage
 */
surveySchema.pre('save', async function(next) {
  const fields = [
    'major', 'year', 'interests', 'experience', 'goals',
    'sleepSchedule', 'cleanliness', 'studyStyle', 'studyLocation',
    'virtualOrInPerson'
  ];
  
  let completedFields = 0;
  
  fields.forEach(field => {
    if (this[field] !== null && this[field] !== undefined && 
        (Array.isArray(this[field]) ? this[field].length > 0 : String(this[field]).trim() !== '')) {
      completedFields++;
    }
  });
  
  this.completionPercentage = Math.round((completedFields / fields.length) * 100);
  this.lastUpdated = new Date();
  
  next();
});

/**
 * Instance method: Get survey profile
 */
surveySchema.methods.getProfile = function() {
  return {
    userId: this.userId,
    major: this.major,
    year: this.year,
    interests: this.interests,
    experience: this.experience,
    sleepSchedule: this.sleepSchedule,
    studyStyle: this.studyStyle,
    virtualOrInPerson: this.virtualOrInPerson,
    completionPercentage: this.completionPercentage
  };
};

/**
 * Instance method: Get compatibility score with another survey (for matching)
 */
surveySchema.methods.getCompatibilityScore = function(otherSurvey) {
  let score = 0;
  let maxScore = 0;
  
  // Major match (0-30 points)
  if (this.major && otherSurvey.major) {
    maxScore += 30;
    if (this.major.toLowerCase() === otherSurvey.major.toLowerCase()) {
      score += 30;
    } else if (this.major.toLowerCase().includes(otherSurvey.major.toLowerCase()) ||
               otherSurvey.major.toLowerCase().includes(this.major.toLowerCase())) {
      score += 15;
    }
  }
  
  // Year proximity (0-20 points)
  if (this.year && otherSurvey.year) {
    maxScore += 20;
    if (this.year === otherSurvey.year) {
      score += 20;
    } else {
      // Same or adjacent year levels
      const years = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
      const diff = Math.abs(years.indexOf(this.year) - years.indexOf(otherSurvey.year));
      if (diff <= 1) score += 10;
    }
  }
  
  // Shared interests (0-30 points)
  if (this.interests && otherSurvey.interests && this.interests.length > 0 && otherSurvey.interests.length > 0) {
    maxScore += 30;
    const sharedInterests = this.interests.filter(i => 
      otherSurvey.interests.some(j => j.toLowerCase() === i.toLowerCase())
    );
    const similarity = sharedInterests.length / Math.max(this.interests.length, otherSurvey.interests.length);
    score += similarity * 30;
  }
  
  // Experience level (0-10 points)
  if (this.experience && otherSurvey.experience) {
    maxScore += 10;
    if (this.experience === otherSurvey.experience) {
      score += 10;
    }
  }
  
  // Study format preference (0-10 points)
  if (this.virtualOrInPerson && otherSurvey.virtualOrInPerson) {
    maxScore += 10;
    if (this.virtualOrInPerson === otherSurvey.virtualOrInPerson || 
        this.virtualOrInPerson === 'Both' || 
        otherSurvey.virtualOrInPerson === 'Both') {
      score += 10;
    }
  }
  
  // Return percentage (0-100)
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
};

/**
 * Static method: Find by user
 */
surveySchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

/**
 * Static method: Find compatible surveys (for study partner matching)
 */
surveySchema.statics.findCompatibleMatches = function(userId, major = null, limit = 10) {
  const query = { userId: { $ne: userId } };
  if (major) query.major = major;
  
  return this.find(query)
    .limit(limit)
    .lean();
};

/**
 * Ensure virtuals are included in JSON output
 */
surveySchema.set('toJSON', { virtuals: true });

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
