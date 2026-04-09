// server/scripts/importDatabase.js
// Script to import all MongoDB collections from JSON files

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../../models/User');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const Cart = require('../../models/Cart');

// Import directory
const importDir = path.resolve(__dirname, '../../database-exports');

async function importDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB!');
    console.log(`📤 Importing data from: ${importDir}\n`);

    // Import Users
    console.log('📤 Importing Users...');
    const usersFile = path.join(importDir, 'users.json');
    if (fs.existsSync(usersFile)) {
      const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      await User.deleteMany({}); // Clear existing data
      const insertedUsers = await User.insertMany(usersData, { ordered: false });
      console.log(`✅ Users imported: ${insertedUsers.length} documents\n`);
    } else {
      console.log(`⚠️  Users file not found: ${usersFile}\n`);
    }

    // Import Products
    console.log('📤 Importing Products...');
    const productsFile = path.join(importDir, 'products.json');
    if (fs.existsSync(productsFile)) {
      const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
      await Product.deleteMany({}); // Clear existing data
      const insertedProducts = await Product.insertMany(productsData, { ordered: false });
      console.log(`✅ Products imported: ${insertedProducts.length} documents\n`);
    } else {
      console.log(`⚠️  Products file not found: ${productsFile}\n`);
    }

    // Import Orders
    console.log('📤 Importing Orders...');
    const ordersFile = path.join(importDir, 'orders.json');
    if (fs.existsSync(ordersFile)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
      await Order.deleteMany({}); // Clear existing data
      const insertedOrders = await Order.insertMany(ordersData, { ordered: false });
      console.log(`✅ Orders imported: ${insertedOrders.length} documents\n`);
    } else {
      console.log(`⚠️  Orders file not found: ${ordersFile}\n`);
    }

    // Import Carts
    console.log('📤 Importing Carts...');
    const cartsFile = path.join(importDir, 'carts.json');
    if (fs.existsSync(cartsFile)) {
      const cartsData = JSON.parse(fs.readFileSync(cartsFile, 'utf-8'));
      await Cart.deleteMany({}); // Clear existing data
      const insertedCarts = await Cart.insertMany(cartsData, { ordered: false });
      console.log(`✅ Carts imported: ${insertedCarts.length} documents\n`);
    } else {
      console.log(`⚠️  Carts file not found: ${cartsFile}\n`);
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ All data imported successfully!');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importDatabase();
