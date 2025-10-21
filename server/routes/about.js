const express = require('express');
const router = express.Router();
const About = require('../models/About');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminAuth');

// Get about page content
router.get('/', async (req, res) => {
  try {
    const about = await About.findOne().sort({ lastUpdated: -1 });
    if (!about) {
      return res.status(404).json({ message: 'About page content not found' });
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update about page content (admin only)
router.put('/', [auth, admin], async (req, res) => {
  try {
    const about = await About.findOne().sort({ lastUpdated: -1 });
    if (!about) {
      // Create new about content if none exists
      const newAbout = new About(req.body);
      await newAbout.save();
      return res.status(201).json(newAbout);
    }

    // Update existing content
    Object.assign(about, req.body);
    about.lastUpdated = Date.now();
    await about.save();
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 