import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { formatPKR } from '../utils/currency';
import { getImageUrl } from '../utils/api';
import { Box, Typography, Button, useTheme, Card, CardContent, CardMedia, IconButton, Grid, Divider } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemCount,
    isCartEmpty,
    validateCart
  } = useCart();
  
  const [validationErrors, setValidationErrors] = useState([]);
  const theme = useTheme();
  const { notify } = useNotification();

  const handleQuantityChange = (itemId, newQuantity, type) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity, type);
    }
  };

  const handleRemoveItem = (itemId, type) => {
    removeFromCart(itemId, type);
    notify('Item removed from cart', 'info');
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    const errors = validateCart();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    navigate('/checkout');
  };

  const handleClearCart = () => {
    clearCart();
    setValidationErrors([]);
    notify('Cart cleared', 'info');
  };

  // Helper function to format price based on item type
  const formatItemPrice = (item) => {
    return formatPKR(item.pricePKR || item.price);
  };

  if (isCartEmpty()) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8, color: 'text.primary', transition: 'background 0.3s, color 0.3s' }}>
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: { xs: 4, sm: 8 }, textAlign: 'center' }}>
            <div style={{ fontSize: 64, color: theme.palette.text.disabled, marginBottom: 16 }}>🛒</div>
            <Typography variant="h5" fontWeight={600} mb={1}>
              Your cart is empty
            </Typography>
            <Typography color="text.secondary" mb={4}>
              Looks like you haven't added any items to your cart yet.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/dog-food')}
                sx={{ fontWeight: 600, borderRadius: 2 }}
              >
                Browse Pet Accessories
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const subtotal = getCartTotal();
  const tax = subtotal * 0.15;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2 }}>
        <Typography variant="h4" fontWeight={700} mb={2} color="text.primary">Shopping Cart</Typography>
        <Typography color="text.secondary" mb={4}>{getCartItemCount()} items in your cart</Typography>
        {validationErrors.length > 0 && (
          <Box sx={{ bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.main', borderRadius: 2, p: 2, mb: 4 }}>
            <Typography fontWeight={600} color="warning.dark" mb={1}>Some items in your cart have issues:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index} style={{ color: theme.palette.warning.dark }}>{error}</li>
              ))}
            </ul>
          </Box>
        )}
        <Grid container spacing={4} alignItems="flex-start">
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>Cart Items</Typography>
                <Divider sx={{ mb: 2 }} />
                {cart.products.length > 0 ? (
                  <Grid container direction="column" spacing={3}>
                    {cart.products.map(item => (
                      <Grid item key={item._id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                          <CardMedia
                            component="img"
                            image={getImageUrl(item.images?.[0])}
                            alt={item.name}
                            sx={{ width: 90, height: 90, borderRadius: 2, objectFit: 'cover', bgcolor: 'grey.100', boxShadow: 1 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={600} fontSize={18} color="text.primary" mb={0.5}>{item.name}</Typography>
                            <Typography color="text.secondary" fontSize={14} mb={1}>{item.description?.substring(0, 80)}...</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Box sx={{ bgcolor: 'primary.light', color: 'primary.main', px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600 }}>Product</Box>
                            </Box>
                            <Typography fontWeight={700} color="primary.main" fontSize={18}>{formatItemPrice(item)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton onClick={() => handleQuantityChange(item._id, item.quantity - 1, 'product')} disabled={item.quantity <= 1}>
                                <RemoveCircleOutlineIcon />
                              </IconButton>
                              <Typography fontWeight={600} minWidth={24} textAlign="center">{item.quantity}</Typography>
                              <IconButton onClick={() => handleQuantityChange(item._id, item.quantity + 1, 'product')} disabled={item.quantity >= (item.stock || 999)}>
                                <AddCircleOutlineIcon />
                              </IconButton>
                            </Box>
                            <IconButton color="error" onClick={() => handleRemoveItem(item._id, 'product')}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : null}
                {cart.pets.length > 0 && (
                  <Box mt={cart.products.length > 0 ? 4 : 0}>
                    <Typography fontWeight={600} mb={2}>Pets ({cart.pets.length})</Typography>
                    <Grid container direction="column" spacing={3}>
                      {cart.pets.map(item => (
                        <Grid item key={item._id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <CardMedia
                              component="img"
                              image={getImageUrl(item.images?.[0])}
                              alt={item.name}
                              sx={{ width: 90, height: 90, borderRadius: 2, objectFit: 'cover', bgcolor: 'grey.100', boxShadow: 1 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography fontWeight={600} fontSize={18} color="text.primary" mb={0.5}>{item.name}</Typography>
                              <Typography color="text.secondary" fontSize={14} mb={1}>{item.description?.substring(0, 80)}...</Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box sx={{ bgcolor: 'secondary.light', color: 'secondary.main', px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600 }}>Pet</Box>
                              </Box>
                              <Typography fontWeight={700} color="primary.main" fontSize={18}>{formatItemPrice(item)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                              <IconButton color="error" onClick={() => handleRemoveItem(item._id, 'pet')}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                {cart.products.length === 0 && cart.pets.length === 0 && (
                  <Typography color="text.secondary" align="center" py={6}>No items in your cart.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 3, p: 3, position: 'sticky', top: 32 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={3}>Order Summary</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Subtotal:</Typography>
                  <Typography fontWeight={600}>{formatPKR(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Tax (15%):</Typography>
                  <Typography fontWeight={600}>{formatPKR(tax)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary">Shipping:</Typography>
                  <Typography fontWeight={600}>{shipping === 0 ? 'Free' : formatPKR(shipping)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary.main">{formatPKR(total)}</Typography>
                </Box>
                {shipping > 0 && (
                  <Box sx={{ bgcolor: 'primary.light', color: 'primary.dark', borderRadius: 2, p: 2, mb: 2, textAlign: 'center' }}>
                    <Typography fontSize={14} fontWeight={500}>
                      Add {formatPKR(100 - subtotal)} more for free shipping!
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{ fontWeight: 700, borderRadius: 2, mb: 2 }}
                  onClick={handleCheckout}
                  disabled={validationErrors.length > 0}
                >
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ borderRadius: 2 }}
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Cart; 