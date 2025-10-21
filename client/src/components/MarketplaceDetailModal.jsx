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
import { formatPKR } from '../utils/currency';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import { getImageUrl as getApiImageUrl } from '../utils/api';

const MarketplaceDetailModal = ({ 
  open, 
  onClose, 
  listing, 
  user, 
  loading, 
  onContactSeller, 
  onEditListing,
  onAddToCart, 
  onGoToCheckout,
  showProductActions = false, // New prop to control button display
  hideLocation = false // New prop to hide location
}) => {
  const [activeImg, setActiveImg] = useState(0);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Check if current user is the listing owner
  const isOwner = currentUser && listing && (
    currentUser._id === listing.owner?._id || 
    currentUser._id === listing.seller?._id ||
    currentUser._id === listing.user?._id
  );

  React.useEffect(() => {
    setActiveImg(0);
  }, [listing]);

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
          <Typography>Loading listing details...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!listing) {
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
          <Typography>Listing details not found.</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  // Enhanced image handling with support for multiple formats
  const getImageUrl = (image) => {
    return getApiImageUrl(image);
  };

  const images = listing.photos && listing.photos.length > 0 
    ? listing.photos.map(resolveImageUrl)
    : [resolveImageUrl(listing.image)];

  const handleNext = () => setActiveImg((prev) => (prev + 1) % images.length);
  const handleBack = () => setActiveImg((prev) => (prev - 1 + images.length) % images.length);

  const handleContactSeller = () => {
    if (onContactSeller) {
      onContactSeller(listing);
    } else {
      // Default contact behavior - navigate to chat
      navigate(`/chat/marketplace/${listing._id || listing.id}/${listing.owner?._id || listing.seller?._id || 'seller'}`);
    }
  };

  const handleEditListing = () => {
    if (onEditListing) {
      onEditListing(listing);
    } else {
      // Default edit behavior - navigate to edit form
      navigate(`/edit-listing/marketplace/${listing._id || listing.id}`);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pr: 5 }}>
        {listing.name}
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
                alt={`Listing photo ${activeImg + 1}`}
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
              {listing.tags && listing.tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  color={tag === 'Featured' ? 'primary' : 'default'}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>
          {/* Listing Details */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700} color="error.main" mb={2}>
              {listing.pricePKR !== undefined && listing.pricePKR !== null && listing.pricePKR !== '' ? formatPKR(listing.pricePKR) : ''}
            </Typography>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>{listing.description || 'No description provided.'}</Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {listing.category && <Typography><b>Category:</b> {listing.category}</Typography>}
              {listing.breed && <Typography><b>Breed:</b> {listing.breed}</Typography>}
              {listing.species && <Typography><b>Species:</b> {listing.species}</Typography>}
              {listing.age && <Typography><b>Age:</b> {listing.age}</Typography>}
              {listing.gender && <Typography><b>Gender:</b> {listing.gender}</Typography>}
              {listing.size && <Typography><b>Size:</b> {listing.size}</Typography>}
              {listing.health && <Typography><b>Health:</b> {listing.health}</Typography>}
              {!hideLocation && listing.location && <Typography><b>Location:</b> {listing.location}</Typography>}
            </Stack>
            <Divider sx={{ my: 2 }} />
            {/* Owner Info */}
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar>{listing.owner?.name?.[0] || listing.seller?.name?.[0] || 'S'}</Avatar>
              <Box>
                <Typography fontWeight={600}>{listing.owner?.name || listing.seller?.name || 'Seller Name'}</Typography>
                <Typography variant="body2" color="text.secondary">{listing.contact || listing.seller?.contact || 'Contact info hidden'}</Typography>
              </Box>
            </Stack>
            <Stack spacing={2}>
              {showProductActions ? (
                // Product category pages - show Add to Cart and Checkout
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ fontWeight: 600 }}
                    onClick={() => onAddToCart && onAddToCart(listing)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ fontWeight: 600 }}
                    onClick={() => onGoToCheckout && onGoToCheckout(listing)}
                  >
                    Proceed to Checkout
                  </Button>
                </>
              ) : (
                // Marketplace and Adoption pages - show appropriate button based on ownership
                <>
                  {isOwner ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      sx={{ fontWeight: 600 }}
                      onClick={handleEditListing}
                    >
                      Edit Listing
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ fontWeight: 600 }}
                      onClick={handleContactSeller}
                    >
                      Contact Seller
                    </Button>
                  )}
                </>
              )}
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

export default MarketplaceDetailModal; 