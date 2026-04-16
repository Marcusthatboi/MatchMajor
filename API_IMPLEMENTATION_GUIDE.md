# Implementation Guide: Updating Controllers with Error Handling & Validation

This guide shows how to update existing controllers to use the new error handling, validation, and async handler system.

## Overview

Each controller should follow this pattern:

1. Import required utilities
2. Wrap async handlers with `asyncHandler`
3. Use `AppError` for error responses
4. Validate input using validators or schemas
5. Return consistent response format

---

## Step 1: Update Auth Controller

### File: `server/controllers/authController.js`

```javascript
// server/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/validationMiddleware');
const {
  validateEmail,
  validatePassword,
  validateUsername
} = require('../utils/validators');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { 
      id,
      iat: Math.floor(Date.now() / 1000)
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: '7d',
      issuer: 'matchmajor-app'
    }
  );
};

// Register user
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validate input
  const validatedUsername = validateUsername(username);
  const validatedEmail = validateEmail(email);
  const validatedPassword = validatePassword(password);
  
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: validatedEmail }, { username: validatedUsername }]
  });
  
  if (existingUser) {
    throw new AppError(
      'User already exists with that email or username',
      409,
      'USER_ALREADY_EXISTS'
    );
  }
  
  // Create new user
  const user = await User.create({
    username: validatedUsername,
    email: validatedEmail,
    password: validatedPassword
  });
  
  // Generate token
  const token = generateToken(user._id);
  
  // Set secure cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
  
  res.status(201).json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    token
  });
});

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  const validatedEmail = validateEmail(email);
  
  if (!password) {
    throw new AppError('Password is required', 400, 'PASSWORD_REQUIRED');
  }
  
  // Find user
  const user = await User.findOne({
    $or: [{ email: validatedEmail }, { username: validatedEmail }]
  });
  
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  
  // Compare password
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  
  // Generate token
  const token = generateToken(user._id);
  
  // Set secure cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
  });
  
  res.status(200).json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    token
  });
});

// Logout user
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get current user
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    user
  });
});
```

### Update Route File: `server/routes/authRoutes.js`

```javascript
// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getCurrentUser 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../utils/schemas');

// Validation middleware applied to routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getCurrentUser);

module.exports = router;
```

---

## Step 2: Update Product Controller

### File: `server/controllers/productController.js`

```javascript
// server/controllers/productController.js
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/validationMiddleware');
const { validateObjectId, validatePagination } = require('../utils/validators');

// Get all products
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  
  // Validate pagination
  const { skip, limit: validatedLimit } = validatePagination(page, limit);
  
  // Build filter
  const filter = category ? { category } : {};
  
  // Query with pagination
  const products = await Product.find(filter)
    .skip(skip)
    .limit(validatedLimit)
    .sort({ createdAt: -1 });
  
  const total = await Product.countDocuments(filter);
  
  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / validatedLimit),
    data: products
  });
});

// Get single product
exports.getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ID
  validateObjectId(id, 'Product ID');
  
  const product = await Product.findById(id);
  
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// Create product (admin only)
exports.createProduct = asyncHandler(async (req, res) => {
  // Validation is handled by middleware
  const product = await Product.create(req.body);
  
  res.status(201).json({
    success: true,
    data: product
  });
});

// Update product (admin only)
exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ID
  validateObjectId(id, 'Product ID');
  
  if (Object.keys(req.body).length === 0) {
    throw new AppError(
      'At least one field must be provided for update',
      400,
      'EMPTY_UPDATE'
    );
  }
  
  const product = await Product.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    data: product
  });
});

// Delete product (admin only)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Validate ID
  validateObjectId(id, 'Product ID');
  
  const product = await Product.findByIdAndDelete(id);
  
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
    data: product
  });
});
```

### Update Route File: `server/routes/productRoutes.js`

```javascript
// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { 
  createProductSchema, 
  updateProductSchema 
} = require('../utils/schemas');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, restrictTo('admin'), validate(createProductSchema), createProduct);
router.put('/:id', protect, restrictTo('admin'), validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

module.exports = router;
```

---

## Step 3: Update Cart Controller

### File: `server/controllers/cartController.js`

