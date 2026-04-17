const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 * Establishes connection to MongoDB with optimized settings
 */
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('? Using existing MongoDB connection');
      return mongoose.connection;
    }

    console.log('?? MongoDB: Connecting to', process.env.MONGODB_URI);        

    const mongooseOptions = {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 15000,
      family: 4,
      bufferCommands: true,
      autoCreate: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true
      // useNewUrlParser and useUnifiedTopology removed for Mongoose 6+ compatibility
    };

    console.log('?? MongoDB: Calling mongoose.connect()...');
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

    // Add stabilization delay
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('? MongoDB: Connected (readyState=' + mongoose.connection.readyState + ')');

    // Verify with ping
    console.log('?? MongoDB: Testing connection with admin.ping()...');       
    const pingResult = await mongoose.connection.db.admin().ping();
    console.log('? MongoDB: Ping successful:', pingResult);
    console.log('? MongoDB connection is fully operational');

    // Final stability check
    console.log('?? Final readyState check:', mongoose.connection.readyState);
    // Test an actual query to verify connection works for models
    console.log('📡 Testing model query capability...');
    try {
      const testCollection = mongoose.connection.collection('users');
      const testResult = await testCollection.findOne({});
      console.log('✅ Model query test passed (found:', testResult ? 'document' : 'no documents', ')');
    } catch (queryErr) {
      console.error('⚠️  Model query test failed:', queryErr.message);
      // Continue anyway - test might fail if collection is empty
    }
    return mongoose.connection;
  } catch (error) {
    console.error('? MongoDB Connection Failed:', error.message);
    throw error;
  }
};

const getConnectionStatus = () => {
  return mongoose.connection.readyState;
};

module.exports = connectDB;
module.exports.getConnectionStatus = getConnectionStatus;
