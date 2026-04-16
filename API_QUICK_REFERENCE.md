# API Error Handling & Validation Quick Reference

Quick lookup guide for error handling patterns and validation examples.

## Error Handling Quick Reference

### AppError Usage

```javascript
// Basic error
throw new AppError('Error message', 400, 'ERROR_CODE');

// In route handler
const { asyncHandler } = require('../middleware/validationMiddleware');

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  res.json({ success: true, data: user });
});
```

### Common Error Patterns

| Scenario | Code |
|----------|------|
| Resource not found | `throw new AppError('Resource not found', 404, 'NOT_FOUND');` |
| Validation failed | `throw new AppError('Invalid input', 400, 'VALIDATION_ERROR');` |
| Unauthorized | `throw new AppError('Not authorized', 401, 'UNAUTHORIZED');` |
| Forbidden | `throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');` |
| Duplicate entry | `throw new AppError('Already exists', 409, 'DUPLICATE');` |
| Invalid input | `throw new AppError('Invalid ID format', 400, 'INVALID_FORMAT');` |

### Error Response Examples

**404 Error:**
```json
{
  "success": false,
  "statusCode": 404,
  "errorCode": "USER_NOT_FOUND",
  "message": "User not found",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

**400 Validation Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed: \"email\" must be a valid email",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

**401 Authentication Error:**
```json
{
  "success": false,
  "statusCode": 401,
  "errorCode": "INVALID_TOKEN",
  "message": "Invalid token format",
  "timestamp": "2024-04-16T10:30:00.000Z"
}
```

---

## Validation Quick Reference

### Simple Field Validation

```javascript
const { validateEmail, validatePassword, validateUsername } = require('../utils/validators');

// Email validation
try {
  const email = validateEmail(req.body.email);
} catch (error) {
  // error is AppError with appropriate status and errorCode
}

// Password validation
const password = validatePassword(req.body.password);

// Username validation
const username = validateUsername(req.body.username);
```

### Schema Validation

```javascript
const { validate } = require('../middleware/validationMiddleware');
const { registerSchema } = require('../utils/schemas');

// In route
router.post('/register', validate(registerSchema), controller.register);

// Schema is applied automatically before controller runs
// Invalid requests are rejected with 400 status
```

### Custom Validation

```javascript
const AppError = require('../utils/AppError');

const validateAge = (age) => {
  const numAge = parseInt(age, 10);
  
  if (isNaN(numAge)) {
    throw new AppError('Age must be a number', 400, 'INVALID_AGE');
  }
  
  if (numAge < 18 || numAge > 100) {
    throw new AppError('Age must be between 18 and 100', 400, 'AGE_OUT_OF_RANGE');
  }
  
  return numAge;
};
```

### Field Validators Available

| Validator | Usage | Throws If |
|-----------|-------|-----------|
| `validateEmail()` | Email format | Invalid format or too long |
| `validatePassword()` | Password strength | Too short or long |
| `validateUsername()` | Username format | Wrong length or invalid characters |
| `validateObjectId()` | MongoDB ID | Invalid format |
| `validatePagination()` | Page/limit params | Invalid numbers |
| `validateStringLength()` | String bounds | Outside min/max range |
| `validateEnum()` | Enum values | Value not in list |
| `validateNumberRange()` | Number bounds | Outside min/max range |
| `validateUrl()` | URL format | Invalid URL |

---

## Controller Implementation Template

### Complete Controller Example

```javascript
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/validationMiddleware');
const { validateObjectId } = require('../utils/validators');

// Get one
exports.getOne = asyncHandler(async (req, res) => {
  const id = validateObjectId(req.params.id, 'Resource ID');
  
  const resource = await Resource.findById(id);
  
  if (!resource) {
    throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    data: resource
  });
});

// Get all with pagination
exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: validatedLimit } = validatePagination(page, limit);
  
  const resources = await Resource.find()
    .skip(skip)
    .limit(validatedLimit);
  
  const total = await Resource.countDocuments();
  
  res.status(200).json({
    success: true,
    count: resources.length,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / validatedLimit),
    data: resources
  });
});

// Create
exports.create = asyncHandler(async (req, res) => {
  // Validation via middleware: validate(createSchema)
  
  const resource = await Resource.create(req.body);
  
  res.status(201).json({
    success: true,
    data: resource
  });
});

// Update
exports.update = asyncHandler(async (req, res) => {
  const id = validateObjectId(req.params.id, 'Resource ID');
  
  // Check update not empty
  if (Object.keys(req.body).length === 0) {
    throw new AppError(
      'At least one field must be provided',
      400,
      'EMPTY_UPDATE'
    );
  }
  
  const resource = await Resource.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!resource) {
    throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    data: resource
  });
});

