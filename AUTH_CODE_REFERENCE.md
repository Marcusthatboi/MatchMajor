# 🔐 Authentication System - Code Structure Reference

## Complete File Inventory

### 📦 Backend Authentication Files

#### 1. `models/User.js` (Password Hashing + Storage)
**Purpose**: Define user schema and password hashing logic

**Key Features**:
```javascript
// Pre-save hook - automatically hashes password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};
```

**What it does**:
- Stores:  username, email, password (hashed), role, timestamps
- Hashes password before saving to DB
- Provides comparePassword() for login verification

---

#### 2. `controllers/authController.js` (Auth Logic)
**Purpose**: Handle registration, login, logout, session retrieval

**Exports**:
```javascript
exports.register   // POST /api/auth/register
exports.login      // POST /api/auth/login
exports.logout     // POST /api/auth/logout
exports.getCurrentUser  // GET /api/auth/me
```

**What it does**:
- Validates user input
- Hashes passwords (via Model hook)
- Generates JWT tokens
- Sets secure cookies
- Verifies credentials

---

#### 3. `middleware/authMiddleware.js` (JWT Verification)
**Purpose**: Verify JWT tokens on protected routes

**Exports**:
```javascript
exports.protect  // Middleware function
exports.restrictTo  // Role-based access control
```

**What it does**:
- Extracts JWT from cookies
- Verifies JWT signature
- Decodes user ID
- Attaches user to request (req.user)
- Rejects invalid/expired tokens

---

#### 4. `routes/authRoutes.js` (Route Definitions)
**Purpose**: Define auth API endpoints

**Routes**:
```javascript
POST   /api/auth/register    // Public
POST   /api/auth/login       // Public
POST   /api/auth/logout      // Public
GET    /api/auth/me          // Protected (requires JWT)
```

**What it does**:
- Maps endpoints to controller functions
- Applies middleware (protect on /me)
- Rate-limited by server.js

---

#### 5. `server/server.js` (Express Setup + Security)
**Purpose**: Application server, security configuration

**Middleware Applied**:
```javascript
// Security
app.use(helmet());  // HTTP headers
app.use(cors({ credentials: true }));  // CORS
app.use(authLimiter);  // Rate limiting (5/15min)
app.use(cookieParser());  // Cookie parsing
```

**What it does**:
- Creates Express app
- Configures middleware
- Sets up routes
- Enables security features

---

### 🎨 Frontend Authentication Files

#### 1. `src/context/UserContext.js` (Global State)
**Purpose**: Global user state management and auth functions

**What it provides**:
```javascript
// Context
export const UserContext = createContext()

// Provider
export const UserProvider = ({ children }) => {/*...*/}

// Hook
export const useUser = () => {
  return {
    user,           // Current user object or null
    isAuthenticated,  // Boolean
    loading,        // During initialization
    login,          // Function
    logout,         // Function
    register,       // Function
    updateProfile   // Function
  }
}
```

**What it does**:
- Initializes user from JWT on app load
- Manages user state globally
- Provides useUser() hook for any component
- Handles login, logout, register
- Updates profile data

---

#### 2. `src/pages/Login.js` (Login Form)
**Purpose**: User login page

**What it does**:
- Renders login form
- Validates email + password
- Calls login API
- Updates UserContext
- Redirects on success
- Shows errors

**Key Code**:
```javascript
const { login } = useUser();

const handleSubmit = async (e) => {
  const response = await apiLogin(email, password);
  login(response.user);  // Update context
  navigate('/survey');   // Redirect
};
```

---

#### 3. `src/pages/Register.js` (Signup Form)
**Purpose**: User registration page

**What it does**:
- Renders signup form
- Validates all fields
- Checks password match
- Calls register API
- Updates UserContext
- Redirects on success

**Validations**:
- Username required
- Email required + valid format
- Password required + 6+ characters
- Confirm password must match

---

#### 4. `src/components/UI/Navbar.js` (Navigation Bar)
**Purpose**: Navigation and user menu

**What it does**:
- Shows navbar to all users
- Displays username when logged in
- Dropdown menu with user options
- Logout button calls context
- Hide nav if not authenticated

