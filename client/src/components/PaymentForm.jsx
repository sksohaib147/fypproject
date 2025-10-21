import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your-publishable-key');

const PaymentFormContent = ({ amount, orderId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await api.post('/payments/create-payment-intent', {
          amount: amount,
          orderId: orderId
        });
        setClientSecret(response.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
        onError && onError(err);
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, orderId, onError]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          },
        }
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
        onError && onError(stripeError);
      } else if (paymentIntent.status === 'succeeded') {
        // Process the payment on our backend
        const response = await api.post('/payments/process-payment', {
          paymentIntentId: paymentIntent.id,
          orderId: orderId
        });

        if (response.success) {
          onSuccess && onSuccess(response.order);
        } else {
          setError('Payment processed but order update failed. Please contact support.');
          onError && onError(new Error('Order update failed'));
        }
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      onError && onError(err);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (loading && !clientSecret) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total Amount: ${amount.toFixed(2)}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Card Information
          </Typography>
          <CardElement options={cardElementOptions} />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!stripe || loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
      </form>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
        Your payment is secured by Stripe. We never store your card details.
      </Typography>
    </Paper>
  );
};

const PaymentForm = ({ amount, orderId, onSuccess, onError }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent
        amount={amount}
        orderId={orderId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default PaymentForm; 