// Delete
exports.delete = asyncHandler(async (req, res) => {
  const id = validateObjectId(req.params.id, 'Resource ID');
  
  const resource = await Resource.findByIdAndDelete(id);
  
  if (!resource) {
    throw new AppError('Resource not found', 404, 'RESOURCE_NOT_FOUND');
  }
  
  res.status(200).json({
    success: true,
    message: 'Resource deleted successfully',
    data: resource
  });
});
```

### Complete Route Example

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/resourceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createSchema, updateSchema } = require('../utils/schemas');

// Public routes
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);

// Protected routes (authenticated users only)
router.post('/', protect, validate(createSchema), controller.create);
router.put('/:id', protect, validate(updateSchema), controller.update);

// Admin only routes
router.delete('/:id', protect, restrictTo('admin'), controller.delete);

module.exports = router;
```

---

## Response Format Guide

### Success Response (200 OK)
```javascript
res.status(200).json({
  success: true,
  data: { ... }
});
```

### Success Response with Metadata
```javascript
res.status(200).json({
  success: true,
  count: 10,
  total: 100,
  page: 1,
  pages: 10,
  data: [ ... ]
});
```

### Created Response (201 Created)
```javascript
res.status(201).json({
  success: true,
  message: 'Resource created successfully',
  data: { ... }
});
```

### No Content Response (204 No Content)
```javascript
res.status(204).send();
```

---

## HTTP Status Codes Quick Reference

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | DELETE successful, no response body |
| 400 | Bad Request | Invalid input/validation failed |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate/conflict (email exists) |
| 415 | Unsupported | Wrong Content-Type |
| 429 | Too Many | Rate limit exceeded |
| 500 | Server Error | Unexpected server error |

---

## Common Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Request validation failed |
| INVALID_EMAIL | 400 | Email format invalid |
| PASSWORD_TOO_SHORT | 400 | Password < 6 chars |
| EMPTY_REQUEST_BODY | 400 | No fields provided |
| INVALID_ID_FORMAT | 400 | Bad MongoDB ID |
| INVALID_TOKEN | 401 | JWT malformed |
| TOKEN_EXPIRED | 401 | JWT expired |
| NO_TOKEN_PROVIDED | 401 | Missing token |
| USER_NOT_FOUND | 404 | User doesn't exist |
| PRODUCT_NOT_FOUND | 404 | Product doesn't exist |
| ROUTE_NOT_FOUND | 404 | API endpoint doesn't exist |
| INSUFFICIENT_PERMISSIONS | 403 | User lacks role |
| DUPLICATE_FIELD | 409 | Unique field exists |
| INTERNAL_SERVER_ERROR | 500 | Unexpected error |

---

## Testing Examples

### Test Successful Request
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Content-Type: application/json"

# Response:
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

### Test Validation Error
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"","price":-10}'

# Response:
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed: name must be a valid string"
}
```

### Test Authentication Error
```bash
curl -X GET http://localhost:5000/api/cart

# Response:
{
  "success": false,
  "statusCode": 401,
  "errorCode": "NO_TOKEN_PROVIDED",
  "message": "Not authorized to access this route"
}
```

### Test Authorization Error
```bash
curl -X DELETE http://localhost:5000/api/products/123 \
  -H "Cookie: token=valid_user_token"

# Response (if user is not admin):
{
  "success": false,
  "statusCode": 403,
  "errorCode": "INSUFFICIENT_PERMISSIONS",
  "message": "User role 'user' is not authorized for this action. Required: admin"
}
```

### Test Not Found Error
```bash
curl -X GET http://localhost:5000/api/products/invalid-id

# Response:
{
  "success": false,
  "statusCode": 400,
  "errorCode": "INVALID_ID_FORMAT",
  "message": "Invalid Product ID format"
}
```

---

## Middleware Application Examples

### Single Middleware
```javascript
router.get('/:id', protect, controller.getOne);
```

### Multiple Middlewares (Validation + Auth)
```javascript
router.post('/', 
  protect,                          // Check authentication
  validate(createSchema),           // Validate request body
  controller.create                 // Controller logic
);
```

### Multiple Middlewares (Auth + Authorization)
```javascript
router.delete('/:id',
  protect,                          // Check authentication
  restrictTo('admin'),              // Check role
  controller.delete                 // Controller logic
);
```

### Apply Middleware to All Routes in Router
```javascript
// All routes in this router require authentication
router.use(protect);

router.get('/', controller.getAll);
router.post('/', validate(createSchema), controller.create);
```

---

## Setup Checklist

- [ ] `server/utils/AppError.js` created
- [ ] `server/middleware/errorHandler.js` created
- [ ] `server/utils/validators.js` created
- [ ] `server/utils/schemas.js` created
- [ ] `server/middleware/validationMiddleware.js` created
- [ ] `server/server.js` updated with error handler
- [ ] `server/middleware/authMiddleware.js` updated
- [ ] `joi` package installed
- [ ] One controller updated as pilot
- [ ] Tests pass for pilot controller
- [ ] All remaining controllers updated
- [ ] All API tests pass
- [ ] Error logs verified
- [ ] Deployed to production

---

## Reference Files

- [Full API Documentation](./API_ROUTES_VALIDATION.md)
- [Implementation Guide](./API_IMPLEMENTATION_GUIDE.md)
- [AppError Source](./server/utils/AppError.js)
- [Error Handler Source](./server/middleware/errorHandler.js)
- [Validators Source](./server/utils/validators.js)
- [Schemas Source](./server/utils/schemas.js)
