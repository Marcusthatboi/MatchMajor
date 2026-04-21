// server/scripts/migrateSurveyData.js
// Script to migrate survey data from User collection to Survey collection

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../../models/User');
const Survey = require('../../models/Survey');

async function migrateSurveyData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB!\n');

    // Get all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate\n`);

    let migratedCount = 0;

    // For each user, create a survey if they have survey data
    for (const user of users) {
      const surveyFields = [
        'major', 'year', 'experience', 'goals', 'sleepSchedule',
        'cleanliness', 'visitorPolicy', 'items', 'pets', 'allergies',
        'campusSelection', 'socialBattery', 'hobbies', 'currentClasses',
        'studyGoals', 'honors', 'studyLocation', 'studyTimes', 'idealGroupSize',
        'virtualOrInPerson', 'studyHabits', 'studyStyle'
      ];

      // Check if user has any survey data
      const hasSurveyData = surveyFields.some(field => user[field] !== null && user[field] !== undefined);

      if (hasSurveyData) {
        try {
          // Create survey object
          const surveyData = {
            userId: user._id
          };

          // Copy survey fields to survey object
          surveyFields.forEach(field => {
            if (user[field] !== null && user[field] !== undefined) {
              surveyData[field] = user[field];
            }
          });

          // Create new survey
          const survey = await Survey.create(surveyData);

          // Update user to reference survey
          await User.findByIdAndUpdate(user._id, { survey: survey._id });

          migratedCount++;
          console.log(`✅ Migrated survey for user: ${user.username} (${migratedCount}/${users.length})`);
        } catch (error) {
          console.error(`❌ Error migrating user ${user.username}:`, error.message);
        }
      } else {
        console.log(`⏭️  Skipped user ${user.username} (no survey data)`);
      }
    }

    console.log(`\n📊 MIGRATION SUMMARY`);
    console.log(`Total users processed: ${users.length}`);
    console.log(`Surveys created: ${migratedCount}`);
    console.log(`✅ Migration completed successfully!\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrateSurveyData();
