import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
  Avatar,
  Divider,
  MobileStepper,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useNavigate } from 'react-router-dom';
import { formatPKR } from '../utils/currency';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const HomeAdoptionModal = ({ open, onClose, pet, user, loading }) => {
  const [activeImg, setActiveImg] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setActiveImg(0);
    setShowContactInfo(false);
  }, [pet]);

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading pet details...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!pet) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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

  const handleNext = () => setActiveImg((prev) => (prev + 1) % images.length);
  const handleBack = () => setActiveImg((prev) => (prev - 1 + images.length) % images.length);

  // Check if current user is the pet owner
  const isOwner = user && pet && (
    user._id === pet.owner?._id || 
    user._id === pet.user?._id
  );

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
    navigate('/adoption');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 5 }}>
        {pet.title || pet.name}
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
                src={images[activeImg]}
                alt={`Pet photo ${activeImg + 1}`}
                style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
                crossOrigin="anonymous"
                onError={(e) => handleImageError(e)}
              />
            </Box>
            {images.length > 1 && (
              <MobileStepper
                steps={images.length}
                position="static"
                activeStep={activeImg}
                nextButton={
                  <Button size="small" onClick={handleNext} disabled={images.length <= 1}>
                    Next
                    <KeyboardArrowRight />
                  </Button>
                }
                backButton={
                  <Button size="small" onClick={handleBack} disabled={images.length <= 1}>
                    <KeyboardArrowLeft />
                    Back
                  </Button>
                }
                sx={{ bgcolor: 'transparent', width: '100%', justifyContent: 'center', mt: 1 }}
              />
            )}
          </Box>
          {/* Pet Details */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} color="error.main" mb={1}>
              {pet.pricePKR !== undefined && pet.pricePKR !== null && pet.pricePKR !== '' ? formatPKR(pet.pricePKR) : ''}
            </Typography>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{pet.description || 'No description provided.'}</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              <b>Breed:</b> {pet.breed || 'Unknown'}
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
                  onClick={() => navigate(`/edit-listing/adoption/${pet._id || pet.id}`)}
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

export default HomeAdoptionModal;