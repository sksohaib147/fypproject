import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Box, Typography, useTheme, Pagination } from '@mui/material';
import api from '../utils/api';
import { formatPKR } from '../utils/currency';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    sortBy: 'name'
  });
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);

  const theme = useTheme();

  const fetchProducts = async (pageNum = page) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', limit);
      if (filters.category) params.append('category', filters.category);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.sortBy) params.append('sort', filters.sortBy);
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
    // eslint-disable-next-line
  }, [page, filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.minPrice && product.pricePKR < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && product.pricePKR > parseFloat(filters.maxPrice)) return false;
    if (filters.condition && product.condition !== filters.condition) return false;
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.pricePKR - b.pricePKR;
      case 'price-high':
        return b.pricePKR - a.pricePKR;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading products...</p>
          </div>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Error Loading Products</h2>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
          </div>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
        <Typography variant="h3" fontWeight={700} mb={6} color="text.primary">Explore Our Products</Typography>
        
        {error && <Typography color="error">{error}</Typography>}
        
        {/* Filters */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 6, mb: 8 }}>
          <Typography variant="h5" fontWeight={600} mb={4}>Filters</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', md: 'repeat(5, 1fr)', gap: 4 }}>
            {/* Category Filter */}
            <Box>
              <Typography fontSize={14} fontWeight={500} mb={1} color="text.secondary">Category</Typography>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                style={{ width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 8, padding: '8px 12px', background: theme.palette.background.paper, color: theme.palette.text.primary }}
              >
                <option value="">All Categories</option>
                <option value="Dogs">Dogs</option>
                <option value="Cats">Cats</option>
                <option value="Other">Other</option>
                <option value="Birds">Birds</option>
                <option value="Fish">Fish</option>
              </select>
            </Box>
            {/* Min Price Filter */}
            <Box>
              <Typography fontSize={14} fontWeight={500} mb={1} color="text.secondary">Min Price</Typography>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min"
                style={{ width: '100%', border: `1px solid ${theme.palette.divider}`, borderRadius: 8, padding: '8px 12px', background: theme.palette.background.paper, color: theme.palette.text.primary }}
              />
            </Box>
            {/* Add other filters as needed */}
          </Box>
        </Box>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {products.length} of {total} products
          </p>
        </div>
        {/* Pagination Controls */}
        {total > limit && (
          <Box display="flex" justifyContent="center" my={4}>
            <Pagination
              count={Math.ceil(total / limit)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-400 dark:text-gray-500 mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No products found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Try adjusting your filters to find what you're looking for.</p>
            <button
              onClick={() => setFilters({
                category: '',
                minPrice: '',
                maxPrice: '',
                condition: '',
                sortBy: 'name'
              })}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)', gap: 6 }}>
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Products; 