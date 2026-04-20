// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController_enhanced');
const { protect, restrictTo, validateCSRFToken, checkResourceOwnership } = require('../server/middleware/authMiddleware_enhanced');

// === ALL ORDER ROUTES REQUIRE AUTHENTICATION ===
router.use(protect);

// === USER ROUTES ===
router.post('/', validateCSRFToken, createOrder);
router.get('/', getUserOrders);
router.get('/:orderId', getOrder);
router.post('/:orderId/cancel', validateCSRFToken, checkResourceOwnership('user'), cancelOrder);

// === ADMIN ROUTES ===
router.put('/:orderId/status', restrictTo('admin'), validateCSRFToken, updateOrderStatus);

module.exports = router;
