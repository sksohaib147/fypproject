import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdvancedSearch from '../components/AdvancedSearch';
import SearchResults from '../components/SearchResults';
import api from '../utils/api';
import { Box, Typography, Button } from '@mui/material';

const Search = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = async (filters) => {
    setLoading(true);
    setError('');

    try {
      // Convert filters to query parameters
      const queryParams = new URLSearchParams();
      if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priceRange.min) queryParams.append('minPrice', filters.priceRange.min);
      if (filters.priceRange.max) queryParams.append('maxPrice', filters.priceRange.max);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.condition) queryParams.append('condition', filters.condition);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

      const response = await api.get(`/search/advanced?${queryParams.toString()}`);
      setResults(response.data);
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = (filters) => {
    // Update URL query params
    const queryParams = new URLSearchParams();
    if (filters.searchTerm) queryParams.append('q', filters.searchTerm);
    if (filters.section) queryParams.append('section', filters.section);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.breed) queryParams.append('breed', filters.breed);
    if (filters.priceRange?.min) queryParams.append('minPrice', filters.priceRange.min);
    if (filters.priceRange?.max) queryParams.append('maxPrice', filters.priceRange.max);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.condition) queryParams.append('condition', filters.condition);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    navigate(`/search?${queryParams.toString()}`);
  };

  // Handle initial search from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.toString()) {
      const initialFilters = {
        searchTerm: params.get('q') || '',
        category: params.get('category') || '',
        priceRange: {
          min: params.get('minPrice') || '',
          max: params.get('maxPrice') || ''
        },
        location: params.get('location') || '',
        condition: params.get('condition') || '',
        sortBy: params.get('sortBy') || 'newest'
      };
      handleSearch(initialFilters);
    }
  }, [location.search]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 }, py: 4 }}>
        <Button variant="outlined" color="primary" onClick={() => navigate('/')} sx={{ mb: 3 }}>
          Back to Home
        </Button>
        <Typography variant="h3" fontWeight={700} color="text.primary" sx={{ mb: 4 }}>
          Search Results
        </Typography>
        {/* AdvancedSearch filter box always visible at the top */}
        <AdvancedSearch onSearch={handleAdvancedSearch} type="global" />
        <Box sx={{ mt: 4 }}>
          <SearchResults
            results={results}
            loading={loading}
            error={error}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Search; 