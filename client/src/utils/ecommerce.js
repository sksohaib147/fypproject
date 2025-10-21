// E-commerce utility functions

// Format price with currency symbol and thousands separator
export const formatPrice = (price) => {
  return `Rs ${Number(price).toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

// Calculate discount percentage
export const calculateDiscount = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

// Format date for product listings
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Validate image file
export const validateImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or GIF)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size should be less than 5MB'
    };
  }

  return { valid: true };
};

// Generate product slug
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Calculate shipping cost based on location and weight
export const calculateShipping = (location, weight) => {
  // This is a simplified version. In a real app, you'd use a shipping API
  const baseRate = 5.99;
  const weightRate = weight * 0.5;
  return baseRate + weightRate;
};

// Format product condition for display
export const formatCondition = (condition) => {
  const conditions = {
    'New': 'Brand New',
    'Like New': 'Like New',
    'Good': 'Good Condition',
    'Fair': 'Fair Condition'
  };
  return conditions[condition] || condition;
};

// Validate product data
export const validateProduct = (product) => {
  const errors = {};

  if (!product.name) errors.name = 'Product name is required';
  if (!product.description) errors.description = 'Description is required';
  if (!product.pricePKR || product.pricePKR <= 0) errors.pricePKR = 'Valid price is required';
  if (!product.category) errors.category = 'Category is required';
  if (!product.condition) errors.condition = 'Condition is required';
  if (!product.location) errors.location = 'Location is required';
  if (!product.images || product.images.length === 0) errors.images = 'At least one image is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 