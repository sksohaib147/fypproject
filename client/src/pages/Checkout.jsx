import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import PaymentForm from '../components/PaymentForm';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel
} from '@mui/material';
import { FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';
import api from '../utils/api';
import { formatPKR } from '../utils/currency';

const steps = ['Shipping Information', 'Payment Method', 'Review & Confirm'];

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const { notify } = useNotification();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  
  const [shippingForm, setShippingForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan'
  });
  
  const [billingForm, setBillingForm] = useState({
    sameAsShipping: true,
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan'
  });
  
  const [paymentMethod, setPaymentMethod] = useState('easypaisa');
  const [saveInfo, setSaveInfo] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  // Calculate totals
  const allCartItems = [...(cart.products || []), ...(cart.pets || [])];
  const subtotal = allCartItems.reduce((sum, item) => sum + ((item.pricePKR || item.price) * (item.quantity || 1)), 0);
  const tax = subtotal * 0.15; // 15% tax
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shipping;

  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleBillingChange = (e) => {
    setBillingForm({ ...billingForm, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate shipping form
      if (!shippingForm.firstName || !shippingForm.lastName || !shippingForm.email || 
          !shippingForm.phone || !shippingForm.address || !shippingForm.city) {
        setError('Please fill in all required fields');
        return;
      }
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      setError('');

      const orderData = {
        products: (cart.products || []).map(item => ({
          productId: item.id || item._id,
          quantity: item.quantity
        })),
        pets: (cart.pets || []).map(item => ({
          petId: item.id || item._id,
          quantity: 1
        })),
        shippingAddress: {
          street: shippingForm.address,
          city: shippingForm.city,
          state: shippingForm.state,
          zipCode: shippingForm.zipCode,
          country: shippingForm.country
        },
        billingAddress: billingForm.sameAsShipping ? {
          street: shippingForm.address,
          city: shippingForm.city,
          state: shippingForm.state,
          zipCode: shippingForm.zipCode,
          country: shippingForm.country
        } : {
          street: billingForm.address,
          city: billingForm.city,
          state: billingForm.state,
          zipCode: billingForm.zipCode,
          country: billingForm.country
        },
        paymentMethod: paymentMethod,
        notes: `Order placed by ${shippingForm.firstName} ${shippingForm.lastName}`
      };
      // Add transactionId for EasyPaisa/JazzCash
      if ((paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && transactionId) {
        orderData.transactionId = transactionId;
      }

      const response = await api.post('/orders', orderData);
      console.log('Order created with ID:', response._id);
      console.log('Order ID type:', typeof response._id);
      console.log('Order ID string:', response._id.toString());
      
      // Ensure we store a clean order ID
      const cleanOrderId = response._id.toString().split(':')[0];
      console.log('Storing clean order ID:', cleanOrderId);
      setOrderId(cleanOrderId);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (order) => {
    try {
      clearCart();
      notify('Purchase successful! Your order has been placed.', 'success');
      navigate('/order-success', { 
        state: { 
          orderId: order._id,
          total: order.totalAmount 
        } 
      });
    } catch (err) {
      setError('Payment successful but there was an issue with the order confirmation');
    }
  };

  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed. Please try again.');
  };

  const renderShippingStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Shipping Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name *"
            name="firstName"
            value={shippingForm.firstName}
            onChange={handleShippingChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name *"
            name="lastName"
            value={shippingForm.lastName}
            onChange={handleShippingChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email *"
            name="email"
            type="email"
            value={shippingForm.email}
            onChange={handleShippingChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone *"
            name="phone"
            value={shippingForm.phone}
            onChange={handleShippingChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address *"
            name="address"
            value={shippingForm.address}
            onChange={handleShippingChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City *"
            name="city"
            value={shippingForm.city}
            onChange={handleShippingChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="State/Province"
            name="state"
            value={shippingForm.state}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="ZIP/Postal Code"
            name="zipCode"
            value={shippingForm.zipCode}
            onChange={handleShippingChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={shippingForm.country}
            onChange={handleShippingChange}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={billingForm.sameAsShipping}
              onChange={(e) => setBillingForm({ ...billingForm, sameAsShipping: e.target.checked })}
            />
          }
          label="Billing address same as shipping address"
        />
      </Box>

      {!billingForm.sameAsShipping && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Billing Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name *"
                name="firstName"
                value={billingForm.firstName}
                onChange={handleBillingChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name *"
                name="lastName"
                value={billingForm.lastName}
                onChange={handleBillingChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address *"
                name="address"
                value={billingForm.address}
                onChange={handleBillingChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City *"
                name="city"
                value={billingForm.city}
                onChange={handleBillingChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                name="state"
                value={billingForm.state}
                onChange={handleBillingChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                name="zipCode"
                value={billingForm.zipCode}
                onChange={handleBillingChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={billingForm.country}
                onChange={handleBillingChange}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderPaymentStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Method
      </Typography>
      
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Select Payment Method</FormLabel>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel
            value="easypaisa"
            control={<Radio />}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>EasyPaisa</span></Box>}
          />
          <FormControlLabel
            value="jazzcash"
            control={<Radio />}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>JazzCash</span></Box>}
          />
          <FormControlLabel
            value="cashondelivery"
            control={<Radio />}
            label="Cash on Delivery"
          />
        </RadioGroup>
      </FormControl>

      {paymentMethod === 'cashondelivery' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You will pay cash when your order is delivered.
        </Alert>
      )}

      {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
        <Alert severity="info" sx={{ mt: 2 }}>
          You will be asked to provide your transaction ID in the next step after making the payment.
        </Alert>
      )}
    </Box>
  );

  const renderReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Order Review
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            {allCartItems.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>
                  {item.name} x {item.quantity || 1}
                </Typography>
                <Typography>
                  {formatPKR((item.pricePKR || item.price) * (item.quantity || 1))}
                </Typography>
              </Box>
            ))}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Shipping Information
            </Typography>
            <Typography>
              {shippingForm.firstName} {shippingForm.lastName}
            </Typography>
            <Typography>{shippingForm.address}</Typography>
            <Typography>{shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}</Typography>
            <Typography>{shippingForm.country}</Typography>
            <Typography>{shippingForm.phone}</Typography>
            <Typography>{shippingForm.email}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>{formatPKR(subtotal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Tax (15%):</Typography>
              <Typography>{formatPKR(tax)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Shipping:</Typography>
              <Typography>{shipping === 0 ? 'Free' : formatPKR(shipping)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">{formatPKR(total)}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Transfer Payment Form for EasyPaisa/JazzCash */}
      {showTransferForm && (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
        <Box sx={{ mt: 4, maxWidth: 400, mx: 'auto' }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Transfer Payment</Typography>
            <TextField
              label="Account Title"
              value="Shahzain Khan"
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Account Number"
              value="03212459858"
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Method"
              value={paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Transaction ID"
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              fullWidth
              margin="normal"
              required
              error={!transactionId && showTransferForm}
              helperText={!transactionId && showTransferForm ? 'Transaction ID is required' : ''}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={!transactionId || loading}
              onClick={async () => {
                try {
                  setLoading(true);
                  console.log('Updating order with ID:', orderId);
                  console.log('Transaction ID:', transactionId);
                  console.log('Full URL:', `/orders/${orderId}`);
                  
                  // Sanitize the order ID to remove any potential corruption
                  const cleanOrderId = orderId.toString().split(':')[0];
                  console.log('Clean order ID:', cleanOrderId);
                  console.log('Clean order ID type:', typeof cleanOrderId);
                  console.log('Clean order ID length:', cleanOrderId.length);
                  
                  // Update the order with the transaction ID
                  console.log('Sending PUT request to:', `/orders/${cleanOrderId}`);
                  console.log('Request payload:', { transactionId });
                  await api.put(`/orders/${cleanOrderId}`, { transactionId });
                  handlePaymentSuccess({ _id: orderId, totalAmount: total });
                } catch (err) {
                  console.error('Error updating transaction ID:', err);
                  setError('Failed to update transaction ID: ' + err.message);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm Order'}
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderShippingStep();
      case 1:
        return renderPaymentStep();
      case 2:
        return renderReviewStep();
      default:
        return 'Unknown step';
    }
  };

  useEffect(() => {
    if (activeStep === 1 && !orderId) {
      createOrder().catch(console.error);
    }
  }, [activeStep]);

  if (allCartItems.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Button variant="contained" onClick={() => navigate('/pcmarketplace')}>
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        {getStepContent(activeStep)}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        
        <Box>
          {activeStep === steps.length - 1 ? (
            paymentMethod === 'cashondelivery' ? (
              <Button
                variant="contained"
                onClick={handlePaymentSuccess}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Place Order'}
              </Button>
            ) : (
              !showTransferForm ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowTransferForm(true)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Transfer Payment'}
                </Button>
              ) : null
            )
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Checkout; 