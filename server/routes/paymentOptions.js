const express = require('express');
const router = express.Router();
const PaymentOption = require('../models/PaymentOption');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get current user's payment option
router.get('/me', auth, async (req, res) => {
  try {
    const paymentOption = await PaymentOption.findOne({ user: req.user._id });
    res.json(paymentOption);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add or update current user's payment option
router.post('/', [
  auth,
  body('cardholder')
    .trim()
    .notEmpty().withMessage('Cardholder name is required')
    .matches(/^[A-Za-z ]+$/).withMessage('Cardholder name must contain only letters and spaces'),
  body('cardNumber')
    .trim()
    .notEmpty().withMessage('Card number is required')
    .matches(/^\d{16}$/).withMessage('Card number must be 16 digits'),
  body('expiry')
    .trim()
    .notEmpty().withMessage('Expiry date is required')
    .matches(/^(0[1-9]|1[0-2])\/(\d{2})$/).withMessage('Expiry must be in MM/YY format')
    .custom((value) => {
      // Check not in the past
      const [mm, yy] = value.split('/');
      const now = new Date();
      const expDate = new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, 1);
      if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
        throw new Error('Expiry date cannot be in the past');
      }
      return true;
    }),
  body('cvv')
    .trim()
    .notEmpty().withMessage('CVV is required')
    .matches(/^\d{3,4}$/).withMessage('CVV must be 3 or 4 digits')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { cardholder, cardNumber, expiry, cvv } = req.body;
    let paymentOption = await PaymentOption.findOne({ user: req.user._id });
    if (paymentOption) {
      // Update
      paymentOption.cardholder = cardholder;
      paymentOption.cardNumber = cardNumber;
      paymentOption.expiry = expiry;
      paymentOption.cvv = cvv;
      await paymentOption.save();
    } else {
      // Create
      paymentOption = new PaymentOption({
        user: req.user._id,
        cardholder,
        cardNumber,
        expiry,
        cvv
      });
      await paymentOption.save();
    }
    res.json(paymentOption);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 