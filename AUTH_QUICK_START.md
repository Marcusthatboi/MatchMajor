# 🚀 Authentication System - Quick Setup & Testing

## ⚡ 5-Minute Setup

### 1. Verify Backend Configuration

**Check `.env` file** (in project root):

```env
MONGODB_URI=mongodb://localhost:27017/matchmajor
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
PORT=5000
```

✅ If using MongoDB Atlas instead:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/matchmajor
```

### 2. Install Dependencies

```bash
# If not already installed
npm install              # Frontend dependencies

# Backend dependencies (from backend folder or root)
npm install --legacy-peer-deps
```

### 3. Start Development Servers

**Terminal 1 - Start Backend**:
```bash
cd /path/to/MatchMajor
npm run server-dev
# Expected: "Server running on port 5000"
```

**Terminal 2 - Start Frontend**:
```bash
cd /path/to/MatchMajor
npm start
# Expected: "Compiled successfully!"
# Opens http://localhost:3000 automatically
```

---

## ✅ Quick Verification Checklist

### Verify Backend Started ✅
```bash
curl http://localhost:5000/api/auth/me
# Should see: "Not authorized to access this route"
# (Good - means server is running and auth is working)
```

### Verify Frontend Started ✅
- Navigate to http://localhost:3000
- Should see MatchMajor home page
- Navbar should be visible

### Verify Database Connected ✅
- Check terminal running backend
- Should see: "Connected to MongoDB" or "MongoDB connection successful"

---

## 🧪 Quick Test (1 minute)

### Test 1: Sign Up (30 seconds)

1. Navigate to http://localhost:3000/register
2. Fill in form:
   - **Username**: `testuser123`
   - **Email**: `test123@example.com`
   - **Password**: `TestPass123`
   - **Confirm Password**: `TestPass123`
3. Click **Register**

**Expected Result** ✅:
- Should redirect to `/survey` page
- Should see "Welcome, testuser123" in Navbar
- Should see survey form

**If it fails**:
- Check browser console (F12 → Console tab) for errors
- Check backend console for errors
- Verify MongoDB is running

---

### Test 2: Page Refresh (Session Persistence)

1. On survey page, press **F5** to refresh
2. Page should reload

**Expected Result** ✅:
- Should still see "Welcome, testuser123" in Navbar
- Should NOT redirect to login page
- Should remain on `/survey` page
- Session persists automatically

**If it fails**:
- Check backend console for JWT verification errors
- Check browser DevTools → Network → see `/api/auth/me` call during refresh

---

### Test 3: Logout

1. Click on username in top right (Navbar)
2. Click **Logout** from dropdown

**Expected Result** ✅:
- Should redirect to `/login` page
- Should NOT see username in Navbar
- Cookie should be cleared

---

### Test 4: Login Again

1. On login page, fill in:
   - **Email**: `test123@example.com`
   - **Password**: `TestPass123`
2. Click **Login**

**Expected Result** ✅:
- Should redirect to `/survey`
- Should see "Welcome, testuser123" in Navbar

---

## 🔍 Debugging Tools

### Check JWT Cookie in Browser

1. Open Browser DevTools (**F12**)
2. Go to **Application** tab
3. In left sidebar: **Cookies** → **http://localhost:3000**
4. Look for **token** cookie

**Expected** ✅:
- Token cookie should exist
- `httpOnly` should be checked ✓
- `Secure` should be checked ✓ (unchecked on localhost is normal)

### Check API Calls in Network Tab

1. Open Browser DevTools (**F12**)
2. Go to **Network** tab
3. Refresh page
4. Look for requests to:
   - `/api/auth/me` - Should get user data back
   - `/api/survey/?` - Should be available if logged in

**Expected** ✅:
- `/api/auth/me` returns `200` with user data
- Requests include `Cookie: token=...` header automatically

### Check Backend Console

You should see logs like:
```
🔄 Initializing user... (on frontend)
✅ User loaded: testuser123 (on frontend)
```

### Check MongoDB Data

```bash
# Connect to MongoDB
mongosh

# List databases
show databases

# Use matchmajor database
use matchmajor

# View users collection
db.users.find()

# Should see created user
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot POST /api/auth/register"

**Cause**: Backend server not running

**Solution**:
```bash
npm run server-dev
# Check console for "Server running on port 5000"
```

---

### Issue 2: "Network Error" when trying to register

**Cause**: Backend or frontend not running, or CORS issue

**Solution**:
```bash
# 1. Check both servers running
npm run server-dev   # Terminal 1
npm start            # Terminal 2

# 2. Clear browser cache
# DevTools → Application → Clear Storage

# 3. Check CORS in server.js
# origin should be: 'http://localhost:3000' for development
```

