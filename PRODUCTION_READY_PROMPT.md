# 🚀 MatchMajor Production-Ready Prompt for Claude Haiku 4.5

## OBJECTIVE
Make the MatchMajor web application fully functional and production-ready for domain deployment.

## PRE-EXECUTION CHECKLIST
- [ ] Read the FULL_STACK_DIAGNOSTIC.md to understand all issues
- [ ] Back up critical files before making changes
- [ ] Test after each major section
- [ ] Commit changes to Git after each phase

---

## PHASE 1: FIX CRITICAL PATH ISSUES (Do This First!)

### Task 1.1: Fix Auth Route Imports
**File**: `/routes/authRoutes.js`  
**Issue**: Imports reference non-existent paths with `/server/` prefix  
**Action**: 
- Fix line 9: Change `require('../server/controllers/authController_enhanced')` to `require('../server/controllers/authController')`
- Fix line 10: Change `require('../server/middleware/authMiddleware_enhanced')` to `require('../server/middleware/authMiddleware_enhanced')`
- Verify the actual files exist before making changes

### Task 1.2: Fix CSS Syntax Error  
**File**: `/src/pages/ChatRoom.css`  
**Issue**: Lines 130-132 have invalid CSS variable  
**Action**:
- Find: `background-color: var(--gold-%);` and replace with `background-color: var(--gold);`
- This is in the `.create-post-btn:hover` or similar class around line 130
- Run `npm run build` to verify CSS compiles

### Task 1.3: Update Docker Base Image
**File**: `/Dockerfile`  
**Issue**: `node:18-alpine` has 21 vulnerabilities  
**Action**:
- Replace `FROM node:18-alpine AS frontend-build` with `FROM node:20-alpine AS frontend-build` (line 2)
- Replace `FROM node:18-alpine` with `FROM node:20-alpine` (line 20)
- This fixes all security vulnerabilities

---

## PHASE 2: CONSOLIDATE PROJECT STRUCTURE

### Task 2.1: Move Routes Under server/
**Action**: All API routes should be in `/server/routes/`
1. Verify routes exist in `/server/routes/` directory (they should be moved here)
2. Update `/server/server.js` to import from `./routes/` instead of `../routes/`
3. Keep `/routes/` directory at root temporarily for backward compatibility

### Task 2.2: Consolidate Middleware
**Action**: All middleware should be in `/server/middleware/`
1. Verify `/server/middleware/authMiddleware_enhanced.js` exists
2. Update all route imports to use `/server/middleware/` consistently
3. Ensure no duplicate middleware files

**Files to clean up**:
- `/middleware/authMiddleware.js` - Move logic to `/server/middleware/`
- `/middleware/` directory - Delete after migration if empty

---

## PHASE 3: REGISTER ALL MISSING ROUTES IN SERVER.JS

### Task 3.1: Update `/server/server.js` - Add All Route Registrations
**Location**: Lines 88-104 in the `setupRoutes()` function

**Current** (only 2 routes registered):
```javascript
function setupRoutes() {
  const authRoutes = require('../routes/authRoutes');
  const healthRoutes = require('./routes/health');
  
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authLimiter, authRoutes);
  
  app.use('*', (req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
  });
  
  app.use(errorHandler);
}
```

**Replace with** (all 10 routes):
```javascript
function setupRoutes() {
  // Import all route modules
  const authRoutes = require('../routes/authRoutes');
  const surveyRoutes = require('../routes/surveyRoutes');
  const matchRoutes = require('../routes/matchRoutes');
  const productRoutes = require('../routes/productRoutes');
  const cartRoutes = require('../routes/cartRoutes');
  const orderRoutes = require('../routes/orderRoutes');
  const postRoutes = require('../routes/postRoutes');
  const messageRoutes = require('../routes/messageRoutes');
  const chatroomRoutes = require('../routes/chatroomRoutes');
  const healthRoutes = require('./routes/health');
  
  // Register routes with appropriate middleware
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/survey', surveyRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/chatroom', chatroomRoutes);
  
  // 404 handler - must be before error handler
  app.use('*', (req, res, next) => {
    next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
  });

  // Global error handling middleware - must be LAST
  app.use(errorHandler);
}
```

**Testing**: After this change, verify routes with:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/auth/me  # Should return 401 if not authenticated (expected)
```

---

## PHASE 4: CREATE/FIX MISSING API CLIENT FILES

### Task 4.1: Verify/Create `/src/api/products.js`
**Status**: Should exist, verify it has:
- `getProducts()` - GET /api/products
- `getProduct(id)` - GET /api/products/:id
- `createProduct(data)` - POST /api/products (admin)
- `updateProduct(id, data)` - PUT /api/products/:id (admin)
- `deleteProduct(id)` - DELETE /api/products/:id (admin)

### Task 4.2: Create `/src/api/cart.js`
**Missing**: Create this file with:
```javascript
export const getCart = async () => api.get('/cart');
export const addToCart = async (productId, quantity) => 
  api.post('/cart/add', { productId, quantity });
