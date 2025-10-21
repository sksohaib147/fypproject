import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaMapMarkerAlt, FaPaw, FaStar, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button, useTheme } from '@mui/material';
import api from '../utils/api';
import { formatPKR } from '../utils/currency';

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/pets/${id}`);
        setPet(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/pet/${id}` } });
      return;
    }

    if (pet.status !== 'available') return;

    setIsAddingToCart(true);
    try {
      addToCart(pet, 'pet');
      // Show success message
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(pet._id)) {
      removeFromWishlist(pet._id);
    } else {
      addToWishlist(pet);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'sold':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Pet Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The pet you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/adoption')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Pets
          </button>
        </div>
      </div>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, overflow: 'hidden', mb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 8, p: 8 }}>
            {/* Image Gallery */}
            <Box>
              <Box sx={{ position: 'relative', height: 384, mb: 4 }}>
                <img
                  src={pet.images && pet.images[0]}
                  alt={pet.name}
                  style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'cover', borderRadius: 3 }}
                  crossOrigin="anonymous"
                />
                <Box sx={{ position: 'absolute', top: 16, right: 16, px: 2, py: 1, borderRadius: 2, fontSize: 14, fontWeight: 600, color: '#fff', bgcolor: getStatusColor(pet.status) }}>{pet.status}</Box>
              </Box>
              {/* Thumbnail Images */}
              {pet.images && pet.images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                  {pet.images.map((image, index) => (
                    <Button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      sx={{ minWidth: 80, minHeight: 80, borderRadius: 2, border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : `2px solid ${theme.palette.divider}`, p: 0, overflow: 'hidden' }}
                    >
                      <img
                        src={image}
                        alt={`${pet.name} ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        crossOrigin="anonymous"
                      />
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
              {/* Pet Details */}
            <Box>
              <Typography variant="h4" fontWeight={700} mb={2}>{pet.name}</Typography>
              <Typography color="text.secondary" fontSize={16} mb={2}>{pet.species} - {pet.breed}</Typography>
              <Typography fontWeight={700} color="primary" fontSize={24} mb={4}>
                {pet.pricePKR !== undefined && pet.pricePKR !== null && pet.pricePKR !== '' ? formatPKR(pet.pricePKR) : pet.price ? formatPKR(pet.price) : ''}
              </Typography>
              <Typography color="text.primary" mb={4} sx={{ whiteSpace: 'pre-wrap' }}>{pet.description}</Typography>
              <Button variant="contained" color="success" sx={{ fontWeight: 600, py: 1.5, borderRadius: 2, width: { xs: '100%', md: '50%' } }}>Adopt Now</Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PetDetail; 