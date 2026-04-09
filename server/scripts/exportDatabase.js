// server/scripts/exportDatabase.js
// Script to export all MongoDB collections to JSON files

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

// Export directory
const exportDir = path.resolve(__dirname, '../../database-exports');

// Ensure export directory exists
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

async function exportDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000
    });
    
    console.log('✅ Connected to MongoDB!');
    console.log(`📦 Exporting data to: ${exportDir}\n`);

    // Export Users
    console.log('📥 Exporting Users...');
    const users = await User.find({});
    const usersFile = path.join(exportDir, 'users.json');
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log(`✅ Users exported: ${users.length} documents`);
    console.log(`   File: ${usersFile}\n`);

    // Export Products
    console.log('📥 Exporting Products...');
    const products = await Product.find({});
    const productsFile = path.join(exportDir, 'products.json');
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    console.log(`✅ Products exported: ${products.length} documents`);
    console.log(`   File: ${productsFile}\n`);

    // Export Orders
    console.log('📥 Exporting Orders...');
    const orders = await Order.find({});
    const ordersFile = path.join(exportDir, 'orders.json');
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    console.log(`✅ Orders exported: ${orders.length} documents`);
    console.log(`   File: ${ordersFile}\n`);

    // Export Carts
    console.log('📥 Exporting Carts...');
    const carts = await Cart.find({});
    const cartsFile = path.join(exportDir, 'carts.json');
    fs.writeFileSync(cartsFile, JSON.stringify(carts, null, 2));
    console.log(`✅ Carts exported: ${carts.length} documents`);
    console.log(`   File: ${cartsFile}\n`);

    // Create summary file
    const summary = {
      exportDate: new Date().toISOString(),
      database: process.env.MONGODB_URI,
      collections: {
        users: users.length,
        products: products.length,
        orders: orders.length,
        carts: carts.length,
        total: users.length + products.length + orders.length + carts.length
      },
      files: {
        users: 'users.json',
        products: 'products.json',
        orders: 'orders.json',
        carts: 'carts.json'
      }
    };

    const summaryFile = path.join(exportDir, 'EXPORT_SUMMARY.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

    console.log('═══════════════════════════════════════');
    console.log('📊 EXPORT SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`Users:    ${users.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Orders:   ${orders.length}`);
    console.log(`Carts:    ${carts.length}`);
    console.log(`─────────────────────────────────────`);
    console.log(`TOTAL:    ${summary.collections.total} documents`);
    console.log(`Export Date: ${new Date().toLocaleString()}`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('✅ All data exported successfully!');
    console.log(`📁 Location: ${exportDir}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

exportDatabase();
