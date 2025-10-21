const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const isAuthenticated = require('../middleware/auth');

// GET chat history - unified chat room based on listing
router.get('/:listingType/:listingId/:userId/:ownerId', async (req, res) => {
  try {
    const { listingType, listingId, userId, ownerId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    
    // Validate listing type
    if (!['adoption', 'marketplace'].includes(listingType)) {
      return res.status(400).json({ error: 'Invalid listing type' });
    }
    
    // Find chat by listing (not by user-owner combination)
    let chat = await Chat.findOne({ 
      listingId, 
      listingType 
    }).populate('messages.from', 'name');
    
    if (!chat) {
      return res.json({ messages: [], total: 0, page: Number(page), limit: Number(limit) });
    }
    
    // Paginate messages (most recent first)
    const total = chat.messages.length;
    const start = total - Number(page) * Number(limit) < 0 ? 0 : total - Number(page) * Number(limit);
    const end = total - (Number(page) - 1) * Number(limit);
    const paginatedMessages = chat.messages.slice(start, end);
    res.json({ messages: paginatedMessages, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Chat history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST send message - unified chat room
router.post('/:listingType/:listingId/:userId/:ownerId', isAuthenticated, async (req, res) => {
  try {
    const { listingType, listingId, userId, ownerId } = req.params;
    const { type = 'text', content } = req.body;
    
    // Validate listing type
    if (!['adoption', 'marketplace'].includes(listingType)) {
      return res.status(400).json({ error: 'Invalid listing type' });
    }
    
    if (!content) return res.status(400).json({ error: 'Message content required' });
    
    // Find or create chat by listing (not by user-owner combination)
    let chat = await Chat.findOne({ listingId, listingType });
    if (!chat) {
      chat = new Chat({ 
        listingId, 
        listingType, 
        userId, 
        ownerId, 
        messages: [] 
      });
    }
    
    // Add message with sender info
    chat.messages.push({ 
      from: req.user._id, 
      type, 
      content,
      timestamp: new Date()
    });
    
    await chat.save();
    res.status(201).json({ message: 'Message sent', chat });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 