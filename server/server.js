// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// === VALIDATE ENVIRONMENT VARIABLES ===
const validateEnv = require('./config/validateEnv');
validateEnv();

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { securityMiddleware } = require('./middleware/securityMiddleware');
const { authLimiter, apiLimiter, searchLimiter, messageLimiter } = require('./config/rateLimiting');

// Import routes
const authRoutes = require('../routes/authRoutes');
const productRoutes = require('../routes/productRoutes');
const cartRoutes = require('../routes/cartRoutes');
const orderRoutes = require('../routes/orderRoutes');
const matchRoutes = require('../routes/matchRoutes');
const surveyRoutes = require('../routes/surveyRoutes');
const chatroomRoutes = require('../routes/chatroomRoutes');
const messageRoutes = require('../routes/messageRoutes');
const postRoutes = require('../routes/postRoutes');
const healthRoutes = require('./routes/health');

// Connect to database
const connectDB = require('../config/db');
connectDB();

const app = express();

// === SECURITY HEADERS WITH HELMET ===
app.use(helmet({
  contentSecurityPolicy: process.env.HELMET_CONTENT_SECURITY_POLICY === 'true' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  } : false,
  hsts: {
    maxAge: parseInt(process.env.HELMET_HSTS_MAX_AGE || 31536000, 10),
    includeSubDomains: process.env.HELMET_HSTS_INCLUDE_SUBDOMAINS === 'true',
    preload: process.env.HELMET_HSTS_PRELOAD === 'true'
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));

// === BODY PARSER WITH SIZE LIMIT ===
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || 5242880, 10); // 5MB default
app.use(express.json({ limit: `${Math.round(maxFileSize / 1024 / 1024)}mb` }));
app.use(express.urlencoded({ limit: `${Math.round(maxFileSize / 1024 / 1024)}mb`, extended: true }));

// === COOKIE PARSER ===
app.use(cookieParser());

// === CORS CONFIGURATION ===
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [process.env.FRONTEND_URL || 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests without origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: process.env.ALLOWED_METHODS?.split(',').map(m => m.trim()) || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: process.env.ALLOWED_HEADERS?.split(',').map(h => h.trim()) || ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number']
}));

// === APPLY SECURITY MIDDLEWARE ===
if (process.env.ENABLE_RATE_LIMIT !== 'false') {
  app.use(securityMiddleware);
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', apiLimiter, productRoutes);
app.use('/api/cart', apiLimiter, cartRoutes);
app.use('/api/orders', apiLimiter, orderRoutes);
app.use('/api/matches', searchLimiter, matchRoutes);
app.use('/api/survey', apiLimiter, surveyRoutes);
app.use('/api/chatrooms', apiLimiter, chatroomRoutes);
app.use('/api/messages', messageLimiter, messageRoutes);
app.use('/api/posts', searchLimiter, postRoutes);

// 404 handler - must be before error handler
app.use('*', (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
});

// Global error handling middleware - must be LAST
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// === GRACEFUL SHUTDOWN ===
const gracefulShutdown = () => {
  console.log('⏹️  Shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// === UNHANDLED PROMISE REJECTION ===
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // In production, log to error tracking service
});

// === UNCAUGHT EXCEPTION ===
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║          🚀 MatchMajor Server Started         ║
╠════════════════════════════════════════════════╣
║  Environment: ${NODE_ENV.toUpperCase().padEnd(28)} ║
║  Port: ${PORT.toString().padEnd(36)} ║
║  Security: Enabled ✓                         ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;