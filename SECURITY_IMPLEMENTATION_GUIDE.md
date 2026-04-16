# 🔒 Security Implementation Guide

## Overview

This document outlines all security improvements implemented in the MatchMajor application including input validation, sanitization, environment variable management, rate limiting, and protected routes.

---

## 1. Environment Variables Setup

### Files
- `.env.example` - Template with all required variables
- `.env` - Development environment (DO NOT commit to git)
- `.env.production` - Production environment (use in deployment)

### Environment Variable Validation

All environment variables are validated on startup via `server/config/validateEnv.js`:

**Validation Rules:**
- ✅ All required variables present
- ✅ Valid NODE_ENV (development, production, test)
- ✅ Valid PORT (1-65535)
- ✅ JWT_SECRET minimum 32 characters
- ✅ SESSION_SECRET minimum 32 characters
- ✅ Valid MongoDB URI format
- ✅ BCRYPT_ROUNDS between 10-15
- ✅ Rate limit values are positive integers
- ✅ Cookie settings valid (SameSite: Strict/Lax/None)

**Production Warnings:**
- 🚨 Development-like JWT_SECRET (starts with "dev_")
- 🚨 Development-like SESSION_SECRET
- 🚨 COOKIE_SECURE not enabled in production
- 🚨 HSTS preload not enabled

### Example .env Configuration

```env
# Core
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/matchmajor

# Security
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
SESSION_SECRET=your_session_secret_key_min_32_chars
BCRYPT_ROUNDS=12

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
COOKIE_SECURE=false
COOKIE_SAME_SITE=Strict
COOKIE_HTTP_ONLY=true
```

---

## 2. Input Validation & Sanitization

### Security Middleware (`server/middleware/securityMiddleware.js`)

#### 2.1 NoSQL Injection Prevention
**Function:** `sanitizeInput()`

Removes MongoDB operators from request data:
- Blocks: `$gt`, `$lt`, `$gte`, `$lte`, `$ne`, `$where`, `$nor`, `$and`, `$or`, `$regex`
- Prevents: Bypassing authentication and authorization checks
- Applied to: `req.body`, `req.query`, `req.params`

**Example Attack Prevented:**
```javascript
// Attacker tries:
POST /api/auth/login
{
  "email": {"$ne": null},
  "password": {"$ne": null}
}

// After sanitization:
{
  "email": "ne: null",
  "password": "ne: null"
}
```

#### 2.2 HTTP Parameter Pollution Prevention
**Function:** `preventParameterPollution()`

Prevents duplicate parameters used to bypass filters:
- Whitelist: tags, interests, members, items, sort, fields, include
- Non-whitelisted duplicates: Keep only last value
- Prevents: Authorization bypass through parameter manipulation

#### 2.3 Content-Type Validation
**Function:** `validateContentType()`

- Enforces: `application/json` for POST/PUT/PATCH
- Returns: 415 Unsupported Media Type if violated
- Prevents: Unexpected data format attacks

#### 2.4 Request Size Limits
**Function:** `validateRequestSize()`

- Max size: Configurable via `MAX_FILE_SIZE` env var
- Default: 5MB
- Returns: 413 Payload Too Large if exceeded
- Prevents: Buffer overflow and DOS attacks

#### 2.5 Security Headers
**Function:** `addSecurityHeaders()`

Applied to all responses:
```
X-Content-Type-Options: nosniff        // Prevent MIME sniffing
X-XSS-Protection: 1; mode=block        // Enable XSS filter
X-Frame-Options: DENY                  // Prevent clickjacking
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
Cache-Control: no-store (for sensitive endpoints)
```

#### 2.6 Request Logging for Security Events
**Function:** `logSecurityEvents()`

Logs suspicious patterns:
- 🚨 MongoDB operator detection in query strings
- ⚠️  Large payloads (> 1MB)
- 🔍 Failed authentication attempts

---

## 3. Rate Limiting (`server/config/rateLimiting.js`)

### Rate Limiters by Endpoint Type

