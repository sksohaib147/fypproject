const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  products: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: true
    },
    quantity: { 
      type: Number, 
      default: 1,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }],
  pets: [{
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: { 
    type: Number, 
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  shipping: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed'],
    default: 'pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'cash', 'easypaisa', 'jazzcash', 'cashondelivery'],
    default: 'stripe'
  },
  transactionId: {
    type: String
  },
  paymentIntentId: {
    type: String
  },
  refundId: {
    type: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Pakistan'
    }
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Pakistan'
    }
  },
  notes: {
    type: String,
    maxlength: 500
  },
  estimatedDelivery: {
    type: Date
  },
  trackingNumber: {
    type: String
  },
  paidAt: {
    type: Date
  },
  shippedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentIntentId: 1 });
orderSchema.index({ user: 1 });

// Pre-save middleware to update updatedAt
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('products') || this.isModified('pets')) {
    let subtotal = 0;
    
    // Calculate products subtotal
    if (this.products && this.products.length > 0) {
      this.products.forEach(item => {
        item.total = item.price * item.quantity;
        subtotal += item.total;
      });
    }
    
    // Calculate pets subtotal
    if (this.pets && this.pets.length > 0) {
      this.pets.forEach(item => {
        subtotal += item.price;
      });
    }
    
    this.subtotal = subtotal;
    this.totalAmount = subtotal + this.tax + this.shipping - this.discount;
  }
  next();
});

// Instance method to get order summary
orderSchema.methods.getOrderSummary = function() {
  return {
    orderId: this._id,
    totalAmount: this.totalAmount,
    status: this.status,
    itemCount: (this.products?.length || 0) + (this.pets?.length || 0),
    createdAt: this.createdAt
  };
};

// Static method to get orders by status
orderSchema.statics.getOrdersByStatus = function(status) {
  return this.find({ status }).populate('user', 'firstName lastName email');
};

// Static method to get user's order history
orderSchema.statics.getUserOrders = function(userId) {
  return this.find({ user: userId })
    .populate('products.product', 'name images pricePKR')
    .populate('pets.pet', 'name type breed images')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema); 