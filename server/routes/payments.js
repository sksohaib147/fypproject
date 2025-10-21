const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const emailService = require('../utils/email');

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        orderId: orderId,
        userId: req.user._id.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Error creating payment intent' });
  }
});

// Process payment
router.post('/process-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId || !orderId) {
      return res.status(400).json({ message: 'Payment intent ID and order ID are required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          status: 'paid',
          paymentIntentId: paymentIntentId,
          paidAt: new Date()
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Send confirmation email
      try {
        await emailService.sendOrderConfirmation(order, req.user);
      } catch (emailError) {
        console.error('Error sending order confirmation email:', emailError);
        // Don't fail the payment if email fails
      }

      res.json({
        success: true,
        message: 'Payment processed successfully',
        order: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
});

// Get payment methods for user
router.get('/payment-methods', auth, async (req, res) => {
  try {
    // In a real application, you would store customer IDs in your user model
    // For now, we'll return an empty array
    res.json({ paymentMethods: [] });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Error fetching payment methods' });
  }
});

// Refund payment
router.post('/refund', auth, async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: 'Payment intent ID is required' });
    }

    const refundParams = {
      payment_intent: paymentIntentId
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    if (reason) {
      refundParams.reason = reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    // Update order status
    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntentId },
      {
        status: 'refunded',
        refundedAt: new Date(),
        refundId: refund.id
      }
    );

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: refund
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ message: 'Error processing refund' });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update order status
      await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { status: 'paid', paidAt: new Date() }
      );
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update order status
      await Order.findOneAndUpdate(
        { paymentIntentId: failedPayment.id },
        { status: 'failed' }
      );
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      console.log('Refund processed:', refund.id);
      
      // Update order status
      await Order.findOneAndUpdate(
        { paymentIntentId: refund.payment_intent },
        { status: 'refunded', refundedAt: new Date() }
      );
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router; 