| Limiter | Window | Max Requests | Purpose |
|---------|--------|--------------|---------|
| `authLimiter` | 15 min | 5 | Brute force protection |
| `apiLimiter` | 15 min | 100 | General API protection |
| `searchLimiter` | 15 min | 50 | Resource exhaustion prevention |
| `uploadLimiter` | 1 hour | 10 | Prevent spam uploads |
| `messageLimiter` | 1 minute | 30 | Chat spam prevention |
| `passwordResetLimiter` | 1 hour | 3 | Account takeover protection |
| `createAccountLimiter` | 1 hour | 5 | Bot registration prevention |
| `downloadLimiter` | 1 hour | 100 | Bandwidth protection |
| `publicLimiter` | 15 min | 200 | Unauthenticated endpoints |

### Rate Limit Key Generation

**For Authenticated Endpoints:**
```
Key = user-${user._id}
```

**For Unauthenticated Endpoints:**
```
Key = ${IP_ADDRESS}
```

### Rate Limit Response

```json
{
  "success": false,
  "statusCode": 429,
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests, please try again later",
  "retryAfter": 900
}
```

---

## 4. Authentication Middleware (`server/middleware/authMiddleware_enhanced.js`)

### 4.1 Protected Routes - `protect` Middleware

**Validation Chain:**
1. ✅ Extract token from cookies or Authorization header
2. ✅ Verify JWT signature and expiration
3. ✅ Validate token structure (contains id and email)
4. ✅ Fetch user from database
5. ✅ Check account is active
6. ✅ Verify email if required
7. ✅ Update last activity timestamp
8. ✅ Attach user to request object

**Usage:**
```javascript
router.get('/me', protect, getCurrentUser);
router.post('/orders', protect, createOrder);
router.put('/:id', protect, updateResource);
```

### 4.2 Role-Based Access Control - `restrictTo` Middleware

**Supported Roles:**
- `user` - Regular user
- `admin` - Administrator
- `moderator` - Community moderator
- `seller` - Product seller

**Usage:**
```javascript
// Admin only
router.delete('/:id', protect, restrictTo('admin'), deleteProduct);

// Multiple roles
router.put('/:id', protect, restrictTo('admin', 'seller'), updateProduct);
```

### 4.3 Optional Authentication - `optionalAuth` Middleware

- Authenticates if token provided
- Continues if no token (doesn't fail)
- Useful for: Public endpoints that show different content for logged-in users

**Usage:**
```javascript
router.get('/', optionalAuth, getPublicPosts);
```

### 4.4 Permission-Based Access - `requirePermission` Middleware

More granular than roles. Individual permissions.

**Supported Permissions:**
- `create_product`
- `edit_product`
- `delete_product`
- `manage_users`
- `view_analytics`
- `moderate_content`

**Usage:**
```javascript
router.post('/admin/products', protect, requirePermission('manage_products'), createProduct);
```

### 4.5 Resource Ownership Check - `checkResourceOwnership` Middleware

Prevents users from modifying others' resources.

**Usage:**
```javascript
router.put('/:id', protect, checkResourceOwnership('userId'), updateOrder);
```

### 4.6 CSRF Token Validation - `validateCSRFToken` Middleware

Prevents Cross-Site Request Forgery attacks.

**Skipped For:** GET, HEAD, OPTIONS
**Token Sources:** 
- `req.body._csrf`
- `req.headers['x-csrf-token']`

**Usage:**
```javascript
router.post('/', protect, validateCSRFToken, createOrder);
```

---

## 5. Protected Routes Configuration

### Routes Requiring Authentication

| Route | Method | Protection | Rate Limit |
|-------|--------|-----------|-----------|
| `/api/auth/register` | POST | Rate Limit | authLimiter |
| `/api/auth/login` | POST | Rate Limit | authLimiter |
| `/api/auth/logout` | POST | protect | authLimiter |
| `/api/auth/me` | GET | protect | apiLimiter |
| `/api/cart/*` | ALL | protect | apiLimiter |
| `/api/orders/*` | ALL | protect | apiLimiter |
| `/api/survey/*` | ALL | protect | apiLimiter |
| `/api/chatrooms/*` | ALL | protect | apiLimiter |
| `/api/messages/*` | ALL | protect | messageLimiter |
| `/api/posts/create` | POST | protect | apiLimiter |
| `/api/posts/:id/edit` | PUT | protect | apiLimiter |
| `/api/posts/:id/delete` | DELETE | protect | apiLimiter |

### Routes Requiring Admin Role

| Route | Method | Protection |
|-------|--------|-----------|
| `/api/products` (create) | POST | protect, restrictTo('admin') |
| `/api/products/:id` (update) | PUT | protect, restrictTo('admin') |
| `/api/products/:id` (delete) | DELETE | protect, restrictTo('admin') |
| `/api/orders/:id/status` | PUT | protect, restrictTo('admin') |
| `/api/users` (admin) | GET | protect, restrictTo('admin') |
| `/api/users/:id` (ban) | DELETE | protect, restrictTo('admin') |

### Public Routes (No Auth Required)

| Route | Method | Rate Limit |
|-------|--------|-----------|
| `/api/auth/register` | POST | authLimiter |
| `/api/auth/login` | POST | authLimiter |
| `/api/products` (list) | GET | publicLimiter |
| `/api/products/:id` | GET | publicLimiter |
| `/api/posts` (list) | GET | publicLimiter |
| `/api/posts/:id` | GET | publicLimiter |

---

## 6. CORS Security Configuration

### Environment Variables

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
ALLOWED_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS
ALLOWED_HEADERS=Content-Type,Authorization,X-CSRF-Token
```

### CORS Rules

- ✅ Strict origin validation
- ✅ Credentials allowed with specific origins
- ✅ Preflight caching enabled
- ✅ Exposed headers: X-Total-Count, X-Page-Number
- ✅ Restricted methods
- ✅ Limited headers

### Dynamic CORS Validation

```javascript
origin: (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  }
}
```

---

## 7. Security Headers with Helmet

### Helmet Configuration

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", "process.env.FRONTEND_URL"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,           // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));
```

