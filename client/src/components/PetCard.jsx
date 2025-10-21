import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaPaw, FaHeart } from 'react-icons/fa';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button, Chip, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const PetCard = ({ pet }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { notify } = useNotification();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const theme = useTheme();
  
  // Wishlist functionality
  const isFavorited = isInWishlist(pet._id);
  
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFavorited) {
      removeFromWishlist(pet._id);
    } else {
      addToWishlist(pet);
    }
  };

  // Robust price mapping
  const price = pet.price ?? pet.pricePKR ?? 0;
  const originalPrice = pet.originalPrice ?? pet.originalPricePKR ?? null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (pet.status !== 'available') return;
    
    setIsAddingToCart(true);
    try {
      addToCart(pet, 'pet');
      notify('Pet added to cart', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      notify('Failed to add pet to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(pet._id)) {
      removeFromWishlist(pet._id);
    } else {
      addToWishlist(pet);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'sold':
        return 'error.main';
      default:
        return 'grey.500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'pending':
        return 'Pending';
      case 'sold':
        return 'Sold';
      default:
        return 'Unknown';
    }
  };

  // Helper function to format price
  const formatPrice = (price) => formatPKR(price);

  // Robust image fallback
  const imageUrl = resolveImageUrl((pet.images && pet.images[0]) || pet.image);

  // Robust species/breed/location
  const species = pet.species || 'Unknown';
  const breed = pet.breed || 'Unknown';
  const location = pet.location || 'Unknown';
  const ratings = pet.ratings || { average: 0, count: 0 };

  return (
    <Box sx={{ bgcolor: 'background.paper', color: 'text.primary', borderRadius: 2, boxShadow: 2, overflow: 'hidden', transition: 'background-color 0.3s', '&:hover': { boxShadow: 6 } }}>
      <Link to={`/adoption/${pet.slug || pet._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Box sx={{ position: 'relative', height: 192 }}>
          <img
            src={imageUrl}
            alt={pet.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
          
          {/* Status Badge */}
          <Box sx={{ position: 'absolute', top: 8, right: 8, px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600, color: '#fff', bgcolor: getStatusColor(pet.status) }}>
            {getStatusText(pet.status)}
          </Box>
          
          {/* Age Badge */}
          {pet.age && (
            <Box sx={{ position: 'absolute', top: 8, left: 8, px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600, color: '#fff', bgcolor: 'primary.main' }}>
              {pet.age} {pet.ageUnit || 'years'}
            </Box>
          )}

          {/* Wishlist Button */}
          <Button
            onClick={handleWishlistToggle}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 48, 
              minWidth: 32, 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              bgcolor: 'background.paper', 
              color: 'text.primary',
              boxShadow: 2,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <FaHeart 
              style={{ fontSize: 14, color: isInWishlist(pet._id) ? theme.palette.error.main : theme.palette.text.secondary }} 
            />
          </Button>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}>
            {pet.name}
          </Typography>
          
          {/* Price Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
              {formatPrice(price)}
            </Typography>
            {originalPrice && originalPrice > price && (
              <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                {formatPrice(originalPrice)}
              </Typography>
            )}
          </Box>

          {/* Pet Details */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip 
                label={species} 
                size="small" 
                sx={{ bgcolor: 'action.hover', color: 'text.secondary' }} 
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {breed}
              </Typography>
            </Box>
            
            {pet.gender && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FaPaw style={{ marginRight: 4, color: theme.palette.text.secondary }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {pet.gender}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FaMapMarkerAlt style={{ marginRight: 4, color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {location}
            </Typography>
          </Box>

          {/* Description */}
          {pet.description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {pet.description}
            </Typography>
          )}

          {/* Tags */}
          {pet.tags && pet.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              {pet.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{ 
                    fontSize: 12, 
                    fontWeight: 500, 
                    bgcolor: 'secondary.light', 
                    color: 'secondary.dark' 
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Link>
      
      {/* Add to Cart Button */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          onClick={handleAddToCart}
          disabled={pet.status !== 'available' || isAddingToCart}
          variant="contained"
          fullWidth
          startIcon={isAddingToCart ? <Box sx={{ width: 16, height: 16, border: 2, borderColor: 'white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <FaShoppingCart />}
          sx={{
            bgcolor: pet.status !== 'available' ? 'grey.300' : 'secondary.main',
            color: pet.status !== 'available' ? 'text.disabled' : 'white',
            '&:hover': {
              bgcolor: pet.status !== 'available' ? 'grey.300' : 'secondary.dark'
            },
            '&:active': {
              bgcolor: pet.status !== 'available' ? 'grey.300' : 'secondary.dark'
            },
            fontWeight: 600,
            py: 1,
            borderRadius: 2
          }}
        >
          {isAddingToCart ? 'Adding...' : (pet.status !== 'available' ? getStatusText(pet.status) : 'Add to Cart')}
        </Button>
      </Box>
    </Box>
  );
};

export default PetCard; 