import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import api from '../utils/api';
import MarketplaceListingForm from '../components/MarketplaceListingForm';
import AdoptionListingForm from '../components/adoption/AdoptionListingForm';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Paper,
} from '@mui/material';

const EditListing = () => {
  const { listingType, listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useNotification();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchListing = async () => {
      try {
        setLoading(true);
        let response;
        
        if (listingType === 'adoption') {
          response = await api.get(`/adoptions/${listingId}`);
        } else if (listingType === 'marketplace') {
          response = await api.get(`/products/${listingId}`);
        } else {
          setError('Invalid listing type');
          return;
        }

        // Check if user owns this listing
        const listingData = response.data || response;
        const isOwner = user._id === listingData.owner?._id || 
                       user._id === listingData.seller?._id || 
                       user._id === listingData.user?._id;

        if (!isOwner) {
          setError('You do not have permission to edit this listing');
          return;
        }

        setListing(listingData);
        setFormOpen(true);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, listingType, user, navigate]);

  const handleSubmit = async (formData) => {
    try {
      if (listingType === 'adoption') {
        await api.put(`/adoptions/${listingId}`, formData);
        notify('Adoption listing updated successfully!', 'success');
      } else if (listingType === 'marketplace') {
        await api.put(`/products/${listingId}`, formData);
        notify('Marketplace listing updated successfully!', 'success');
      }
      
      setFormOpen(false);
      navigate(listingType === 'adoption' ? '/adoption' : '/pcmarketplace');
    } catch (err) {
      console.error('Error updating listing:', err);
      notify('Failed to update listing', 'error');
    }
  };

  const handleClose = () => {
    setFormOpen(false);
    navigate(listingType === 'adoption' ? '/adoption' : '/pcmarketplace');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (!listing) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Listing not found
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit {listingType === 'adoption' ? 'Adoption' : 'Marketplace'} Listing
      </Typography>
      
      {listingType === 'adoption' ? (
        <AdoptionListingForm
          open={formOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
          initialData={listing}
        />
      ) : (
        <MarketplaceListingForm
          open={formOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
          initialData={listing}
        />
      )}
    </Container>
  );
};

export default EditListing; 