### Headers Added

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | nosniff | Prevent MIME sniffing |
| `X-Frame-Options` | DENY | Prevent clickjacking |
| `X-XSS-Protection` | 1; mode=block | Enable browser XSS filter |
| `Strict-Transport-Security` | max-age=31536000; includeSubDomains; preload | HTTPS enforcement |
| `Content-Security-Policy` | ... | XSS and injection prevention |
| `Referrer-Policy` | strict-origin-when-cross-origin | Control referrer info |
| `Permissions-Policy` | geolocation=(), microphone=(), camera=() | Restrict browser features |

---

## 8. Password Security

### Hashing Configuration

```env
BCRYPT_ROUNDS=12
```

- Salt rounds: 12 (default, adjustable 10-15)
- Algorithm: bcryptjs
- Never stored in plain text
- Never logged
- Timing-attack resistant comparison

### Password Validation Rules

- Minimum: 6 characters
- Maximum: 128 characters
- Allowed: All printable characters
- Must be different from current password (for changes)
- Must be confirmed on registration

---

## 9. JWT Token Security

### Configuration

```env
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars
JWT_EXPIRE=7d
```

### Token Structure

```javascript
{
  id: user._id,
  email: user.email,
  role: user.role,
  iat: issued_at_timestamp,
  exp: expiration_timestamp
}
```

### Token Validation

- ✅ Signature verification
- ✅ Expiration check
- ✅ User existence verification
- ✅ Account status check
- ✅ Email verification status

### Cookie Security

```javascript
Cookie {
  httpOnly: true,           // JS cannot access
  secure: process.env.COOKIE_SECURE === 'true', // HTTPS only in production
  sameSite: 'Strict',       // CSRF protection
  maxAge: 7 * 24 * 60 * 60  // 7 days
}
```

---

## 10. Logging & Monitoring

### Security Events Logged

```javascript
// Successful authentication
✅ Authenticated: user@email.com - GET /api/auth/me

// Failed authentication
⚠️  Auth failure from 192.168.1.1: POST /api/auth/login

// Suspicious patterns
🚨 Potential injection attempt from 192.168.1.2: /api/users?username[$ne]=null

// Large payloads
⚠️  Large payload from 192.168.1.3: 5242880 bytes
```

### Error Logging

- **Development:** Full stack traces included
- **Production:** Generic messages, errors logged to service
- **User ID tracking:** Helps identify suspicious patterns

---

## 11. Integration with Enhanced Controllers

The security middleware works with the existing enhanced controllers:

