# API Routes, Error Handling & Validation Guide

## Overview

This guide documents the MatchMajor REST API with comprehensive error handling and request validation. The API follows RESTful conventions and includes centralized error handling with standardized error responses.

---

## Table of Contents

1. [Error Handling](#error-handling)
2. [Response Format](#response-format)
3. [Validation](#validation)
4. [Authentication](#authentication)
5. [API Endpoints](#api-endpoints)
6. [Error Codes](#error-codes)

---

## Error Handling

### Error Handling Architecture

The application uses a comprehensive error handling system with three layers:

1. **Custom AppError Class** (`server/utils/AppError.js`)
   - All application errors inherit from this class
   - Includes HTTP status codes and error codes
   - Timestamps for debugging

2. **Global Error Handler** (`server/middleware/errorHandler.js`)
   - Catches all errors thrown in route handlers
   - Handles MongoDB validation errors
   - Handles JWT authentication errors
   - Logs errors with context

3. **Async Error Wrapper** (`server/middleware/validationMiddleware.js`)
   - Wraps async route handlers
   - Automatically catches promise rejections

### Using AppError in Controllers

```javascript
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/validationMiddleware');

// In a route handler
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  
  res.json({ success: true, data: product });
});
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed: Email is required",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

### Error Response Fields

- **success**: Boolean (false for errors)
- **statusCode**: HTTP status code
- **errorCode**: Machine-readable error identifier
- **message**: Human-readable error description
- **timestamp**: ISO timestamp when error occurred
- **stack** (development only): Full stack trace

---

## Validation

### Validation System

The application uses **Joi** for schema validation with three layers:

1. **Request Body Validation** - Uses Joi schemas defined in `server/utils/schemas.js`
2. **Field Validators** - Utility functions in `server/utils/validators.js`
3. **Model Validation** - Mongoose schema validation

### Using Joi Schema Validation

```javascript
const { validate } = require('../middleware/validationMiddleware');
const { createProductSchema } = require('../utils/schemas');

// In route file
router.post('/products', validate(createProductSchema), productController.create);
```

### Using Field Validators

```javascript
const { validateEmail, validatePassword, validateObjectId } = require('../utils/validators');

// In controller
exports.register = asyncHandler(async (req, res) => {
  const email = validateEmail(req.body.email);
  const password = validatePassword(req.body.password);
  
  // Rest of logic...
});
```

### Available Validators

- `validateEmail(email)` - Validates email format
- `validatePassword(password)` - Password must be 6-128 characters
- `validateUsername(username)` - 3-50 alphanumeric characters, underscores, hyphens
- `validateObjectId(id, fieldName)` - Validates MongoDB ObjectId format
- `validateRequiredFields(data, fields)` - Checks required fields exist
- `validatePagination(page, limit)` - Validates pagination parameters
- `validateStringLength(str, min, max, fieldName)` - Validates string length
- `validateEnum(value, allowedValues, fieldName)` - Validates enum values
- `validateNumberRange(value, min, max, fieldName)` - Validates number range
- `validateUrl(url, fieldName)` - Validates URL format

### Creating Custom Validators

```javascript
// Add to server/utils/validators.js
const validateMajor = (major) => {
  if (!major) {
    throw new AppError('Major is required', 400, 'MAJOR_REQUIRED');
  }
  
  const allowedMajors = ['CS', 'Math', 'Physics', 'Biology'];
  if (!allowedMajors.includes(major)) {
    throw new AppError(
      `Major must be one of: ${allowedMajors.join(', ')}`,
      400,
      'INVALID_MAJOR'
    );
  }
  
  return major;
};
```

---

## Authentication

### Protected Routes

All authenticated routes require a valid JWT token in the `token` cookie.

```javascript
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Requires authentication
router.get('/profile', protect, controller.getProfile);

// Requires authentication AND admin role
router.delete('/user/:id', protect, restrictTo('admin'), controller.deleteUser);
```

### Token Management

- **Token Lifetime**: 7 days
- **Storage**: HTTPOnly secure cookie
- **Format**: JWT with issuer verification

### Authentication Errors

| Error Code | Message | Action |
|-----------|---------|--------|
| NO_TOKEN_PROVIDED | Not authorized to access this route | Login required |
| INVALID_TOKEN | Invalid token format | Re-authenticate |
| TOKEN_EXPIRED | Token has expired | Refresh token (implement refresh flow) |
| USER_NOT_FOUND | User associated with token no longer exists | Re-authenticate |

---

## API Endpoints

### Authentication Routes
**Base URL**: `/api/auth`

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 201 Created
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGc..."
}
```

**Validation Rules**:
- Username: 3-50 alphanumeric characters
- Email: Valid email format
- Password: 6-128 characters
- Username & Email must be unique

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer [token in cookie]

Response: 200 OK
{
  "success": true,
  "user": { ... }
}
```

#### Logout
```
POST /api/auth/logout

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Product Routes
**Base URL**: `/api/products`

#### Get All Products
```
GET /api/products?category=textbooks&page=1&limit=10

Response: 200 OK
{
  "success": true,
  "count": 10,
  "data": [ ... ]
}
```

#### Get Single Product
```
GET /api/products/:id

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

**Error**: 404 if product not found

#### Create Product (Admin)
```
POST /api/products
Authorization: Bearer [admin token]
Content-Type: application/json

{
  "name": "Calculus Textbook",
  "description": "Advanced calculus for engineering students",
  "price": 89.99,
  "category": "textbooks",
  "image": "https://example.com/image.jpg",
  "stock": 50
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

**Validation**:
- Name: 3-100 characters (required)
- Price: Positive number (required)
- Stock: Non-negative integer
- Category: Required

#### Update Product (Admin)
```
PUT /api/products/:id
Authorization: Bearer [admin token]

{
  "price": 79.99,
  "stock": 45
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Delete Product (Admin)
```
DELETE /api/products/:id
Authorization: Bearer [admin token]

Response: 200 OK
{
  "success": true,
  "message": "Product deleted"
}
```

### Cart Routes
**Base URL**: `/api/cart`
*All routes require authentication*

#### Get Cart
```
GET /api/cart
Authorization: Bearer [token]

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "...",
    "items": [ ... ],
    "total": 249.97
  }
}
```

#### Add to Cart
```
POST /api/cart/add
Authorization: Bearer [token]

{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

**Validation**:
- productId: Valid MongoDB ID (required)
- quantity: 1-1000 (required)

#### Update Cart Item
```
PUT /api/cart/update
Authorization: Bearer [token]

{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 3
}

Response: 200 OK
```

#### Remove from Cart
```
DELETE /api/cart/item/:productId
Authorization: Bearer [token]

Response: 200 OK
```

#### Clear Cart
```
DELETE /api/cart/clear
Authorization: Bearer [token]

Response: 200 OK
```

### Order Routes
**Base URL**: `/api/orders`
*All routes require authentication*

#### Create Order
```
POST /api/orders
Authorization: Bearer [token]

{
  "street": "123 Main St",
  "city": "Glassboro",
  "state": "NJ",
  "zipCode": "08028",
  "country": "USA",
  "paymentMethod": "creditCard"
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

**Validation**:
- All fields required
- zipCode: Must match format (xxxxx or xxxxx-xxxx)
- paymentMethod: creditCard | debitCard | paypal | bankTransfer

#### Get User Orders
```
GET /api/orders/myorders
Authorization: Bearer [token]

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Get Order by ID
```
GET /api/orders/:id
Authorization: Bearer [token]

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Update Order Status (Admin)
```
PUT /api/orders/:id/status
Authorization: Bearer [admin token]

{
  "status": "shipped"
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

**Valid Status Values**: pending | processing | shipped | delivered | cancelled

### Match Routes
**Base URL**: `/api/matches`
*All routes require authentication*

#### Get Match Recommendations
```
GET /api/matches
Authorization: Bearer [token]

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "username": "jane_doe",
      "major": "Computer Science",
      "compatibilityScore": 85
    }
  ]
}
```

#### Get User Profile
```
GET /api/matches/:userId
Authorization: Bearer [token]

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Update User Profile
```
PUT /api/matches/profile
Authorization: Bearer [token]

{
  "major": "Computer Science",
  "year": "junior",
  "interests": ["machine learning", "web development"]
}

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

### Survey Routes
**Base URL**: `/api/survey`
*All routes require authentication*

#### Create/Update Survey
```
POST /api/survey
Authorization: Bearer [token]

{
  "major": "Computer Science",
  "year": "junior",
  "interests": ["AI", "Web Dev"],
  "goals": "Looking for study partners",
  "studyStyle": "collaborative"
}

Response: 201/200 Created/OK
{
  "success": true,
  "data": { ... }
}
```

#### Get Current User Survey
```
GET /api/survey
Authorization: Bearer [token]

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Get Specific User Survey
```
GET /api/survey/:userId
Authorization: Bearer [token]

Response: 200 OK
{
  "success": true,
  "data": { ... }
}
```

#### Delete Survey
```
DELETE /api/survey
Authorization: Bearer [token]

Response: 200 OK
{
  "success": true,
  "message": "Survey deleted"
}
```

### Chat Routes
**Base URL**: `/api/chatrooms`
*All routes require authentication*

#### Get All Chatrooms
```
GET /api/chatrooms

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Create Chatroom
```
POST /api/chatrooms

{
  "name": "CS202 Study Group",
  "description": "Discussion for Data Structures course"
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

#### Join Chatroom
```
POST /api/chatrooms/join

{
  "chatroomId": "507f1f77bcf86cd799439011"
}

Response: 200 OK
```

#### Leave Chatroom
```
POST /api/chatrooms/leave

{
  "chatroomId": "507f1f77bcf86cd799439011"
}

Response: 200 OK
```

### Message Routes
**Base URL**: `/api/messages`
*All routes require authentication*

#### Get Messages
```
GET /api/messages/:chatroomId?limit=50

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Send Message
```
POST /api/messages

{
  "chatroomId": "507f1f77bcf86cd799439011",
  "text": "Does anyone want to study together?"
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

**Validation**:
- text: 1-5000 characters (required)
- chatroomId: Valid MongoDB ID (required)

#### Delete Message
```
DELETE /api/messages/:messageId

Response: 200 OK
```

### Post Routes
**Base URL**: `/api/posts`
*All routes require authentication*

#### Get Posts
```
GET /api/posts/:chatroomId?limit=20

Response: 200 OK
{
  "success": true,
  "data": [ ... ]
}
```

#### Create Post
```
POST /api/posts

{
  "content": "Just finished Chapter 5! Who else is reading it?",
  "chatroomId": "507f1f77bcf86cd799439011"
}

Response: 201 Created
{
  "success": true,
  "data": { ... }
}
```

**Validation**:
- content: 1-5000 characters (required)

#### Like Post
```
PUT /api/posts/:postId/like

Response: 200 OK
```

#### Add Comment
```
POST /api/posts/:postId/comment

{
  "content": "Great point!"
}

Response: 201 Created
```

#### Delete Post
```
DELETE /api/posts/:postId

Response: 200 OK
```

---

## Error Codes

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET, PUT, POST |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Invalid input or validation failed |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (e.g., email already exists) |
| 415 | Unsupported Media Type | Wrong Content-Type header |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Application Error Codes

| Error Code | HTTP Status | Meaning |
|-----------|------------|---------|
| VALIDATION_ERROR | 400 | Request data validation failed |
| MISSING_REQUIRED_FIELDS | 400 | Required fields missing |
| INVALID_EMAIL | 400 | Invalid email format |
| EMAIL_ALREADY_EXISTS | 409 | Email already registered |
| PASSWORD_TOO_SHORT | 400 | Password less than 6 characters |
| INVALID_TOKEN | 401 | JWT token malformed |
| TOKEN_EXPIRED | 401 | JWT token expired |
| NO_TOKEN_PROVIDED | 401 | Missing authentication token |
| INSUFFICIENT_PERMISSIONS | 403 | User lacks required role |
| PRODUCT_NOT_FOUND | 404 | Product doesn't exist |
| USER_NOT_FOUND | 404 | User doesn't exist |
| ORDER_NOT_FOUND | 404 | Order doesn't exist |
| ROUTE_NOT_FOUND | 404 | API endpoint doesn't exist |
| DUPLICATE_FIELD | 409 | Unique field already exists in database |
| INVALID_ID_FORMAT | 400 | MongoDB ID format invalid |
| INTERNAL_SERVER_ERROR | 500 | Unexpected server error |

---

## Best Practices

### 1. Always Use Async Handlers
```javascript
// ✓ Good - uses asyncHandler wrapper
const getUser = asyncHandler(async (req, res) => {
  // Errors are automatically caught
});

// ✗ Bad - errors might not be caught
const getUser = async (req, res, next) => {
  // Must manually call next(error)
};
```

### 2. Throw AppError Instead of Responding
```javascript
// ✓ Good - consistent error handling
throw new AppError('Invalid product ID', 400, 'INVALID_PRODUCT_ID');

// ✗ Bad - inconsistent error format
return res.status(400).json({ message: 'Invalid product ID' });
```

### 3. Validate Input at the Middleware Level
```javascript
// ✓ Good - validation happens before controller
router.post('/products', validate(createProductSchema), controller.create);

// ✗ Bad - validation in controller adds complexity
router.post('/products', controller.create);
```

### 4. Use Consistent Response Format
```javascript
// ✓ Good - consistent structure
res.status(201).json({
  success: true,
  data: { ... }
});

// ✗ Inconsistent
res.status(201).json(product);
```

### 5. Check Authentication Before Authorization
```javascript
// ✓ Good - protect runs first, then restrictTo
router.delete('/user/:id', protect, restrictTo('admin'), controller.delete);

// ✗ Bad - wrong order
router.delete('/user/:id', restrictTo('admin'), protect, controller.delete);
```

---

## Integration Checklist

- [x] Create `server/utils/AppError.js`
- [x] Create `server/middleware/errorHandler.js`
- [x] Create `server/utils/validators.js`
- [x] Create `server/utils/schemas.js`
- [x] Create `server/middleware/validationMiddleware.js`
- [x] Update `server/server.js` with error handler
- [x] Update `server/middleware/authMiddleware.js`
- [ ] Update auth controller to use asyncHandler
- [ ] Update product controller to use asyncHandler and validators
- [ ] Update cart controller to use asyncHandler and validators
- [ ] Update order controller to use asyncHandler and validators
- [ ] Update match controller to use asyncHandler and validators
- [ ] Update survey controller to use asyncHandler and validators
- [ ] Update chat/message controller to use asyncHandler and validators
- [ ] Update post controller to use asyncHandler and validators
- [ ] Add Joi to package.json dependencies: `npm install joi`

---

## Next Steps

1. **Install Joi**: `npm install joi`
2. **Update Controllers**: Wrap all handlers with `asyncHandler` and use validation middleware
3. **Test Error Cases**: Verify all error codes and messages are correct
4. **Add API Tests**: Create test suite for all endpoints
5. **Monitor Logs**: Use error logs to identify issues in production

---

## Questions or Issues?

Refer to:
- [Error Handling Examples](./API_ERROR_HANDLING.md) - Detailed error handling patterns
- [Validation Examples](./API_VALIDATION.md) - How to validate different field types
- [Test Cases](../tests/api/) - Example test cases for all endpoints
