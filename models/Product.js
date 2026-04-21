// server/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    max: [999999, 'Price cannot exceed 999999']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['textbooks', 'supplies', 'housing', 'services', 'other'],
      message: 'Category must be one of: textbooks, supplies, housing, services, other'
    }
  },
  
  image: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  
  // Stock management
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  
  features: [{
    type: String,
    maxlength: [500, 'Feature description cannot exceed 500 characters']
  }],
  
  // Status
  inStock: {
    type: Boolean,
    default: true
  },
  
  // Seller/Provider information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Product ratings and reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  reviewCount: {
    type: Number,
    default: 0
  },
  
  // SEO and visibility
  searchKeywords: [{
    type: String,
    lowercase: true
  }]
}, {
  timestamps: true
});

/**
 * Indexes for performance optimization
 */
// Single field indexes
productSchema.index({ name: 'text', description: 'text' }); // Full-text search
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ seller: 1 });

// Compound indexes
productSchema.index({ category: 1, price: 1 });
productSchema.index({ inStock: 1, category: 1 });

/**
 * Virtual: SKU (Stock Keeping Unit)
 */
productSchema.virtual('sku').get(function() {
  return `${this.category.toUpperCase()}-${this._id}`;
});

/**
 * Virtual: Discount percentage (if needed for promotions)
 */
productSchema.virtual('discount').get(function() {
  return this.originalPrice ? Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100) : 0;
});

/**
 * Pre-save middleware: Update inStock status based on stock quantity
 */
productSchema.pre('save', async function() {
  // Automatically set inStock based on stock quantity
  if (this.stock <= 0) {
    this.inStock = false;
  } else {
    this.inStock = true;
  }
});

/**
 * Instance method: Get available quantity
 */
productSchema.methods.getAvailableQuantity = function() {
  return this.stock;
};

/**
 * Instance method: Reduce stock (for orders)
 */
productSchema.methods.reduceStock = async function(quantity) {
  if (quantity > this.stock) {
    throw new Error(`Not enough stock available. Available: ${this.stock}, Requested: ${quantity}`);
  }
  this.stock -= quantity;
  await this.save();
  return this.stock;
};

/**
 * Instance method: Increase stock (for returns)
 */
productSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  await this.save();
  return this.stock;
};

/**
 * Static method: Find products by category with pagination
 */
productSchema.statics.findByCategory = function(category, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ category, inStock: true })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

/**
 * Static method: Search products
 */
productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  return this.find({
    $text: { $search: searchTerm },
    ...filters
  }).sort({ score: { $meta: 'textScore' } });
};

/**
 * Ensure virtuals are included in JSON output
 */
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
