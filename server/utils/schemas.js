// server/utils/schemas.js
const Joi = require('joi');

/**
 * Joi schemas for request validation
 * These schemas define the structure and validation rules for API requests
 */

// Auth schemas
const registerSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 50 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Product schemas
const createProductSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Product name must be at least 3 characters',
      'string.max': 'Product name must not exceed 100 characters',
      'any.required': 'Product name is required'
    }),
  
  description: Joi.string()
    .min(10)
    .max(1000)
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description must not exceed 1000 characters'
    }),
  
  price: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),
  
  category: Joi.string()
    .required()
    .messages({
      'any.required': 'Category is required'
    }),
  
  image: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Image must be a valid URL'
    }),
  
  stock: Joi.number()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Stock must be a number',
      'number.min': 'Stock cannot be negative'
    })
});

const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100),
  
  description: Joi.string()
    .min(10)
    .max(1000),
  
  price: Joi.number()
    .positive(),
  
  category: Joi.string(),
  
  image: Joi.string()
    .uri(),
  
  stock: Joi.number()
    .integer()
    .min(0)
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Cart schemas
const addToCartSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.min': 'Quantity must be at least 1',
      'number.max': 'Quantity cannot exceed 1000',
      'any.required': 'Quantity is required'
    })
});

const updateCartItemSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
});

// Order schemas
const createOrderSchema = Joi.object({
  street: Joi.string()
    .min(5)
    .max(100)
    .required(),
  
  city: Joi.string()
    .min(2)
    .max(50)
    .required(),
  
  state: Joi.string()
    .min(2)
    .max(50)
    .required(),
  
  zipCode: Joi.string()
    .pattern(/^[0-9]{5}(-[0-9]{4})?$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid zip code format'
    }),
  
  country: Joi.string()
    .min(2)
    .max(50)
    .required(),
  
  paymentMethod: Joi.string()
    .valid('creditCard', 'debitCard', 'paypal', 'bankTransfer')
    .required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, processing, shipped, delivered, cancelled'
    })
});

// Survey schemas
const createSurveySchema = Joi.object({
  major: Joi.string()
    .required(),
  
  year: Joi.string()
    .valid('freshman', 'sophomore', 'junior', 'senior', 'graduate')
    .required(),
  
  experience: Joi.string(),
  goals: Joi.string(),
  sleepSchedule: Joi.string(),
  cleanliness: Joi.string(),
  visitorPolicy: Joi.string(),
  items: Joi.string(),
  pets: Joi.string(),
  allergies: Joi.string(),
  campusSelection: Joi.string(),
  socialBattery: Joi.string(),
  hobbies: Joi.string(),
  currentClasses: Joi.string(),
  studyGoals: Joi.string(),
  honors: Joi.string(),
  studyLocation: Joi.string(),
  studyTimes: Joi.string(),
  idealGroupSize: Joi.string(),
  virtualOrInPerson: Joi.string(),
  studyHabits: Joi.string(),
  studyStyle: Joi.string()
});

// Chat schemas
const createChatroomSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required(),
  
  description: Joi.string()
    .max(500)
});

const joinChatroomSchema = Joi.object({
  chatroomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
});

const sendMessageSchema = Joi.object({
  text: Joi.string()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 5000 characters',
      'any.required': 'Message text is required'
    }),
  
  chatroomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid chatroom ID format'
    })
});

// Post schemas
const createPostSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(5000)
    .required(),
  
  chatroomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
});

const addCommentSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(1000)
    .required()
});

module.exports = {
  // Auth
  registerSchema,
  loginSchema,
  
  // Products
  createProductSchema,
  updateProductSchema,
  
  // Cart
  addToCartSchema,
  updateCartItemSchema,
  
  // Orders
  createOrderSchema,
  updateOrderStatusSchema,
  
  // Survey
  createSurveySchema,
  
  // Chat
  createChatroomSchema,
  joinChatroomSchema,
  sendMessageSchema,
  
  // Posts
  createPostSchema,
  addCommentSchema
};