```javascript
// server/controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/validationMiddleware');
const { validateObjectId } = require('../utils/validators');

// Get user's cart
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
  
  if (!cart) {
    cart = new Cart({
      userId: req.user._id,
      items: [],
      total: 0
    });
  }
  
  res.status(200).json({
    success: true,
    data: cart
  });
});

// Add item to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  // Validate input
  validateObjectId(productId, 'Product ID');
  
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('Quantity must be a positive integer', 400, 'INVALID_QUANTITY');
  }
  
  // Check if product exists
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  
  if (product.stock < quantity) {
    throw new AppError(
      `Only ${product.stock} items in stock`,
      400,
      'INSUFFICIENT_STOCK'
    );
  }
  
  // Get or create cart
  let cart = await Cart.findOne({ userId: req.user._id });
  
  if (!cart) {
    cart = new Cart({
      userId: req.user._id,
      items: [],
      total: 0
    });
  }
  
  // Check if item already in cart
  const existingItem = cart.items.find(item => item.productId.toString() === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      quantity,
      price: product.price
    });
  }
  
  // Calculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  await cart.save();
  await cart.populate('items.productId');
  
  res.status(201).json({
    success: true,
    message: 'Item added to cart',
    data: cart
  });
});

// Update cart item quantity
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  // Validate input
  validateObjectId(productId, 'Product ID');
  
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('Quantity must be a positive integer', 400, 'INVALID_QUANTITY');
  }
  
  const cart = await Cart.findOne({ userId: req.user._id });
  
  if (!cart) {
    throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
  }
  
  const item = cart.items.find(item => item.productId.toString() === productId);
  
  if (!item) {
    throw new AppError('Item not found in cart', 404, 'ITEM_NOT_IN_CART');
  }
  
  // Check stock
  const product = await Product.findById(productId);
  
  if (product.stock < quantity) {
    throw new AppError(
      `Only ${product.stock} items in stock`,
      400,
      'INSUFFICIENT_STOCK'
    );
  }
  
  item.quantity = quantity;
  
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  await cart.save();
  
  res.status(200).json({
    success: true,
    data: cart
  });
});

// Remove item from cart
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  // Validate input
  validateObjectId(productId, 'Product ID');
  
  const cart = await Cart.findOne({ userId: req.user._id });
  
  if (!cart) {
    throw new AppError('Cart not found', 404, 'CART_NOT_FOUND');
  }
  
  cart.items = cart.items.filter(item => item.productId.toString() !== productId);
  
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  await cart.save();
  
  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    data: cart
  });
});

// Clear cart
exports.clearCart = asyncHandler(async (req, res) => {
  await Cart.updateOne(
    { userId: req.user._id },
    { items: [], total: 0 }
  );
  
  res.status(200).json({
    success: true,
    message: 'Cart cleared'
  });
});
```

---

## Step 4: Pattern for Other Controllers

Apply the same pattern to remaining controllers:

### Template for Any Controller

```javascript
const ModelName = require('../models/ModelName');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/validationMiddleware');
const { validateObjectId } = require('../utils/validators');

exports.handleAction = asyncHandler(async (req, res) => {
  try {
    // 1. Validate input
    const id = validateObjectId(req.params.id, 'Resource ID');
    
    // 2. Query database
    const resource = await ModelName.findById(id);
    
    // 3. Check for errors
    if (!resource) {
      throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
    }
    
    // 4. Return success response
    res.status(200).json({
      success: true,
      data: resource
    });
  } catch (error) {
    // asyncHandler will pass this to error middleware
    throw error;
  }
});
```

---

## Step 5: Installing Dependencies

```bash
# Navigate to server directory
cd server

# Install Joi for schema validation
npm install joi

# Verify installation
npm list joi
```

Update `server/package.json` if needed:

```json
{
  "dependencies": {
    "joi": "^17.11.0"
  }
}
```

---

## Step 6: Testing the New System

### Test Error Handling

```bash
# Test 404 error
curl http://localhost:5000/api/invalid-route

# Response:
{
  "success": false,
  "statusCode": 404,
  "errorCode": "ROUTE_NOT_FOUND",
  "message": "Route GET /api/invalid-route not found",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

### Test Validation Error

```bash
# Test validation with invalid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"invalid-email","password":"password123"}'

# Response:
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed: \"email\" must be a valid email",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

### Test Authentication Error

```bash
# Test without token
curl http://localhost:5000/api/cart

# Response:
{
  "success": false,
  "statusCode": 401,
  "errorCode": "NO_TOKEN_PROVIDED",
  "message": "Not authorized to access this route",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

---

## Checklist for Implementation

- [ ] Update auth controller and routes
- [ ] Update product controller and routes
- [ ] Update cart controller and routes
- [ ] Update order controller and routes
- [ ] Update match controller and routes
- [ ] Update survey controller and routes
- [ ] Update chatroom controller and routes
- [ ] Update message controller and routes
- [ ] Update post controller and routes
- [ ] Install Joi dependency
- [ ] Test all error scenarios
- [ ] Update unit tests for new error format
- [ ] Update API documentation
- [ ] Deploy and monitor error logs

---

## Common Pitfalls to Avoid

1. **Don't forget asyncHandler wrapper**
   ```javascript
   // ✗ Bad - errors won't be caught
   exports.getUser = async (req, res) => { ... };
   
   // ✓ Good
   exports.getUser = asyncHandler(async (req, res) => { ... });
   ```

2. **Don't use res.status().json() for errors**
   ```javascript
   // ✗ Bad - inconsistent error format
   return res.status(404).json({ message: 'Not found' });
   
   // ✓ Good - uses AppError
   throw new AppError('Not found', 404, 'NOT_FOUND');
   ```

3. **Don't forget validation middleware in routes**
   ```javascript
   // ✗ Bad - no validation
   router.post('/products', createProduct);
   
   // ✓ Good - validation applied
   router.post('/products', validate(createProductSchema), createProduct);
   ```

4. **Don't put validation logic in controller**
   ```javascript
   // ✗ Bad - scattered validation
   if (!req.body.email) {
     return res.status(400).json(...);
   }
   
   // ✓ Good - centralized validation
   const email = validateEmail(req.body.email);
   ```

---

## Support

For questions or issues, refer to:
- `API_ROUTES_VALIDATION.md` - Complete API documentation
- `server/utils/AppError.js` - Error class implementation
- `server/utils/validators.js` - Available validators
- `server/utils/schemas.js` - Available Joi schemas
