import React from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import ProductCard from './ProductCard';
import { Box, Typography, Button } from '@mui/material';
import { formatPKR } from '../utils/currency';

const SearchResults = ({ results, loading, error }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <FaSpinner style={{ fontSize: 48, color: 'error.main', animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error.main">{error}</Typography>
        <Button
          onClick={() => window.location.reload()}
          variant="contained"
          color="error"
          sx={{ mt: 2, px: 2, py: 1, borderRadius: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No results found</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your search criteria
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
      gap: 3, 
      p: 2 
    }}>
      {results.map((item) => (
        <Link
          key={item._id}
          to={`/${item.type === 'pet' ? 'pets' : 'products'}/${item._id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Box sx={{ transform: 'transition-transform', '&:hover': { transform: 'scale(1.05)' } }}>
            <ProductCard
              name={item.name}
              pricePKR={item.pricePKR}
              image={item.images[0]}
              category={item.category}
              condition={item.condition}
              location={item.location}
              rating={item.ratings?.average || 0}
              reviewCount={item.ratings?.count || 0}
              isSold={item.status === 'sold'}
              discount={item.discountPercentage}
              freeShipping={item.shipping?.freeShipping}
              originalPricePKR={item.originalPricePKR}
            />
          </Box>
        </Link>
      ))}
    </Box>
  );
};

export default SearchResults; 