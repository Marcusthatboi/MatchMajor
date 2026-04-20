// server/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token with enhanced security
const generateToken = (id, email) => {
  return jwt.sign(
    { 
      id,
      email,
      iat: Math.floor(Date.now() / 1000) // Issued at time
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: '7d', // Reduced from 30 days to 7 days for better security
      issuer: 'matchmajor-app'
    }
  );
};

// Register a new user with basic validation
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Basic input validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with that email or username'
      });
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });
    
    if (user) {
      // Create token
      const token = generateToken(user._id, user.email);
      
      // Set secure cookie with enhanced options
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });
      
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map(err => err.message)
        .join('; ');
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages}`,
        errorCode: 'VALIDATION_ERROR',
        details: error.errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists`,
        errorCode: 'DUPLICATE_KEY',
        field
      });
    }
    
    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      errorCode: 'SERVER_ERROR'
    });
  }
};

// Login user with enhanced security
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email or username - MUST select password for comparison
    const user = await User.findOne({ $or: [{ email }, { username: email }] }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Create token
    const token = generateToken(user._id, user.email);
    
    // Set secure cookie with enhanced options
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      errorCode: 'LOGIN_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
