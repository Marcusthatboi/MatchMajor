# 🏗️ Authentication System - Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MATCHMAJOR APPLICATION                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────┐   ┌──────────────────────────────┐ │
│  │     FRONTEND (React)             │   │    BACKEND (Node/Express)    │ │
│  │   (http://localhost:3000)        │   │   (http://localhost:5000)    │ │
│  │                                  │   │                              │ │
│  │  ┌────────────────────────────┐  │   │  ┌──────────────────────────┐ │
│  │  │  UserProvider Wrapper      │  │   │  │  Security Middleware     │ │
│  │  │ (src/context/UserContext)  │  │   │  │ - Helmet (headers)       │ │
│  │  │                            │  │   │  │ - CORS (credentials)     │ │
│  │  │ ┌────────────────────────┐ │  │   │  │ - Rate Limiting          │ │
│  │  │ │   useUser() Hook       │ │  │   │  │ - Cookie Parser          │ │
│  │  │ │ Returns:               │ │  │   │  └──────────────────────────┘ │
│  │  │ │ - user (object)        │ │  │   │                              │
│  │  │ │ - login()              │ │  │   │  ┌──────────────────────────┐ │
│  │  │ │ - logout()             │ │  │   │  │  Auth Routes             │ │
│  │  │ │ - register()           │ │  │   │  │ POST /register           │ │
│  │  │ │ - isAuthenticated      │ │  │   │  │ POST /login              │ │
│  │  │ └────────────────────────┘ │  │   │  │ POST /logout             │ │
│  │  │                            │  │   │  │ GET  /me (protected)     │ │
│  │  └────────────────────────────┘  │   │  └──────────────────────────┘ │
│  │           ↓                       │   │           ↑                    │
│  │  ┌────────────────────────────┐  │   │  ┌──────────────────────────┐ │
│  │  │  Pages & Components        │  │   │  │  Auth Controller         │ │
│  │  │ - Login.js                 │  │   │  │ exports:                 │ │
│  │  │ - Register.js              │◄─┼───┤►│ - register()             │ │
│  │  │ - Navbar.js                │  │   │  │ - login()                │ │
│  │  │ - Survey.js                │  │   │  │ - logout()               │ │
│  │  │ - Protected Routes (App)   │  │   │  │ - getCurrentUser()       │ │
│  │  └────────────────────────────┘  │   │  └──────────────────────────┘ │
│  │           ↓                       │   │           ↓                    │
│  │  ┌────────────────────────────┐  │   │  ┌──────────────────────────┐ │
│  │  │  API Service Layer         │  │   │  │  Auth Middleware         │ │
│  │  │ (src/api/auth.js)          │  │   │  │ protect:                 │ │
│  │  │                            │  │   │  │ - Get token from cookie  │ │
│  │  │ Exported Functions:        │  │   │  │ - Verify JWT             │ │
│  │  │ - register()               │  │   │  │ - Attach user to request │ │
│  │  │ - login()                  │  │   │  │ - Call next()            │ │
│  │  │ - logout()                 │  │   │  │                          │ │
│  │  │ - getCurrentUser()         │  │   │  └──────────────────────────┘ │
│  │  │                            │  │   │           ↓                    │
│  │  └────────────────────────────┘  │   │  ┌──────────────────────────┐ │
│  │           ↓                       │   │  │  User Model              │ │
│  │  ┌────────────────────────────┐  │   │  │ (models/User.js)         │ │
│  │  │  Axios Configuration       │  │   │  │                          │ │
│  │  │ withCredentials: true ────┼──┼───┤►│ Schema:                  │ │
│  │  │ (auto-sends cookies)       │  │   │  │ - username (unique)      │ │
│  │  └────────────────────────────┘  │   │  │ - email (unique)         │ │
│  │                                  │   │  │ - password (hashed)      │ │
│  │  ┌────────────────────────────┐  │   │  │ - role (user/admin)      │ │
│  │  │  JWT Cookie                │  │   │  │                          │ │
│  │  │ - httpOnly: true (XSS-safe)│  │   │  │ Methods:                 │ │
│  │  │ - secure: prod only        │  │   │  │ - comparePassword()      │ │
│  │  │ - sameSite: strict (CSRF)  │  │   │  │ - hash password (pre)    │ │
│  │  │ - maxAge: 7 days           │  │   │  └──────────────────────────┘ │
│  │  └────────────────────────────┘  │   │           ↓                    │
│  └──────────────────────────────────┘   │  ┌──────────────────────────┐ │
│                                          │  │  MongoDB                 │ │
└──────────────────────────────────────────┤►│  Database                │ │
                                           │  │ collections/users       │ │
                                           │  └──────────────────────────┘ │
                                           └──────────────────────────────┘
```

---

## 🔄 Complete Authentication Flow

### 1. Registration Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      REGISTRATION SEQUENCE                              │
└─────────────────────────────────────────────────────────────────────────┘

USER INTERACTION:
┌─────────────────────┐
│  User navigates to  │
│  /register          │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│  Fills registration form:│
│  - username: john_doe    │
│  - email: john@test.com  │
│  - password: Pass123!    │
│  - confirm: Pass123!     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│   Frontend Validation (Register.js)      │
│ ✓ All fields required                    │
│ ✓ Password length >= 6                   │
│ ✓ Password match                         │
│ ✓ Email format valid                     │
└──────────┬───────────────────────────────┘
           │ All valid?
           ▼
┌──────────────────────────────────────────────────┐
│  POST /api/auth/register                        │
│  {                                              │
│    "username": "john_doe",                      │
│    "email": "john@test.com",                    │
│    "password": "Pass123!"                       │
│  }                                              │
│                                                 │
│  Headers sent automatically:                    │
│  - Cookie: token=... (if exists)                │
└──────────┬──────────────────────────────────────┘
           │ (HTTPS in production)
           ▼
┌──────────────────────────────────────────────────┐
│  Backend Processing (authController.js)         │
│                                                 │
│  1. Validate inputs                             │
│     - Check required fields                     │
│     - Check password length >= 6                │
│     ✗ Yes → next, No → return 400 error        │
│                                                 │
│  2. Check duplicate user                        │
│     - Query DB for email OR username            │
│     ✗ Found → return 400 "User exists"          │
│     ✓ Not found → continue                      │
│                                                 │
│  3. Create User document                        │
│     - Set: username, email, password (plain)    │
│     - Role: 'user' (default)                    │
│     - Save to MongoDB (trigger pre-save hook)   │
│                                                 │
│  4. Pre-save Hook (User.js)                     │
│     - Password modified? Yes → continue         │
│     - Generate salt: bcrypt.genSalt(12)         │
│     - Hash: bcrypt.hash(password, salt)         │
│     - Replace: user.password = hashed           │
│     - Save to database                          │
│                                                 │
│  5. Generate JWT Token                          │
│     - Create token with:                        │
│       { id: user._id, iat: timestamp }          │
│     - Sign with JWT_SECRET                      │
│     - Expires: 7 days                           │
│                                                 │
│  6. Set Cookie Header                           │
│     - res.cookie('token', token, {              │
│       httpOnly: true,   ← XSS-safe              │
│       secure: true,     ← HTTPS only (prod)     │
│       sameSite: 'strict',← CSRF protection      │
│       maxAge: 7*24*60*60*1000   ← 7 days        │
│     })                                          │
│                                                 │
│  7. Return Response                             │
│     {                                           │
│       "success": true,                          │
│       "user": {                                 │
│         "_id": "507f1f77bcf86cd799439011",     │
│         "username": "john_doe",                 │
│         "email": "john@test.com",               │
│         "role": "user"                          │
│       }                                         │
│     }                                           │
└──────────┬──────────────────────────────────────┘
           │ SET-COOKIE header with jwt
           ▼
┌──────────────────────────────────────────────────┐
│  Frontend Receives Response (Login.js)          │
│                                                 │
│  1. Check response.success                      │
│     ✓ true → continue                           │
│     ✗ false → show error message               │
│                                                 │
│  2. Update UserContext                          │
│     userContext.register(response.user)         │
│     - setUser(userData)                         │
│     - setError(null)                            │
│                                                 │
│  3. Navigate                                    │
│     navigate('/survey')                         │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Browser Automatically Stores:   │
│  - Cookie: token=<JWT>           │
│  - httpOnly → JS can't access    │
│  - Auto-sent with future requests│
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Page Renders (/survey)          │
│  - Navbar shows "john_doe"       │
│  - User can see survey form      │
│  - useUser() returns user data   │
└──────────────────────────────────┘

RESULT:
✅ User registered
✅ Password hashed + stored
✅ JWT created + sent
✅ Cookie stored (auto-sent)
✅ Context updated
✅ Logged in automatically
```

---

### 2. Login Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      LOGIN SEQUENCE                                     │
└─────────────────────────────────────────────────────────────────────────┘

USER INTERACTION:
┌─────────────────────┐
│  User navigates to  │
│  /login             │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│  Fills login form:       │
│  - email: john@test.com  │
│  - password: Pass123!    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│   Frontend Validation (Login.js)         │
│ ✓ Email required                         │
│ ✓ Password required                      │
└──────────┬───────────────────────────────┘
           │ Valid?
           ▼
┌──────────────────────────────────────────────────┐
│  POST /api/auth/login                           │
│  {                                              │
│    "email": "john@test.com",                    │
│    "password": "Pass123!"                       │
│  }                                              │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Backend Processing (authController.js)         │
│                                                 │
│  1. Validate inputs                             │
│     - Check email required → yes                │
│     - Check password required → yes             │
│     ✗ Missing → return 400 error               │
│                                                 │
│  2. Find user by email or username              │
│     - Query: User.findOne({ email OR username })│
│     ✗ Not found → return 401 "Invalid creds"    │
│     ✓ Found → continue                          │
│                                                 │
│  3. Compare passwords                           │
│     - Get: user.password (hashed from DB)       │
│     - Call: user.comparePassword(inputPassword) │
│       - Inside: bcrypt.compare(input, hashed)   │
│       - Returns: true/false                     │
│     ✗ No match → return 401 "Invalid creds"     │
│     ✓ Match → continue                          │
│                                                 │
│  4. Generate JWT Token                          │
│     - Same as registration:                     │
│     - Token expires in 7 days                   │
│                                                 │
│  5. Set Cookie Header                           │
│     - Same httpOnly, secure, sameSite flags     │
│                                                 │
│  6. Return Response                             │
│     {                                           │
│       "success": true,                          │
│       "user": {                                 │
│         "_id": "507f1f77bcf86cd799439011",     │
│         "username": "john_doe",                 │
│         "email": "john@test.com",               │
│         "role": "user"                          │
│       }                                         │
│     }                                           │
└──────────┬──────────────────────────────────────┘
           │ SET-COOKIE header
           ▼
┌──────────────────────────────────────────────────┐
│  Frontend Receives Response (Login.js)          │
│                                                 │
│  1. Check response.success                      │
│  2. Update UserContext                          │
│  3. Navigate to /survey                         │
│  4. Browser stores cookie automatically         │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Logged In Successfully                         │
│  - Cookie stored with JWT                       │
│  - UserContext updated                          │
│  - Navbar shows username                        │
│  - Can access protected pages                   │
└──────────────────────────────────────────────────┘

RESULT:
✅ Password verified
✅ JWT created + sent
✅ Cookie stored
✅ Context updated
✅ Logged in
```

---

### 3. Session Persistence Flow (Page Refresh or Restart)

```
┌─────────────────────────────────────────────────────────────────────────┐
│              SESSION PERSISTENCE (AUTO-LOGIN)                           │
└─────────────────────────────────────────────────────────────────────────┘

BEFORE:
✓ User logged in
✓ JWT stored in cookie (httpOnly)

USER ACTION:
┌──────────────────────────────┐
│  User refreshes page (F5)   │
│  OR closes & reopens browser │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│  App Component Mounts/Remounts           │
│  - React renders App.js                  │
│  - UserProvider initializes              │
└──────────┬───────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  UserContext useEffect Hook Triggers            │
│  (runs on component mount)                      │
│                                                 │
│  useEffect(() => {                              │
│    const initializeUser = async () => {         │
│      try {                                      │
│        const response = await getCurrentUser() │
│        if (response.success && response.user) { │
│          setUser(response.user)                │
│        } else {                                │
│          setUser(null)                         │
│        }                                       │
│      } finally {                               │
│        setLoading(false)                       │
│      }                                         │
│    }                                           │
│    initializeUser()                            │
│  }, [])                                        │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Call GET /api/auth/me                          │
│  (from src/api/auth.js)                         │
│                                                 │
│  GET /api/auth/me                               │
│  Cookie: token=<JWT>  ← Auto-sent by axios     │
│                         (withCredentials: true) │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Backend Processing                             │
│                                                 │
│  1. Auth Route:                                 │
│     router.get('/me', protect, getCurrentUser) │
│                                                 │
│  2. Protect Middleware Runs                     │
│     - Extract token from req.cookies.token      │
│     - Verify: jwt.verify(token, JWT_SECRET)    │
│     ✗ Invalid/expired → return 401             │
│     ✓ Valid → continue                         │
│     - Decode token → get user id               │
│     - Query DB: User.findById(decoded.id)       │
│     - Attach to req.user                        │
│     - Call next()                               │
│                                                 │
│  3. getCurrentUser Controller Runs              │
│     - Access req.user (from middleware)         │
│     - Return user document (no password)        │
│     - Status: 200                               │
└──────────┬──────────────────────────────────────┘
           │ Response with user data
           ▼
┌──────────────────────────────────────────────────┐
│  Frontend Receives Response                     │
│                                                 │
│  {                                              │
│    "success": true,                             │
│    "user": {                                    │
│      "_id": "507f1f77bcf86cd799439011",        │
│      "username": "john_doe",                    │
│      "email": "john@test.com",                  │
│      "role": "user",                            │
│      "createdAt": "2024-01-15T..."             │
│    }                                            │
│  }                                              │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  UserContext Updates                            │
│  - setUser(response.user)                       │
│  - setLoading(false)                            │
│  - User now available throughout app            │
│  - useUser() hook returns updated user          │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Components Re-render with Cookie Data          │
│  - Navbar shows "john_doe"                      │
│  - Protected routes allow access                │
│  - Survey auto-loads user data                  │
│  - Page fully restored                          │
└──────────────────────────────────────────────────┘

RESULT:
✅ User auto-loaded from JWT
✅ No login page shown
✅ Session persists (7 days)
✅ All protected routes accessible
✅ Cookie auto-expires after 7 days
```

---

### 4. Logout Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      LOGOUT SEQUENCE                                    │
└─────────────────────────────────────────────────────────────────────────┘

USER ACTION:
┌──────────────────────────────────┐
│  Click username dropdown in      │
│  Navbar                          │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Click "Logout" button           │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Navbar Component Handler                       │
│  onClick → userContext.logout()                 │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  UserContext logout Function                    │
│                                                 │
│  logout = () => {                               │
│    apiLogout()  ← Call backend                  │
│    setUser(null)                                │
│    setError(null)                               │
│  }                                              │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  POST /api/auth/logout                          │
│  Cookie: token=<JWT>  ← Auto-sent               │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Backend Processing                             │
│                                                 │
│  exports.logout = (req, res) => {               │
│    res.cookie('token', '', {                    │
│      httpOnly: true,                            │
│      expires: new Date(0)  ← Past date          │
│    })                                           │
│                                                 │
│    res.status(200).json({                       │
│      success: true,                             │
│      message: 'Logged out successfully'         │
│    })                                           │
│  }                                              │
└──────────┬──────────────────────────────────────┘
           │ SET-COOKIE: token=; expires=1970
           ▼
┌──────────────────────────────────────────────────┐
│  Browser Processes Response                     │
│  - Receives empty token cookie                  │
│  - Expires date is in past                      │
│  - Browser deletes cookie                       │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Frontend Completes Logout                      │
│  - setUser(null) in UserContext                 │
│  - useUser() now returns null user              │
│  - Components re-render                         │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  App Navigation                                 │
│  navigate('/login')                             │
│  OR Protected routes redirect to login          │
└──────────┬──────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│  Logged Out State                               │
│  ✓ Cookie deleted                               │
│  ✓ User set to null                             │
│  ✓ Navbar shows no username                     │
│  ✓ Protected routes inaccessible                │
│  ✓ Redirect to login page                       │
└──────────────────────────────────────────────────┘

RESULT:
✅ JWT cookie deleted
✅ Context cleared
✅ Navigation to login
✅ Session ended
```

---

## 🔐 Security At Each Layer

### Frontend Security
```
✓ Password never sent in plain text again after registration
✓ Tokens NOT stored in localStorage (XSS risk)
✓ Tokens in httpOnly cookies (JavaScript can't access)
✓ Credentials sent with all requests (withCredentials: true)
✓ Validation before sending to backend
```

### Backend Security
```
✓ Passwords hashed immediately before storage (bcrypt)
✓ Password never returned in responses
✓ JWT verified on every protected request
✓ Token includes user ID only (not password)
✓ Tokens expire after 7 days
✓ Invalid credentials don't reveal account existence
```

### Network Security
```
✓ HTTPS required in production (secure: true)
✓ SameSite=strict prevents CSRF
✓ HttpOnly prevents XSS attacks
✓ CORS restricts to trusted domains
✓ Rate limiting prevents brute force
```

### Database Security
```
✓ Passwords salted with 12 rounds
✓ Each password uniquely hashed
✓ Cannot reverse-engineer password from hash
✓ User document stored securely in MongoDB
✓ Timestamps track account creation
```

---

## 📊 Files Involved

**Frontend Files:**
```
src/
├── context/
│   └── UserContext.js (Global state + hooks)
├── pages/
│   ├── Login.js (Login form)
│   └── Register.js (Signup form)
├── components/
│   └── UI/
│       └── Navbar.js (User menu + logout)
├── api/
│   └── auth.js (API calls)
└── App.js (UserProvider wrapper)
```

**Backend Files:**
```
├── controllers/
│   └── authController.js (register, login, logout, getCurrentUser)
├── middleware/
│   └── authMiddleware.js (JWT verification)
├── models/
│   └── User.js (Schema + password hashing)
├── routes/
│   └── authRoutes.js (Auth endpoints)
└── server.js (Express setup + security)
```

**Configuration Files:**
```
.env (JWT_SECRET, MONGODB_URI, NODE_ENV)
```

---

This is a **production-grade** authentication system. All user data is now secure and properly authenticated!
