# Edge Case Handling - Comprehensive Guide

## Overview

This document details all edge cases that have been implemented throughout the MatchMajor application to ensure robust error handling and data integrity.

---

## Error Handling Infrastructure

### Error Codes System (`errorCodes.js`)
Centralized error code definitions with:
- HTTP status codes
- User-friendly messages
- Consistent error identification

### Enhanced Error Handler (`errorHandler.js`)
Global middleware catching:
- MongoDB errors (CastError, Duplicate Key, ValidationError)
- JWT errors (expired, invalid)
- JSON parse errors
- Network/timeout errors
- Custom AppError exceptions

### Input Validation (`inputValidation.js`)
Comprehensive validators for:
- Email format
- Password strength
- Username format
- Phone/zip codes
- String lengths
- Quantities and prices
- Enum values
- Array validation
- Text sanitization

### Async Handler (`asyncHandler.js`)
Automatic error catching and forwarding to middleware

---

## Authentication Edge Cases

### Registration
✅ **Missing Required Fields**
- Throws error if username, email, or password empty
- Error Code: `MISSING_FIELDS`

✅ **Invalid Email Format**
- Validates email pattern
- Error Code: `INVALID_EMAIL`

✅ **Invalid Username Format**
- Must be 3-50 chars, alphanumeric + underscore/hyphen
- Error Code: `INVALID_USERNAME`

✅ **Weak Password**
- Minimum 6 characters
- Maximum 128 characters
- Error Code: `PASSWORD_TOO_SHORT`, `PASSWORD_TOO_LONG`

✅ **Duplicate Email**
- Case-insensitive check
- Error Code: `EMAIL_TAKEN` (409 Conflict)

✅ **Duplicate Username**
- Case-insensitive check
- Error Code: `USERNAME_TAKEN` (409 Conflict)

✅ **Password Mismatch**
- Checks confirmPassword matches password
- Error Code: `PASSWORD_MISMATCH`

### Login
✅ **Missing Credentials**
- Both email and password required
- Error Code: `MISSING_FIELDS`

✅ **Invalid Email Format**
- Must be valid email
- Error Code: `INVALID_EMAIL`

✅ **User Not Found**
- Returns generic "invalid credentials" to prevent user enumeration
- Error Code: `INVALID_CREDENTIALS` (401)

✅ **Incorrect Password**
- Bcrypt comparison with timeout protection
- Returns generic error
- Error Code: `INVALID_CREDENTIALS`

✅ **Account Deactivated**
- Checks `isActive` flag
- Error Code: `ACCOUNT_DEACTIVATED`

✅ **Expired Token**
- JWT expiration check
- Error Code: `TOKEN_EXPIRED`

✅ **Invalid Token**
- Malformed or tampered tokens rejected
- Error Code: `INVALID_TOKEN`

✅ **No Token Provided**
- Checks for token in cookies
- Error Code: `NO_TOKEN`

### Password Change
✅ **Current Password Verification**
- Must match actual password
- Error Code: `INVALID_PASSWORD`

✅ **New Password Same as Current**
- Prevents no-change password updates
- Error Code: `SAME_PASSWORD`

✅ **Password Confirmation Mismatch**
- New password must be confirmed
- Error Code: `PASSWORD_MISMATCH`

---

## Product Management Edge Cases

### Get Products
✅ **Invalid Category**
- Only allows: textbooks, supplies, housing, services, other
- Error Code: `INVALID_CATEGORY`

✅ **Invalid Pagination**
- Page must be ≥ 1
- Limit capped at 100 (prevents DOS)
- Default: page 1, limit 10

✅ **Search Query**
- Text search with sanitization
- Prevents XSS attacks

### Get Single Product
✅ **Invalid Product ID**
- MongoDB ObjectId format validation
- Error Code: `INVALID_OBJECT_ID`

✅ **Product Not Found**
- 404 when ID doesn't match
- Error Code: `PRODUCT_NOT_FOUND`

### Create Product
✅ **Missing Fields**
- name, description, price, category, stock required
- Error Code: `MISSING_FIELDS`