**Key Code**:
```javascript
const { user, isAuthenticated, logout } = useUser();

{isAuthenticated && (
  <div>
    <span>{user.username}</span>
    <button onClick={logout}>Logout</button>
  </div>
)}
```

---

#### 5. `src/api/auth.js` (API Service Layer)
**Purpose**: Make auth API calls with automatic cookie handling

**Exports**:
```javascript
export const register = async (username, email, password)
export const login = async (email, password)
export const logout = async ()
export const getCurrentUser = async ()
```

**What it does**:
- Uses axios with `withCredentials: true`
- Automatically sends cookies
- Environment-aware URLs
- All calls return response.data

---

#### 6. `src/App.js` (Root Component)
**Purpose**: App root with routing and UserProvider

**What it does**:
- Wraps UserProvider around entire app
- Defines all routes
- Implements protected routes
- Shows loading spinner during init
- Auth context available everywhere

**Key Structure**:
```javascript
<UserProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/survey" element={
        <ProtectedRoute><Survey /></ProtectedRoute>
      } />
    </Routes>
  </BrowserRouter>
</UserProvider>
```

---

## 🔄 Authentication Data Flow

### Complete Request Lifecycle

```
USER INTERACTION
    ↓
APPLICATION COMPONENT (uses useUser())
    ↓
CALLS API FUNCTION (src/api/auth.js)
    ↓
AXIOS REQUEST
├─ URL: /api/auth/... or http://localhost:5000/api/auth/...
├─ Headers: { withCredentials: true }
├─ Body: JSON data
└─ Cookie: token=<JWT> (auto-included)
    ↓
NETWORK TRANSMISSION
    ↓
EXPRESS SERVER (server/server.js)
├─ Parse JSON
├─ Parse Cookies (cookieParser)
├─ Apply Middleware
│  ├─ Helmet (security headers)
│  ├─ CORS (check origin)
│  ├─ Rate Limiter (check attempts)
│  └─ JSON Parser
    ↓
AUTH ROUTES (routes/authRoutes.js)
├─ Match endpoint
├─ Apply protect middleware (if /me)
    ↓
PROTECT MIDDLEWARE (middleware/authMiddleware.js)
├─ Get token from req.cookies.token
├─ Verify JWT signature
├─ Decode token → get user ID
├─ Query DB for user
├─ Attach to req.user
└─ Call next()
    ↓
AUTH CONTROLLER (controllers/authController.js)
├─ Read req.body and req.user
├─ Execute auth logic
│  ├─ Validate inputs
│  ├─ Query database
│  ├─ Compare passwords (User model)
│  ├─ Generate JWT token
│  ├─ Set cookie header
└─ Return response
    ↓
DATABASE (MongoDB)
├─ Read/write user documents
└─ Passwords hashed with bcrypt
    ↓
RESPONSE SENT
├─ Status code
├─ JSON body
├─ SET-COOKIE header (with JWT)
└─ HTTP headers
    ↓
BROWSER RECEIVES
├─ Parse JSON
├─ Store cookie (automatically)
├─ HTTP-only flag prevents JS access
└─ Browser auto-sends with future requests
    ↓
FRONTEND RECEIVES
├─ Parse response
├─ Update UserContext
├─ Re-render components
└─ Navigate if needed
    ↓
COMPONENT UPDATES
├─ useUser() returns new user
├─ Props might change
└─ UI reflects new state
```

---

## 📊 State Management Flow

### Registration State Change

```
Initial State:
{
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

USER REGISTERS

UserContext.register(userData) called
↓
State becomes:
{
  user: userData,
  isAuthenticated: true,
  loading: false,
  error: null
}

ALL COMPONENTS USING useUser() RE-RENDER
```

---

### Login State Change

```
Initial State:
{
  user: null,
  isAuthenticated: false,
  loading: true
}

INITIALIZATION (ON APP LOAD)

useEffect calls getCurrentUser()
↓
If token in cookie is valid:
{
  user: userFromDB,
  isAuthenticated: true,
  loading: false
}

OR if no token:
{
  user: null,
  isAuthenticated: false,
  loading: false
}

USER NAVIGATES TO LOGIN PAGE

If no user (isAuthenticated=false):
→ Login form visible

LOGIN FORM SUBMITTED

UserContext.login(userData) called
↓
State becomes:
{
  user: userData,
  isAuthenticated: true,
  loading: false
}

REDIRECT TO /survey
```

