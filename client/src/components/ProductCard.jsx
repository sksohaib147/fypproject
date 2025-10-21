import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaTag, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { formatCondition, calculateDiscount } from '../utils/ecommerce';
import { formatPKR } from '../utils/currency';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Box, Typography, Button, Chip, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const theme = useTheme();
  
  // Robust price mapping
  const currentPrice = product.pricePKR ?? product.price ?? 0;
  const originalPrice = product.originalPricePKR ?? product.originalPrice ?? null;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercentage = hasDiscount ? calculateDiscount(originalPrice, currentPrice) : 0;

  const formatPrice = (price) => formatPKR(price);

  // Robust image fallback
  const imageUrl = resolveImageUrl((product.images && product.images[0]) || product.image);

  // Robust category/condition/location
  const category = product.category || 'Other';
  const condition = product.condition || 'N/A';
  const location = product.location || 'Unknown';
  const ratings = product.ratings || { average: 0, count: 0 };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) return;
    
    setIsAddingToCart(true);
    try {
      addToCart(product, 'product');
      // Show success message or toast
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };
  
  const isFavorited = isInWishlist(product._id);

  return (
    <Box sx={{ 
      bgcolor: 'background.paper', 
      color: 'text.primary', 
      borderRadius: 2, 
      boxShadow: 2, 
      overflow: 'hidden', 
      transition: 'background-color 0.3s', 
      '&:hover': { boxShadow: 6 },
      ...(product.stock === 0 ? { filter: 'blur(2px)', opacity: 0.6 } : {})
    }}>
      <Link to={`/product/${product.slug || product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Box sx={{ position: 'relative', height: 192 }}>
          <img
            src={imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => handleImageError(e)}
          />
          
          {/* Status Badges */}
          {product.status === 'sold' && (
            <Box sx={{ position: 'absolute', top: 8, right: 8, px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600, color: '#fff', bgcolor: 'error.main' }}>
              Sold
            </Box>
          )}
          
          {product.stock <= 0 && product.status !== 'sold' && (
            <Box sx={{ position: 'absolute', top: 8, right: 8, px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600, color: '#fff', bgcolor: 'grey.500' }}>
              Out of Stock
            </Box>
          )}
          
          {hasDiscount && (
            <Box sx={{ position: 'absolute', top: 8, left: 8, px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600, color: '#fff', bgcolor: 'success.main' }}>
              {discountPercentage}% OFF
            </Box>
          )}
          
          {product.shipping?.freeShipping && (
            <Box sx={{ position: 'absolute', bottom: 8, left: 8, px: 1, py: 0.5, borderRadius: 1, fontSize: 12, fontWeight: 600, color: '#fff', bgcolor: 'primary.main' }}>
              Free Shipping
            </Box>
          )}

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
        
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary', '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }}>
            {product.name || 'N/A'}
          </Typography>
          
          {/* Price Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
            {hasDiscount ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                  {formatPrice(currentPrice)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                  {formatPrice(originalPrice)}
                </Typography>
              </Box>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main' }}>
                {formatPrice(currentPrice)}
              </Typography>
            )}
            
            {/* Stock Indicator */}
            {product.stock > 0 && (
              <Typography variant="caption" sx={{ color: 'success.main' }}>
                {product.stock <= 5 ? `Only ${product.stock} left!` : 'In Stock'}
              </Typography>
            )}
          </Box>

          {/* Category and Condition */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Chip 
              label={category} 
              size="small" 
              sx={{ bgcolor: 'action.hover', color: 'text.secondary' }} 
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {formatCondition(condition)}
            </Typography>
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <FaMapMarkerAlt style={{ marginRight: 4, color: theme.palette.text.secondary }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {location}
            </Typography>
          </Box>

          {/* Ratings */}
          {ratings.average > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <FaStar style={{ marginRight: 4, color: theme.palette.warning.main }} />
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                {ratings.average.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
                ({ratings.count})
              </Typography>
            </Box>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{ 
                    fontSize: 12, 
                    fontWeight: 500, 
                    bgcolor: 'primary.light', 
                    color: 'primary.dark' 
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
          disabled={product.stock <= 0 || isAddingToCart}
          variant="contained"
          fullWidth
          startIcon={isAddingToCart ? <Box sx={{ width: 16, height: 16, border: 2, borderColor: 'white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <FaShoppingCart />}
          sx={{
            bgcolor: product.stock <= 0 ? 'grey.300' : 'primary.main',
            color: product.stock <= 0 ? 'text.disabled' : 'white',
            '&:hover': {
              bgcolor: product.stock <= 0 ? 'grey.300' : 'primary.dark'
            },
            '&:active': {
              bgcolor: product.stock <= 0 ? 'grey.300' : 'primary.dark'
            },
            fontWeight: 600,
            py: 1,
            borderRadius: 2
          }}
        >
          {isAddingToCart ? 'Adding...' : (product.stock <= 0 ? 'Out of Stock' : 'Add to Cart')}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductCard; 