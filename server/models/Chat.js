const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Generic listing ID (can be Adoption or Product)
  listingType: { type: String, enum: ['adoption', 'marketplace'], required: true }, // Type of listing
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who initiated the chat (for reference)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Owner/seller of the listing (for reference)
  messages: [MessageSchema],
}, { timestamps: true });

// Index for finding chats by listing
ChatSchema.index({ listingId: 1, listingType: 1 });
// Index for finding chats by user (for user's chat history)
ChatSchema.index({ userId: 1 });
ChatSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Chat', ChatSchema); 