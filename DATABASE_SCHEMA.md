# MongoDB Database Schema Documentation

## Overview

This document describes the complete MongoDB database structure for the MatchMajor application. It includes all collections, their fields, data types, relationships, and validation rules.

---

## Collections

### 1. Users Collection

**Description:** Stores user account information, authentication data, and profile/survey information for study partner matching.

**Collection Name:** `users`

#### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | ✓ | ✓ | Auto | MongoDB unique identifier |
| `username` | String | ✓ | ✓ | - | Unique username for login |
| `email` | String | ✓ | ✓ | - | Unique email address (lowercase) |
| `password` | String | ✓ | - | - | Bcrypt hashed password (12 salt rounds) |
| `profilePhoto` | String | ✗ | - | null | URL to user's profile picture |
| `role` | String | ✗ | - | "user" | User role: "user" or "admin" |
| `createdAt` | Date | ✓ | - | Auto | Account creation timestamp |
| `updatedAt` | Date | ✓ | - | Auto | Last profile update timestamp |
| `orders` | Array[ObjectId] | ✗ | - | [] | References to Order documents |

#### Survey/Profile Fields - Study Partner Matching

| Field | Type | Enum Values | Default | Description |
|-------|------|------------|---------|-------------|
| `major` | String | - | null | Student's major/field of study |
| `year` | String | Freshman, Sophomore, Junior, Senior, Graduate, Other | null | Academic year |
| `interests` | Array[String] | - | [] | List of interests/hobbies |
| `experience` | String | Beginner, Intermediate, Advanced, Expert | null | Experience level with subject |
| `goals` | String | - | null | Study/career goals |

#### Survey/Profile Fields - Study Preferences

| Field | Type | Description |
|-------|------|-------------|
| `currentClasses` | String | Classes user is currently taking |
| `studyGoals` | String | Specific study objectives |
| `honors` | String | Honors program participation |
| `studyLocation` | String | Preferred study location |
| `studyTimes` | String | Preferred study times |
| `idealGroupSize` | String | Preferred study group size |
| `virtualOrInPerson` | String | Virtual or in-person preference |
| `studyHabits` | String | Study habits description |
| `studyStyle` | String | Learning style |

#### Survey/Profile Fields - Roommate Preferences

| Field | Type | Enum Values | Description |
|-------|------|------------|-------------|
| `sleepSchedule` | String | Early Bird, Night Owl, Flexible | Preferred sleep schedule |
| `cleanliness` | String | Very Tidy, Tidy, Average, Messy | Cleanliness preference |
| `socialBattery` | String | - | Social interaction preference |
| `campusSelection` | String | - | Campus choice |

#### Survey/Profile Fields - Housing

| Field | Type | Description |
|-------|------|-------------|
| `visitorPolicy` | String | Policy on visitors |
| `items` | String | Items user has/wants to share |
| `pets` | String | Pet ownership status |
| `allergies` | String | Allergies to accommodations |
| `hobbies` | String | Hobbies and pastimes |

