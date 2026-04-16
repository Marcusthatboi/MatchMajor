// backend/routes/productRoutes.js
// DEPRECATED: This file is for reference only
// Main product routes are located at: ../../routes/productRoutes.js
// This file should not be used in the application

const express = require('express');
const router = express.Router();

// Placeholder: All product routes are handled by ../../routes/productRoutes.js
router.get('/', (req, res) => {
  res.status(410).json({
    error: 'This route is deprecated. Use /api/products from the main routes.',
    redirectTo: '/api/products'
  });
});

module.exports = router;
