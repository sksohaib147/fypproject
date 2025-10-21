import React from 'react';
import { Button, Chip, Box, Typography, Stack, IconButton } from '@mui/material';
import { resolveImageUrl, handleImageError } from '../../utils/imageUtils';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { FaHeart } from 'react-icons/fa';

const AdoptionPetCard = ({
  pet,
  image,
  name,
  age,
  breed,
  location,
  tags = [],
  onViewDetails,
  onAdopt,
  onEditListing,
  showAdoptButton = false,
}) => {
  const { user: currentUser } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  // Check if current user is the pet owner
  const isOwner = currentUser && pet && (
    currentUser._id === pet.owner?._id || 
    currentUser._id === pet.user?._id
  );
  
  // Debug logging
  console.log('AdoptionPetCard Debug:', {
    currentUser: currentUser?._id,
    currentUserEmail: currentUser?.email,
    petOwner: pet?.owner?._id,
    petUser: pet?.user?._id,
    isOwner,
    petName: pet?.name || pet?.title,
    fullCurrentUser: currentUser,
    fullPet: pet
  });
  

  // Enhanced image handling with proper fallback
  const imageUrl = resolveImageUrl(image);
  const displayName = name || 'Untitled';
  const displayAge = age ?? 'N/A';
  const displayBreed = breed || 'Unknown';
  const displayLocation = location || 'Unknown';
  
  // Wishlist functionality
  const isFavorited = isInWishlist(pet?._id || pet?.id);
  
  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    if (isFavorited) {
      removeFromWishlist(pet._id || pet.id);
    } else {
      addToWishlist(pet);
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
          onError={(e) => handleImageError(e)}
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
      <Typography variant="body2" color="text.secondary">
        {displayAge} yrs • {displayBreed}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {displayLocation}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1, mt: 0.5 }}>
        {tags.map(tag => (
          <Chip
            key={tag}
            label={tag}
            color={tag === 'Featured' ? 'primary' : tag === 'Older' ? 'warning' : 'default'}
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
        ) : showAdoptButton && (
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={e => { e.stopPropagation(); onAdopt && onAdopt(); }}
            aria-label={`Adopt ${displayName}`}
          >
            Adopt Me
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default AdoptionPetCard; 