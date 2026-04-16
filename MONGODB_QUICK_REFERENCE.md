# MongoDB Models Quick Reference

## Import Models

```javascript
// Option 1: Centralized import
const { User, Product, Order, Cart, Survey, Chatroom, Message, Post } = require('../models');

// Option 2: Individual imports
const User = require('../models/User');
const Product = require('../models/Product');
```

---

## User Model

### Create User
```javascript
const user = await User.create({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'SecurePass123' // Hashed automatically
});
```

### Find Users
```javascript
// By ID
const user = await User.findById(userId);

// By email
const user = await User.findOne({ email: 'john@example.com' });

// By username
const user = await User.findOne({ username: 'johndoe' });

// All active users
const users = await User.find({ isActive: true });

// Get password (normally hidden)
const user = await User.findById(userId).select('+password');
```

### Compare Password
```javascript
const user = await User.findById(userId).select('+password');
const isMatch = await user.comparePassword(inputPassword);
```

### Update User
```javascript
const user = await User.findByIdAndUpdate(userId, {
  profilePhoto: 'https://...',
  lastLogin: new Date()
}, { new: true });
```

---

## Product Model

### Create Product
```javascript
const product = await Product.create({
  name: 'Calculus Textbook',
  description: 'Essential calculus textbook for math majors',
  price: 89.99,
  category: 'textbooks',
  stock: 50,
  seller: sellerId
});
```

### Find Products
```javascript
// By category with pagination
const products = await Product.findByCategory('textbooks', 1, 10);

// Search products
const results = await Product.searchProducts('calculus', {
  category: 'textbooks',
  maxPrice: 100
});

// By category with filter
const supplies = await Product.find({
  category: 'supplies',
  stock: { $gt: 0 }
}).sort({ price: 1 });

// Low stock products
const lowStock = await Product.find({
  stock: { $lt: 5 }
});
```

### Manage Stock
```javascript
const product = await Product.findById(productId);

// Reduce stock for order
await product.reduceStock(2);

// Increase stock for return
await product.increaseStock(1);

// Check available quantity
const available = product.getAvailableQuantity();
```

---

## Order Model

### Create Order
```javascript
const order = await Order.create({
  user: userId,
  items: [
    {
      product: productId1,
      name: 'Calculus Book',
      price: 89.99,
      quantity: 1
    }
  ],
  shippingAddress: {
    street: '123 Main St',
    city: 'Boston',
    state: 'MA',
    zipCode: '02101',
    country: 'USA'
  },
  paymentMethod: 'creditCard',
  totalPrice: 89.99
});
```

### Find Orders
```javascript
// User's orders
const orders = await Order.findByUser(userId, 'pending');

// By status
const shipped = await Order.findByStatus('shipped');

// All user orders sorted
const userOrders = await Order.find({ user: userId }).sort({ createdAt: -1 });

// By tracking number
const order = await Order.findOne({ trackingNumber: 'TRK123' });
```

### Update Order Status
```javascript
const order = await Order.findById(orderId);
await order.updateStatus('shipped', 'Order dispatched to carrier');

// Status history is automatically updated
console.log(order.statusHistory);
// [
//   { status: 'pending', timestamp: ..., notes: '...' },
//   { status: 'shipped', timestamp: ..., notes: 'Order dispatched to carrier' }
// ]
```

### Get Order Info
```javascript
const order = await Order.findById(orderId);

const subtotal = order.getSubtotal();
const summary = order.getSummary();
const itemCount = order.itemCount; // Virtual field
```

---

## Cart Model

### Create/Get Cart
```javascript
// Get existing or create new
const cart = await Cart.findByUser(userId);

if (!cart) {
  const newCart = await Cart.create({
    user: userId,
    items: [],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });
}
```

