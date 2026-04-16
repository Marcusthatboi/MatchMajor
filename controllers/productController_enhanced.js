// server/controllers/productController_enhanced.js
/**
 * Product Controller with comprehensive edge case handling
 */

const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const ERROR_CODES = require('../utils/errorCodes');
const {
  validateMongoId,
  validateRequiredFields,
  validateStringLength,
  validatePrice,
  validateEnum,
  sanitizeText
} = require('../utils/inputValidation');

/**
 * Get all products with filtering, sorting, and pagination
 * GET /api/products?category=textbooks&page=1&limit=10&sort=-price
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10, sort = '-createdAt', search } = req.query;

  // === VALIDATE PAGINATION ===
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10)); // Max 100 items per page
  const skip = (pageNum - 1) * limitNum;

  // === BUILD FILTER ===
  const filter = { inStock: true };

  // Add category filter if provided
  if (category) {
    const validCategories = ['textbooks', 'supplies', 'housing', 'services', 'other'];
    if (!validCategories.includes(category)) {
      const error = ERROR_CODES.INVALID_CATEGORY;
      throw new AppError(error.message, error.status, 'INVALID_CATEGORY');
    }
    filter.category = category;
  }

  // Add search filter if provided
  if (search && search.trim()) {
    filter.$text = { $search: sanitizeText(search) };
  }

  // === FETCH PRODUCTS ===
  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean();

  // === FETCH TOTAL COUNT ===
  const total = await Product.countDocuments(filter);
  const pages = Math.ceil(total / limitNum);

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: products,
    pagination: {
      current: pageNum,
      total: pages,
      perPage: limitNum,
      totalItems: total
    }
  });
});

/**
 * Get single product by ID with validation
 * GET /api/products/:id
 */
exports.getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // === VALIDATE ID ===
  validateMongoId(id, 'Product ID');

  // === FETCH PRODUCT ===
  const product = await Product.findById(id).populate('seller', 'username email');

  if (!product) {
    const error = ERROR_CODES.PRODUCT_NOT_FOUND;
    throw new AppError(error.message, error.status, 'PRODUCT_NOT_FOUND');
  }

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: product
  });
});

/**
 * Create product with comprehensive validation (admin only)
 * POST /api/products
 */
exports.createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, image, features } = req.body;

  // === INPUT VALIDATION ===
  validateRequiredFields(
    { name, description, price, category, stock },
    ['name', 'description', 'price', 'category', 'stock']
  );

  // Validate field lengths and formats
  validateStringLength(name, 3, 100, 'Product name');
  validateStringLength(description, 10, 1000, 'Product description');
  validatePrice(price);
  validateEnum(category, ['textbooks', 'supplies', 'housing', 'services', 'other'], 'Category');

  const stockNum = parseInt(stock);
  if (!Number.isInteger(stockNum) || stockNum < 0) {
    const error = ERROR_CODES.INVALID_QUANTITY;
    throw new AppError('Stock must be a non-negative integer', error.status, 'INVALID_STOCK');
  }

  // === VALIDATE OPTIONAL FIELDS ===
  if (image) {
    validateStringLength(image, 1, 500, 'Image URL');
  }

  if (features && Array.isArray(features)) {
    if (features.length > 20) {
      const error = ERROR_CODES.ARRAY_EMPTY;
      throw new AppError('Maximum 20 features allowed', error.status, 'TOO_MANY_FEATURES');
    }
    // Validate each feature
    features.forEach((f, idx) => {
      validateStringLength(f, 1, 50, `Feature ${idx + 1}`);
    });
  }

  // === CREATE PRODUCT ===
  const product = await Product.create({
    name: sanitizeText(name),
    description: sanitizeText(description),
    price: validatePrice(price),
    category,
    stock: stockNum,
    image,
    features: features || [],
    seller: req.user._id
  });

  // === RETURN RESPONSE ===
  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Product created successfully',
    data: product
  });
});

