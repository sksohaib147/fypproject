const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');

// Add a review (product or pet)
router.post('/', auth, async (req, res) => {
  try {
    const { product, pet, rating, comment } = req.body;
    if (!product && !pet) {
      return res.status(400).json({ message: 'Product or Pet ID required' });
    }
    const review = new Review({
      user: req.user._id,
      product,
      pet,
      rating,
      comment
    });
    await review.save();

    // Update average rating/count for product or pet
    if (product) {
      const reviews = await Review.find({ product });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(product, {
        'ratings.average': avg,
        'ratings.count': reviews.length
      });
    }
    if (pet) {
      const reviews = await Review.find({ pet });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Pet.findByIdAndUpdate(pet, {
        'ratings.average': avg,
        'ratings.count': reviews.length
      });
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'firstName lastName');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Get reviews for a pet
router.get('/pet/:petId', async (req, res) => {
  try {
    const reviews = await Review.find({ pet: req.params.petId })
      .populate('user', 'firstName lastName');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Delete a review (user or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await review.remove();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router; 