---

### Issue 3: "User already exists with that email"

**Cause**: Email was already registered in previous test

**Solution**: Use a different email:
```
test456@example.com  (instead of test123@example.com)
```

---

### Issue 4: Login shows "Invalid credentials"

**Cause**: Wrong password or email/username mismatch

**Solution**:
```
Email: testuser123@example.com
Password: TestPass123
(Make sure to use exact email from registration)
```

---

### Issue 5: "500 Server Error" when logging in

**Cause**: MongoDB not connected or JWT_SECRET not set

**Solution**:
```bash
# 1. Restart backend with proper .env
npm run server-dev

# 2. Check .env file has JWT_SECRET
JWT_SECRET=dev-secret-key

# 3. Verify MongoDB is running
mongosh
```

---

### Issue 6: Page refreshes but still logged out

**Cause**: User context not loading session from backend

**Solution**:
```bash
# 1. Check browser console for errors (F12 → Console)
# 2. Check backend logs for /api/auth/me errors
# 3. Verify JWT_SECRET matches on backend
# 4. Check token in browser DevTools → Application → Cookies
```

---

## 📋 Testing Scenarios

### Scenario 1: Register → Survey → Logout → Login

```bash
# 1. Register
http://localhost:3000/register
# Fill form, click Register

# 2. Verify on Survey page
# Should see filled survey form

# 3. Logout
# Click username dropdown → Logout

# 4. Login again
# Go to http://localhost:3000/login
# Fill same credentials

# Expected: Back on survey page
```

### Scenario 2: Session Persistence Across Refresh

```bash
# 1. Login to account
# 2. Press F5 (refresh)
# 3. Should stay logged in
# 4. Try this 5 times - should always stay logged in
```

### Scenario 3: Invalid Login Attempts

```bash
# 1. Try wrong password
# Should see: "Invalid credentials"

# 2. Try wrong email
# Should see: "Invalid credentials"

# 3. Try non-existent account
# Should see: "Invalid credentials"

# Note: All three should show same generic message (security best practice)
```

### Scenario 4: Rate Limiting

```bash
# 1. Try to login 6 times with wrong password quickly
# 6th attempt should show: "Too many authentication attempts"

# 2. Wait 15 minutes
# 3. Should be able to try again

# (This is enforced by backend rate limiting)
```

---

## 📊 System Verification

### Frontend Components ✅

- [x] `src/context/UserContext.js` - Global state
- [x] `src/pages/Login.js` - Login form
- [x] `src/pages/Register.js` - Signup form
- [x] `src/components/UI/Navbar.js` - Shows user + logout
- [x] `src/api/auth.js` - API calls
- [x] `src/App.js` - Protected routes

### Backend Components ✅

- [x] `controllers/authController.js` - Auth logic
- [x] `middleware/authMiddleware.js` - JWT verification
- [x] `models/User.js` - User schema + password hashing
- [x] `routes/authRoutes.js` - Auth endpoints
- [x] `server/server.js` - CORS + security

### Database Components ✅

- [x] MongoDB collection: `users`
- [x] User document includes: username, email, password (hashed), role
- [x] Passwords automatically hashed before save
- [x] createAt/updatedAt timestamps

### Security Features ✅

- [x] Passwords hashed (bcrypt, 12 rounds)
- [x] JWT tokens (7 day expiration)
- [x] HTTP-only cookies (XSS-safe)
- [x] Rate limiting (5 attempts/15 min)
- [x] CORS configured
- [x] Helmet security headers

---

## 🎯 Commands Cheat Sheet

```bash
# Start backend
npm run server-dev

# Start frontend
npm start

# Run both simultaneously (from root if using concurrently)
npm run dev

# Check if backend is running
curl http://localhost:5000/api/auth/me

# Connect to MongoDB
mongosh

# View users in database
db.users.find()

# Clear browser cache
# DevTools → Application → Clear All Site Data
```

---

## 📞 Support Checklist

Before reporting issues, verify:

- [ ] MongoDB is running (`mongosh` works)
- [ ] Backend server shows "Server running on port 5000"
- [ ] Frontend shows "Compiled successfully!"
- [ ] `.env` file exists with `JWT_SECRET`
- [ ] Browser allows cookies
- [ ] No browser extensions blocking requests
- [ ] Console has no errors (F12 → Console)
- [ ] Network requests show 200 status (F12 → Network)

---

## ✨ You're All Set!

Your authentication system is complete and ready to use. If you run through the quick test and everything passes, you have a fully functional authentication system with:

✅ Sign up  
✅ Login  
✅ Logout  
✅ Session persistence  
✅ Password hashing  
✅ JWT tokens  
✅ Secure cookies  

All user data will now be associated with authenticated users!
