const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Pet = require('../models/Pet');
const Adoption = require('../models/Adoption');
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');
const UserActivity = require('../models/UserActivity');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Test endpoint to verify server is running updated code
router.get('/test', adminAuth, (req, res) => {
  res.json({ message: 'Admin test endpoint working!', timestamp: new Date().toISOString() });
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current admin
router.get('/me', adminAuth, async (req, res) => {
  try {
    console.log('Admin in /me:', req.admin);
    res.json({ 
      username: req.admin.username, 
      email: req.admin.email, 
      avatar: req.admin.avatar, 
      role: 'admin' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard data
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalPets = await Pet.countDocuments();
    
    const completedOrders = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    const topProducts = await Product.find()
      .sort({ salesCount: -1 })
      .limit(5);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalPets,
      totalRevenue,
      recentOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').lean(); // Use lean() for better performance
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Suspend/unsuspend user
router.put('/users/:userId/suspend', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products (only category products)
router.get('/products', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments({ source: 'category' });
    const products = await Product.find({ source: 'category' })
      .populate('seller', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Use lean() for better performance
    res.json({ data: products, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product (admin-specific) - SPECIFIC ROUTE BEFORE GENERIC
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const { status, stock } = req.body;
    
    // Update status if provided
    if (status && ['available', 'sold', 'pending'].includes(status)) {
      product.status = status;
    }
    
    // Update stock if provided (for out of stock functionality)
    if (stock !== undefined) {
      product.stock = stock;
    }
    
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product (admin-specific) - SPECIFIC ROUTE BEFORE GENERIC
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Get all pets
router.get('/pets', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Pet.countDocuments();
    const pets = await Pet.find()
      .populate('seller', 'name email')
      .skip(skip)
      .limit(Number(limit));
    res.json({ data: pets, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all adoptions
router.get('/adoptions', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Adoption.countDocuments();
    const adoptions = await Adoption.find()
      .populate('owner', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit));
    res.json({ data: adoptions, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get marketplace and adoption listings (for admin listings tab)
router.get('/listings', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query; // Increased limit for better performance
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get products with efficient pagination
    const products = await Product.find({ source: { $in: ['marketplace', 'adoption'] } })
      .populate('seller', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean(); // Use lean() for better performance
    
    // Get adoptions with efficient pagination
    const adoptions = await Adoption.find()
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean(); // Use lean() for better performance
    
    // Combine and sort by creation date (only the limited results)
    const allListings = [...products, ...adoptions].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Get total counts efficiently
    const totalProducts = await Product.countDocuments({ source: { $in: ['marketplace', 'adoption'] } });
    const totalAdoptions = await Adoption.countDocuments();
    const total = totalProducts + totalAdoptions;
    
    // Format the results
    const formattedListings = allListings.map(item => {
      if (item.species) {
        // This is an adoption
        return {
          ...item,
          id: item._id,
          title: `${item.species} - ${item.breed}` || 'Adoption',
          type: 'adoption',
          name: `${item.species} - ${item.breed}`,
          description: item.description,
          price: null,
          images: item.photos || []
        };
      } else {
        // This is a product
        return {
          ...item,
          id: item._id,
          title: item.name,
          type: 'product',
          images: item.images || []
        };
      }
    });
    
    res.json({ 
      data: formattedListings, 
      total, 
      page: Number(page), 
      limit: Number(limit) 
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update adoption (admin-specific)
router.put('/adoptions/:id', adminAuth, async (req, res) => {
  try {
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }
    
    const { status, adminApproval } = req.body;
    
    // Update status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      adoption.status = status;
    }
    
    // Update admin approval if provided
    if (adminApproval !== undefined) {
      adoption.adminApproval = adminApproval;
    }
    
    await adoption.save();
    res.json(adoption);
  } catch (error) {
    console.error('Error updating adoption:', error);
    res.status(500).json({ message: 'Error updating adoption' });
  }
});

// Delete adoption (admin-specific)
router.delete('/adoptions/:id', adminAuth, async (req, res) => {
  try {
    const adoption = await Adoption.findByIdAndDelete(req.params.id);
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }
    res.json({ message: 'Adoption deleted successfully' });
  } catch (error) {
    console.error('Error deleting adoption:', error);
    res.status(500).json({ message: 'Error deleting adoption' });
  }
});

// Get transaction logs
router.get('/transactions', adminAuth, async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = {};
    
    if (start && end) {
      query.createdAt = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }
    
    const transactions = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user activities
router.get('/activities', adminAuth, async (req, res) => {
  try {
    const { start, end } = req.query;
    const query = {};
    
    if (start && end) {
      query.date = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }
    
    const activities = await UserActivity.find(query)
      .populate('user', 'name email')
      .sort({ date: -1 });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload admin avatar
router.post('/upload-avatar', adminAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const admin = await Admin.findById(req.admin._id);
    admin.avatar = `/uploads/${req.file.filename}`;
    await admin.save();
    res.json({ url: admin.avatar });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

// Update admin profile
router.post('/update-profile', adminAuth, async (req, res) => {
  try {
    const { username, email } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (username) admin.username = username;
    if (email) admin.email = email;
    await admin.save();
    res.json({ 
      username: admin.username, 
      email: admin.email, 
      avatar: admin.avatar, 
      role: 'admin' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get pending adoptions for review
router.get('/pending-adoptions', adminAuth, async (req, res) => {
  try {
    const Adoption = require('../models/Adoption');
    const pendingAdoptions = await Adoption.find({ adminApproval: false })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(pendingAdoptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject adoption
router.put('/adoptions/:id/approve', adminAuth, async (req, res) => {
  try {
    console.log('Adoption approval request:', { id: req.params.id, body: req.body, admin: req.admin });
    
    const Adoption = require('../models/Adoption');
    const { approved } = req.body;
    const adoption = await Adoption.findById(req.params.id);
    
    console.log('Found adoption:', adoption);
    
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }
    
    adoption.adminApproval = approved;
    // Use valid status values from the enum: 'available', 'adopted', 'pending'
    adoption.status = approved ? 'available' : 'pending';
    await adoption.save();
    
    console.log('Adoption updated successfully');
    
    res.json(adoption);
  } catch (error) {
    console.error('Error in adoption approval:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Get pending products for review
router.get('/pending-products', adminAuth, async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: 'pending' })
      .populate('seller', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(pendingProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/reject product
router.put('/products/:id/approve', adminAuth, async (req, res) => {
  try {
    console.log('Product approval request:', { id: req.params.id, body: req.body, admin: req.admin });
    
    const { approved } = req.body;
    const product = await Product.findById(req.params.id);
    
    console.log('Found product:', product);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Use valid status values from the enum: 'available', 'sold', 'pending'
    product.status = approved ? 'available' : 'pending';
    await product.save();
    
    console.log('Product updated successfully');
    
    res.json(product);
  } catch (error) {
    console.error('Error in product approval:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    console.log('Product delete request:', { id: req.params.id, admin: req.admin });
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    console.log('Product deleted successfully');
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in product deletion:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Delete adoption
router.delete('/adoptions/:id', adminAuth, async (req, res) => {
  try {
    console.log('Adoption delete request:', { id: req.params.id, admin: req.admin });
    
    const Adoption = require('../models/Adoption');
    const adoption = await Adoption.findById(req.params.id);
    
    if (!adoption) {
      return res.status(404).json({ message: 'Adoption not found' });
    }
    
    await Adoption.findByIdAndDelete(req.params.id);
    console.log('Adoption deleted successfully');
    
    res.json({ message: 'Adoption deleted successfully' });
  } catch (error) {
    console.error('Error in adoption deletion:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// GENERIC ROUTES MUST BE LAST
// Toggle listing visibility
router.put('/:type/:id/visibility', adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'pets' ? Pet : Product;
    const listing = await Model.findById(id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    listing.isVisible = !listing.isVisible;
    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete listing (generic)
router.delete('/:type/:id', adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type === 'pets' ? Pet : Product;
    await Model.findByIdAndDelete(id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 