/**
 * Update product with validation (admin/seller only)
 * PUT /api/products/:id
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // === VALIDATE ID ===
  validateMongoId(id, 'Product ID');

  // === FIND PRODUCT ===
  const product = await Product.findById(id);

  if (!product) {
    const error = ERROR_CODES.PRODUCT_NOT_FOUND;
    throw new AppError(error.message, error.status, 'PRODUCT_NOT_FOUND');
  }

  // === CHECK AUTHORIZATION ===
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === VALIDATE UPDATES ===
  const allowedUpdates = ['name', 'description', 'price', 'category', 'stock', 'image', 'features'];
  const updateKeys = Object.keys(updates);
  const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));

  if (!isValidUpdate) {
    const error = ERROR_CODES.MISSING_FIELDS;
    throw new AppError('Invalid update fields', error.status, 'INVALID_FIELDS');
  }

  // === VALIDATE FIELD VALUES ===
  if (updates.name) {
    validateStringLength(updates.name, 3, 100, 'Product name');
    product.name = sanitizeText(updates.name);
  }

  if (updates.description) {
    validateStringLength(updates.description, 10, 1000, 'Product description');
    product.description = sanitizeText(updates.description);
  }

  if (updates.price !== undefined) {
    product.price = validatePrice(updates.price);
  }

  if (updates.category) {
    validateEnum(updates.category, ['textbooks', 'supplies', 'housing', 'services', 'other']);
    product.category = updates.category;
  }

  if (updates.stock !== undefined) {
    const stockNum = parseInt(updates.stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      const error = ERROR_CODES.INVALID_QUANTITY;
      throw new AppError('Stock must be non-negative integer', error.status, 'INVALID_STOCK');
    }
    product.stock = stockNum;
  }

  if (updates.image) {
    validateStringLength(updates.image, 1, 500, 'Image URL');
    product.image = updates.image;
  }

  if (updates.features && Array.isArray(updates.features)) {
    if (updates.features.length > 20) {
      const error = ERROR_CODES.ARRAY_EMPTY;
      throw new AppError('Maximum 20 features allowed', error.status, 'TOO_MANY_FEATURES');
    }
    product.features = updates.features;
  }

  // === SAVE CHANGES ===
  await product.save();

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Product updated successfully',
    data: product
  });
});

/**
 * Delete product (admin/seller only)
 * DELETE /api/products/:id
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // === VALIDATE ID ===
  validateMongoId(id, 'Product ID');

  // === FIND PRODUCT ===
  const product = await Product.findById(id);

  if (!product) {
    const error = ERROR_CODES.PRODUCT_NOT_FOUND;
    throw new AppError(error.message, error.status, 'PRODUCT_NOT_FOUND');
  }

  // === CHECK AUTHORIZATION ===
  if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const error = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
    throw new AppError(error.message, error.status, 'INSUFFICIENT_PERMISSIONS');
  }

  // === DELETE PRODUCT ===
  await Product.findByIdAndDelete(id);

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Product deleted successfully'
  });
});

/**
 * Search products
 * GET /api/products/search?q=calculus
 */
exports.searchProducts = asyncHandler(async (req, res) => {
  const { q, category, maxPrice, minPrice, page = 1, limit = 10 } = req.query;

  if (!q || !q.trim()) {
    const error = ERROR_CODES.MISSING_FIELDS;
    throw new AppError('Search query is required', error.status, 'MISSING_SEARCH_QUERY');
  }

  // === BUILD FILTER ===
  const filter = { $text: { $search: sanitizeText(q) } };

  if (category) {
    validateEnum(category, ['textbooks', 'supplies', 'housing', 'services', 'other']);
    filter.category = category;
  }

  if (minPrice) {
    filter.price = { $gte: validatePrice(minPrice) };
  }

  if (maxPrice) {
    filter.price = { ...filter.price, $lte: validatePrice(maxPrice) };
  }

  // === PAGINATION ===
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  // === SEARCH ===
  const products = await Product.find(filter)
    .select({ score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await Product.countDocuments(filter);
  const pages = Math.ceil(total / limitNum);

  // === RETURN RESPONSE ===
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: products,
    pagination: {
      current: pageNum,
      total: pages,
      perPage: limitNum,
      totalItems: total
    }
  });
});

module.exports = exports;
