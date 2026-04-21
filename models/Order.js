// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required']
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [1000, 'Quantity cannot exceed 1000']
    }
  }],
  
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street is required'],
      minlength: [5, 'Street must be at least 5 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      minlength: [2, 'City name must be at least 2 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      match: [/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid zip code format']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['creditCard', 'debitCard', 'paypal', 'bankTransfer'],
      message: 'Invalid payment method'
    }
  },
  
  paymentResult: {
    id: String,
    status: String,
    email: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  
  status: {
    type: String,
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      message: 'Invalid order status'
    },
    default: 'pending'
  },
  
  // Tracking information
  trackingNumber: {
    type: String,
    default: null
  },
  
  // Status timeline
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  
  // Cancellation details (if applicable)
  cancellationReason: {
    type: String,
    default: null
  },
  
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

/**
 * Indexes for performance optimization
 */
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.zipCode': 1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ user: 1, status: 1 });

/**
 * Virtual: Itemcount
 */
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

/**
 * Pre-save middleware: Initialize status history
 */
orderSchema.pre('save', async function() {
  if (this.isNew) {
    this.statusHistory = [{
      status: this.status,
      timestamp: new Date(),
      notes: 'Order created'
    }];
  }
});

/**
 * Instance method: Update order status
 */
orderSchema.methods.updateStatus = async function(newStatus, notes = '') {
  if (this.status === newStatus) {
    throw new Error('Order already has this status');
  }
  
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    notes: notes
  });
  
  // Handle cancellation
  if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
  
  await this.save();
  return this;
};

/**
 * Instance method: Calculate subtotal
 */
orderSchema.methods.getSubtotal = function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

/**
 * Instance method: Get order summary
 */
orderSchema.methods.getSummary = function() {
  return {
    orderId: this._id,
    status: this.status,
    itemCount: this.itemCount,
    totalPrice: this.totalPrice,
    createdAt: this.createdAt,
    shippingAddress: this.shippingAddress,
    trackingNumber: this.trackingNumber
  };
};

/**
 * Static method: Get orders by user
 */
orderSchema.statics.findByUser = function(userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Static method: Get orders by status
 */
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

/**
 * Ensure virtuals are included in JSON output
 */
orderSchema.set('toJSON', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
