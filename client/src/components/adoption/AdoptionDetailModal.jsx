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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useNavigate } from 'react-router-dom';
import { formatPKR } from '../../utils/currency';
import { resolveImageUrl, handleImageError } from '../../utils/imageUtils';
import { useAuth } from '../../contexts/AuthContext';

const AdoptionDetailModal = ({ open, onClose, pet, user, loading, onEditListing }) => {
  const [activeImg, setActiveImg] = useState(0);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Check if current user is the pet owner
  const isOwner = currentUser && pet && (
    currentUser._id === pet.owner?._id || 
    currentUser._id === pet.user?._id
  );

  React.useEffect(() => {
    setActiveImg(0);
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

  // Enhanced error handling for images
  const handleImageError = (e) => {
    console.warn('Image failed to load:', e.target.src);
    e.target.src = '/placeholder.svg';
    e.target.onerror = null; // Prevent infinite loop
  };

  const handleContactInfo = () => {
    // Placeholder for contact info logic
    alert('Contact info hidden for this pet.');
  };

  const handleChatWithOwner = () => {
    navigate(`/chat/adoption/${pet.id || pet._id}/${pet.owner?._id || 'owner'}`);
  };

  const handleViewListing = () => {
    navigate(`/adoption-listing/${pet.id || pet._id}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Image Carousel */}
          <Box sx={{ minWidth: 280, maxWidth: 340, flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ width: '100%', height: 260, mb: 1, borderRadius: 2, overflow: 'hidden', boxShadow: 2, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {pet.tags && pet.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  color={tag === 'Featured' ? 'primary' : tag === 'Older' ? 'warning' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>
          {/* Pet Details */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} color="error.main" mb={2}>
              {pet.pricePKR !== undefined && pet.pricePKR !== null && pet.pricePKR !== '' ? formatPKR(pet.pricePKR) : ''}
            </Typography>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{pet.description || 'No description provided.'}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              <Typography><b>Species:</b> {pet.species}</Typography>
              <Typography><b>Breed:</b> {pet.breed}</Typography>
              <Typography><b>Age:</b> {pet.age} years</Typography>
              <Typography><b>Gender:</b> {pet.gender}</Typography>
              <Typography><b>Size:</b> {pet.size}</Typography>
              <Typography><b>Health:</b> {pet.health || 'N/A'}</Typography>
              <Typography><b>Location:</b> {pet.location}</Typography>
            </Stack>
            <Divider sx={{ my: 2 }} />
            {/* Owner Info (placeholder) */}
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar>{pet.owner?.name?.[0] || 'U'}</Avatar>
              <Box>
                <Typography fontWeight={600}>{pet.owner?.name || 'Owner Name'}</Typography>
                <Typography variant="body2" color="text.secondary">{pet.contact || 'Contact info hidden'}</Typography>
              </Box>
            </Stack>
            {/* Action Buttons */}
            <Stack spacing={1.5} sx={{ mt: 2 }}>
              {isOwner ? (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ fontWeight: 600 }}
                  onClick={() => navigate(`/edit-listing/adoption/${pet.id || pet._id}`)}
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
                    {/* showContactInfo ? 'Hide Contact Info' : 'Contact Info' */}
                    Contact Info
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
            {user && (
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 1 }}>
                Adopt Pet
              </Button>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Back to Listings</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdoptionDetailModal; 