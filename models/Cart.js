// server/models/Cart.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    productName: String,
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [1000, 'Quantity cannot exceed 1000'],
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Calculated total
  subtotal: {
    type: Number,
    default: 0
  },
  
  total: {
    type: Number,
    default: 0
  },
  
  // Discount and tax (for future use)
  discount: {
    type: Number,
    default: 0
  },
  
  tax: {
    type: Number,
    default: 0
  },
  
  // Cart expiration (for abandoned carts)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

/**
 * Indexes for performance optimization
 */
// user index is created automatically via unique: true constraint
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion
cartSchema.index({ createdAt: -1 });

/**
 * Virtual: Item count
 */
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

/**
 * Pre-save middleware: Recalculate totals
 */
cartSchema.pre('save', async function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate total (subtotal + tax - discount)
  this.total = this.subtotal + this.tax - this.discount;
  
  // Ensure total is not negative
  if (this.total < 0) {
    this.total = 0;
  }
  
  next();
});

/**
 * Instance method: Add or update item in cart
 */
cartSchema.methods.addItem = async function(productId, productName, price, quantity = 1) {
  // Check if item already exists in cart
  const existingItem = this.items.find(item => item.product.toString() === productId.toString());
  
  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      productName,
      price,
      quantity
    });
  }
  
  await this.save();
  return this;
};

/**
 * Instance method: Remove item from cart
 */
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(item => item.product.toString() !== productId.toString());
  await this.save();
  return this;
};

/**
 * Instance method: Update item quantity
 */
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  if (quantity <= 0) {
    return this.removeItem(productId);
  }
  
  const item = this.items.find(item => item.product.toString() === productId.toString());
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  item.quantity = quantity;
  item.addedAt = new Date(); // Update timestamp
  await this.save();
  return this;
};

/**
 * Instance method: Clear cart
 */
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.subtotal = 0;
  this.total = 0;
  await this.save();
  return this;
};

/**
 * Instance method: Get cart summary
 */
cartSchema.methods.getSummary = function() {
  return {
    itemCount: this.itemCount,
    subtotal: this.subtotal,
    discount: this.discount,
    tax: this.tax,
    total: this.total,
    items: this.items.map(item => ({
      product: item.product,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.price * item.quantity
    }))
  };
};

/**
 * Static method: Find cart by user
 */
cartSchema.statics.findByUser = function(userId) {
  return this.findOne({ user: userId }).populate('items.product');
};

/**
 * Ensure virtuals are included in JSON output
 */
cartSchema.set('toJSON', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;