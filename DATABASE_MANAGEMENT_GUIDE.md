# Database Management Guide

## Overview

This guide explains how to use the database schema files and manage database information transfers through GitHub for the MatchMajor project.

---

## Files in This Database Documentation

### 1. **DATABASE_SCHEMA.md**
Complete documentation of all MongoDB collections, their fields, relationships, and validation rules.

**Use this for:**
- Understanding database structure
- Setting up new databases
- Reviewing field requirements
- Database design reference
- Team collaboration

### 2. **DATABASE_SAMPLE_DATA.json**
Example documents showing what data looks like in each collection.

**Use this for:**
- Understanding data format
- Testing functionality
- Seeding test data
- Documentation purposes

---

## Quick Start: Exporting Your Database

### Step 1: Get MongoDB Tools

Install MongoDB Database Tools if you don't have them:

**Windows:**
```powershell
# Using Chocolatey
choco install mongodb-database-tools

# Or download from: https://www.mongodb.com/try/download/database-tools
```

**Mac:**
```bash
brew install mongodb-database-tools
```

**Linux:**
```bash
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.0.0.tgz
tar -zxvf mongodb-database-tools-*.tgz
export PATH=$PATH:/path/to/mongodb-database-tools/bin
```

### Step 2: Configure Your Connection

Get your MongoDB connection string from your `.env` file:

```bash
# From server/.env
MONGODB_URI=mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor
```

### Step 3: Export Collections to JSON

Run these commands in PowerShell or Terminal:

```bash
# Export users collection
mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection users \
  --out database-exports/users.json

# Export products collection
mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection products \
  --out database-exports/products.json

# Export orders collection
mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection orders \
  --out database-exports/orders.json

# Export carts collection
mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection carts \
  --out database-exports/carts.json
```

**On Windows (PowerShell):**
```powershell
$uri = "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor"

mongoexport --uri $uri --collection users --out database-exports\users.json
mongoexport --uri $uri --collection products --out database-exports\products.json
mongoexport --uri $uri --collection orders --out database-exports\orders.json
mongoexport --uri $uri --collection carts --out database-exports\carts.json
```

### Step 4: Review Exported Files

Each file will contain JSON documents, one per line (JSONL format):

```json
{"_id":{"$oid":"507f1f77bcf86cd799439011"},"username":"alex_cs2024",...}
```

### Step 5: Create Directory Structure

```bash
mkdir database-exports
mkdir database-imports
```

---

## Sharing Data Through GitHub

### ⚠️ Security Checklist

Before sharing any database exports:

- [ ] **Remove sensitive data**: Passwords should never be exported
- [ ] **Remove real emails**: Replace with test emails
- [ ] **Remove PII**: Personal information like addresses
- [ ] **Check .gitignore**: Never commit `.env` files
- [ ] **Use .gitignore patterns**:

**.gitignore additions:**
```
# Don't commit actual database exports with real data
database-exports/users.json
database-exports/orders.json
database-exports/

# Environment files
.env
.env.local
.env.*.local

# Credential files
*.pem
*.key
credentials.json
```

### Safe Way to Share Database Info

**Option 1: Share Anonymized Sample Data** (✅ Recommended)

```bash
# Create anonymized sample data
mongoexport --uri "mongodb://..." \
  --collection users \
  --query '{"_id":{"$oid":"507f1f77bcf86cd799439011"}}' \
  --out sample-user.json
```

Edit the exported file to remove sensitive information:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "user_1",
  "email": "user1@example.com",    // Changed from real email
  "password": "***REDACTED***",     // Never share passwords
  "major": "Computer Science",
  ...
}
```

**Option 2: Share Schema Only** (✅ Most Secure)

Just commit the `DATABASE_SCHEMA.md` file - it has all the structure info without any data.

**Option 3: Use Private Repository**

For real company/sensitive data, use a **private GitHub repository** and only share with authorized team members.

---

## Importing Data

### Import from Exported JSON Files

```bash
# Single collection import
mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection users \
  --file database-exports/users.json

# All collections
mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection users \
  --file database-exports/users.json

mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection products \
  --file database-exports/products.json

mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection orders \
  --file database-exports/orders.json

mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection carts \
  --file database-exports/carts.json
```

### Import with Replace (overwrites existing data)

```bash
mongoimport --uri "mongodb://..." \
  --collection users \
  --file users.json \
  --drop  # This will delete existing collection first
```

---

## Using Sample Data for Development

### 1. Generate Sample Data from DATABASE_SAMPLE_DATA.json

```javascript
// Create a script to load sample data
// server/scripts/loadSampleData.js

const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const sampleData = require('./DATABASE_SAMPLE_DATA.json');

async function loadSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    
    // Load sample data
    await User.insertMany(sampleData.collections.users);
    await Product.insertMany(sampleData.collections.products);
    await Order.insertMany(sampleData.collections.orders);
    await Cart.insertMany(sampleData.collections.carts);
    
    console.log('✅ Sample data loaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error loading sample data:', error);
    process.exit(1);
  }
}

loadSampleData();
```

### 2. Run Sample Data Script

```bash
# Navigate to server directory
cd server

