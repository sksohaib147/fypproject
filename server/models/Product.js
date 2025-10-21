const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  pricePKR: {
    type: Number,
    required: true,
    min: 0
  },
  originalPricePKR: {
    type: Number,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Dogs', 'Cats', 'Birds', 'Fish', 'Other', 'Rabbit', 'Rabbit Food', 'Toys', 'Belts and Cages']
  },
  breed: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair']
  },
  images: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available'
  },
  source: {
    type: String,
    enum: ['marketplace', 'adoption', 'category'],
    default: 'category'
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String
  }],
  specifications: {
    type: Map,
    of: String
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Create text index for search
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text',
  category: 'text'
});

// Add indexes for better query performance
productSchema.index({ source: 1, createdAt: -1 }); // For admin listings query
productSchema.index({ seller: 1 }); // For populate queries
productSchema.index({ status: 1 }); // For status filtering
productSchema.index({ category: 1 }); // For category filtering
productSchema.index({ createdAt: -1 }); // For sorting by creation date

// Generate slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate discount percentage if original price is set
productSchema.pre('save', function(next) {
  if (this.isModified('originalPricePKR') && this.originalPricePKR > this.pricePKR) {
    this.discountPercentage = Math.round(((this.originalPricePKR - this.pricePKR) / this.originalPricePKR) * 100);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema); 