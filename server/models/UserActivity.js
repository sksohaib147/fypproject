const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  details: {
    method: String,
    path: String,
    body: mongoose.Schema.Types.Mixed,
    query: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('UserActivity', userActivitySchema); 