### Manage Items
```javascript
const cart = await Cart.findByUser(userId);

// Add item
await cart.addItem(productId, 'Calculus Book', 89.99, 1);

// Update quantity
await cart.updateItemQuantity(productId, 2);

// Remove item
await cart.removeItem(productId);

// Get summary with totals
const summary = cart.getSummary();
console.log(summary.subtotal, summary.total, summary.tax);
```

### Get Cart
```javascript
const cart = await Cart.findByUser(userId).populate('items.product');
// Includes full product details

const itemCount = cart.itemCount; // Virtual field
```

### Clear Cart
```javascript
const cart = await Cart.findByUser(userId);
await cart.clearCart();
```

---

## Survey Model

### Create/Update Survey
```javascript
const survey = await Survey.create({
  userId: userId,
  major: 'Computer Science',
  year: 'Junior',
  interests: ['Web Development', 'AI'],
  experience: 'Advanced',
  sleepSchedule: 'Night Owl',
  studyStyle: 'Group study preferred',
  virtualOrInPerson: 'Both'
});

// Update survey
const survey = await Survey.findByUserId(userId);
survey.interests = ['Web Dev', 'Data Science'];
await survey.save(); // Recalculates completionPercentage
```

### Get Survey
```javascript
// Get by user
const survey = await Survey.findByUserId(userId);

// Get profile (subset of fields)
const profile = survey.getProfile();
```

### Find Compatible Matches
```javascript
// Find study partner matches
const matches = await Survey.findCompatibleMatches(userId, 'Computer Science', 10);

// Get compatibility score
const score = survey.getCompatibilityScore(otherSurvey); // 0-100
```

---

## Chatroom Model

### Create Chatroom
```javascript
const chatroom = await Chatroom.create({
  name: 'CS101 Study Group',
  description: 'Discussion for Computer Science 101',
  color: '#09A6AD',
  creator: userId,
  category: 'study',
  members: [userId] // Creator auto-added
});
```

### Find Chatrooms
```javascript
// By category
const studyRooms = await Chatroom.findByCategory('study', 20);

// User's chatrooms
const userRooms = await Chatroom.findUserChatrooms(userId);

// Search
const results = await Chatroom.searchChatrooms('calculus');

// All public (non-archived)
const active = await Chatroom.find({
  isArchived: false,
  isPrivate: false
});
```

### Manage Members
```javascript
const chatroom = await Chatroom.findById(chatroomId);

// Add member
await chatroom.addMember(userId);

// Remove member
await chatroom.removeMember(userId);

// Check membership
if (chatroom.isMember(userId)) {
  // User is member
}

// Check creator
if (chatroom.isCreator(userId)) {
  // User is creator
}
```

### Update Chatroom
```javascript
const chatroom = await Chatroom.findByIdAndUpdate(chatroomId, {
  name: 'New Name',
  description: 'Updated description'
}, { new: true });
```

---

## Message Model

### Create Message
```javascript
const message = await Message.create({
  chatroom: chatroomId,
  user: userId,
  username: 'johndoe',
  text: 'Hello everyone!',
  sentAt: new Date()
});
```

### Find Messages
```javascript
// Get chatroom messages (50 limit)
const messages = await Message.findByChatroom(chatroomId);

// Get messages with pagination
const messages = await Message.findByChatroom(chatroomId, 20, 40); // limit 20, skip 40

// Get threaded replies
const threads = await Message.getThreads(chatroomId);

// Get specific message
const message = await Message.findById(messageId).populate('user');
```

### Edit/Delete Message
```javascript
const message = await Message.findById(messageId);

// Edit
await message.editMessage('Updated message text');

// Delete (soft delete)
await message.deleteMessage();
```

### Add Reaction
```javascript
const message = await Message.findById(messageId);

// Add emoji reaction
await message.addReaction(userId, '👍');

// User's emoji reaction is tracked in reactions Map
```

---

## Post Model

### Create Post
```javascript
const post = await Post.create({
  chatroom: chatroomId,
  author: userId,
  authorName: 'John Doe',
  content: 'Great discussion everyone!'
});
```

