# MatchMajor - Complete Project Documentation Index

Welcome to MatchMajor! This document serves as a master index to all project documentation, guides, and references.

---

## Quick Navigation

### 🚀 Getting Started
- [QUICK_START.md](QUICK_START.md) - 5-minute project setup
- [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md) - Docker container setup

### 🔐 Authentication & API
- [AUTH_QUICK_START.md](AUTH_QUICK_START.md) - Authentication setup
- [AUTH_DOCUMENTATION_INDEX.md](AUTH_DOCUMENTATION_INDEX.md) - Complete auth guide
- [AUTH_ARCHITECTURE.md](AUTH_ARCHITECTURE.md) - Auth system design
- [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md) - All API endpoints & validation

### 💾 Database & Models
- [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md) - Complete MongoDB reference ⭐ Start here
- [MONGODB_QUICK_REFERENCE.md](MONGODB_QUICK_REFERENCE.md) - Code examples & quick queries
- [MONGODB_IMPLEMENTATION_SUMMARY.md](MONGODB_IMPLEMENTATION_SUMMARY.md) - What was implemented
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Original schema definition
- [DATABASE_MANAGEMENT_GUIDE.md](DATABASE_MANAGEMENT_GUIDE.md) - Database operations

### 🛠️ Development Guides
- [IMPLEMENTATION_INDEX.md](IMPLEMENTATION_INDEX.md) - Implementation guide
- [API_IMPLEMENTATION_GUIDE.md](API_IMPLEMENTATION_GUIDE.md) - Controller patterns
- [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) - API patterns & validators
- [COMPONENT_TEMPLATES.md](COMPONENT_TEMPLATES.md) - Frontend component templates

### 📊 Data & Configuration
- [DATABASE_SAMPLE_DATA.json](DATABASE_SAMPLE_DATA.json) - Sample data for testing
- [docker-compose.yml](docker-compose.yml) - Production Docker setup
- [docker-compose.dev.yml](docker-compose.dev.yml) - Development Docker setup
- [Makefile](Makefile) - Common commands

### 📚 Additional Resources
- [MATCHING_ALGORITHM.md](MATCHING_ALGORITHM.md) - Study group matching logic
- [AUTHENTICATION_COMPLETE.md](AUTHENTICATION_COMPLETE.md) - Auth implementation status
- [CONTAINERIZATION_COMPLETE.md](CONTAINERIZATION_COMPLETE.md) - Docker status
- [SYNC_COMPLETE.md](SYNC_COMPLETE.md) - Frontend/backend sync status
- [FILES_CHANGED.md](FILES_CHANGED.md) - Recent changes

---

## By Task

### I Want To...

#### Set Up the Project
1. Read [QUICK_START.md](QUICK_START.md) - 5 min
2. Run `npm install`
3. Configure `.env` file
4. Run `npm run dev`

