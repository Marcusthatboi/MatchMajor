/**
 * Centralized error codes for consistent error handling across the application
 * Each error code maps to a specific scenario with appropriate HTTP status and message
 */

const ERROR_CODES = {
  // Authentication Errors (4xx)
  MISSING_CREDENTIALS: { status: 400, message: 'Username/email and password are required' },
  INVALID_EMAIL: { status: 400, message: 'Invalid email format' },
  INVALID_USERNAME: { status: 400, message: 'Username must be 3-50 characters, alphanumeric with underscores/hyphens only' },
  PASSWORD_TOO_SHORT: { status: 400, message: 'Password must be at least 6 characters' },
  PASSWORD_TOO_LONG: { status: 400, message: 'Password cannot exceed 128 characters' },
  USERNAME_TAKEN: { status: 409, message: 'Username already exists' },
  EMAIL_TAKEN: { status: 409, message: 'Email already registered' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  INVALID_TOKEN: { status: 401, message: 'Invalid or malformed token' },
  TOKEN_EXPIRED: { status: 401, message: 'Token has expired' },
  NO_TOKEN: { status: 401, message: 'No token provided' },
  INSUFFICIENT_PERMISSIONS: { status: 403, message: 'Insufficient permissions' },

  // Input Validation Errors (400)
  MISSING_FIELDS: { status: 400, message: 'Missing required fields' },
  INVALID_OBJECT_ID: { status: 400, message: 'Invalid ID format' },
  INVALID_QUANTITY: { status: 400, message: 'Quantity must be a positive integer' },
  INVALID_PRICE: { status: 400, message: 'Price must be a non-negative number' },
  INVALID_ENUM_VALUE: { status: 400, message: 'Invalid option selected' },
  INVALID_EMAIL_FORMAT: { status: 400, message: 'Email must be valid format' },
  INVALID_ZIP_CODE: { status: 400, message: 'Invalid zip code format' },
  STRING_TOO_SHORT: { status: 400, message: 'Input is too short' },
  STRING_TOO_LONG: { status: 400, message: 'Input is too long' },
  ARRAY_EMPTY: { status: 400, message: 'Array cannot be empty' },
  INVALID_JSON: { status: 400, message: 'Invalid JSON in request body' },

  // Product Errors (4xx)
  PRODUCT_NOT_FOUND: { status: 404, message: 'Product not found' },
  PRODUCT_OUT_OF_STOCK: { status: 400, message: 'Product is out of stock' },
  INSUFFICIENT_STOCK: { status: 400, message: 'Insufficient stock for requested quantity' },
  INVALID_CATEGORY: { status: 400, message: 'Invalid product category' },

  // Cart Errors (4xx)
  CART_NOT_FOUND: { status: 404, message: 'Cart not found' },
  CART_EMPTY: { status: 400, message: 'Cart is empty' },
  ITEM_NOT_IN_CART: { status: 404, message: 'Item not found in cart' },

  // Order Errors (4xx)
  ORDER_NOT_FOUND: { status: 404, message: 'Order not found' },
  INVALID_ORDER_STATUS: { status: 400, message: 'Invalid order status' },
  CANNOT_CANCEL_ORDER: { status: 400, message: 'Cannot cancel order in current status' },
  INVALID_PAYMENT_METHOD: { status: 400, message: 'Invalid payment method' },

  // Survey Errors (4xx)
  SURVEY_NOT_FOUND: { status: 404, message: 'Survey not found' },
  SURVEY_INCOMPLETE: { status: 400, message: 'Survey is incomplete' },

  // Chatroom Errors (4xx)
  CHATROOM_NOT_FOUND: { status: 404, message: 'Chatroom not found' },
  NOT_CHATROOM_MEMBER: { status: 403, message: 'You are not a member of this chatroom' },
  ALREADY_CHATROOM_MEMBER: { status: 409, message: 'Already a member of this chatroom' },
  CANNOT_LEAVE_OWN_ROOM: { status: 400, message: 'Creator cannot leave their own chatroom' },

  // Message Errors (4xx)
  MESSAGE_NOT_FOUND: { status: 404, message: 'Message not found' },
  INVALID_MESSAGE_CONTENT: { status: 400, message: 'Message content is invalid' },
  NOT_MESSAGE_AUTHOR: { status: 403, message: 'You can only edit your own messages' },

  // Post Errors (4xx)
  POST_NOT_FOUND: { status: 404, message: 'Post not found' },
  NOT_POST_AUTHOR: { status: 403, message: 'You can only edit your own posts' },

  // Database Errors (5xx)
  DATABASE_ERROR: { status: 500, message: 'Database operation failed' },
  DUPLICATE_ENTRY: { status: 409, message: 'This entry already exists' },

  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR: { status: 500, message: 'Internal server error' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service temporarily unavailable' },

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Too many requests. Please try again later' },

  // External Service Errors (5xx)
  PAYMENT_SERVICE_ERROR: { status: 503, message: 'Payment service temporarily unavailable' },
};

module.exports = ERROR_CODES;
