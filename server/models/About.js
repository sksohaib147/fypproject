const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  hero: {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true }
  },
  mission: {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  vision: {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  features: [{
    icon: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  statistics: {
    petsAdopted: { type: Number, required: true },
    happyCustomers: { type: Number, required: true },
    productsSold: { type: Number, required: true }
  },
  contact: {
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('About', aboutSchema); 