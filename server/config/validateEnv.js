// server/config/validateEnv.js
/**
 * Environment variable validation
 * Ensures all required variables are set and have valid values
 */

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'SESSION_SECRET'
];

const validNodeEnvs = ['development', 'production', 'test'];

/**
 * Validate environment variables
 * Throws error if validation fails
 */
function validateEnvironment() {
  console.log('🔍 Validating environment variables...');

  // === CHECK REQUIRED VARIABLES ===
  const missing = [];
  requiredEnvVars.forEach(variable => {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  });

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('📝 Create a .env file with all required variables');
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  // === VALIDATE NODE_ENV ===
  if (!validNodeEnvs.includes(process.env.NODE_ENV)) {
    throw new Error(`Invalid NODE_ENV: ${process.env.NODE_ENV}. Must be one of: ${validNodeEnvs.join(', ')}`);
  }

  // === VALIDATE PORT ===
  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}. Must be a number between 1 and 65535`);
  }

  // === VALIDATE JWT_SECRET LENGTH ===
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // === VALIDATE SESSION_SECRET LENGTH ===
  if (process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must be at least 32 characters long');
  }

  // === VALIDATE MONGODB_URI ===
  if (!process.env.MONGODB_URI.startsWith('mongodb')) {
    throw new Error('Invalid MONGODB_URI: must start with "mongodb"');
  }

  // === VALIDATE BCRYPT_ROUNDS ===
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS, 10);
  if (isNaN(bcryptRounds) || bcryptRounds < 10 || bcryptRounds > 15) {
    throw new Error('BCRYPT_ROUNDS must be between 10 and 15');
  }

  // === VALIDATE RATE LIMITS ===
  const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10);
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10);
  
  if (isNaN(rateLimitWindow) || rateLimitWindow < 1000) {
    throw new Error('RATE_LIMIT_WINDOW_MS must be a number >= 1000');
  }
  
  if (isNaN(rateLimitMax) || rateLimitMax < 1) {
    throw new Error('RATE_LIMIT_MAX_REQUESTS must be a number >= 1');
  }

  // === VALIDATE COOKIE SETTINGS ===
  const cookieHttpOnly = process.env.COOKIE_HTTP_ONLY === 'true';
  const cookieSameSite = process.env.COOKIE_SAME_SITE;
  
  if (!['Strict', 'Lax', 'None'].includes(cookieSameSite)) {
    throw new Error(`Invalid COOKIE_SAME_SITE: ${cookieSameSite}. Must be Strict, Lax, or None`);
  }

  // === VALIDATE FILE SIZE ===
  const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10);
  if (isNaN(maxFileSize) || maxFileSize < 1024) {
    throw new Error('MAX_FILE_SIZE must be a number >= 1024');
  }

  // === PRODUCTION WARNINGS ===
  if (process.env.NODE_ENV === 'production') {
    const warnings = [];

    if (process.env.JWT_SECRET.startsWith('dev_')) {
      warnings.push('⚠️  JWT_SECRET looks like a development key');
    }

    if (process.env.SESSION_SECRET.startsWith('dev_')) {
      warnings.push('⚠️  SESSION_SECRET looks like a development key');
    }

    if (process.env.COOKIE_SECURE !== 'true') {
      warnings.push('⚠️  COOKIE_SECURE is not enabled in production');
    }

    if (process.env.HELMET_HSTS_PRELOAD !== 'true') {
      warnings.push('⚠️  HELMET_HSTS_PRELOAD is not enabled in production');
    }

    if (warnings.length > 0) {
      console.warn('🚨 Production Security Warnings:');
      warnings.forEach(warning => console.warn(warning));
    }
  }

  console.log('✅ Environment variables validated successfully');
  return true;
}

module.exports = validateEnvironment;
