import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { useNotification } from '../contexts/NotificationContext';
import { formatPKR } from '../utils/currency';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();
  const { notify } = useNotification();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch product');
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
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
      notify('Product added to cart', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      notify('Failed to add product to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: 4 }}>
        {loading && <Typography align="center" color="text.secondary">Loading product...</Typography>}
        {error && <Typography align="center" color="error.main">{error}</Typography>}
        {product && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 8 }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={product.images && product.images[0]} alt={product.name} style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'cover', borderRadius: 3 }} crossOrigin="anonymous" />
            </Box>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" fontWeight={700} mb={2}>{product.name}</Typography>
              <Typography color="text.secondary" fontSize={16} mb={2}>{product.category}</Typography>
              <Typography fontWeight={700} color="primary" fontSize={24} mb={4}>
                {product.pricePKR !== undefined && product.pricePKR !== null && product.pricePKR !== '' ? formatPKR(product.pricePKR) : ''}
              </Typography>
              <Typography color="text.primary" mb={4} sx={{ whiteSpace: 'pre-wrap' }}>{product.description}</Typography>
              <Button variant="contained" color="error" sx={{ fontWeight: 600, py: 1.5, borderRadius: 2, width: { xs: '100%', md: '50%' } }}>Add to Cart</Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProductDetail; 