✅ **Invalid Field Lengths**
- name: 3-100 chars
- description: 10-1000 chars
- Error Code: `STRING_TOO_SHORT`, `STRING_TOO_LONG`

✅ **Invalid Price**
- Must be 0 to 999,999
- Must be number
- Error Code: `INVALID_PRICE`

✅ **Invalid Stock**
- Must be non-negative integer
- Error Code: `INVALID_STOCK`

✅ **Too Many Features**
- Maximum 20 features allowed
- Error Code: `TOO_MANY_FEATURES`

### Update Product
✅ **Unauthorized Update**
- Only seller or admin can update
- Error Code: `INSUFFICIENT_PERMISSIONS`

✅ **Invalid Update Fields**
- Only allowed fields can be modified
- Error Code: `INVALID_FIELDS`

### Search Products
✅ **Missing Search Query**
- Search term required
- Error Code: `MISSING_SEARCH_QUERY`

✅ **Invalid Price Range**
- Min/max prices validated
- Error Code: `INVALID_PRICE`

---

## Cart Management Edge Cases

### Get Cart
✅ **No Authentication**
- User required
- Error Code: `NO_TOKEN`

✅ **Deleted Products in Cart**
- Auto-removes products no longer in database
- Saves updated cart

✅ **Cart Auto-Creation**
- Creates cart if doesn't exist

### Add to Cart
✅ **Product Not Found**
- Validates product ID exists
- Error Code: `PRODUCT_NOT_FOUND`

✅ **Product Out of Stock**
- Checks `inStock` flag and stock > 0
- Error Code: `PRODUCT_OUT_OF_STOCK`

✅ **Insufficient Stock**
- Compares requested qty vs available
- Error Code: `INSUFFICIENT_STOCK`

✅ **Invalid Quantity**
- Must be 1-1000
- Must be integer
- Error Code: `INVALID_QUANTITY`

✅ **Duplicate Item**
- Merges with existing item instead of duplication

### Update Item Quantity
✅ **Item Not in Cart**
- Validates item exists before update
- Error Code: `ITEM_NOT_IN_CART`

✅ **Stock Validation**
- Re-checks available stock
- Error Code: `INSUFFICIENT_STOCK`

### Remove Item
✅ **Item Not Found**
- Validates item exists in cart
- Error Code: `ITEM_NOT_IN_CART`

### Clear Cart
✅ **Already Empty**
- Checks for empty cart
- Error Code: `CART_EMPTY`

---

## Order Management Edge Cases

### Create Order
✅ **Empty Cart**
- Prevents orders from empty carts
- Error Code: `CART_EMPTY`

✅ **Missing Shipping Address**
- All address fields required
- Error Code: `MISSING_FIELDS`

✅ **Invalid Address Format**
- Street: 5+ chars
- City: 2+ chars
- Zip code: ##### or #####-####
- Error Code: `STRING_TOO_SHORT`, `INVALID_ZIP_CODE`

✅ **Invalid Payment Method**
- Only: creditCard, debitCard, paypal, bankTransfer
- Error Code: `INVALID_ENUM_VALUE`

✅ **Product Deleted Before Order**
- Checks all products still exist
- Error Code: `PRODUCT_DELETED`

✅ **Stock Changed Before Order**
- Re-validates stock at checkout
- Error Code: `PRODUCT_OUT_OF_STOCK`, `INSUFFICIENT_STOCK`

✅ **Inventory Lock**
- Stock reduced atomically
- Rollback on failure
- Error Code: `INVENTORY_UPDATE_ERROR`

✅ **Cart Cleared After Order**
- Auto-deletes cart on successful order

### Get Orders
✅ **Invalid Status Filter**
- Only allows: pending, processing, shipped, delivered, cancelled
- Error Code: `INVALID_ENUM_VALUE`

✅ **Pagination Validation**
- Page ≥ 1, limit ≤ 100

### View Order
✅ **Unauthorized Access**
- Users can only view own orders
- Admins can view all
- Error Code: `INSUFFICIENT_PERMISSIONS`