#### Understand the Database
1. Start with [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md) - Full reference
2. Check specific models in `models/` folder
3. Use [MONGODB_QUICK_REFERENCE.md](MONGODB_QUICK_REFERENCE.md) for code examples
4. Review [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for original design

#### Learn About Authentication
1. Read [AUTH_QUICK_START.md](AUTH_QUICK_START.md) - 10 min
2. Review [AUTH_DOCUMENTATION_INDEX.md](AUTH_DOCUMENTATION_INDEX.md) - Detailed guide
3. Check [AUTH_ARCHITECTURE.md](AUTH_ARCHITECTURE.md) - System design
4. Reference [AUTH_CODE_REFERENCE.md](AUTH_CODE_REFERENCE.md) - Implementation

#### Understand All API Routes
1. Check [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md)
2. See error codes & response formats
3. Review validation rules per endpoint
4. Check [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) for patterns

#### Create a New Model
1. Check [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md#schema-details)
2. Use existing models as templates (`models/User.js`, `models/Product.js`)
3. Apply same patterns: validation → indexes → pre-hooks → methods
4. Add to `models/index.js` exports

#### Implement a New Controller
1. Read [API_IMPLEMENTATION_GUIDE.md](API_IMPLEMENTATION_GUIDE.md)
2. Wrap handlers with `asyncHandler`
3. Throw `AppError` instead of `res.status().json()`
4. Use validation middleware for routes
5. Reference [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) for patterns

#### Query the Database
1. Read [MONGODB_QUICK_REFERENCE.md](MONGODB_QUICK_REFERENCE.md) first
2. Check specific model methods
3. Use [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md) for validation rules
4. Test in controller or route handler

#### Deploy the Project
1. Review [docker-compose.yml](docker-compose.yml) for production
2. Set environment variables
3. Run Docker containers
4. Check logs with `docker logs`
5. See [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md) for details

#### Understand the Matching Algorithm
1. Read [MATCHING_ALGORITHM.md](MATCHING_ALGORITHM.md)
2. Check `models/Survey.js` - `getCompatibilityScore()` method
3. Review [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md#survey-schema)

#### Work with Frontend Components
1. Check [COMPONENT_TEMPLATES.md](COMPONENT_TEMPLATES.md)
2. See `src/components/` for actual components
3. Review [FRONTEND_BACKEND_SYNC.md](FRONTEND_BACKEND_SYNC.md) for integration

---

## Project Architecture Overview

### Folder Structure

```
project/
├── config/
│   └── db.js                          # MongoDB connection (production-ready)
│
├── models/                            # Mongoose models (8 total)
│   ├── index.js                       # Central export
│   ├── User.js                        # Auth & profiles
│   ├── Product.js                     # E-commerce inventory
│   ├── Order.js                       # Purchase orders
│   ├── Cart.js                        # Shopping carts (TTL)
│   ├── Survey.js                      # Preferences & matching
│   ├── Chatroom.js                    # Discussion rooms
│   ├── Message.js                     # Real-time chat
│   └── Post.js                        # Community posts
│
├── routes/                            # API endpoints
│   ├── auth.js                        # Authentication
│   ├── products.js                    # Products
│   ├── cart.js                        # Shopping cart
│   ├── orders.js                      # Orders
│   ├── surveys.js                     # Preferences
│   ├── chatrooms.js                   # Chat rooms
│   ├── messages.js                    # Messages
│   └── posts.js                       # Posts
│
├── controllers/                       # Business logic
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   └── ... (more)
│
├── middleware/
│   ├── authMiddleware.js              # JWT & role-based access
│   ├── errorHandler.js                # Global error handling
│   ├── validationMiddleware.js        # Request validation
│   └── ... (more)
│
├── utils/
│   ├── AppError.js                    # Custom error class
│   ├── validators.js                  # Reusable field validators
│   └── schemas.js                     # Joi validation schemas
│
├── server/
│   └── server.js                      # Express app setup
│
├── public/                            # Static files
├── src/                               # Frontend (React)
│   ├── components/                    # React components
│   ├── pages/                         # Pages/screens
│   └── ... (more)
│
└── Documentation files (this directory)
    ├── MONGODB_SETUP_GUIDE.md         # 🌟 START HERE for database
    ├── MONGODB_QUICK_REFERENCE.md     # Code examples
    ├── API_ROUTES_VALIDATION.md       # All endpoints
    ├── AUTH_QUICK_START.md            # Authentication
    ├── QUICK_START.md                 # Project setup
    └── ... (more)
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Database** | MongoDB + Mongoose ODM |
| **Backend** | Node.js + Express.js |
| **Frontend** | React + React Router |
| **Authentication** | JWT (with HTTPOnly cookies) |
| **Validation** | Joi + Custom validators |
| **Password Security** | bcryptjs (12-round hashing) |
| **Container** | Docker + Docker Compose |
| **Package Manager** | npm |

---

## Key Concepts

### 1. MongoDB Models (8 Total)

Each model follows consistent patterns:

```
Structure:
  └─ Schema definition
     ├─ Field definitions with validation
     ├─ Indexes (for performance)
     ├─ Pre/post middleware (auto-calculations)
     ├─ Instance methods (object-level operations)
     └─ Static methods (collection-level queries)
```

**Models**: User, Product, Order, Cart, Survey, Chatroom, Message, Post

**See**: [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md)

### 2. Error Handling System

Centralized error handling with specific error codes:

```javascript
// In controller
throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');

// Middleware catches and returns:
{
  success: false,
  statusCode: 409,
  errorCode: 'EMAIL_EXISTS',
  message: 'Email already exists',
  timestamp: '2024-01-15T10:30:00Z'
}
```

**See**: [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md)

### 3. Request Validation

Two-level validation:

```javascript
// 1. Route-level: Joi schema validation
router.post('/products', validate(createProductSchema), controller);

// 2. Model-level: Mongoose schema validation
const productSchema = new Schema({
  price: { type: Number, min: 0, max: 999999 }
});
```

**See**: [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md)

### 4. Authentication Flow

JWT-based authentication with role authorization:

```
1. User registers/logs in
2. Server creates JWT token
3. Token stored in HTTPOnly cookie
4. Subsequent requests include token
5. authMiddleware validates token
6. restrictTo middleware checks role
```

**See**: [AUTH_DOCUMENTATION_INDEX.md](AUTH_DOCUMENTATION_INDEX.md)

### 5. Database Relationships

```
User (1) ──┬─ (Many) Orders
           ├─ (Many) Products (as seller)
           ├─ (One) Survey
           ├─ (One) Cart
           ├─ (Many) Chatrooms
           ├─ (Many) Messages
           └─ (Many) Posts

[See full diagram in MONGODB_SETUP_GUIDE.md]
```

---

## Important Files

### Must Read
- ⭐ [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md) - Database reference
- ⭐ [QUICK_START.md](QUICK_START.md) - Project setup
- ⭐ [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md) - All endpoints

### Configuration
- [.env.example](.env.example) - Environment template
- [docker-compose.yml](docker-compose.yml) - Docker configuration
- [package.json](package.json) - Dependencies

### Models
- All in [models/](models/) folder
- Reference: [MONGODB_IMPLEMENTATION_SUMMARY.md](MONGODB_IMPLEMENTATION_SUMMARY.md)

### Controllers
- All in [controllers/](controllers/) folder
- Template: [API_IMPLEMENTATION_GUIDE.md](API_IMPLEMENTATION_GUIDE.md)

### Middleware
- [middleware/authMiddleware.js](middleware/authMiddleware.js) - Auth
- [middleware/errorHandler.js](middleware/errorHandler.js) - Error handling
- [middleware/validationMiddleware.js](middleware/validationMiddleware.js) - Validation

### Utilities
- [utils/AppError.js](utils/AppError.js) - Error class
- [utils/validators.js](utils/validators.js) - Field validators
- [utils/schemas.js](utils/schemas.js) - Joi schemas

---

## Common Tasks & Commands

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build frontend
npm run build

# Start with Docker
docker-compose -f docker-compose.dev.yml up

# View logs
docker logs container_name
```

### Database

```bash
# Seed sample data
npm run seed-db

# Connect to MongoDB
mongosh mongodb://localhost:27017

# See all databases
show databases

# Switch database
use matchmajor

# View all collections
show collections
```

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Status Dashboard

| Component | Status | Reference |
|-----------|--------|-----------|
| Authentication | ✅ Complete | [AUTH_COMPLETE](AUTHENTICATION_COMPLETE.md) |
| Database Setup | ✅ Complete | [MONGODB_IMPLEMENTATION_SUMMARY.md](MONGODB_IMPLEMENTATION_SUMMARY.md) |
| Models (8) | ✅ Complete | [models/](models/) |
| Error Handling | ✅ Complete | [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md) |
| Validation | ✅ Complete | [API_QUICK_REFERENCE.md](API_QUICK_REFERENCE.md) |
| API Routes | ✅ Complete | [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md) |
| Docker Setup | ✅ Complete | [CONTAINERIZATION_COMPLETE.md](CONTAINERIZATION_COMPLETE.md) |
| Controllers | 🔄 Partial | [API_IMPLEMENTATION_GUIDE.md](API_IMPLEMENTATION_GUIDE.md) |
| Frontend | 🔄 In Progress | [COMPONENT_TEMPLATES.md](COMPONENT_TEMPLATES.md) |
| Integration Tests | ⏳ Pending | - |

---

## Next Steps

1. **If setting up for first time**:
   - Read [QUICK_START.md](QUICK_START.md)
   - Run `npm install`
   - Set up MongoDB
   - Run `npm run dev`

2. **If implementing features**:
   - Check [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md) for endpoints
   - Read [API_IMPLEMENTATION_GUIDE.md](API_IMPLEMENTATION_GUIDE.md) for patterns
   - Use [MONGODB_QUICK_REFERENCE.md](MONGODB_QUICK_REFERENCE.md) for queries

3. **If debugging issues**:
   - Check [MONGODB_SETUP_GUIDE.md#troubleshooting](MONGODB_SETUP_GUIDE.md)
   - Review error codes in [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md)
   - Check [FILES_CHANGED.md](FILES_CHANGED.md) for recent changes

4. **If deploying**:
   - Review [docker-compose.yml](docker-compose.yml)
   - Set environment variables
   - Follow [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)

---

## Support & References

### External Resources
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Mongoose Documentation](https://mongoosejs.com)
- [Express.js Guide](https://expressjs.com)
- [JWT Introduction](https://jwt.io)

### Local Documentation
- All files in this directory are self-contained
- Start with ⭐ marked files
- Cross-references provided throughout

---

## Document Descriptions

| Document | Lines | Purpose |
|----------|-------|---------|
| QUICK_START.md | 150 | 5-minute project setup |
| MONGODB_SETUP_GUIDE.md | 900+ | Complete database reference ⭐ |
| MONGODB_QUICK_REFERENCE.md | 600+ | Code examples for queries |
| API_ROUTES_VALIDATION.md | 400+ | All endpoints & error codes |
| API_IMPLEMENTATION_GUIDE.md | 300+ | Controller patterns |
| API_QUICK_REFERENCE.md | 200+ | Validators & patterns |
| AUTH_DOCUMENTATION_INDEX.md | 400+ | Authentication complete guide |
| MONGODB_IMPLEMENTATION_SUMMARY.md | 300+ | What was implemented |
| COMPONENT_TEMPLATES.md | 200+ | Frontend component examples |
| DATABASE_SCHEMA.md | 150+ | Original schema design |

---

## Last Updated

- Models: ✅ All 8 complete with validation & indexing
- Documentation: ✅ Comprehensive guides created
- Error Handling: ✅ Global system in place
- Validation: ✅ Multi-level validation
- Authentication: ✅ JWT with role-based access

---

## Questions?

Refer to the appropriate documentation:

- **"How do I query...?"** → [MONGODB_QUICK_REFERENCE.md](MONGODB_QUICK_REFERENCE.md)
- **"What's the API for...?"** → [API_ROUTES_VALIDATION.md](API_ROUTES_VALIDATION.md)
- **"How do I authenticate?"** → [AUTH_QUICK_START.md](AUTH_QUICK_START.md)
- **"How does the database work?"** → [MONGODB_SETUP_GUIDE.md](MONGODB_SETUP_GUIDE.md)
- **"How do I create a controller?"** → [API_IMPLEMENTATION_GUIDE.md](API_IMPLEMENTATION_GUIDE.md)
- **"How do I deploy?"** → [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)

---

**Happy coding! 🚀**
