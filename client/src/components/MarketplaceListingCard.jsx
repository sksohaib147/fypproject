import React from 'react';
import { Button, Chip, Box, Typography, Stack, IconButton } from '@mui/material';
import { formatPKR } from '../utils/currency';
import { useAuth } from '../contexts/AuthContext';
import { resolveImageUrl } from '../utils/imageUtils';
import { useWishlist } from '../contexts/WishlistContext';
import { FaHeart } from 'react-icons/fa';

const MarketplaceListingCard = ({ 
  listing, 
  onViewDetails, 
  onContactSeller,
  onEditListing 
}) => {
  const { user: currentUser } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // Check if current user is the listing owner
  const isOwner = currentUser && listing && (
    currentUser._id === listing.owner?._id || 
    currentUser._id === listing.seller?._id ||
    currentUser._id === listing.user?._id
  );
  
  // Debug logging
  console.log('MarketplaceListingCard Debug:', {
    currentUser: currentUser?._id,
    currentUserEmail: currentUser?.email,
    listingOwner: listing?.owner?._id,
    listingSeller: listing?.seller?._id,
    listingUser: listing?.user?._id,
    isOwner,
    listingName: listing?.name || listing?.title
  });
  


  // Robust image fallback with proper URL conversion
  const imageUrl = resolveImageUrl(listing?.image || listing?.photos?.[0] || '/placeholder.svg');
  const displayName = listing?.name || listing?.title || 'Untitled';
  const displayPrice = listing?.pricePKR !== undefined ? listing.pricePKR : listing?.price ?? 0;
  const displayBreed = listing?.breed || 'Unknown';
  const displayLocation = listing?.location || 'Unknown';
  
  // Wishlist functionality
  const isFavorited = isInWishlist(listing._id || listing.id);
  
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (isFavorited) {
      removeFromWishlist(listing._id || listing.id);
    } else {
      addToWishlist(listing);
    }
  };
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: 2,
        boxShadow: 2,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'box-shadow 0.2s, transform 0.1s',
        cursor: 'pointer',
        '&:hover': { boxShadow: 6, transform: 'translateY(-2px)', backgroundColor: 'action.hover' },
      }}
      onClick={onViewDetails}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${displayName}`}
    >
      <Box
        sx={{
          width: '100%',
          height: 180,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          position: 'relative',
        }}
      >
        <img
          src={imageUrl}
          alt={`Photo of ${displayName}`}
          style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
          loading="lazy"
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('Image failed to load:', e.target.src, 'for listing:', displayName);
            e.target.src = '/placeholder.svg';
          }}
          onLoad={(e) => {
            console.log('Image loaded successfully:', displayName, 'from:', e.target.src);
          }}
        />
        {/* Heart Icon for Wishlist */}
        <IconButton
          onClick={handleWishlistToggle}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            color: isFavorited ? '#ff4757' : '#fff',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              color: isFavorited ? '#ff4757' : '#fff',
            },
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          size="small"
        >
          <FaHeart />
        </IconButton>
      </Box>
      <Typography variant="h6" fontWeight={700} noWrap gutterBottom>
        {displayName}
      </Typography>
      <Typography variant="h5" color="primary" fontWeight={800} gutterBottom>
        {displayPrice !== undefined && displayPrice !== null && displayPrice !== '' ? formatPKR(displayPrice) : ''}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {displayBreed}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {displayLocation}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1, mt: 0.5 }}>
        {listing?.tags?.map(tag => (
          <Chip
            key={tag}
            label={tag}
            color={tag === 'Featured' ? 'primary' : 'default'}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={e => { e.stopPropagation(); onViewDetails(); }}
          aria-label={`View details for ${displayName}`}
        >
          View Details
        </Button>
        {isOwner ? (
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={e => { e.stopPropagation(); onEditListing && onEditListing(); }}
            aria-label={`Edit listing for ${displayName}`}
          >
            Edit Listing
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={e => { e.stopPropagation(); onContactSeller && onContactSeller(); }}
            aria-label={`Contact seller for ${displayName}`}
          >
            Contact Seller
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default MarketplaceListingCard; 