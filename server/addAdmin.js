const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchmajor';

async function addAdminUser() {
  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const User = mongoose.model('User', {
      username: String,
      email: String,
      password: String,
      role: String,
      orders: [mongoose.Schema.Types.ObjectId],
      createdAt: Date,
      updatedAt: Date
    });

    const adminUser = new User({
      username: 'admin',
      email: 'admin@matchmajor.com',
      password: hashedPassword,
      role: 'admin',
      orders: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Email: admin@matchmajor.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addAdminUser();