#### Sample User Document

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439011')",
  "username": "alex_cs2024",
  "email": "alex@university.edu",
  "password": "$2a$12$...[hashed_password]...",
  "profilePhoto": "https://example.com/photos/alex.jpg",
  "role": "user",
  "major": "Computer Science",
  "year": "Senior",
  "interests": ["machine learning", "web development", "open source"],
  "experience": "Advanced",
  "goals": "Secure internship in AI",
  "currentClasses": "Design Patterns, Data Structures, AI",
  "studyGoals": "Master design patterns",
  "studyLocation": "Library or cafe",
  "studyTimes": "Weekday evenings",
  "idealGroupSize": "2-3 people",
  "virtualOrInPerson": "In-person preferred",
  "sleepSchedule": "Night Owl",
  "cleanliness": "Tidy",
  "honors": "Yes",
  "orders": [
    "ObjectId('507f1f77bcf86cd799439012')"
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

---

### 2. Products Collection

**Description:** Stores product information for the marketplace/shop feature.

**Collection Name:** `products`

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | ✓ | Auto | MongoDB unique identifier |
| `name` | String | ✓ | - | Product name |
| `description` | String | ✓ | - | Detailed product description |
| `price` | Number | ✓ | - | Product price (minimum: 0) |
| `category` | String | ✓ | - | Product category (enum) |
| `image` | String | ✗ | "https://via.placeholder.com/300" | Product image URL |
| `features` | Array[String] | ✗ | [] | List of product features |
| `inStock` | Boolean | ✗ | true | Stock availability |
| `createdAt` | Date | ✓ | Auto | Product creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last product update timestamp |

#### Category Enum Values
- Bundle
- Hardware
- Software
- Service
- Accessory

#### Sample Product Document

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439013')",
  "name": "Study Bundle Pro",
  "description": "Complete study package with collaboration tools and resources",
  "price": 49.99,
  "category": "Bundle",
  "image": "https://example.com/products/study-bundle.jpg",
  "features": [
    "Unlimited group chats",
    "Shared notes workspace",
    "Schedule coordinator",
    "Resource library access"
  ],
  "inStock": true,
  "createdAt": "2024-01-10T08:00:00Z",
  "updatedAt": "2024-01-10T08:00:00Z"
}
```

---

### 3. Orders Collection

**Description:** Stores user order information and transaction details.

**Collection Name:** `orders`

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | ✓ | Auto | MongoDB unique identifier |
| `user` | ObjectId (ref: User) | ✓ | - | Reference to user who placed order |
| `items` | Array[Object] | ✓ | - | Array of ordered items |
| `items[].product` | ObjectId (ref: Product) | ✓ | - | Reference to product |
| `items[].name` | String | ✗ | - | Product name at time of order |
| `items[].price` | Number | ✗ | - | Product price at time of order |
| `items[].quantity` | Number | ✓ | - | Quantity ordered (min: 1) |
| `shippingAddress` | Object | ✗ | - | Shipping address details |
| `shippingAddress.street` | String | ✗ | - | Street address |
| `shippingAddress.city` | String | ✗ | - | City |
| `shippingAddress.state` | String | ✗ | - | State/Province |
| `shippingAddress.zipCode` | String | ✗ | - | ZIP/Postal code |
| `shippingAddress.country` | String | ✗ | - | Country |
| `paymentMethod` | String | ✓ | - | Payment method used |
| `paymentResult` | Object | ✗ | - | Payment processing result |
| `paymentResult.id` | String | ✗ | - | Payment transaction ID |
| `paymentResult.status` | String | ✗ | - | Payment status |
| `paymentResult.email` | String | ✗ | - | Payment email |
| `totalPrice` | Number | ✓ | - | Total order amount |
| `status` | String | ✗ | "pending" | Order status (enum) |
| `createdAt` | Date | ✓ | Auto | Order creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last status update timestamp |

#### Status Enum Values
- pending
- processing
- shipped
- delivered
- cancelled

#### Sample Order Document

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439014')",
  "user": "ObjectId('507f1f77bcf86cd799439011')",
  "items": [
    {
      "product": "ObjectId('507f1f77bcf86cd799439013')",
      "name": "Study Bundle Pro",
      "price": 49.99,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "country": "USA"
  },
  "paymentMethod": "creditCard",
  "paymentResult": {
    "id": "pi_1234567890",
    "status": "succeeded",
    "email": "alex@university.edu"
  },
  "totalPrice": 49.99,
  "status": "processing",
  "createdAt": "2024-01-20T15:30:00Z",
  "updatedAt": "2024-01-20T15:32:00Z"
}
```

---

### 4. Cart Collection

**Description:** Stores shopping cart information for users.

**Collection Name:** `carts`

#### Schema Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | ✓ | Auto | MongoDB unique identifier |
| `user` | ObjectId (ref: User) | ✓ | - | Reference to user cart owner |
| `items` | Array[Object] | ✗ | [] | Array of cart items |
| `items[].product` | ObjectId (ref: Product) | ✓ | - | Reference to product |
| `items[].quantity` | Number | ✓ | 1 | Item quantity (min: 1) |
| `total` | Number | ✗ | 0 | Cart total price |
| `createdAt` | Date | ✓ | Auto | Cart creation timestamp |
| `updatedAt` | Date | ✓ | Auto | Last cart update timestamp |

#### Sample Cart Document

```json
{
  "_id": "ObjectId('507f1f77bcf86cd799439015')",
  "user": "ObjectId('507f1f77bcf86cd799439011')",
  "items": [
    {
      "product": "ObjectId('507f1f77bcf86cd799439013')",
      "quantity": 1
    },
    {
      "product": "ObjectId('507f1f77bcf86cd799439016')",
      "quantity": 2
    }
  ],
  "total": 99.97,
  "createdAt": "2024-01-20T15:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

---

## Collection Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    COLLECTION DIAGRAM                   │
└─────────────────────────────────────────────────────────┘

              ┌──────────────────────┐
              │      PRODUCTS        │
              │  (Marketplace Items) │
              └──────────────────────┘
                      ▲      ▲
                      │      │
                 Referenced by
                      │      │
       ┌──────────────┼──────┼──────────────┐
       │              │      │              │
       │              │      │              │
   ┌────────┐    ┌────────┐  ┌──────────┐
   │  CART  │    │ ORDERS │  │ PRODUCTS │
   └────────┘    └────────┘  └──────────┘
       ▲              ▲
       │   References │
       │              │
       └──────┬───────┘
              │
         ┌─────────────────────┐
         │      USERS          │
         │ (Authentication &   │
         │  Profile/Survey)    │
         └─────────────────────┘
```

### Relationships Summary

- **Users → Orders**: One-to-Many (1 user can have multiple orders)
- **Users → Cart**: One-to-One (1 user has 1 cart)
- **Products → Orders**: Many-to-Many (products appear in multiple orders)
- **Products → Cart**: Many-to-Many (products can be in multiple carts)

