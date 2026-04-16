// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct,
  deleteProduct
} = require('../controllers/productController_enhanced');
const { protect, restrictTo, validateCSRFToken } = require('../middleware/authMiddleware_enhanced');

// === PUBLIC ROUTES (read-only) ===
router.get('/', getProducts);
router.get('/:id', getProduct);

// === PROTECTED ROUTES (admin only) ===
router.post('/', protect, restrictTo('admin'), validateCSRFToken, createProduct);
router.put('/:id', protect, restrictTo('admin'), validateCSRFToken, updateProduct);
router.delete('/:id', protect, restrictTo('admin'), validateCSRFToken, deleteProduct);

module.exports = router;