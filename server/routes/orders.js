const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');
const emailService = require('../utils/email');
const UserActivity = require('../models/UserActivity');

// Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    let orders, total;
    
    if (req.user.role === 'admin') {
      // Admin can see all orders
      total = await Order.countDocuments();
      orders = await Order.find()
        .populate('user', 'firstName lastName email phone address')
        .populate('products.product', 'name images pricePKR')
        .populate('pets.pet', 'name type breed images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    } else {
      // Regular users can only see their own orders
      total = await Order.countDocuments({ user: req.user._id });
      orders = await Order.find({ user: req.user._id })
        .populate('products.product', 'name images pricePKR')
        .populate('pets.pet', 'name type breed images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));
    }
    
    res.json({ data: orders, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone address')
      .populate('products.product', 'name images pricePKR description')
      .populate('pets.pet', 'name type breed images description');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { products, pets, shippingAddress, billingAddress, notes, paymentMethod, transactionId } = req.body;
    
    if ((!products || products.length === 0) && (!pets || pets.length === 0)) {
      return res.status(400).json({ message: 'Order must contain at least one product or pet' });
    }
    
    let orderItems = [];
    let totalAmount = 0;
    
    // Process products
    if (products && products.length > 0) {
      for (const item of products) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }
        
        const itemTotal = product.pricePKR * item.quantity;
        totalAmount += itemTotal;
        
        orderItems.push({
          product: item.productId,
          quantity: item.quantity,
          price: product.pricePKR,
          total: itemTotal
        });
        
        // Update product stock
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }
    }
    
    // Process pets
    if (pets && pets.length > 0) {
      for (const item of pets) {
        const pet = await Pet.findById(item.petId);
        if (!pet) {
          return res.status(404).json({ message: `Pet ${item.petId} not found` });
        }
        
        if (pet.status !== 'available') {
          return res.status(400).json({ message: `Pet ${pet.name} is not available` });
        }
        
        totalAmount += pet.price;
        
        orderItems.push({
          pet: item.petId,
          price: pet.price
        });
        
        // Update pet status
        await Pet.findByIdAndUpdate(item.petId, { status: 'pending' });
      }
    }
    
    // Calculate tax and shipping (simplified calculation)
    const tax = totalAmount * 0.15; // 15% tax
    const shipping = totalAmount > 100 ? 0 : 10; // Free shipping over $100
    const finalTotal = totalAmount + tax + shipping;
    
    const order = new Order({
      user: req.user._id,
      products: products ? orderItems.filter(item => item.product) : [],
      pets: pets ? orderItems.filter(item => item.pet) : [],
      subtotal: totalAmount,
      tax: tax,
      shipping: shipping,
      totalAmount: finalTotal,
      shippingAddress: shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes: notes,
              paymentMethod: paymentMethod || 'easypaisa',
      transactionId: transactionId
    });
    
    await order.save();
    
    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(order, req.user);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
    }
    
    // Log user activity
    await UserActivity.create({
      user: req.user._id,
      action: 'Placed order',
      details: { method: req.method, path: req.path, orderId: order._id }
    });
    
    console.log('Server: Order created with ID:', order._id);
    console.log('Server: Order ID type:', typeof order._id);
    console.log('Server: Order ID string:', order._id.toString());
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

// Update order status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update order status' });
    }
    
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update status and add timestamp
    const updateData = { status };
    
    switch (status) {
      case 'shipped':
        updateData.shippedAt = new Date();
        updateData.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        break;
      case 'refunded':
        updateData.refundedAt = new Date();
        break;
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'firstName lastName email');
    
    // Log admin activity
    await UserActivity.create({
      user: req.user._id,
      action: `Admin updated order status to ${status}`,
      details: { method: req.method, path: req.path, orderId: req.params.id, status }
    });
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Update order transaction ID
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Server: PUT request received for order ID:', req.params.id);
    console.log('Server: Request params:', req.params);
    console.log('Server: Request body:', req.body);
    console.log('Server: Request method:', req.method);
    console.log('Server: Request path:', req.path);
    console.log('Server: Request URL:', req.url);
    
    const { transactionId } = req.body;
    
    if (!transactionId) {
      console.log('Server: Transaction ID is missing');
      return res.status(400).json({ message: 'Transaction ID is required' });
    }
    
    console.log('Server: Looking for order with ID:', req.params.id);
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      console.log('Server: Order not found with ID:', req.params.id);
      console.log('Server: Checking if ID is valid ObjectId format...');
      
      // Check if the ID is a valid ObjectId format
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        console.log('Server: Invalid ObjectId format:', req.params.id);
        return res.status(400).json({ message: 'Invalid order ID format' });
      }
      
      // Try to find any orders to see if the database is accessible
      const totalOrders = await Order.countDocuments();
      console.log('Server: Total orders in database:', totalOrders);
      
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('Server: Order found:', order._id);
    
    // Check if user is authorized to update this order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      console.log('Server: User not authorized to update this order');
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    console.log('Server: Updating order with transaction ID:', transactionId);
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { transactionId },
      { new: true }
    ).populate('user', 'firstName lastName email');
    
    console.log('Server: Order updated successfully:', updatedOrder._id);
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order transaction ID:', error);
    res.status(500).json({ message: 'Error updating order transaction ID' });
  }
});

// Cancel order
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to cancel this order
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled in its current status' });
    }
    
    // Restore product stock
    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }
    
    // Restore pet availability
    if (order.pets && order.pets.length > 0) {
      for (const item of order.pets) {
        await Pet.findByIdAndUpdate(item.pet, { status: 'available' });
      }
    }
    
    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        cancelledAt: new Date()
      },
      { new: true }
    );
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Error cancelling order' });
  }
});

// Get order statistics (admin only) - moved to end to avoid route conflicts
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view order statistics' });
    }
    
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);
    
    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const monthlyStats = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      overview: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
      statusBreakdown: statusStats,
      monthlyTrends: monthlyStats
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({ message: 'Error fetching order statistics' });
  }
});

module.exports = router; 