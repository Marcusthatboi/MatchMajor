# MongoDB Setup & Schema Documentation

## Overview

MatchMajor uses MongoDB with Mongoose ODM for object-oriented database modeling. This document provides a complete reference for the database schema, connection setup, and model usage.

---

## Table of Contents

1. [Database Connection](#database-connection)
2. [Environment Configuration](#environment-configuration)
3. [Models Overview](#models-overview)
4. [Schema Details](#schema-details)
5. [Indexes](#indexes)
6. [Best Practices](#best-practices)
7. [Model Methods](#model-methods)
8. [Relationships](#relationships)

---

## Database Connection

### Connection Configuration

The database connection is managed in `config/db.js` with the following features:

- **Connection Pooling**: 2-10 concurrent connections
- **Timeout Management**: 30-second timeouts for all operations
- **Retry Logic**: Automatic retry on connection failures
- **IPv4 Priority**: Skips IPv6 for stability
- **Connection Events**: Monitoring and logging of connection state

### Connection Setup

```javascript
// In server/server.js
const connectDB = require('./config/db');

// Call during app startup
await connectDB();
```

### Connection Status

```javascript
const { getConnectionStatus } = require('./config/db');

// Returns: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
const status = getConnectionStatus();
```

---

## Environment Configuration

### Required .env Variables

```env
# MongoDB Connection String
MONGODB_URI=mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor?authSource=admin

# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secure_jwt_secret_key_with_at_least_32_characters_2024!
```

### Connection String Breakdown

```
mongodb://username:password@host:port/database?authSource=admin
│         │        │         │      │   │        │            │
│         │        │         │      │   │        │            └─ Authentication database
│         │        │         │      │   │        └─────────────── Database name
│         │        │         │      │   └───────────────────────── Port number
│         │        │         │      └───────────────────────────── Host/server
│         │        │         └─────────────────────────────────── Password
│         │        └──────────────────────────────────────────── Username
│         └──────────────────────────────────────────────────── Protocol
└─────────────────────────────────────────────────────────────── Scheme
```

### Docker MongoDB Setup

```yaml
# docker-compose.yml
mongodb:
  image: mongo:latest
  environment:
    MONGO_INITDB_ROOT_USERNAME: matchmajor
    MONGO_INITDB_ROOT_PASSWORD: matchmajor_password
    MONGO_INITDB_DATABASE: matchmajor
  ports:
    - "27017:27017"
  volumes:
    - mongodb_data:/data/db
```

---

## Models Overview

### All Available Models

| Model | Purpose | Key Fields | Reference |
|-------|---------|-----------|-----------|
| **User** | User accounts & authentication | username, email, password, role | Primary entity |
| **Product** | Products/Items for sale | name, price, category, stock | Used in orders & cart |
| **Cart** | Shopping carts per user | user, items, total | Belongs to User |
| **Order** | Purchase orders | user, items, status, shipping | Belongs to User |
| **Survey** | User profile & preferences | userId, major, interests, studyStyle | References User |
| **Chatroom** | Chat rooms for groups | name, members, creator | References User |
| **Message** | Chat messages | chatroom, user, text | References Chatroom, User |
| **Post** | Community posts | chatroom, author, content, comments | References Chatroom, User |

### Model Import

```javascript
// Option 1: Import individual models
const User = require('../models/User');
const Product = require('../models/Product');

// Option 2: Import all models at once
const { User, Product, Cart, Order, Survey, Chatroom, Message, Post } = require('../models');

// Option 3: Using models directly in routes/controllers
const models = require('../models');
models.User.findById(userId);
```

---

## Schema Details

### 1. User Schema

```javascript
{
  username:      String (unique, 3-50 chars),
  email:         String (unique, valid format),
  password:      String (6-128 chars, hashed),
  profilePhoto:  String (optional),
  survey:        ObjectId -> Survey (optional),
  role:          String (enum: 'user', 'admin'),
  orders:        [ObjectId] -> Order array,
  isActive:      Boolean (default: true),
  lastLogin:     Date (default: null),
  createdAt:     Date (auto),
  updatedAt:     Date (auto)
}
```

**Validation Rules**:
- Username: Alphanumeric, underscores, hyphens only
- Email: Valid email format, lowercase
- Password: Minimum 6 characters, hashed with bcrypt (12 rounds)
- Role: Must be 'user' or 'admin'

**Methods**:
- `comparePassword(password)` - Verify password
- `toJSON()` - Returns user without password

---

### 2. Product Schema

```javascript
{
  name:            String (3-100 chars),
  description:     String (10-1000 chars),
  price:           Number (min: 0),
  category:        String (enum: textbooks, supplies, housing, services, other),
  image:           String (URL, default: placeholder),
  stock:           Number (default: 0, auto-updates inStock),
  features:        [String] (optional),
  inStock:         Boolean (auto-calculated),
  seller:          ObjectId -> User (optional),
  averageRating:   Number (0-5, default: 0),
  reviewCount:     Number (default: 0),
  searchKeywords:  [String] (lowercase),
  createdAt:       Date (auto),
  updatedAt:       Date (auto)
}
```

**Virtuals**:
- `sku` - Stock Keeping Unit (e.g., "TEXTBOOKS-507f...")
- `discount` - Calculated discount percentage

**Methods**:
- `getAvailableQuantity()` - Get current stock
- `reduceStock(quantity)` - Decrease stock (for orders)
- `increaseStock(quantity)` - Increase stock (for returns)

**Static Methods**:
- `findByCategory(category, page, limit)` - Paginated category search
- `searchProducts(searchTerm, filters)` - Full-text search

---

### 3. Order Schema

```javascript
{
  user:             ObjectId -> User (required),
  items:            [{
    product:        ObjectId -> Product,
    name:           String,
    price:          Number,
    quantity:       Number (1-1000)
  }],
  shippingAddress: {
    street:         String (5+ chars),
    city:           String (2+ chars),
    state:          String,
    zipCode:        String (xxxxx or xxxxx-xxxx format),
    country:        String
  },
  paymentMethod:    String (enum: creditCard, debitCard, paypal, bankTransfer),
  paymentResult:   {
    id:             String,
    status:         String,
    email:          String,
    timestamp:      Date
  },
  totalPrice:       Number (min: 0),
  status:           String (enum: pending, processing, shipped, delivered, cancelled),
  trackingNumber:   String (optional),
  statusHistory:    [{
    status:         String,
    timestamp:      Date,
    notes:          String
  }],
  cancellationReason: String (optional),
  cancelledAt:      Date (optional),
  createdAt:        Date (auto),
  updatedAt:        Date (auto)
}
```

**Virtuals**:
- `itemCount` - Total quantity of items

**Methods**:
- `updateStatus(newStatus, notes)` - Change order status
- `getSubtotal()` - Calculate items total
- `getSummary()` - Get concise order info

**Static Methods**:
- `findByUser(userId, status)` - Get user's orders
- `findByStatus(status)` - Get orders by status

---

### 4. Cart Schema

```javascript
{
  user:       ObjectId -> User (unique, required),
  items:      [{
    product:  ObjectId -> Product,
    productName: String,
    price:    Number,
    quantity: Number (1-1000),
    addedAt:  Date
  }],
  subtotal:   Number (auto-calculated),
  total:      Number (auto-calculated),
  discount:   Number (default: 0),
  tax:        Number (default: 0),
  expiresAt:  Date (default: +7 days, TTL index),
  createdAt:  Date (auto),
  updatedAt:  Date (auto)
}
```

**Virtuals**:
- `itemCount` - Total quantity of items

**Methods**:
- `addItem(productId, productName, price, quantity)` - Add/update item
- `removeItem(productId)` - Remove item from cart
- `updateItemQuantity(productId, quantity)` - Update quantity
- `clearCart()` - Empty the cart
- `getSummary()` - Get cart totals and items

**Static Methods**:
- `findByUser(userId)` - Get user's cart

---

### 5. Survey Schema

```javascript
{
  userId:            ObjectId -> User (unique, required),
  
  // Academic
  major:             String (optional),
  year:              String (enum: Freshman, Sophomore, Junior, Senior, Graduate, Other),
  interests:         [String],
  experience:        String (enum: Beginner, Intermediate, Advanced, Expert),
  goals:             String,
  currentClasses:    String,
  studyGoals:        String,
  honors:            String,
  
  // Lifestyle
  sleepSchedule:     String (enum: Early Bird, Night Owl, Flexible),
  cleanliness:       String (enum: Very Tidy, Tidy, Average, Messy),
  visitorPolicy:     String,
  items:             String,
  pets:              String,
  allergies:         String,
  campusSelection:   String,
  socialBattery:     String,
  hobbies:           String,
  
  // Study
  studyLocation:     String,
  studyTimes:        String,
  idealGroupSize:    String,
  virtualOrInPerson: String (enum: Virtual, In-Person, Both),
  studyHabits:       String,
  studyStyle:        String,
  
  completionPercentage: Number (0-100, auto-calculated),
  lastUpdated:       Date,
  createdAt:         Date (auto),
  updatedAt:         Date (auto)
}
```

**Virtuals**:
- `isComplete` - Boolean (completionPercentage === 100)

**Methods**:
- `getProfile()` - Get public-facing profile
- `getCompatibilityScore(otherSurvey)` - Calculate match score

**Static Methods**:
- `findByUserId(userId)` - Get user's survey
- `findCompatibleMatches(userId, major, limit)` - Find study partners

---

### 6. Chatroom Schema

```javascript
{
  name:          String (3-100 chars, required),
  description:   String (500 chars max),
  color:         String (hex format, default: #09A6AD),
  creator:       ObjectId -> User (required),
  members:       [ObjectId] -> User array,
  isCustom:      Boolean (default: false),
  memberCount:   Number (auto-calculated),
  activeNow:     Number,
  category:      String (enum: study, social, housing, sports, clubs, other),
  lastMessageAt: Date (default: now),
  isPrivate:     Boolean (default: false),
  isArchived:    Boolean (default: false),
  createdAt:     Date (auto),
  updatedAt:     Date (auto)
}
```

**Virtuals**:
- `memberDetails` - Populated member info

**Methods**:
- `addMember(userId)` - Add member to chatroom
- `removeMember(userId)` - Remove member
- `isMember(userId)` - Check membership
- `isCreator(userId)` - Check creator
- `updateLastMessage()` - Update timestamp
- `getInfo()` - Get chatroom details

**Static Methods**:
- `findByCategory(category, limit)` - Get rooms by category
- `findUserChatrooms(userId)` - Get user's rooms
- `searchChatrooms(searchTerm)` - Full-text search

---

### 7. Message Schema

```javascript
{
  chatroom:   ObjectId -> Chatroom (required),
  user:       ObjectId -> User (required),
  username:   String (required),
  text:       String (1-5000 chars, required),
  isEdited:   Boolean (default: false),
  editedAt:   Date (default: null),
  isDeleted:  Boolean (default: false),
  reactions:  Map<String, [ObjectId]> (emoji -> users),
  replyTo:    ObjectId -> Message (optional),
  sentAt:     Date (auto),
  updatedAt:  Date (auto)
}
```

**Methods**:
- `editMessage(newText)` - Edit message
- `deleteMessage()` - Soft delete
- `addReaction(userId, emoji)` - Add emoji reaction
- `getDetails()` - Get message info

**Static Methods**:
- `findByChatroom(chatroomId, limit, skip)` - Get chatroom messages
- `getThreads(chatroomId)` - Get threaded replies

---

### 8. Post Schema

```javascript
{
  chatroom:    ObjectId -> Chatroom (required),
  author:      ObjectId -> User (required),
  authorName:  String (required),
  content:     String (1-5000 chars, required),
  likes:       [ObjectId] -> User array,
  likeCount:   Number (auto-calculated),
  comments:    [{
    author:    ObjectId -> User,
    authorName: String,
    text:      String (1-1000 chars),
    likes:     [ObjectId] -> User array,
    createdAt: Date
  }],
  isEdited:    Boolean (default: false),
  editedAt:    Date (default: null),
  isDeleted:   Boolean (default: false),
  createdAt:   Date (auto),
  updatedAt:   Date (auto)
}
```

**Virtuals**:
- `commentCount` - Number of comments

**Methods**:
- `toggleLike(userId)` - Like/unlike post
- `addComment(authorId, authorName, text)` - Add comment
- `removeComment(commentId)` - Remove comment
- `editPost(newContent)` - Edit post
- `deletePost()` - Soft delete post
- `getDetails()` - Get post with comments

**Static Methods**:
- `findByChatroom(chatroomId, limit, skip)` - Get posts
- `getTrendingPosts(limit)` - Get most liked posts

---

## Indexes

All models include strategic indexes for performance:

### User Indexes
- Single: `email`, `username`, `createdAt`, `role`
- TTL: None

### Product Indexes
- Single: `category`, `price`, `stock`, `createdAt`, `seller`, Text: `name`, `description`
- Compound: `category` + `price`, `inStock` + `category`

### Order Indexes
- Single: `status`, `createdAt`, `trackingNumber`
- Compound: `user` + `createdAt`, `user` + `status`

### Cart Indexes
- Single: `user` (unique), `createdAt`
- TTL: `expiresAt` (auto-deletes after 7 days)

### Survey Indexes
- Single: `userId`, `major`, `year`, `experience`, `updatedAt`
- Compound: `major` + `year`, `interests` + `experience`

### Chatroom Indexes
- Single: `creator`, `category`, `isArchived`, `lastMessageAt`, `members`, `createdAt`
- Text: `name`, `description`

### Message Indexes
- Single: `user`, `sentAt`
- Compound: `chatroom` + `sentAt`, `chatroom` + `isDeleted`, `replyTo`

### Post Indexes
- Single: `author`, `createdAt`, `likeCount`
- Compound: `chatroom` + `createdAt`, `chatroom` + `isDeleted`

---

## Relationships

### Relationship Diagram

```
User
├── orders: [Order]
├── survey: Survey
├── created chatrooms: [Chatroom]
└── profile photo: String

Product
└── seller: User (optional)

Order
├── user: User
└── items[].product: Product

Cart
├── user: User (unique)
└── items[].product: Product

Survey
└── userId: User (unique)

Chatroom
├── creator: User
└── members: [User]

Message
├── chatroom: Chatroom
└── user: User

Post
├── chatroom: Chatroom
├── author: User
└── comments[].author: User
```

---

## Best Practices

### 1. Always Validate Input

```javascript
// ✓ Good - model validation
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  }
});

// ✗ Bad - no validation
const userSchema = new mongoose.Schema({ email: String });
```

### 2. Use Indexes for Performance

```javascript
// ✓ Good - frequently queried fields indexed
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// ✗ Bad - missing indexes
// Queries will do full collection scans
```

### 3. Use Virtual Fields

```javascript
// ✓ Good - virtual for computed fields
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// ✗ Bad - store redundant data
postSchema.add({ commentCount: Number }); // Must be manually updated
```

### 4. Use Pre/Post Hooks

```javascript
// ✓ Good - auto-hash on save
userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// ✗ Bad - manual hashing in controller
// Error-prone and scattered logic
```

### 5. Implement Soft Deletes

```javascript
// ✓ Good - safe deletion
messageSchema.methods.deleteMessage = async function() {
  this.isDeleted = true;
  await this.save();
};

// ✗ Bad - hard delete
await Message.findByIdAndDelete(messageId); // Data lost forever
```

### 6. Use References for Related Data

```javascript
// ✓ Good - reference to user
messageSchema.add({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});
await message.populate('user');

// ✗ Bad - denormalized user data
messageSchema.add({
  user: {
    name: String,
    email: String
    // Duplicated and out-of-sync with User model
  }
});
```

---

## Compound Indexes

Compound indexes optimize queries with multiple conditions:

```javascript
// Query like this
db.orders.find({ user: userId, status: 'pending' })
  .sort({ createdAt: -1 });

// Benefits from this compound index
orderSchema.index({ user: 1, status: 1, createdAt: -1 });

// Without it: Full collection scan
// With it: Direct index lookup
```

---

## TTL (Time-To-Live) Indexes

Automatically delete documents after expiration:

```javascript
// Cart expires after 7 days
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Behind the scenes:
// Carts are automatically deleted when expiresAt time passes
```

---

## Text Search Indexes

Enable full-text search across multiple fields:

```javascript
// Search across name and description
productSchema.index({ name: 'text', description: 'text' });

// Query
Product.find({
  $text: { $search: 'laptop computer' }
}).sort({ score: { $meta: 'textScore' } });
```

---

## Troubleshooting

### Common Issues

**Issue**: "MongoAuthenticationError"
```
Solution: Check credentials in MONGODB_URI
- Username and password must be URL-encoded
- authSource=admin might be needed for certain setups
```

**Issue**: "Cannot read property 'name' of null"
```
Solution: Item doesn't exist or wasn't populated
- Use .populate('fieldName') for references
- Check if document exists before accessing properties
```

**Issue**: "Duplicate key error"
```
Solution: Unique field already exists
- Check for unique: true in schema
- Example: Two users with same email
- Solution: Add validation before create/update
```

**Issue**: "Validation error"
```
Solution: Data doesn't match schema requirements
- Check model schema for validation rules
- Pass required fields
- Match enum values exactly
```

---

## Next Steps

1. **Connection Testing**
   ```bash
   npm run dev
   # Check console for "✅ MongoDB Connected"
   ```

2. **Seed Sample Data**
   ```bash
   npm run seed-db
   ```

3. **Create Models in Code**
   ```javascript
   const { User } = require('./models');
   const user = await User.create({
     username: 'johndoe',
     email: 'john@example.com',
     password: 'securePassword123'
   });
   ```

4. **Query Data**
   ```javascript
   const users = await User.find({ role: 'user' });
   const products = await Product.findByCategory('textbooks');
   ```

---

## Resources

- [Mongoose Documentation](https://mongoosejs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Data Modeling Guide](https://docs.mongodb.com/manual/core/data-modeling-introduction/)
- [Indexing Strategy](https://docs.mongodb.com/manual/indexes/)
