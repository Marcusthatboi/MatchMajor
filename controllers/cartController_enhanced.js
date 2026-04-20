// server/controllers/cartController_enhanced.js
/**
 * Cart Controller with comprehensive edge case handling
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../server/utils/AppError');
const asyncHandler = require('../server/utils/asyncHandler');
const ERROR_CODES = require('../server/utils/errorCodes');
const {
  validateMongoId,
  validateRequiredFields,
  validateQuantity
} = require('../server/utils/inputValidation');

/**
 * Get user's cart with proper error handling
 * GET /api/cart
 */
exports.getCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === FIND EXISTING CART ===
  let cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name price image category inStock stock'
  });

  // === AUTO-CREATE CART IF NONE EXISTS ===
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      subtotal: 0,
      total: 0,
      tax: 0,
      discount: 0
    });
  }

  // === VALIDATE CART ITEMS (CHECK DELETED PRODUCTS) ===
  const validItems = [];
  for (const item of cart.items) {
    if (!item.product) {
      // Product was deleted, skip it
      continue;
    }
    validItems.push(item);
  }

  // Update cart if any items were removed
  if (validItems.length !== cart.items.length) {
    cart.items = validItems;
    await cart.save();
  }

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: cart
  });
});

/**
 * Add item to cart with stock validation
 * POST /api/cart
 */
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE INPUT ===
  validateRequiredFields({ productId }, ['productId']);
  validateMongoId(productId, 'Product ID');
  const validatedQuantity = validateQuantity(quantity);

  // === FIND PRODUCT ===
  const product = await Product.findById(productId);

  if (!product) {
    const error = ERROR_CODES.PRODUCT_NOT_FOUND;
    throw new AppError(error.message, error.status, 'PRODUCT_NOT_FOUND');
  }

  // === CHECK STOCK ===
  if (!product.inStock || product.stock <= 0) {
    const error = ERROR_CODES.PRODUCT_OUT_OF_STOCK;
    throw new AppError(error.message, error.status, 'PRODUCT_OUT_OF_STOCK');
  }

  if (product.stock < validatedQuantity) {
    const error = ERROR_CODES.INSUFFICIENT_STOCK;
    throw new AppError(
      `Only ${product.stock} items available`,
      error.status,
      'INSUFFICIENT_STOCK'
    );
  }

  // === GET OR CREATE CART ===
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      subtotal: 0,
      total: 0,
      tax: 0,
      discount: 0
    });
  }

  // === ADD OR UPDATE ITEM ===
  try {
    await cart.addItem(productId, product.name, product.price, validatedQuantity);
  } catch (error) {
    throw new AppError(error.message, 400, 'CART_UPDATE_ERROR');
  }

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'name price image'
  });

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Item added to cart',
    data: cart
  });
});

/**
 * Update item quantity in cart
 * PUT /api/cart/:productId
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE INPUT ===
  validateMongoId(productId, 'Product ID');
  validateRequiredFields({ quantity }, ['quantity']);
  const validatedQuantity = validateQuantity(quantity);

  // === GET CART ===
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    const error = ERROR_CODES.CART_NOT_FOUND;
    throw new AppError(error.message, error.status, 'CART_NOT_FOUND');
  }

  // === CHECK ITEM EXISTS ===
  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    const error = ERROR_CODES.ITEM_NOT_IN_CART;
    throw new AppError(error.message, error.status, 'ITEM_NOT_IN_CART');
  }

  // === CHECK STOCK ===
  const product = await Product.findById(productId);

  if (!product) {
    const error = ERROR_CODES.PRODUCT_NOT_FOUND;
    throw new AppError(error.message, error.status, 'PRODUCT_NOT_FOUND');
  }

  if (product.stock < validatedQuantity) {
    const error = ERROR_CODES.INSUFFICIENT_STOCK;
    throw new AppError(
      `Only ${product.stock} items available`,
      error.status,
      'INSUFFICIENT_STOCK'
    );
  }

  // === UPDATE QUANTITY ===
  try {
    await cart.updateItemQuantity(productId, validatedQuantity);
  } catch (error) {
    throw new AppError(error.message, 400, 'QUANTITY_UPDATE_ERROR');
  }

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'name price image'
  });

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Item quantity updated',
    data: cart
  });
});

/**
 * Remove item from cart
 * DELETE /api/cart/:productId
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === VALIDATE ID ===
  validateMongoId(productId, 'Product ID');

  // === GET CART ===
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    const error = ERROR_CODES.CART_NOT_FOUND;
    throw new AppError(error.message, error.status, 'CART_NOT_FOUND');
  }

  // === CHECK ITEM EXISTS ===
  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    const error = ERROR_CODES.ITEM_NOT_IN_CART;
    throw new AppError(error.message, error.status, 'ITEM_NOT_IN_CART');
  }

  // === REMOVE ITEM ===
  try {
    await cart.removeItem(productId);
  } catch (error) {
    throw new AppError(error.message, 400, 'REMOVAL_ERROR');
  }

  await cart.save();
  await cart.populate({
    path: 'items.product',
    select: 'name price image'
  });

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Item removed from cart',
    data: cart
  });
});

/**
 * Clear entire cart
 * DELETE /api/cart
 */
exports.clearCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === GET CART ===
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    const error = ERROR_CODES.CART_NOT_FOUND;
    throw new AppError(error.message, error.status, 'CART_NOT_FOUND');
  }

  // === CLEAR ITEMS ===
  if (cart.items.length === 0) {
    const error = ERROR_CODES.CART_EMPTY;
    throw new AppError(error.message, error.status, 'CART_EMPTY');
  }

  try {
    await cart.clearCart();
  } catch (error) {
    throw new AppError(error.message, 400, 'CLEAR_ERROR');
  }

  await cart.save();

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Cart cleared successfully',
    data: cart
  });
});

/**
 * Get cart summary with calculations
 * GET /api/cart/summary
 */
exports.getCartSummary = asyncHandler(async (req, res) => {
  if (!req.user) {
    const error = ERROR_CODES.NO_TOKEN;
    throw new AppError(error.message, error.status, 'NO_TOKEN');
  }

  // === GET CART ===
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.product',
    select: 'name price image category'
  });

  if (!cart) {
    const error = ERROR_CODES.CART_NOT_FOUND;
    throw new AppError(error.message, error.status, 'CART_NOT_FOUND');
  }

  if (cart.items.length === 0) {
    const error = ERROR_CODES.CART_EMPTY;
    throw new AppError(error.message, error.status, 'CART_EMPTY');
  }

  // === GET SUMMARY ===
  try {
    const summary = cart.getSummary();

    res.status(200).json({
      success: true,
      statusCode: 200,
      data: summary
    });
  } catch (error) {
    throw new AppError('Error calculating cart summary', 500, 'SUMMARY_ERROR');
  }
});

module.exports = exports;