### Update Order Status
✅ **Invalid Status Transition**
- Validates allowed state transitions
- pending → processing/cancelled
- processing → shipped/cancelled
- shipped → delivered
- Error Code: `INVALID_STATUS_TRANSITION`

✅ **Cancellation Rollback**
- Returns inventory on cancellation
- Error Code: `CANCELLATION_ERROR`

### Cancel Order
✅ **Non-Cancellable Status**
- Only pending/processing can be cancelled
- Error Code: `CANNOT_CANCEL_ORDER`

✅ **Unauthorized Cancellation**
- User can only cancel own orders
- Error Code: `INSUFFICIENT_PERMISSIONS`

---

## Input Sanitization & Security

### Email Sanitization
- Lowercase normalization
- Trim whitespace
- Format validation
- Prevents duplicate accounts with case variations

### Username Sanitization
- Lowercase normalization
- Trim whitespace
- Alphanumeric + underscore/hyphen only
- 3-50 character limit

### Text Sanitization
- Removes angle brackets `< >`
- Prevents XSS attacks
- Enforces 5000 char limit
- Trims whitespace

### Password Security
- Hashed with bcrypt (12 rounds)
- Never logged
- Not returned in responses
- Compared safely (timing attack resistant)

---

## Database Error Handling

### Duplicate Key Error (11000)
- Catches MongoDB constraint violations
- Maps to appropriate field
- Returns 409 Conflict
- Suggests field that conflicted

### Validation Error
- Mongoose schema validation failures
- Aggregates all validation messages
- Returns 400 Bad Request
- Clear error messages for client

### Cast Error
- Invalid ObjectId format
- Returns 400 Bad Request
- Clear message about format

### Connection Errors
- Network failures caught
- Returns 503 Service Unavailable
- Prevents cascading failures

### Timeout Errors
- Database operation timeouts
- Returns 503 Service Unavailable
- Retries handled by connection pool

---

## Request-Level Edge Cases

### JSON Parse Errors
- Invalid JSON in request body
- Returns 400 Bad Request
- Error Code: `INVALID_JSON`

### Missing Content-Type
- Handled by Express middleware
- Defaults to application/json

### Request Size Limits
- Default 100kb limit
- Prevents buffer overflow attacks

### Missing Authentication
- Protected routes check for token
- Returns 401 Unauthorized
- Error Code: `NO_TOKEN`

---

## Rate Limiting Edge Cases (Ready to Implement)

### Authentication Endpoints
- Limit: 5 attempts per 15 minutes per IP
- Prevents brute force attacks
- Error Code: `RATE_LIMIT_EXCEEDED` (429)

### API Endpoints
- General limit: 100 requests per minute per user
- Product search: 50 requests per minute
- Returns 429 Too Many Requests

### Reset Conditions
- Time-based window reset
- Per user/IP tracking
- Exponential backoff

---

## Frontend Error Handling (API Layer)

### Network Failures
- Catches connection errors
- Returns mock data or error message
- Prevents UI crashes

### Timeout Handling
- 30-second timeout on requests
- Retries with exponential backoff
- User-friendly timeout message

### Invalid Response Format
- Validates response structure
- Handles unexpected data
- Returns error message

### 401 Unauthorized
- Clears user session
- Redirects to login
- Asks for re-authentication

### 403 Forbidden
- Shows permission denied message
- Redirects to appropriate page
- No information disclosure

### 404 Not Found
- Shows resource not found
- Suggests alternative actions
- Maintains user state

### 500 Server Error
- Generic error message
- Logs error ID for support
- Retry button available

---

## Data Consistency Edge Cases

### Concurrent Updates
- MongoDB session support ready
- Atomic operations for critical updates
- Inventory locked during order creation

### Deleted References
- Auto-cleanup on document deletion
- Cart items with deleted products removed
- Order items snapshot (immutable)

### Stale Data
- Cart items re-validated before checkout
- Product prices re-checked at order time
- Stock verified during order creation

---

## Logging & Monitoring

### Error Logging
```javascript
{
  timestamp: ISO-8601,
  statusCode: 400-503,
  errorCode: 'CODE',
  message: 'User message',
  method: 'GET/POST',
  path: '/api/endpoint',
  userId: 'user_id or anonymous',
  stack: '[development only]'
}
```

