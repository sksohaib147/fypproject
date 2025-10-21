const mongoose = require('mongoose');

const AdoptionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  species: { type: String, required: true, enum: ['dog', 'cat', 'rabbit'] },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['male', 'female'] },
  size: { type: String, required: true, enum: ['Small', 'Medium', 'Large'] },
  description: { type: String, required: true },
  photos: [{ type: String, required: true }],
  location: { type: String, required: true },
  status: { type: String, enum: ['available', 'adopted', 'pending'], default: 'available' },
  tags: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminApproval: { type: Boolean, default: false },
}, { timestamps: true });

// Add indexes for better query performance
AdoptionSchema.index({ owner: 1 }); // For populate queries
AdoptionSchema.index({ status: 1 }); // For status filtering
AdoptionSchema.index({ createdAt: -1 }); // For sorting by creation date
AdoptionSchema.index({ species: 1, breed: 1 }); // For species/breed filtering

module.exports = mongoose.model('Adoption', AdoptionSchema); 