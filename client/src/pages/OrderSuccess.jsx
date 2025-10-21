import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { Box, Paper, Typography, Button, useTheme } from '@mui/material';

const OrderSuccess = () => {
  const theme = useTheme();
  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', color: 'text.primary', py: 6 }}>
      <Paper elevation={3} sx={{ maxWidth: 420, width: '100%', mx: 'auto', p: 5, borderRadius: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
        <FaCheckCircle style={{ color: theme.palette.success.main, fontSize: 56, marginBottom: 16 }} />
        <Typography variant="h4" fontWeight={700} mb={1} color="success.main">
          Order Placed Successfully!
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Thank you for your purchase. Your order is being processed and you will receive an email confirmation soon.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            component={Link}
            to="/profile"
            variant="contained"
            color="primary"
            size="large"
            sx={{ fontWeight: 600, borderRadius: 2 }}
            fullWidth
          >
            View My Orders
          </Button>
          <Button
            component={Link}
            to="/dog-food"
            variant="outlined"
            color="primary"
            size="large"
            sx={{ fontWeight: 600, borderRadius: 2 }}
            fullWidth
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderSuccess; 