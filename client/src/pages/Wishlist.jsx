import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash, FaEye, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPKR } from '../utils/currency';
import { getImageUrl } from '../utils/api';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';
import { Box, Typography, useTheme, IconButton, Button, Grid, Card, CardMedia, CardContent, Chip } from '@mui/material';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleMoveToCart = (item) => {
    addToCart(item, item.type || 'product');
    removeFromWishlist(item._id);
  };

  const handleRemoveItem = (itemId) => {
    removeFromWishlist(itemId);
  };

  // Helper function to format price based on item type
  const formatItemPrice = (item) => {
    return formatPKR(item.pricePKR || item.price);
  };

  // Helper function to get image URL with proper fallbacks
  const getItemImageUrl = (item) => {
    // Try different image field structures
    const imagePath = item.image || item.images?.[0] || item.photos?.[0] || '/placeholder.svg';
    return resolveImageUrl(imagePath);
  };

  // Helper function to determine if item is a product (from category pages)
  const isProduct = (item) => {
    // Products from category pages have source: 'category' 
    // OR have specific product categories without marketplace/adoption sources
    return item.source === 'category' || 
           (item.category && ['Dogs', 'Cats', 'Birds', 'Fish', 'Other', 'Rabbit', 'Rabbit Food', 'Toys', 'Belts and Cages'].includes(item.category) && 
            item.source !== 'marketplace' && 
            item.source !== 'adoption');
  };

  // Helper function to determine if item is a listing (from marketplace/adoption)
  const isListing = (item) => {
    // Listings from marketplace/adoption pages have marketplace/adoption sources
    // OR are pets with owner/seller info
    return item.source === 'marketplace' || 
           item.source === 'adoption' || 
           item.type === 'pet' ||
           (item.owner || item.seller || item.user) && item.source !== 'category';
  };

  // Handle item click to open details modal
  const handleItemClick = (item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  // Close detail modal
  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  // Handle contact seller/owner - navigate to chat
  const handleContactSeller = (item) => {
    if (!user) {
      // If user is not logged in, redirect to login
      navigate('/login', { state: { from: '/wishlist' } });
      return;
    }

    // Determine listing type and owner ID
    const listingType = item.type === 'pet' ? 'adoption' : 'marketplace';
    const ownerId = item.owner?._id || item.seller?._id || item.user?._id;
    
    if (!ownerId) {
      alert('Owner information not available for this listing.');
      return;
    }

    // Navigate to chat page with proper parameters
    navigate(`/chat/${listingType}/${item._id}/${user._id}/${ownerId}`);
    handleCloseModal();
  };

  if (wishlist.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, p: 6, textAlign: 'center' }}>
            <Typography variant="h1" color="text.secondary" mb={3}>💝</Typography>
            <Typography variant="h4" fontWeight={600} mb={2}>Your wishlist is empty</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>Start adding items you love to your wishlist!</Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/pcmarketplace"
                style={{ bgcolor: 'primary.main', color: 'white', px: 4, py: 1.5, borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
              >
                Browse P&CMarketplace
              </Link>
              <Link
                to="/adoption"
                style={{ border: `1px solid ${theme.palette.primary.main}`, color: theme.palette.primary.main, px: 4, py: 1.5, borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
              >
                Browse Pets
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700}>My Wishlist</Typography>
          <Button
            onClick={clearWishlist}
            sx={{ color: theme.palette.error.main, fontWeight: 500 }}
            size="small"
          >
            Clear All
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {wishlist.map((item) => {
            const isProductItem = isProduct(item);
            const isListingItem = isListing(item);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={getItemImageUrl(item)}
                      alt={item.name || item.title}
                      onError={(e) => handleImageError(e)}
                    />
                    
                {/* Type Badge */}
                    <Chip
                      label={isProductItem ? 'Product' : 'Listing'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        bgcolor: isProductItem ? 'blue.500' : 'purple.500',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                    
                {/* Status Badge */}
                {item.status && (
                      <Chip
                        label={item.status}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: item.status === 'available' ? 'success.main' : item.status === 'sold' ? 'error.main' : 'warning.main',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                    
                    {/* Action Buttons */}
                    <Box sx={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 1 }}>
                      {/* Cart button only for products */}
                      {isProductItem && (
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToCart(item);
                          }}
                          sx={{
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            color: '#fff',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.9)',
                            },
                          }}
                          size="small"
                        >
                          <FaShoppingCart />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item._id);
                        }}
                        sx={{
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          color: '#fff',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.9)',
                          },
                        }}
                        size="small"
                      >
                        <FaTrash />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={600} noWrap gutterBottom>
                      {item.name || item.title}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={600} mb={1}>
                      {formatItemPrice(item)}
                    </Typography>
                    {item.breed && (
                      <Typography variant="body2" color="text.secondary" mb={0.5}>
                        {item.breed}
                      </Typography>
                    )}
                    {item.location && (
                      <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                        {item.location}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Detail Modal */}
      {selectedItem && detailModalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
          onClick={handleCloseModal}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              maxWidth: 600,
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'text.secondary',
                zIndex: 1
              }}
            >
              <FaTrash />
            </IconButton>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Image */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <img
                  src={getItemImageUrl(selectedItem)}
                  alt={selectedItem.name || selectedItem.title}
                  style={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 12
                  }}
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </Box>
              
              {/* Details */}
              <Box sx={{ flex: 1, minWidth: 0, p: 3 }}>
                <Typography variant="h5" fontWeight={700} mb={2}>
                  {selectedItem.name || selectedItem.title}
                </Typography>
                
                <Typography variant="h4" color="primary" fontWeight={700} mb={2}>
                  {formatItemPrice(selectedItem)}
                </Typography>
                
                {selectedItem.breed && (
                  <Typography variant="body1" color="text.secondary" mb={1}>
                    <strong>Breed:</strong> {selectedItem.breed}
                  </Typography>
                )}
                
                {selectedItem.location && (
                  <Typography variant="body1" color="text.secondary" mb={1}>
                    <strong>Location:</strong> {selectedItem.location}
                  </Typography>
                )}
                
                {selectedItem.description && (
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    {selectedItem.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Contact Seller button for listings */}
                  {isListing(selectedItem) && (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<FaPhone />}
                      onClick={() => handleContactSeller(selectedItem)}
                    >
                      Contact Seller
                    </Button>
                  )}
                  
                  {/* Add to Cart button only for products */}
                  {isProduct(selectedItem) && (
                    <Button
                      variant="contained"
                      startIcon={<FaShoppingCart />}
                      onClick={() => {
                        handleMoveToCart(selectedItem);
                        handleCloseModal();
                      }}
                    >
                      Add to Cart
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<FaTrash />}
                    onClick={() => {
                      handleRemoveItem(selectedItem._id);
                      handleCloseModal();
                    }}
                  >
                    Remove from Wishlist
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Wishlist; 