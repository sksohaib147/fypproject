import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => (
  <Box sx={{ bgcolor: 'background.paper', color: 'text.primary', mt: 6, pt: 6, pb: 2, transition: 'background-color 0.3s' }}>
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, mb: 2 }}>
        <Typography variant="body2">
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
        </Typography>
        <Typography variant="body2">
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Use</a>
        </Typography>
        <Typography variant="body2">
          <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link>
        </Typography>
      </Box>
      <Divider sx={{ bgcolor: 'divider', my: 3 }} />
      <Typography variant="body2" color="text.secondary" align="center">
        © Copyright Paws and Claws 2024. All rights reserved.
      </Typography>
    </Container>
  </Box>
);

export default Footer; 