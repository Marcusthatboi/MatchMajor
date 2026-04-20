// server/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart,
  clearCart 
} = require('../controllers/cartController_enhanced');
const { protect, validateCSRFToken } = require('../server/middleware/authMiddleware_enhanced');

// === ALL CART ROUTES REQUIRE AUTHENTICATION ===
router.use(protect);

router.get('/', getCart);
router.post('/add', validateCSRFToken, addToCart);
router.put('/update', validateCSRFToken, updateCartItem);
router.delete('/item/:productId', validateCSRFToken, removeFromCart);
router.delete('/clear', validateCSRFToken, clearCart);

module.exports = router;
