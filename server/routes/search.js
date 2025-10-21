const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Pet = require('../models/Pet');

// Advanced search endpoint
router.get('/advanced', async (req, res) => {
  try {
    const {
      type = 'all',
      searchTerm,
      category,
      minPrice,
      maxPrice,
      location,
      condition,
      sortBy = 'newest'
    } = req.query;

    // Build query object
    const query = {};

    // Add search term if provided
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add price range filter (using PKR)
    if (minPrice || maxPrice) {
      query.pricePKR = {};
      if (minPrice) query.pricePKR.$gte = Number(minPrice);
      if (maxPrice) query.pricePKR.$lte = Number(maxPrice);
    }

    // Add location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Add condition filter
    if (condition) {
      query.condition = condition;
    }

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'price_asc':
        sort = { pricePKR: 1 };
        break;
      case 'price_desc':
        sort = { pricePKR: -1 };
        break;
      case 'rating':
        sort = { 'ratings.average': -1 };
        break;
      default: // newest
        sort = { createdAt: -1 };
    }

    // Execute search based on type
    let results = [];
    if (type === 'all' || type === 'products') {
      const products = await Product.find(query)
        .sort(sort)
        .populate('seller', 'firstName lastName email')
        .limit(50);
      results = results.concat(products);
    }

    if (type === 'all' || type === 'pets') {
      const pets = await Pet.find(query)
        .sort(sort)
        .populate('seller', 'firstName lastName email')
        .limit(50);
      results = results.concat(pets);
    }

    // Sort combined results if needed
    if (type === 'all') {
      results.sort((a, b) => {
        if (sortBy === 'price_asc') return a.pricePKR - b.pricePKR;
        if (sortBy === 'price_desc') return b.pricePKR - a.pricePKR;
        if (sortBy === 'rating') return b.ratings.average - a.ratings.average;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing search',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 