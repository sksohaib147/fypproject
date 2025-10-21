import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Stack,
  Button,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { formatPKR } from '../utils/currency';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const HomeMarketplaceModal = ({ open, onClose, pet, user, loading }) => {
  const [showContactInfo, setShowContactInfo] = useState(false);
  const navigate = useNavigate();

  // Check if current user is the pet owner
  const isOwner = user && pet && (
    user._id === pet.owner?._id || 
    user._id === pet.seller?._id ||
    user._id === pet.user?._id
  );

  React.useEffect(() => {
    setShowContactInfo(false);
  }, [pet]);

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Loading...
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <Typography>Loading pet details...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!pet) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Not found
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Pet details not found.</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Enhanced image handling with support for multiple formats
  const getImageUrl = (image) => {
    if (!image) return '/placeholder.svg';
    if (image.startsWith('http')) return image;
    return `http://localhost:5000/uploads/${image}`;
  };

  const images = pet.photos && pet.photos.length > 0 
    ? pet.photos.map(resolveImageUrl)
    : [resolveImageUrl(pet.image)];

  // Enhanced error handling for images
  const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = '/placeholder.svg';
    e.target.onerror = null; // Prevent infinite loop
  };

  const handleContactInfo = () => {
    setShowContactInfo(!showContactInfo);
  };

  const handleChatWithOwner = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/chat/${pet._id || pet.id}/${pet.owner?._id || 'owner'}`);
    onClose();
  };

  const handleViewListing = () => {
    navigate('/pcmarketplace');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 5 }}>
        {pet.name}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {/* Image */}
          <Box sx={{ minWidth: 200, maxWidth: 250, flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '100%', height: 180, mb: 1, borderRadius: 2, overflow: 'hidden', boxShadow: 2, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={images[0]}
                alt={`Pet photo`}
                style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
                crossOrigin="anonymous"
                onError={(e) => handleImageError(e)}
              />
            </Box>
          </Box>
          {/* Pet Details */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} color="error.main" mb={1}>
              {pet.pricePKR !== undefined && pet.pricePKR !== null && pet.pricePKR !== '' ? formatPKR(pet.pricePKR) : ''}
            </Typography>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{pet.description || 'No description provided.'}</Typography>
                         <Typography variant="body2" color="text.secondary" mb={2}>
               <b>Breed:</b> {pet.breed || pet.category || 'Unknown'}
             </Typography>

            {/* Contact Info Alert */}
            {showContactInfo && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Contact Information:</strong><br />
                  Phone: {pet.contact || 'Not provided'}<br />
                  Location: {pet.location || 'Not provided'}
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {isOwner ? (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ fontWeight: 600 }}
                  onClick={() => navigate(`/edit-listing/marketplace/${pet._id || pet.id}`)}
                >
                  Edit Listing
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleContactInfo}
                    sx={{ fontWeight: 600 }}
                  >
                    {showContactInfo ? 'Hide Contact Info' : 'Contact Info'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    onClick={handleChatWithOwner}
                    sx={{ fontWeight: 600 }}
                  >
                    Chat with Owner
                  </Button>
                </>
              )}
              
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleViewListing}
                sx={{ fontWeight: 600 }}
              >
                View Listing
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Back to Listings</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HomeMarketplaceModal;