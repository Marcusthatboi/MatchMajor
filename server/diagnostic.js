// Diagnostic script to test MongoDB connection
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('🔍 DIAGNOSTIC: Testing MongoDB connection...');
console.log('📍 MONGODB_URI:', process.env.MONGODB_URI);

async function diagnose() {
  try {
    console.log('\n--- Step 1: Connect to MongoDB ---');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
      bufferCommands: false,
      autoCreate: true
    });
    console.log('✅ Connected');

    console.log('\n--- Step 2: Check connection state ---');
    console.log('Connection readyState:', mongoose.connection.readyState);
    console.log('(0=disconnected, 1=connected, 2=connecting, 3=disconnecting)');

    console.log('\n--- Step 3: Test admin.ping() ---');
    const pingResult = await mongoose.connection.db.admin().ping();
    console.log('✅ Ping successful:', pingResult);

    console.log('\n--- Step 4: Wait 2 seconds for stabilization ---');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n--- Step 5: Define a test schema ---');
    const testSchema = new mongoose.Schema({
      name: String,
      email: String
    });
    const TestModel = mongoose.model('TestDiagnostic', testSchema);
    console.log('✅ Schema defined and model created');

    console.log('\n--- Step 6: Test insertOne directly on connection ---');
    try {
      const collection = mongoose.connection.collection('test_direct');
      const insertResult = await collection.insertOne({ test: 'direct', timestamp: Date.now() });
      console.log('✅ Direct insert successful:', insertResult.insertedId);
    } catch (directErr) {
      console.error('❌ Direct insert failed:', directErr.message);
    }

    console.log('\n--- Step 7: Test Model.findOne() ---');
    try {
      console.log('Calling TestModel.findOne({})...');
      const result = await TestModel.findOne({}).maxTimeMS(5000);
      console.log('✅ Model.findOne() successful:', result);
    } catch (findErr) {
      console.error('❌ Model.findOne() failed:', findErr.message);
      console.error('Stack:', findErr.stack.split('\n').slice(0, 5).join('\n'));
    }

    console.log('\n--- Step 8: Load User model and test ---');
    try {
      // Try loading the User model
      const User = require('./models/User');
      console.log('✅ User model loaded');
      
      console.log('Calling User.findOne({})...');
      const userResult = await User.findOne({}).maxTimeMS(5000);
      console.log('✅ User.findOne() successful:', userResult);
    } catch (userErr) {
      console.error('❌ User.findOne() failed:', userErr.message);
      console.error('Error code:', userErr.code);
      console.error('Stack:', userErr.stack.split('\n').slice(0, 5).join('\n'));
    }

    console.log('\n--- Step 9: Check collections ---');
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('✅ Collections found:', collections.map(c => c.name));
    } catch (colErr) {
      console.error('❌ listCollections failed:', colErr.message);
    }

    console.log('\n--- ALL TESTS COMPLETE ---');
    
  } catch (error) {
    console.error('❌ FATAL ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  }
}

diagnose();