---

## Indexes

### Recommended Indexes for Performance

#### Users Collection
```javascript
// For login/authentication
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

// For profile matching
db.users.createIndex({ major: 1 });
db.users.createIndex({ year: 1 });
db.users.createIndex({ interests: 1 });
db.users.createIndex({ experience: 1 });

// For compound queries
db.users.createIndex({ major: 1, year: 1, interests: 1 });
```

#### Products Collection
```javascript
// For browsing
db.products.createIndex({ category: 1 });

// For search
db.products.createIndex({ name: "text", description: "text" });
```

#### Orders Collection
```javascript
// For user order history
db.orders.createIndex({ user: 1 });

// For order status tracking
db.orders.createIndex({ status: 1 });

// For timestamps
db.orders.createIndex({ createdAt: 1 });
```

#### Cart Collection
```javascript
// For user carts
db.carts.createIndex({ user: 1 }, { unique: true });
```

---

## Data Relationships & Foreign Keys

### User References
```javascript
// User has many orders
user._id → orders[].user

// User has one cart
user._id → cart.user
```

### Product References
```javascript
// Product appears in orders
product._id → orders[].items[].product

// Product appears in cart
product._id → cart.items[].product
```

---

## Validation Rules

### Users Collection
- `username` and `email` must be unique
- `email` must be lowercase and trimmed
- `password` must be hashed with bcrypt (12 salt rounds)
- `year` must be one of the enum values (Freshman, Sophomore, Junior, Senior, Graduate, Other)
- `experience` must be one of the enum values (Beginner, Intermediate, Advanced, Expert)
- `role` must be either "user" or "admin"

### Products Collection
- `name` and `description` are required
- `price` must be >= 0
- `category` must be one of the enum values (Bundle, Hardware, Software, Service, Accessory)

### Orders Collection
- `user` must reference a valid User
- `items` array must contain at least one item
- `items[].quantity` must be >= 1
- `totalPrice` must be >= 0
- `status` must be one of the enum values (pending, processing, shipped, delivered, cancelled)
- `items[].product` must reference a valid Product

### Cart Collection
- `user` must reference a valid User (unique per user)
- `items[].quantity` must be >= 1
- `items[].product` must reference a valid Product

---

## Database Statistics

### Expected Collection Sizes

| Collection | Expected Documents | Purpose |
|------------|-------------------|---------|
| users | 100 - 10,000+ | User accounts & profiles |
| products | 50 - 500 | Marketplace items |
| orders | Variable | Order history |
| carts | 100 - 10,000+ | Active shopping carts |

---

## Environment Configuration

### MongoDB Connection

**Connection String Format:**
```
mongodb://[username]:[password]@[host]:[port]/[database]
```

**Example:**
```
MONGODB_URI=mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor
```

### Environment Variables Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `NODE_ENV` - development, production, or staging

---

## Backup & Export Instructions

### Export Collections to JSON

```bash
# Export all users
mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection users \
  --out users.json

# Export all products
mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection products \
  --out products.json

# Export all orders
mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection orders \
  --out orders.json

# Export all carts
mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection carts \
  --out carts.json
```

### Import Collections from JSON

```bash
# Import all users
mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection users \
  --file users.json \
  --jsonArray

# Import all products
mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection products \
  --file products.json \
  --jsonArray

# Import all orders
mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection orders \
  --file orders.json \
  --jsonArray

# Import all carts
mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection carts \
  --file carts.json \
  --jsonArray
```

---

## Updating Schema

### Adding a New Field to Users

```javascript
db.users.updateMany({}, { $set: { newField: defaultValue } })
```

### Removing a Field from Users

```javascript
db.users.updateMany({}, { $unset: { fieldToRemove: "" } })
```

### Creating TTL (Time-To-Live) Index for Sessions

```javascript
// Auto-delete carts after 30 days of inactivity
db.carts.createIndex({ "updatedAt": 1 }, { expireAfterSeconds: 2592000 })
```

---

## Security Notes

1. **Password Security**: All passwords are hashed using bcrypt with 12 salt rounds before storage
2. **Email Security**: Emails are stored in lowercase and are unique per user
3. **Authentication**: Implement JWT tokens for API endpoint protection
4. **Role-Based Access**: Admin operations should verify `role` field is "admin"
5. **Sensitive Data**: Never expose password hashes or internal IDs in API responses
6. **Data Validation**: Always validate and sanitize input data before saving to database

---

## Last Updated
January 20, 2024

---

## Notes for GitHub Transfer

✅ **Before sharing database info via GitHub:**
1. Export collections using mongoexport command
2. Store exported JSON files in a safe, private location
3. Never commit `.env` files or connection strings with credentials
4. Document any custom validation or business logic
5. Include this schema document with any exported data
6. Keep database backups separate from version control