### Development vs Production
- **Development**: Full stack traces, detailed logs
- **Production**: Generic messages, logged to service, no stack traces

---

## Testing Edge Cases

### Unit Test Coverage
```javascript
// Example test cases
describe('Auth Controller', () => {
  it('should reject duplicate email')
  it('should reject weak password')
  it('should hash password on save')
  it('should return generic error on login failure')
})

describe('Cart Controller', () => {
  it('should reject out of stock items')
  it('should merge duplicate items')
  it('should validate quantity limits')
  it('should handle deleted products')
})

describe('Order Controller', () => {
  it('should validate address format')
  it('should check stock at checkout')
  it('should rollback on payment failure')
  it('should prevent concurrent orders')
})
```

---

## Security Best Practices Implemented

1. **Input Validation**: Every user input validated
2. **Output Encoding**: All data sanitized before response
3. **Authentication**: JWT with expiration
4. **Authorization**: Role-based access control
5. **Password Security**: Bcrypt hashing
6. **Error Messages**: No sensitive info disclosure
7. **HTTPS Ready**: Secure cookie flags
8. **CORS Ready**: Configured correctly
9. **NoSQL Injection**: Mongoose prevents injection
10. **XSS Prevention**: Text sanitization

---

## Common Error Scenarios & Resolutions

| Scenario | Error Code | HTTP Status | Resolution |
|----------|-----------|-------------|-----------|
| User types wrong email | INVALID_CREDENTIALS | 401 | Verify email/password |
| Product unavailable | PRODUCT_OUT_OF_STOCK | 400 | Check availability or try later |
| Quantity too high | INSUFFICIENT_STOCK | 400 | Reduce quantity |
| Invalid zip code | INVALID_ZIP_CODE | 400 | Enter valid zip (##### or #####-####) |
| No authentication | NO_TOKEN | 401 | Login first |
| Can't access others' orders | INSUFFICIENT_PERMISSIONS | 403 | You can only view your orders |
| Database down | DATABASE_ERROR | 503 | Service temporarily unavailable |
| Duplicate username | USERNAME_TAKEN | 409 | Choose different username |

---

## Implementation Files

### New Files Created
1. `server/utils/errorCodes.js` - Error code definitions
2. `server/utils/errorCodes.js` - Centralized error codes
3. `server/utils/inputValidation.js` - Validation functions
4. `server/utils/asyncHandler.js` - Error-catching wrapper
5. `controllers/authController_enhanced.js` - Enhanced auth
6. `controllers/productController_enhanced.js` - Enhanced products
7. `controllers/cartController_enhanced.js` - Enhanced cart
8. `controllers/orderController_enhanced.js` - Enhanced orders

### Modified Files
1. `server/middleware/errorHandler.js` - Enhanced error handling

---

## Migration Guide

To use the enhanced controllers:

```javascript
// Update routes/auth.js
const authController = require('../controllers/authController_enhanced');

// Update routes/products.js
const productController = require('../controllers/productController_enhanced');

// Update routes/cart.js
const cartController = require('../controllers/cartController_enhanced');

// Update routes/orders.js
const orderController = require('../controllers/orderController_enhanced');
```

---

## Future Improvements

1. **Rate Limiting**: Implement per-endpoint rate limits
2. **Request Deduplication**: Prevent duplicate concurrent requests
3. **Audit Logging**: Log all user actions
4. **Circuit Breaker**: Handle cascading failures
5. **Request Correlation**: Track requests across services
6. **Health Checks**: Endpoint availability monitoring
7. **Graceful Degradation**: Fallback responses
8. **Error Telemetry**: Send errors to monitoring service

---

## Conclusion

The application now handles:
- ✅ 50+ specific edge cases
- ✅ Comprehensive input validation
- ✅ Proper error messaging
- ✅ Security best practices
- ✅ Database error recovery
- ✅ Authorization checks
- ✅ Data consistency
- ✅ Request sanitization
- ✅ Proper HTTP status codes
- ✅ User-friendly error messages

All controllers are production-ready with robust error handling.
