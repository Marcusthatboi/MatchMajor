const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 * Establishes connection to MongoDB with optimized settings
 */
const connectDB = async () => {
  try {
    const mongooseOptions = {
      // Connection pool settings for performance
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // Timeout settings
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // New URL parser
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Connection monitoring
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB Disconnected');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
    });

    mongoose.connection.on('reconnectFailed', () => {
      console.error('❌ MongoDB Reconnection Failed');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to application termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // Additional error details
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error:', error.message);
    } else if (error.name === 'MongoParseError') {
      console.error('MongoDB Connection String Error:', error.message);
    } else if (error.name === 'MongoAuthenticationError') {
      console.error('MongoDB Authentication Error - Check credentials in .env');
    }
    
    // Exit process only in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    throw error;
  }
};

// Optional: Get connection status
const getConnectionStatus = () => {
  return mongoose.connection.readyState;
};

/**
 * Connection states:
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */

module.exports = connectDB;
module.exports.getConnectionStatus = getConnectionStatus;