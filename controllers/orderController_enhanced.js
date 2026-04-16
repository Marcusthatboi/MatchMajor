// server/controllers/orderController_enhanced.js
/**
 * Order Controller with comprehensive edge case handling
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const ERROR_CODES = require('../utils/errorCodes');
const {
  validateMongoId,
  validateRequiredFields,
  validateEmail,
  validateStringLength,
  validateZipCode,
  validateEnum,
  sanitizeText,
  sanitizeEmail
} = require('../utils/inputValidation');

/**
 * Create order from cart with comprehensive validation
 * POST /api/orders
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE INPUT ===
  validateRequiredFields(
    { shippingAddress, paymentMethod },
    ['shippingAddress', 'paymentMethod']
  );

  // === VALIDATE PAYMENT METHOD ===
  const validPaymentMethods = ['creditCard', 'debitCard', 'paypal', 'bankTransfer'];
  validateEnum(paymentMethod, validPaymentMethods, 'Payment method');

  // === VALIDATE SHIPPING ADDRESS ===
  validateRequiredFields(
    shippingAddress,
    ['street', 'city', 'state', 'zipCode', 'country']
  );

  validateStringLength(shippingAddress.street, 5, 200, 'Street');
  validateStringLength(shippingAddress.city, 2, 100, 'City');
  validateStringLength(shippingAddress.state, 2, 50, 'State');
  validateStringLength(shippingAddress.country, 2, 50, 'Country');
  validateZipCode(shippingAddress.zipCode);

  // === GET CART ===
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart) {
    const error = ERROR_CODES.CART_NOT_FOUND;
    throw new AppError(error.message, error.status, 'CART_NOT_FOUND');
  }

  if (cart.items.length === 0) {
    const error = ERROR_CODES.CART_EMPTY;
    throw new AppError(error.message, error.status, 'CART_EMPTY');
  }

  // === VALIDATE STOCK FOR EACH ITEM ===
  const orderItems = [];
  let totalPrice = 0;

  for (const cartItem of cart.items) {
    const product = cartItem.product;

    // Check if product still exists
    if (!product) {
      throw new AppError(
        `Product in cart no longer exists`,
        404,
        'PRODUCT_DELETED'
      );
    }

    // Check if product is still in stock
    if (!product.inStock || product.stock <= 0) {
      const error = ERROR_CODES.PRODUCT_OUT_OF_STOCK;
      throw new AppError(
        `${product.name} is no longer in stock`,
        error.status,
        'PRODUCT_OUT_OF_STOCK'
      );
    }

    // Check if sufficient stock available
    if (product.stock < cartItem.quantity) {
      const error = ERROR_CODES.INSUFFICIENT_STOCK;
      throw new AppError(
        `${product.name}: only ${product.stock} available, requested ${cartItem.quantity}`,
        error.status,
        'INSUFFICIENT_STOCK'
      );
    }

    // Add to order items
    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity
    });

    totalPrice += product.price * cartItem.quantity;
  }

  // === VALIDATE TOTAL PRICE ===
  if (totalPrice <= 0) {
    const error = ERROR_CODES.INVALID_PRICE;
    throw new AppError('Order total must be greater than 0', error.status, 'INVALID_TOTAL');
  }

  // === REDUCE STOCK FOR ALL PRODUCTS ===
  try {
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      await product.reduceStock(item.quantity);
    }
  } catch (error) {
    throw new AppError(
      'Failed to update inventory. Order not processed.',
      500,
      'INVENTORY_UPDATE_ERROR'
    );
  }

  // === CREATE ORDER ===
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    status: 'pending',
    statusHistory: [{
      status: 'pending',
      timestamp: new Date(),
      notes: 'Order created'
    }]
  });

  // === CLEAR CART ===
  await Cart.findByIdAndDelete(cart._id);

  // === RETURN RESPONSE ===
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Order created successfully',
    data: order
  });
});

/**
 * Get user's orders
 * GET /api/orders
 */
