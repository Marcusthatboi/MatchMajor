// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require authentication

router.post('/', createOrder);
router.get('/myorders', getUserOrders);
router.get('/:id', getOrderById);

// Admin route
router.put('/:id/status', restrictTo('admin'), updateOrderStatus);

module.exports = router;