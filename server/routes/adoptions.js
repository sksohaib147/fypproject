const express = require('express');
const router = express.Router();
const Adoption = require('../models/Adoption');
const isAuthenticated = require('../middleware/auth');
const UserActivity = require('../models/UserActivity');
// const multer = require('multer'); // For real photo uploads

// GET /api/adoptions - list/filter
router.get('/', async (req, res) => {
  try {
    const { species, breed, ageMin, ageMax, size, gender, location, status, sort, page = 1, limit = 12, userCreated } = req.query;
    const filter = { adminApproval: true };
    if (species) filter.species = species;
    if (breed) filter.breed = breed;
    if (size) filter.size = size;
    if (gender) filter.gender = gender;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (ageMin || ageMax) filter.age = {};
    if (ageMin) filter.age.$gte = Number(ageMin);
    if (ageMax) filter.age.$lte = Number(ageMax);

    // Filter for user-created adoptions only (exclude admin adoptions)
    if (userCreated === 'true') {
      // Get system admin user ID
      const User = require('../models/User');
      const systemUser = await User.findOne({ email: 'admin@system.local' });
      if (systemUser) {
        filter.owner = { $ne: systemUser._id };
      }
    }

    let query = Adoption.find(filter).populate('owner', 'name email');
    if (sort === 'oldest') query = query.sort({ createdAt: 1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else if (sort === 'featured') query = query.sort({ tags: -1 });
    // TODO: sort by distance if location is available

    const total = await Adoption.countDocuments(filter);
    const pets = await query.skip((page - 1) * limit).limit(Number(limit));
    // Ensure all needed fields are present and handle missing/optional fields
    const mappedPets = pets.map(pet => ({
      ...pet.toObject(),
      image: (pet.photos && pet.photos[0]) || pet.image || '/placeholder.jpg',
      title: pet.title || 'Untitled',
      breed: pet.breed || 'Unknown',
      location: pet.location || 'Unknown',
      tags: pet.tags || [],
    }));
    res.json({ pets: mappedPets, total });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/adoptions/:id - details
router.get('/:id', async (req, res) => {
  try {
    const pet = await Adoption.findById(req.params.id).populate('owner', 'name email');
    if (!pet) return res.status(404).json({ error: 'Not found' });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/adoptions/random - 4 random pets for adoption (admin approved)
router.get('/random', async (req, res) => {
  try {
    const pets = await Adoption.aggregate([
      { $match: { adminApproval: true } },
      { $sample: { size: 4 } }
    ]);
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/adoptions - create (auth required, pending admin approval)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // For now, expect photos as array of URLs in req.body.photos
    const { title, species, breed, age, gender, size, description, photos, location, tags } = req.body;
    if (!title || !species || !breed || !age || !gender || !size || !description || !photos || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const pet = new Adoption({
      title,
      species,
      breed,
      age,
      gender,
      size,
      description,
      photos,
      location,
      tags,
      owner: req.user._id,
      adminApproval: false,
      status: 'pending',
    });
    await pet.save();
    // Log user activity
    await UserActivity.create({
      user: req.user._id,
      action: 'Posted adoption listing',
      details: { method: req.method, path: req.path, body: req.body }
    });
    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/adoptions/:id - admin can approve/reject
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    // Only admin can approve/reject
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update adoption status' });
    }
    const { status, adminApproval } = req.body;
    const adoption = await Adoption.findById(req.params.id);
    if (!adoption) return res.status(404).json({ error: 'Not found' });
    if (status) adoption.status = status;
    if (adminApproval !== undefined) adoption.adminApproval = adminApproval;
    await adoption.save();
    // Log admin activity
    await UserActivity.create({
      user: req.user._id,
      action: `Admin updated adoption status to ${status}`,
      details: { method: req.method, path: req.path, adoptionId: req.params.id, status, adminApproval }
    });
    res.json(adoption);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 