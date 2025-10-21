const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');

// Get all pets
router.get('/', async (req, res) => {
  try {
    const { type, isAdoption, status, page = 1, limit = 12 } = req.query;
    const query = {};

    if (type) query.type = type;
    if (isAdoption !== undefined) query.isAdoption = isAdoption;
    if (status) query.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Pet.countDocuments(query);
    const pets = await Pet.find(query)
      .populate('seller', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    res.json({ data: pets, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single pet
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate('seller', 'firstName lastName email');
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }
    
    res.json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/pets/random - 4 random pets for sale (not adoption)
router.get('/random', async (req, res) => {
  try {
    const pets = await Pet.aggregate([
      { $match: { isAdoption: false } },
      { $sample: { size: 4 } }
    ]);
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create pet listing
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('type').isIn(['cat', 'dog', 'rabbit']).withMessage('Invalid pet type'),
  body('breed').notEmpty().withMessage('Breed is required'),
  body('age').isNumeric().withMessage('Age must be a number'),
  body('gender').isIn(['male', 'female']).withMessage('Invalid gender'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('description').notEmpty().withMessage('Description is required'),
  body('images').isArray().withMessage('Images must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pet = new Pet({
      ...req.body,
      seller: req.user._id
    });

    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update pet listing
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('type').optional().isIn(['cat', 'dog', 'rabbit']).withMessage('Invalid pet type'),
  body('breed').optional().notEmpty().withMessage('Breed cannot be empty'),
  body('age').optional().isNumeric().withMessage('Age must be a number'),
  body('gender').optional().isIn(['male', 'female']).withMessage('Invalid gender'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('status').optional().isIn(['available', 'sold', 'pending']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check if user is the seller
    if (pet.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedPet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete pet listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check if user is the seller
    if (pet.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pet.remove();
    res.json({ message: 'Pet listing removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 