---

## 🔐 Security Layers

### Layer 1: Frontend Validation
```
src/pages/Register.js
src/pages/Login.js

Validates:
- Required fields
- Email format
- Password length
- Password confirmation
```

### Layer 2: Authentication API
```
src/api/auth.js

✓ Credentials sent only via HTTPS (prod)
✓ withCredentials: true
✓ Automatic cookie inclusion
```

### Layer 3: Express Security
```
server/server.js

✓ Helmet: 15+ HTTP headers
✓ CORS: Restricted origins
✓ Rate Limiting: 5 attempts/15min
✓ Cookie Parser: Safe parsing
```

### Layer 4: Authentication Middleware
```
middleware/authMiddleware.js

✓ JWT verification
✓ Token signature check
✓ Expiration check
✓ User attachment to request
```

### Layer 5: Password Security
```
models/User.js

✓ BCrypt hashing
✓ 12 salt rounds
✓ Pre-save hook
✓ comparePassword method
```

### Layer 6: Database Storage
```
MongoDB users collection

✓ Passwords stored hashed
✓ Never stored plain text
✓ Never returned in responses
✓ Unique username + email
```

---

## 📝 API Response Examples

### Register Success
```json
Status: 201

{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}

SET-COOKIE: token=eyJhbGc...; httpOnly; secure; sameSite=strict
```

### Login Success
```json
Status: 200

{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user"
  }
}

SET-COOKIE: token=eyJhbGc...; httpOnly; secure; sameSite=strict
```

### Login Failure
```json
Status: 401

{
  "success": false,
  "message": "Invalid credentials"
}

(No cookie set)
```

### Get Current User (Protected)
```json
Status: 200

{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Current User (Not Authenticated)
```json
Status: 401

{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

## 🎯 Using Authentication in Your Components

### Pattern 1: Protect a Component
```javascript
import { useUser } from '../context/UserContext';

export const Survey = () => {
  const { user, isAuthenticated } = useUser();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Survey for {user.username}</div>;
};
```

### Pattern 2: Make Protected API Call
```javascript
import { useUser } from '../context/UserContext';
import { saveSurvey } from '../api/surveys';

export const SurveyForm = () => {
  const { user } = useUser();
  
  const handleSubmit = async (data) => {
    // JWT cookie automatically included!
    const response = await saveSurvey(data);
    // Backend can read req.user._id
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Pattern 3: Show User-Specific Data
```javascript
import { useUser } from '../context/UserContext';

export const Profile = () => {
  const { user } = useUser();
  
  return (
    <div>
      <h1>Profile: {user.username}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
};
```

### Pattern 4: Conditional Rendering
```javascript
import { useUser } from '../context/UserContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useUser();
  
  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user.username}!</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/register">Sign Up</a>
        </>
      )}
    </nav>
  );
};
```

---

## ✅ Verification Checklist

### Backend Files Present
- [x] models/User.js
- [x] controllers/authController.js
- [x] middleware/authMiddleware.js
- [x] routes/authRoutes.js
- [x] server/server.js

### Frontend Files Present
- [x] src/context/UserContext.js
- [x] src/pages/Login.js
- [x] src/pages/Register.js
- [x] src/components/UI/Navbar.js
- [x] src/api/auth.js
- [x] src/App.js

### Dependencies Installed
- [x] bcryptjs (password hashing)
- [x] jsonwebtoken (JWT)
- [x] express (server)
- [x] mongoose (database)
- [x] axios (API calls)
- [x] cors (cross-origin)
- [x] helmet (security)

### Configuration Present
- [x] .env with JWT_SECRET
- [x] .env with MONGODB_URI
- [x] .env with NODE_ENV

### Security Configured
- [x] Password hashing (12 rounds)
- [x] JWT generation (7 day expiration)
- [x] HTTP-only cookies
- [x] CORS with credentials
- [x] Rate limiting
- [x] Helmet security headers

---

This is your complete authentication system reference. All files are in place and ready to use!