# Run the script
node scripts/loadSampleData.js
```

---

## Backup & Recovery

### Create Automatic Backups

```bash
# Create backup timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# Export all collections with timestamp
mongoexport --uri "mongodb://..." --collection users --out "backups\users_$timestamp.json"
mongoexport --uri "mongodb://..." --collection products --out "backups\products_$timestamp.json"
mongoexport --uri "mongodb://..." --collection orders --out "backups\orders_$timestamp.json"
mongoexport --uri "mongodb://..." --collection carts --out "backups\carts_$timestamp.json"

echo "✅ Backup created at: backups\*_$timestamp.json"
```

### Restore from Backup

```bash
# Drop current database
mongo mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor --eval "db.dropDatabase()"

# Restore from backup
mongoimport --uri "mongodb://..." --collection users --file "backups\users_20240120_150000.json"
mongoimport --uri "mongodb://..." --collection products --file "backups\products_20240120_150000.json"
mongoimport --uri "mongodb://..." --collection orders --file "backups\orders_20240120_150000.json"
mongoimport --uri "mongodb://..." --collection carts --file "backups\carts_20240120_150000.json"
```

---

## Docker Database Management

### Export from Docker Container

```bash
# Get container name
docker ps | grep mongodb

# Export from running container
docker exec matchmajor-db mongoexport \
  --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection users \
  --out /tmp/users.json

# Copy from container to host
docker cp matchmajor-db:/tmp/users.json ./database-exports/users.json
```

### Import to Docker Container

```bash
# Copy file to container
docker cp ./database-exports/users.json matchmajor-db:/tmp/users.json

# Import into Docker MongoDB
docker exec matchmajor-db mongoimport \
  --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
  --collection users \
  --file /tmp/users.json
```

---

## Troubleshooting

### Connection Issues

**Error:** `Failed to connect to MongoDB`

```bash
# Check MongoDB is running
docker ps  # For Docker
# or
mongosh --uri "mongodb://localhost:27017"

# Check connection string
echo $MONGODB_URI  # Linux/Mac
echo $env:MONGODB_URI  # PowerShell
```

### Authentication Failed

**Error:** `authentication failed`

```bash
# Verify credentials in .env file
cat server/.env | grep MONGODB_URI

# For Docker, check compose file
docker-compose logs mongodb | grep "error"
```

### Collection Not Found

```bash
# List all collections in database
mongosh
> use matchmajor
> show collections

# If empty, import data
```

### File Format Issues

```bash
# Verify JSON format
# Use --jsonArray for array of documents
mongoimport --uri "mongodb://..." \
  --collection users \
  --file users.json \
  --jsonArray
```

---

## Useful Database Queries

### View Database Statistics

```bash
mongosh
> use matchmajor
> db.stats()
> db.users.countDocuments()
> db.users.stats()
```

### Export with Filters

```bash
# Only export active users
mongoexport --uri "mongodb://..." \
  --collection users \
  --query '{"role":"user"}' \
  --out active-users.json

# Only export recent orders
mongoexport --uri "mongodb://..." \
  --collection orders \
  --query '{"createdAt":{"$gte":new Date("2024-01-15")}}' \
  --out recent-orders.json
```

### Export with Projection (specific fields only)

```bash
# Export only username and email (no passwords)
mongoexport --uri "mongodb://..." \
  --collection users \
  --fields "username,email,major,year" \
  --out users-safe.json
```

---

## Best Practices

### Do's ✅
- ✅ Document all schema changes
- ✅ Always backup before major operations
- ✅ Use anonymized data for examples
- ✅ Keep DATABASE_SCHEMA.md updated
- ✅ Use .gitignore for sensitive files
- ✅ Test imports in dev environment first
- ✅ Version control schema documentation

### Don'ts ❌
- ❌ Never commit real user passwords
- ❌ Never share `.env` files
- ❌ Don't export PII without anonymization
- ❌ Don't drop production databases
- ❌ Don't commit large database exports
- ❌ Don't use weak MongoDB credentials
- ❌ Don't backup to unsecured locations

---

## Quick Reference Commands

### Linux/Mac/PowerShell

```bash
# Export all
for collection in users products orders carts; do
  mongoexport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
    --collection $collection \
    --out database-exports/$collection.json
done

# Import all
for collection in users products orders carts; do
  mongoimport --uri "mongodb://matchmajor:matchmajor_password@localhost:27017/matchmajor" \
    --collection $collection \
    --file database-exports/$collection.json
done
```

### Check Database Size

```bash
mongosh
> use matchmajor
> db.stats().dataSize  // Size in bytes
> db.stats().dataSize / (1024*1024)  // Size in MB
```

### Verify Data Integrity

```javascript
// Check for missing references
db.orders.aggregate([
  { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user_data" } },
  { $match: { user_data: { $size: 0 } } }
])
```

---

## Support & Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [mongoexport Reference](https://docs.mongodb.com/database-tools/mongoexport/)
- [mongoimport Reference](https://docs.mongodb.com/database-tools/mongoimport/)
- [MongoDB Connection Strings](https://docs.mongodb.com/manual/reference/connection-string/)

---

**Last Updated:** January 20, 2024
**Version:** 1.0

