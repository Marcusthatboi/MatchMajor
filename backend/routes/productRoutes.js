// backend/routes/productRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Product = require('../models/productModel');

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost/chmod-inc', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB:', mongoose.connection.name))
  .catch((err) => console.error('MongoDB connection error:', err));

// Debug logs
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/products route hit');
    const products = await Product.find();
    console.log(`Found ${products.length} products:`, products); // Log the products
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Example route
router.get("/", (req, res) => {
  res.send("Product routes are working!");
});

module.exports = router;