### Find Posts
```javascript
// Get posts by chatroom
const posts = await Post.findByChatroom(chatroomId);

// With pagination
const posts = await Post.findByChatroom(chatroomId, 10, 20);

// Trending posts
const trending = await Post.getTrendingPosts(10);

// Get specific post
const post = await Post.findById(postId)
  .populate('author', 'username profilePhoto')
  .populate('comments.author', 'username profilePhoto');
```

### Manage Likes
```javascript
const post = await Post.findById(postId);

// Like/unlike
const newLikeCount = await post.toggleLike(userId);
```

### Manage Comments
```javascript
const post = await Post.findById(postId);

// Add comment
await post.addComment(userId, 'John Doe', 'Great point!');

// Remove comment
await post.removeComment(commentId);

// Get count
console.log(post.commentCount); // Virtual field
```

### Edit/Delete Post
```javascript
const post = await Post.findById(postId);

// Edit
await post.editPost('Updated content');

// Delete (soft delete)
await post.deletePost();

// Get details
const details = post.getDetails();
```

---

## Common Patterns

### Populate References
```javascript
// Single reference
const order = await Order.findById(orderId).populate('user');

// Multiple levels
const message = await Message.findById(messageId)
  .populate('user')
  .populate('chatroom');

// Selective fields
const post = await Post.findById(postId)
  .populate('author', 'username profilePhoto')
  .populate('comments.author', 'username profilePhoto');
```

### Pagination
```javascript
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const products = await Product.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });

const total = await Product.countDocuments();
const pages = Math.ceil(total / limit);
```

### Error Handling
```javascript
try {
  const user = await User.create({
    username: 'john',
    email: 'john@example.com',
    password: 'pass' // Too short
  });
} catch (error) {
  if (error.code === 11000) {
    // Duplicate key error
    console.log('Email already exists');
  } else if (error.name === 'ValidationError') {
    // Validation failed
    console.log(error.message);
  }
}
```

### Transactions (Advanced)
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // Multiple operations in transaction
  await Order.create([{ /* order data */ }], { session });
  await Cart.findByIdAndDelete(cartId, { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

## Performance Tips

### Use Select to Limit Fields
```javascript
// Good - only get needed fields
const users = await User.find().select('username email');

// Bad - retrieves all fields
const users = await User.find();
```

### Use Lean for Read-Only Data
```javascript
// Good - faster for read-only
const products = await Product.find().lean();

// Bad - returns full Mongoose documents
const products = await Product.find();
```

### Index Your Queries
```javascript
// Query by email frequently?
userSchema.index({ email: 1 });

// Query by category and price?
productSchema.index({ category: 1, price: 1 });

// Text search?
productSchema.index({ name: 'text', description: 'text' });
```

---

## Useful Helpers

### Count Documents
```javascript
const userCount = await User.countDocuments();
const activeUsers = await User.countDocuments({ isActive: true });
```

### Check Existence
```javascript
const exists = await User.exists({ email: 'john@example.com' });
```

### Update Many
```javascript
await Product.updateMany(
  { category: 'textbooks' },
  { $set: { featured: true } }
);
```

### Delete Many
```javascript
await Message.deleteMany({ isDeleted: true, createdAt: { $lt: oneYearAgo } });
```

---

## Troubleshooting

**"Cannot populate path"**
- Check spelling of reference field
- Verify Model.model() name matches ref value

**"Duplicate key error"**
- Check for duplicate in unique fields
- Clear indexes: `db.collection.dropIndex()`

**"Query returns null"**
- Verify data exists in database
- Check filter criteria
- Use find() instead of findOne()

**"Async/await hanging"**
- Check MongoDB connection
- Verify credentials in .env
- Check network/firewall

---

## Next Steps

1. Try creating a user
2. Create a product
3. Add it to cart
4. Create an order
5. Query the relationships