exports.getUserOrders = asyncHandler(async (req, res) => {
  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  const { status, page = 1, limit = 10 } = req.query;

  // === BUILD FILTER ===
  const filter = { user: req.user._id };

  if (status) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    validateEnum(status, validStatuses, 'Status');
    filter.status = status;
  }

  // === PAGINATION ===
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // === FETCH ORDERS ===
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('items.product', 'name image');

  const total = await Order.countDocuments(filter);
  const pages = Math.ceil(total / limitNum);

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: orders,
    pagination: {
      current: pageNum,
      total: pages,
      perPage: limitNum,
      totalItems: total
    }
  });
});

/**
 * Get single order by ID
 * GET /api/orders/:orderId
 */
exports.getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(orderId, 'Order ID');

  // === FETCH ORDER ===
  const order = await Order.findById(orderId).populate('items.product');

  if (!order) {
    const error = ERROR_CODES.ORDER_NOT_FOUND;
    throw new AppError(error.message, error.status, 'ORDER_NOT_FOUND');
  }

  // === CHECK AUTHORIZATION ===
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: order
  });
});

/**
 * Update order status (admin only)
 * PUT /api/orders/:orderId/status
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;

  // === VALIDATE INPUT ===
  validateMongoId(orderId, 'Order ID');
  validateRequiredFields({ status }, ['status']);

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  validateEnum(status, validStatuses, 'Status');

  // === FETCH ORDER ===
  const order = await Order.findById(orderId);

  if (!order) {
    const error = ERROR_CODES.ORDER_NOT_FOUND;
    throw new AppError(error.message, error.status, 'ORDER_NOT_FOUND');
  }

  // === VALIDATE STATUS TRANSITION ===
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: []
  };

  if (!validTransitions[order.status].includes(status)) {
    const error = ERROR_CODES.INVALID_ORDER_STATUS;
    throw new AppError(
      `Cannot change from ${order.status} to ${status}`,
      error.status,
      'INVALID_STATUS_TRANSITION'
    );
  }

  // === HANDLE CANCELLATION ===
  if (status === 'cancelled' && order.status !== 'cancelled') {
    // Return products to stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.increaseStock(item.quantity);
      }
    }
    order.cancelledAt = new Date();
    order.cancellationReason = notes || 'Cancelled by admin';
  }

  // === UPDATE STATUS ===
  try {
    await order.updateStatus(status, notes || 'Status updated');
  } catch (error) {
    throw new AppError(error.message, 400, 'STATUS_UPDATE_ERROR');
  }

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Order status updated successfully',
    data: order
  });
});

/**
 * Cancel order by user
 * POST /api/orders/:orderId/cancel
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(orderId, 'Order ID');

  // === FETCH ORDER ===
  const order = await Order.findById(orderId);

  if (!order) {
    const error = ERROR_CODES.ORDER_NOT_FOUND;
    throw new AppError(error.message, error.status, 'ORDER_NOT_FOUND');
  }

  // === CHECK AUTHORIZATION ===
  if (order.user.toString() !== req.user._id.toString()) {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === CHECK IF CANCELLABLE ===
  const cancellableStatuses = ['pending', 'processing'];
  if (!cancellableStatuses.includes(order.status)) {
    const error = ERROR_CODES.CANNOT_CANCEL_ORDER;
    throw new AppError(
      `Cannot cancel order with status: ${order.status}`,
      error.status,
      'CANNOT_CANCEL_ORDER'
    );
  }

  // === RETURN PRODUCTS TO STOCK ===
  try {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.increaseStock(item.quantity);
      }
    }
  } catch (error) {
    throw new AppError(
      'Failed to process cancellation',
      500,
      'CANCELLATION_ERROR'
    );
  }

  // === UPDATE ORDER ===
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = sanitizeText(reason) || 'Cancelled by user';
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    notes: order.cancellationReason
  });

  await order.save();

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Order cancelled successfully',
    data: order
  });
});

module.exports = exports;