```javascript
// authController_enhanced.js
exports.register = asyncHandler(async (req, res) => {
  // Input validation via inputValidation.js
  // Sanitized via securityMiddleware.js
  // Rate limited via authLimiter
});

// productController_enhanced.js
exports.createProduct = asyncHandler(async (req, res) => {
  // Protected route (protect middleware)
  // Admin only (restrictTo('admin') middleware)
  // Rate limited (apiLimiter)
  // Input validated and sanitized
});
```

---

## 12. Deployment Checklist

### Before Production Deployment

- [ ] ✅ Set NODE_ENV=production
- [ ] ✅ Generate strong JWT_SECRET (min 32 chars, no "dev_" prefix)
- [ ] ✅ Generate strong SESSION_SECRET (min 32 chars, no "dev_" prefix)
- [ ] ✅ Set COOKIE_SECURE=true
- [ ] ✅ Set HELMET_HSTS_PRELOAD=true
- [ ] ✅ Update FRONTEND_URL to production domain
- [ ] ✅ Update ALLOWED_ORIGINS to production domain
- [ ] ✅ Use MongoDB Atlas with authentication
- [ ] ✅ Enable HTTPS/SSL certificate
- [ ] ✅ Set up error logging service (Sentry, etc.)
- [ ] ✅ Configure database backups
- [ ] ✅ Set up monitoring and alerting
- [ ] ✅ Test rate limiting configuration
- [ ] ✅ Verify CORS working correctly
- [ ] ✅ Test all protected routes
- [ ] ✅ Review environment variables

---

## 13. Security Best Practices

### DO ✅

- ✅ Always validate and sanitize user input
- ✅ Use HTTPS in production
- ✅ Store secrets in environment variables
- ✅ Update dependencies regularly
- ✅ Use strong, unique passwords
- ✅ Implement rate limiting
- ✅ Log security events
- ✅ Use HTTPS-only cookies
- ✅ Implement CORS properly
- ✅ Use security headers (Helmet)

### DON'T ❌

- ❌ Don't expose sensitive data in error messages
- ❌ Don't commit .env files to git
- ❌ Don't use weak secrets
- ❌ Don't disable security headers
- ❌ Don't allow unrestricted CORS
- ❌ Don't store passwords in plain text
- ❌ Don't log sensitive information
- ❌ Don't use deprecated libraries
- ❌ Don't skip input validation
- ❌ Don't disable rate limiting

---

## 14. Troubleshooting

### "Environment variables not found"

**Solution:** Create `.env` file from `.env.example`

```bash
cp .env.example .env
```

### "CORS origin not allowed"

**Solution:** Add origin to `ALLOWED_ORIGINS` in `.env`

```env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### "Too many requests"

**Solution:** Wait for rate limit window to pass or configure higher limits in `.env`

### "Invalid token"

**Solution:** Clear cookies and login again

```bash
localStorage.removeItem('token')
```

### "Injection attempt detected"

**Solution:** Remove MongoDB operators from request, use proper query syntax

---

## 15. Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/knowledge/file-system/security/introduction/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [CORS Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 16. Security Implementation Summary

| Component | Status | Configuration |
|-----------|--------|---------------|
| Environment Validation | ✅ | `validateEnv.js` |
| Input Sanitization | ✅ | `securityMiddleware.js` |
| Rate Limiting | ✅ | `rateLimiting.js` |
| Authentication | ✅ | `authMiddleware_enhanced.js` |
| CORS | ✅ | Environment variables |
| Security Headers | ✅ | Helmet configuration |
| Password Security | ✅ | Bcryptjs, 12 rounds |
| JWT Tokens | ✅ | 7-day expiration |
| Protected Routes | ✅ | Updated route files |
| Error Handling | ✅ | Generic messages |
| Logging | ✅ | Security events |

---

## Conclusion

The MatchMajor application now has enterprise-grade security with:

- ✅ Comprehensive input validation and sanitization
- ✅ Environment-based configuration
- ✅ Rate limiting on all endpoints
- ✅ Multi-layer authentication and authorization
- ✅ CORS security
- ✅ Security headers with Helmet
- ✅ Secure password hashing
- ✅ JWT token protection
- ✅ Security event logging
- ✅ Production-ready error handling