export const updateCartItem = async (productId, quantity) => 
  api.put('/cart/item', { productId, quantity });
export const removeFromCart = async (productId) => 
  api.delete(`/cart/item/${productId}`);
export const clearCart = async () => api.delete('/cart');
```

### Task 4.3: Create `/src/api/orders.js`
**Missing**: Create this file with:
```javascript
export const createOrder = async (orderData) => 
  api.post('/orders', orderData, { skipCache: true });
export const getOrders = async () => api.get('/orders');
export const getOrder = async (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = async (id, status) => 
  api.put(`/orders/${id}`, { status });
export const cancelOrder = async (id) => api.delete(`/orders/${id}`);
```

### Task 4.4: Create `/src/api/matches.js`
**Missing**: Create this file with:
```javascript
export const getMatches = async () => 
  api.get('/matches', { skipCache: true });
export const getUserProfile = async (userId) => 
  api.get(`/matches/${userId}`);
export const updateProfile = async (profileData) => 
  api.put('/matches/profile', profileData, { skipCache: true });
```

### Task 4.5: Complete `/src/api/surveys.js`
**Status**: Exists but may be incomplete, ensure has:
```javascript
export const saveSurvey = async (surveyData) => 
  api.post('/survey', surveyData, { skipCache: true });
export const getSurvey = async () => api.get('/survey');
export const getUserSurvey = async (userId) => 
  api.get(`/survey/${userId}`);
export const deleteSurvey = async () => api.delete('/survey');
export const getAllSurveys = async () => api.get('/survey/all');
```

### Task 4.6: Fix `/src/api/posts.js`
**Status**: Exists, verify all functions:
```javascript
export const getPosts = async (limit = 10) => 
  api.get('/posts', { params: { limit }, skipCache: true });
export const createPost = async (content) => 
  api.post('/posts', { content }, { skipCache: true });
export const likePost = async (postId) => 
  api.post(`/posts/${postId}/like`, {}, { skipCache: true });
export const deletePost = async (postId) => 
  api.delete(`/posts/${postId}`, { skipCache: true });
export const getPostComments = async (postId) => 
  api.get(`/posts/${postId}/comments`);
```

### Task 4.7: Create `/src/api/messages.js`
**Missing**: Create this file with:
```javascript
export const getMessages = async (limit = 50) => 
  api.get('/messages', { params: { limit }, skipCache: true });
export const sendMessage = async (text) => 
  api.post('/messages', { text }, { skipCache: true });
export const deleteMessage = async (id) => 
  api.delete(`/messages/${id}`, { skipCache: true });
export const getConversation = async (userId) => 
  api.get(`/messages/conversation/${userId}`);
```

### Task 4.8: Fix `/src/api/chat.js`
**Status**: Exists but may fail gracefully, ensure it uses proper endpoints

---

## PHASE 5: VERIFY CONTROLLERS & MODELS

### Task 5.1: Check Auth Controller
**File**: Verify `/server/controllers/authController.js` OR `/server/controllers/authController_enhanced.js` exists  
**Required Functions**:
- `register(req, res)` - Create new user
- `login(req, res)` - Authenticate user
- `logout(req, res)` - Clear session
- `getCurrentUser(req, res)` - Get logged-in user data

### Task 5.2: Verify Survey Model & Controller
**Files**:
- `/models/Survey.js` - Should exist
- `/controllers/surveyController.js` - Should exist
**Verify**: Survey model has proper relationship to User model

### Task 5.3: Check All Controller Implementations
**Verify these files exist and have all CRUD operations**:
- ✅ `/controllers/surveyController.js`
- ✅ `/controllers/matchController.js`
- ✅ `/controllers/productController_enhanced.js`
- ✅ `/controllers/cartController_enhanced.js`
- ✅ `/controllers/orderController_enhanced.js`
- ✅ `/controllers/postController.js`
- ✅ `/controllers/messageController.js`
- ✅ `/controllers/chatroomController.js`

---

## PHASE 6: FIX FRONTEND PAGES

### Task 6.1: Fix ChatRoom.css CSS Syntax
Already covered in Phase 1.2 - verify fix is applied

### Task 6.2: Verify Survey.js Component
**File**: `/src/pages/Survey.js`  
**Check**: 
- Uses `saveSurvey()` from `/src/api/surveys.js` ✅
- Has proper error handling
- Form data matches database schema

### Task 6.3: Fix Matches.js Component  
**File**: `/src/pages/Matches.js`  
**Ensure**:
- Imports `getMatches()` from `/src/api/matches.js`
- Properly displays match cards
- Has loading and error states

### Task 6.4: Verify Cart/Checkout Flow
**Files**: 
- `/src/pages/Cart.js` - Uses cart API correctly
- `/src/pages/Checkout.js` - Uses order API correctly
- `/src/pages/ProductDetail.js` - Can add to cart
- Verify all use proper API endpoints

---

## PHASE 7: ENVIRONMENT & DATABASE

### Task 7.1: Verify Environment Variables
**File**: `/server/.env` and `.env`  
**Required Variables**:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://[your-domain]:27017/matchmajor
JWT_SECRET=[32+ character secure string]
FRONTEND_URL=[your-domain.com]
ALLOWED_ORIGINS=[your-domain.com]
REACT_APP_API_URL=https://[your-domain.com]/api
```

### Task 7.2: Database Connection Test
**Run**: `npm run export:direct` to test MongoDB connection  
**Expected**: Exports database collections successfully

### Task 7.3: Verify Database Models
**Check** these models exist in `/models/`:
- ✅ `User.js`
- ✅ `Product.js`
- ✅ `Order.js`
- ✅ `Cart.js`
- ✅ `Survey.js`
- ⚠️ `Post.js` - Verify exists
- ⚠️ `Message.js` - Verify exists
- ⚠️ `Chatroom.js` - Verify exists

---

## PHASE 8: BUILD & TEST

### Task 8.1: Frontend Build
```bash
npm run build
```
**Expected**: 
- No errors
- Output: "Successfully compiled"
- CSS compiles without errors

### Task 8.2: Backend Server Test
```bash
npm run start:backend
```
**Expected**:
- Server starts without errors
- MongoDB connects successfully
- All routes registered
- "🚀 MatchMajor Server Started" message

### Task 8.3: Health Check Endpoints
```bash
# In separate terminal
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/detailed
curl http://localhost:5000/api/health/ready
curl http://localhost:5000/api/health/live
```
**Expected**: All return 200 OK with health status

### Task 8.4: Test Auth Flow
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!","confirmPassword":"TestPass123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -H "Cookie: token=[your-token-from-login]"
```

### Task 8.5: Test All API Endpoints
```bash
# For each endpoint:
curl http://localhost:5000/api/products     # Should work
curl http://localhost:5000/api/survey       # Should work with auth
curl http://localhost:5000/api/matches      # Should work with auth
curl http://localhost:5000/api/cart         # Should work with auth
curl http://localhost:5000/api/orders       # Should work with auth
curl http://localhost:5000/api/posts        # Should work with auth
curl http://localhost:5000/api/messages     # Should work with auth
curl http://localhost:5000/api/chatroom     # Should work with auth
```

**Expected**: No 404 errors, proper auth validation

---

## PHASE 9: DOCKER SETUP

### Task 9.1: Build Docker Image
```bash
docker build -t matchmajor:latest .
```
**Expected**: Build completes successfully without errors

### Task 9.2: Test Docker Compose
```bash
docker-compose up --build
```
**Expected**:
- All services start (MongoDB, backend, frontend)
- No port conflicts
- Services communicate properly
- Frontend accessible at http://localhost:3000

### Task 9.3: Run Health Checks
```bash
docker-compose logs backend
```
**Expected**: Server startup messages, no errors

---

## PHASE 10: DOMAIN CONFIGURATION

### Task 10.1: Update CORS for Domain
**When you have your domain** (e.g., `matchmajor.yourdomain.com`):

Update `/server/.env`:
```
FRONTEND_URL=https://matchmajor.yourdomain.com
ALLOWED_ORIGINS=https://matchmajor.yourdomain.com,https://api.yourdomain.com
```

### Task 10.2: Configure DNS
Point your domain to your server:
- **A Record**: yourdomain.com → [your-server-IP]
- **CNAME**: matchmajor.yourdomain.com → yourdomain.com
- **MX Records**: Configure for email (if needed)

### Task 10.3: SSL Certificate Setup
```bash
# Using Let's Encrypt with Certbot
certbot certonly --standalone -d matchmajor.yourdomain.com
```

### Task 10.4: Update Environment for Production
Create `/server/.env.production`:
```
NODE_ENV=production
PORT=443
MONGODB_URI=mongodb+srv://[user]:[pass]@[cluster].mongodb.net/matchmajor
JWT_SECRET=[very-secure-random-string-min-32-chars]
FRONTEND_URL=https://matchmajor.yourdomain.com
ALLOWED_ORIGINS=https://matchmajor.yourdomain.com
REACT_APP_API_URL=https://matchmajor.yourdomain.com/api
ENABLE_HELMET=true
ENABLE_CORS=true
ENABLE_RATE_LIMIT=true
COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
```

### Task 10.5: Update Docker Compose for Domain
Update `/docker-compose.yml`:
```yaml
environment:
  FRONTEND_URL: https://matchmajor.yourdomain.com
  ALLOWED_ORIGINS: https://matchmajor.yourdomain.com
  REACT_APP_API_URL: https://matchmajor.yourdomain.com/api
  NODE_ENV: production
```

---

## PHASE 11: FINAL VERIFICATION

### Task 11.1: Verify All API Endpoints Respond
```bash
# Create a test script to verify all endpoints
# For each endpoint, check:
# - Status code (not 404)
# - Response format (valid JSON)
# - Auth requirements (401 if no token, works with token)
```

### Task 11.2: Frontend-Backend Integration Test
1. Load frontend at your domain
2. Register new account
3. Login
4. Complete survey
5. View matches
6. Create post
7. Add product to cart
8. Checkout

**Expected**: All flows work without JavaScript errors

### Task 11.3: Database Integrity Check
```bash
# Connect to MongoDB and verify:
# - User collection has records
# - Survey collection has data
# - Products are available
# - No orphaned records
```

### Task 11.4: Performance Baseline
- Frontend load time: < 3 seconds
- API response time: < 200ms
- Database queries: < 100ms
- Cache hit rate: > 50%

### Task 11.5: Security Checklist
- ✅ HTTPS enabled
- ✅ JWT tokens work
- ✅ CORS properly restricted
- ✅ Rate limiting active
- ✅ No console errors
- ✅ No sensitive data in logs
- ✅ Password hashing working
- ✅ CSRF protection active

---

## SUCCESS CRITERIA ✅

**Application is production-ready when:**

1. ✅ All 10 API routes responding correctly (not 404)
2. ✅ Frontend builds without errors or warnings
3. ✅ All React pages load without JavaScript errors
4. ✅ Authentication flow works end-to-end
5. ✅ Database operations functional and performant
6. ✅ Docker builds and runs successfully
7. ✅ Health check endpoints all passing
8. ✅ HTTPS/SSL certificate working
9. ✅ Domain DNS properly configured
10. ✅ CORS restrictions working
11. ✅ Rate limiting functioning
12. ✅ Error handling comprehensive
13. ✅ All data validations working
14. ✅ No security vulnerabilities
15. ✅ API caching working (40%+ hit rate)

---

## TESTING COMMANDS REFERENCE

```bash
# Frontend
npm run build
npm run test

# Backend
npm run dev
npm run export:direct

# Docker
docker-compose up --build
docker-compose logs -f
docker-compose down

# Health checks
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/detailed
curl http://localhost:5000/api/health/ready

# Database
npm run migrate:survey

# Production build
npm run build:prod
```

---

## GIT COMMIT STRATEGY

After each phase, commit:
```bash
git add .
git commit -m "Phase X: [Description]"
git push origin main
```

**Commit Messages**:
- Phase 1: "fix: resolve critical path and CSS issues"
- Phase 2: "refactor: consolidate project structure"
- Phase 3: "feat: register all API routes"
- Phase 4: "feat: create missing API clients"
- Phase 5: "test: verify controllers and models"
- Phase 6: "fix: resolve frontend component issues"
- Phase 7: "config: update environment and database"
- Phase 8: "test: full build and endpoint testing"
- Phase 9: "ci: docker build and compose setup"
- Phase 10: "config: domain and SSL setup"
- Phase 11: "test: final verification and security check"

---

## ESTIMATED TIME

- Phase 1-3: 30 minutes (critical fixes)
- Phase 4-5: 45 minutes (API completeness)
- Phase 6-7: 30 minutes (frontend & environment)
- Phase 8-9: 30 minutes (build & docker)
- Phase 10-11: 30 minutes (domain & final testing)

**Total**: 2.5-3 hours for full production readiness

---

## ERROR HANDLING

If you encounter errors:

1. **Path not found**: Check file locations, may need to consolidate structure first
2. **Import errors**: Verify all route imports updated to correct paths
3. **404 on routes**: Ensure all routes registered in server.js setupRoutes()
4. **CSS compile errors**: Check ChatRoom.css line 130 for syntax issues
5. **Database errors**: Verify MONGODB_URI and connection settings
6. **Build errors**: Check Node version (should be 18+), run `npm install`
7. **Docker errors**: Ensure ports not in use, check .env variables

---

## SUPPORT REFERENCES

- API Documentation: See API_QUICK_REFERENCE.md
- Database Schema: See DATABASE_SCHEMA.md
- Deployment Guide: See DEPLOYMENT_GUIDE.md
- Security: See SECURITY_IMPLEMENTATION_GUIDE.md
- Troubleshooting: See error logs in console/docker

---

**Generated**: April 19, 2026  
**For**: Claude Haiku 4.5  
**Objective**: Full production deployment  
**Status**: Ready for execution

