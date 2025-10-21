const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const UserActivity = require('../models/UserActivity');
const User = require('../models/User');

// Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const { minPrice, maxPrice, category, location, sort, page = 1, limit = 12, userCreated, source } = req.query;
    const filter = { status: 'available' };
    if (minPrice) filter.pricePKR = { ...filter.pricePKR, $gte: Number(minPrice) };
    if (maxPrice) filter.pricePKR = { ...filter.pricePKR, $lte: Number(maxPrice) };
    if (category) filter.category = { $regex: `^${category}$`, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    
    // Filter by source if specified, otherwise default to category
    if (source) {
      filter.source = source;
    } else {
      // Only show products from category source (not marketplace or adoption)
      filter.source = 'category';
    }
    
    // Filter for user-created products only (exclude admin products)
    if (userCreated === 'true') {
      // Get system admin user ID
      const systemUser = await User.findOne({ email: 'admin@system.local' });
      if (systemUser) {
        filter.seller = { $ne: systemUser._id };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { pricePKR: 1 };
    if (sort === 'price-high') sortOption = { pricePKR: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('seller', 'firstName lastName email')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    const mappedProducts = products.map(product => ({
      ...product.toObject(),
      price: product.pricePKR ?? product.price ?? 0,
      pricePKR: product.pricePKR, // Preserve the original pricePKR field
      photos: product.images || [],
      image: (product.images && product.images[0]) || product.image || '/placeholder.jpg',
      name: product.name || 'Untitled',
      breed: product.breed || product.category || 'Unknown',
      location: product.location || 'Unknown',
      tags: product.tags || [],
    }));
    res.json({ data: mappedProducts, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get 4 random products from product categories
router.get('/random', async (req, res) => {
  try {
    // Only include products from main categories (case-insensitive matching) and category source
    const categories = ['Dogs', 'Cats', 'Rabbit Food', 'Toys', 'Belts and Cages'];
    const products = await Product.aggregate([
      { 
        $match: { 
          category: { $in: categories },
          status: 'available',
          source: 'category'
        } 
      },
      { $sample: { size: 4 } }
    ]);
    
    // If no products found, try to get any available products from category source
    if (products.length === 0) {
      const fallbackProducts = await Product.aggregate([
        { 
          $match: { 
            status: 'available',
            source: 'category'
          } 
        },
        { $sample: { size: 4 } }
      ]);
      // Map the fallback products to include the image field
      const mappedFallbackProducts = fallbackProducts.map(product => ({
        ...product,
        price: product.pricePKR ?? product.price ?? 0,
        photos: product.images || [],
        image: (product.images && product.images[0]) || product.image || '/placeholder.jpg',
        name: product.name || 'Untitled',
        breed: product.breed || 'Unknown',
        location: product.location || 'Unknown',
        tags: product.tags || [],
      }));
      res.json(mappedFallbackProducts);
    } else {
      // Map the products to include the image field like the main endpoint
      const mappedProducts = products.map(product => ({
        ...product,
        price: product.pricePKR ?? product.price ?? 0,
        photos: product.images || [],
        image: (product.images && product.images[0]) || product.image || '/placeholder.jpg',
        name: product.name || 'Untitled',
        breed: product.breed || product.category || 'Unknown',
        location: product.location || 'Unknown',
        tags: product.tags || [],
      }));
      res.json(mappedProducts);
    }
  } catch (error) {
    console.error('Error fetching random products:', error);
    res.status(500).json({ message: 'Error fetching random products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'firstName lastName email');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
});

// Create product
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('pricePKR').isFloat({ min: 1 }).withMessage('Price must be at least 1'),
  body('category').isIn(['Dogs', 'Cats', 'Birds', 'Fish', 'Other', 'Rabbit', 'Rabbit Food', 'Toys', 'Belts and Cages'])
    .withMessage('Invalid category'),
  body('stock').isNumeric().withMessage('Stock must be a number'),
  body('images').isArray().withMessage('Images must be an array'),
  body('location').notEmpty().withMessage('Location is required'),
  body('condition').isIn(['New', 'Like New', 'Good', 'Fair']).withMessage('Invalid condition'),
  body('slug').notEmpty().withMessage('Slug is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let {
      name,
      slug,
      description,
      pricePKR,
      category,
      stock,
      images,
      location,
      condition
    } = req.body;

    // Generate slug if not provided
    if (!slug && name) {
      slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Ensure condition is set
    if (!condition) {
      condition = 'New';
    }

    // Ensure images is an array of strings
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ errors: [{ msg: 'At least one image is required', path: 'images' }] });
    }

    // Set seller: if admin, use system user
    let sellerId = req.user._id;
    if (req.user.role === 'admin') {
      let systemUser = await User.findOne({ email: 'admin@system.local' });
      if (!systemUser) {
        systemUser = await User.create({
          firstName: 'System',
          lastName: 'Admin',
          email: 'admin@system.local',
          password: 'adminpass123',
          phone: '0000000000'
        });
      }
      sellerId = systemUser._id;
    }

    const product = new Product({
      name,
      slug,
      description,
      pricePKR,
      category,
      stock,
      images,
      location,
      condition,
      seller: sellerId,
      status: req.user.role === 'admin' ? 'available' : 'pending',
      source: req.body.source || 'category', // Set source based on where it was posted
    });

    await product.save();
    console.log('Received product payload:', req.body);
    console.log('Saved product:', product);
    // Log user activity
    await UserActivity.create({
      user: req.user._id,
      action: 'Posted product listing',
      details: { method: req.method, path: req.path, body: req.body }
    });
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      return res.status(409).json({ message: 'A product with this slug already exists. Please use a different name.' });
    }
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update product
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('pricePKR').optional().isNumeric().withMessage('Price must be a number'),
  body('category').optional().isIn(['Dogs', 'Cats', 'Birds', 'Fish', 'Other', 'Rabbit', 'Rabbit Food', 'Toys', 'Belts and Cages'])
    .withMessage('Invalid category'),
  body('stock').optional().isNumeric().withMessage('Stock must be a number'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('location').optional().notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Allow admin to update status, otherwise only seller can update
    if (!(req.user.role === 'admin' || product.seller.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const {
      name,
      description,
      pricePKR,
      category,
      breed,
      stock,
      images,
      location,
      status
    } = req.body;

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (pricePKR) product.pricePKR = pricePKR;
    if (category) product.category = category;
    if (breed) product.breed = breed;
    if (stock) product.stock = stock;
    if (images) product.images = images;
    if (location) product.location = location;
    if (status) product.status = status;

    await product.save();
    // Log admin or user activity
    await UserActivity.create({
      user: req.user._id,
      action: req.user.role === 'admin' ? `Admin updated product status to ${status}` : 'Updated product listing',
      details: { method: req.method, path: req.path, productId: req.params.id, status }
    });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router; 