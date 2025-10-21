const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Pet = require('../models/Pet');
const adminAuth = require('../middleware/adminAuth');

// User signups over time (last 30 days)
router.get('/signups', adminAuth, async (req, res) => {
  try {
    const days = 30;
    const data = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching signups', error: error.message });
  }
});

// Orders/sales over time (last 30 days)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const days = 30;
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// Top products (by sales count)
router.get('/top-products', adminAuth, async (req, res) => {
  try {
    const data = await Product.find().sort({ 'ratings.count': -1 }).limit(10);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top products', error: error.message });
  }
});

// Top pets (by sales count)
router.get('/top-pets', adminAuth, async (req, res) => {
  try {
    const data = await Pet.find().sort({ 'ratings.count': -1 }).limit(10);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top pets', error: error.message });
  }
});

// Revenue stats (total revenue, average order value)
router.get('/revenue', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgOrder = orders.length ? totalRevenue / orders.length : 0;
    res.json({ totalRevenue, avgOrder, orderCount: orders.length });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching revenue', error: error.message });
  }
});

module.exports = router; 