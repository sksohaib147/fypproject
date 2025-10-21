const mongoose = require('mongoose');

const paymentOptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // one payment option per user
  },
  cardholder: {
    type: String,
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  expiry: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('PaymentOption', paymentOptionSchema); 