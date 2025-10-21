import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const sectionOptions = [
  { label: 'All', value: '' },
  { label: 'AdoptionHub', value: 'adoption' },
  { label: 'P&CMarketplace', value: 'marketplace' },
  { label: 'Dog Food', value: 'dogfood' },
  { label: 'Cat Food', value: 'catfood' },
  { label: 'Rabbit Food', value: 'rabbitfood' },
  { label: 'Toys', value: 'toys' },
  { label: 'Belts and Cages', value: 'beltsandcages' },
];

const breedOptions = {
  Dogs: [
    'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle',
    'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund',
  ],
  Cats: [
    'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'Bengal',
    'Sphynx', 'British Shorthair', 'Abyssinian', 'Scottish Fold', 'Birman',
  ],
  Rabbits: [
    'Holland Lop', 'Netherland Dwarf', 'Mini Rex', 'Lionhead', 'Flemish Giant',
    'English Lop', 'Dutch', 'Harlequin', 'Rex', 'Polish',
  ],
};

const AdvancedSearch = ({ onSearch, type = 'pets' }) => {
  const [showFilters, setShowFilters] = useState(type === 'global');
  const [filters, setFilters] = useState({
    section: '',
    category: '',
    breed: '',
    priceRange: { min: '', max: '' },
    location: '',
    condition: '',
    sortBy: 'newest',
    searchTerm: '',
  });
  const theme = useTheme();

  // Call onSearch on every input change (real-time)
  useEffect(() => {
    if (onSearch) onSearch(filters);
    // eslint-disable-next-line
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('price')) {
      const [field, bound] = name.split('.');
      setFilters(prev => ({
        ...prev,
        priceRange: {
          ...prev.priceRange,
          [bound]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: { min: '', max: '' },
      location: '',
      condition: '',
      sortBy: 'newest'
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Search Bar */}
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            placeholder="Search the entire website..."
            variant="outlined"
            value={filters.searchTerm}
            onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <IconButton
            onClick={() => setShowFilters(!showFilters)}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' }
            }}
            title={showFilters ? 'Hide Filters' : 'Add Filters'}
          >
            <FaFilter />
          </IconButton>
        </Box>
        {/* Section Filter */}
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Section</InputLabel>
            <Select
              name="section"
              value={filters.section}
              onChange={e => setFilters(prev => ({ ...prev, section: e.target.value }))}
              label="Section"
            >
              {sectionOptions.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            mt: 2
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>Filters</Typography>
              <Button
                onClick={clearFilters}
                sx={{ 
                  color: 'error.main', 
                  fontSize: 14,
                  '&:hover': { color: 'error.dark' }
                }}
              >
                Clear All
              </Button>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
              {/* Show/hide filters based on section */}
              {/* Category Filter (only Dogs, Cats, Rabbits) */}
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={filters.category}
                    onChange={e => setFilters(prev => ({ ...prev, category: e.target.value, breed: '' }))}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    <MenuItem value="Dogs">Dogs</MenuItem>
                    <MenuItem value="Cats">Cats</MenuItem>
                    <MenuItem value="Rabbits">Rabbits</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              {/* Breed Filter (only show if category is selected) */}
              {filters.category && breedOptions[filters.category] && (
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>Breed</InputLabel>
                    <Select
                      name="breed"
                      value={filters.breed}
                      onChange={handleFilterChange}
                      label="Breed"
                    >
                      <MenuItem value="">All Breeds</MenuItem>
                      {breedOptions[filters.category].map(breed => (
                        <MenuItem key={breed} value={breed}>{breed}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              {/* Price Range */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                  Price Range (USD)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    type="number"
                    name="price.min"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={handleFilterChange}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    type="number"
                    name="price.max"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={handleFilterChange}
                    size="small"
                    fullWidth
                  />
                </Box>
              </Box>
              {/* Location */}
              <Box>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  size="small"
                />
              </Box>
              {/* Condition (show for marketplace/food/toys) */}
              {(filters.section === 'marketplace' || filters.section === 'dogfood' || filters.section === 'catfood' || filters.section === 'toys' || filters.section === 'beltsandcages') && (
                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel>Condition</InputLabel>
                    <Select
                      name="condition"
                      value={filters.condition}
                      onChange={handleFilterChange}
                      label="Condition"
                    >
                      <MenuItem value="">All Conditions</MenuItem>
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Like New">Like New</MenuItem>
                      <MenuItem value="Good">Good</MenuItem>
                      <MenuItem value="Fair">Fair</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
              {/* Sort By */}
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    label="Sort By"
                  >
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="price_asc">Price: Low to High</MenuItem>
                    <MenuItem value="price_desc">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Highest Rated</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdvancedSearch; 