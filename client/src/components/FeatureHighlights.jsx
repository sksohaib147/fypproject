import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalShipping, SupportAgent, Pets } from '@mui/icons-material';

const FeatureHighlights = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, py: 4, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary', transition: 'background-color 0.3s' }}>
    <Box sx={{ textAlign: 'center', px: 3 }}>
      <LocalShipping sx={{ fontSize: 40, mb: 1 }} />
      <Typography fontWeight={700}>FREE AND FAST DELIVERY</Typography>
      <Typography variant="body2" color="text.secondary">Free delivery for all orders over $100</Typography>
    </Box>
    <Box sx={{ textAlign: 'center', px: 3 }}>
      <SupportAgent sx={{ fontSize: 40, mb: 1 }} />
      <Typography fontWeight={700}>CUSTOMER SERVICE</Typography>
      <Typography variant="body2" color="text.secondary">24/7 friendly customer support</Typography>
    </Box>
    <Box sx={{ textAlign: 'center', px: 3 }}>
      <Pets sx={{ fontSize: 40, mb: 1 }} />
      <Typography fontWeight={700}>Vaccinated Pets</Typography>
      <Typography variant="body2" color="text.secondary">All pets are vaccinated and healthy</Typography>
    </Box>
  </Box>
);

export default FeatureHighlights; 