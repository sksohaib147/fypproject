import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useNotification } from '../contexts/NotificationContext';
import { Box, Typography, Button, useTheme, Grid, Fab, Zoom, Snackbar, Alert, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { FaStar, FaArrowLeft, FaHeart } from 'react-icons/fa';
import { FaDog, FaCat, FaBone, FaGamepad, FaHome } from 'react-icons/fa';
import { GiRabbit } from 'react-icons/gi';
import MarketplaceDetailModal from '../components/MarketplaceDetailModal';
import MarketplaceListingForm from '../components/MarketplaceListingForm';
import api from '../utils/api';
import { formatPKR } from '../utils/currency';
import { resolveImageUrl } from '../utils/imageUtils';
import { generateSlug } from '../utils/ecommerce';
import { useLanguage } from '../contexts/LanguageContext';

const categories = [
  { name: 'Dog Food', icon: <FaDog />, path: '/dog-food' },
  { name: 'Cat Food', icon: <FaCat />, path: '/cat-food' },
  { name: 'Rabbit Food', icon: <GiRabbit />, path: '/rabbit-food' },
  { name: 'Toys', icon: <FaGamepad />, path: '/toys' },
  { name: 'Belts and Cages', icon: <FaHome />, path: '/belts-and-cages' },
];

// Generate unique slug function
const generateUniqueSlug = (name) => {
  const baseSlug = generateSlug(name);
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
};

const ToysDropdown = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Only admin can post
  const isAdmin = user && user.role === 'admin';

  // Translation object
  const t = {
    categories: language === 'ur' ? 'پروڈکٹ کیٹیگریز' : 'Product Categories',
    toys: language === 'ur' ? 'کھلونے' : 'Toys',
    dogFood: language === 'ur' ? 'کتوں کا کھانا' : 'Dog Food',
    catFood: language === 'ur' ? 'بلیوں کا کھانا' : 'Cat Food',
    rabbitFood: language === 'ur' ? 'خرگوش کا کھانا' : 'Rabbit Food',
    beltsAndCages: language === 'ur' ? 'پٹے اور پنجرے' : 'Belts and Cages',
  };

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const data = await api.get('/products?category=Toys');
        setListings(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        setListings([]);
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const handleAddToCart = (listing) => {
    const product = { ...listing, _id: listing._id || listing.id };
    addToCart(product, 'product');
  };

  const handleGoToCheckout = (listing) => {
    const product = { ...listing, _id: listing._id || listing.id };
    addToCart(product, 'product');
    navigate('/checkout');
  };

  // When setting selectedListing, ensure pricePKR is set
  const handleViewDetails = (listing) => {
    setSelectedListing({ ...listing, pricePKR: listing.pricePKR ?? listing.price ?? '' });
    setDetailOpen(true);
    setDetailLoading(false);
  };

  const handleFormSubmit = async (formData) => {
    const pricePKR = Number(formData.price || formData.pricePKR);
    if (!pricePKR || pricePKR < 1) {
      setSnackbar({ open: true, message: 'Price is required and must be at least 1', severity: 'error' });
      return;
    }
    try {
      const name = formData.title || formData.name || 'Toy';
      const payload = {
        ...formData,
        pricePKR,
        name,
        description: formData.description || formData.title || formData.name || 'Toy',
        stock: Number(formData.stock) || 1,
        images: (formData.photos || formData.images || []).length > 0 ? (formData.photos || formData.images || []).map(String) : ['/placeholder.jpg'],
        location: formData.location || 'Unknown',
        condition: 'New',
        slug: generateUniqueSlug(name),
        source: 'category', // This is from product category page
      };
      await api.post('/products', payload);
      setSnackbar({ open: true, message: 'Product posted successfully!', severity: 'success' });
      const data = await api.get('/products?category=Toys');
      setListings(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Product post error:', err);
      setSnackbar({ open: true, message: err?.data?.message || err.message || 'Failed to post product', severity: 'error' });
    }
    setFormOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2, color: 'text.primary' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Sidebar */}
          <Box component="aside" sx={{ width: { xs: '100%', md: '25%' }, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: 3, minHeight: 400 }}>
            <Box sx={{ position: 'relative', mb: 4 }}>
              <Typography variant="h4" fontWeight={700} sx={{ display: 'inline-block', color: 'text.primary' }}>
                {t.categories}
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 48, height: 4, bgcolor: 'error.main', borderRadius: 2 }} />
              </Typography>
            </Box>
            <Box component="ul" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {categories.map((cat) => (
                <Box component="li" key={cat.name}>
                  {cat.name === 'Toys' && (
                    <Link to="/toys" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box sx={{ width: '100%', display: 'block', textAlign: 'left', p: 2, borderRadius: 2, border: 1, borderColor: 'error.200', bgcolor: 'error.50', color: 'error.main', transition: 'all 0.2s', '&:hover': { borderColor: 'error.200', boxShadow: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2, color: 'error.main' }}>{cat.icon}</Box>
                          <Typography sx={{ fontWeight: 500, color: 'error.main' }}>{t.toys}</Typography>
                        </Box>
                      </Box>
                    </Link>
                  )}
                  {cat.name !== 'Toys' && (
                    <Link to={cat.name === 'Dog Food' ? '/dog-food' : cat.name === 'Cat Food' ? '/cat-food' : cat.name === 'Rabbit Food' ? '/rabbit-food' : '/belts-and-cages'} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Box sx={{ width: '100%', display: 'block', textAlign: 'left', p: 2, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary', transition: 'all 0.2s', '&:hover': { borderColor: 'error.200', boxShadow: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2, color: 'text.secondary', '&:hover': { color: 'error.main' }, transition: 'color 0.2s' }}>{cat.icon}</Box>
                          <Typography sx={{ fontWeight: 500, '&:hover': { color: 'error.main' }, transition: 'color 0.2s' }}>{t[cat.name.replace(/ /g, '').replace('and', 'And').charAt(0).toLowerCase() + cat.name.replace(/ /g, '').replace('and', 'And').slice(1)] || cat.name}</Typography>
                        </Box>
                      </Box>
                    </Link>
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Main Content */}
          <Box component="main" sx={{ flex: 1 }}>
            <Box sx={{ mb: 1 }}>
              <button 
                onClick={() => navigate('/')} 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  color: '#666', 
                  fontWeight: 600, 
                  fontSize: 18, 
                  marginBottom: 16,
                  textTransform: 'none',
                  padding: 0,
                  minWidth: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.color = '#d32f2f'}
                onMouseLeave={(e) => e.target.style.color = '#666'}
              >
                <FaArrowLeft style={{ marginRight: 8 }} /> Back to Home
              </button>
            </Box>
            <Typography variant="h4" fontWeight={700} mb={1} color="text.primary">Pet Toys</Typography>
            <Typography color="text.secondary" mb={3} sx={{ maxWidth: 600 }}>
              Discover our wide selection of fun, safe, and durable toys for your pets. From chew toys and balls to interactive puzzles, we have something for every pet's playtime needs.
            </Typography>
            <Grid container spacing={3}>
              {loading ? (
                <Grid item xs={12}>
                  <Typography variant="h6" align="center">Loading products...</Typography>
                </Grid>
              ) : listings.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="h6" align="center">No products found in this category.</Typography>
                </Grid>
              ) : (
                listings.map(listing => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={listing._id || listing.id}>
                    <Box sx={{ 
                      position: 'relative', 
                      bgcolor: 'background.paper', 
                      borderRadius: 3, 
                      boxShadow: 2, 
                      p: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      cursor: 'pointer',
                      ...(listing.stock === 0 ? { filter: 'blur(2px)', opacity: 0.6 } : {})
                    }} onClick={() => handleViewDetails(listing)}>
                      <Box sx={{ position: 'relative' }}>
                        <img
                          src={
                            listing.image
                              ? listing.image.startsWith('http')
                                ? listing.image
                                : `http://localhost:5000/uploads/${listing.image}`
                              : '/placeholder.jpg'
                          }
                          alt={listing.name}
                          style={{ height: 128, width: '100%', objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                          crossOrigin="anonymous"
                        />
                        
                        {/* Heart Icon for Wishlist */}
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            const isFavorited = isInWishlist(listing._id);
                            if (isFavorited) {
                              removeFromWishlist(listing._id);
                            } else {
                              addToWishlist(listing);
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            color: isInWishlist(listing._id) ? '#ff4757' : '#fff',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.7)',
                              color: isInWishlist(listing._id) ? '#ff4757' : '#fff',
                            },
                            transition: 'all 0.2s ease',
                            zIndex: 10,
                          }}
                          size="small"
                        >
                          <FaHeart />
                        </IconButton>
                        
                        {listing.stock === 0 && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            left: 8, 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1, 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: '#fff', 
                            bgcolor: 'grey.700' 
                          }}>
                            Out of Stock
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ p: 1.5, pb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.name}</Typography>
                        <Typography color="text.secondary" fontSize={14} mb={0.5}>
                          {listing.pricePKR !== undefined && listing.pricePKR !== null && listing.pricePKR !== '' ? formatPKR(listing.pricePKR) : ''}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontSize={12} mb={1} sx={{ minHeight: 40, whiteSpace: 'pre-wrap' }}>{listing.description}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main', fontSize: 12 }}>
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} style={{ color: i < Math.round(listing.rating) ? theme.palette.warning.main : theme.palette.grey[300] }} />
                          ))}
                          <Typography color="text.secondary" fontSize={12} sx={{ ml: 0.5 }}>({listing.reviews})</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        </Box>
      </Box>
      {isAdmin && (
        <MarketplaceListingForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          hideBreedAndSpecies={true}
          defaultCategory="Toys"
        />
      )}
      <MarketplaceDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        listing={selectedListing}
        user={user}
        loading={detailLoading}
        onAddToCart={handleAddToCart}
        onGoToCheckout={handleGoToCheckout}
        showProductActions={true}
        hideLocation={true}
      />
      {isAdmin && (
        <Zoom in={true}>
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000, bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
            onClick={() => setFormOpen(true)}
          >
            <AddIcon />
          </Fab>
        </Zoom>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ToysDropdown; 