import React, { useState } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Typography,
  IconButton,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import SearchIcon from '@mui/icons-material/Search';

const speciesOptions = [
  { label: 'Dog', value: 'dog' },
  { label: 'Cat', value: 'cat' },
  { label: 'Rabbit', value: 'rabbit' },
];
const breedOptions = {
  dog: ['Labrador', 'Poodle', 'Bulldog'],
  cat: ['Siamese', 'Persian', 'Maine Coon'],
  rabbit: ['Lionhead', 'Dutch', 'Flemish Giant'],
};
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
];

const MarketplaceFilterBar = ({ onSearch }) => {
  const theme = useTheme();
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');

  const handleClear = () => {
    setSpecies('dog');
    setBreed('');
    setMinPrice('');
    setMaxPrice('');
    setLocation('');
    setSort('newest');
    if (onSearch) onSearch({ species: 'dog', breed: '', minPrice: '', maxPrice: '', location: '', sort: 'newest' });
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ species, breed, minPrice, maxPrice, location, sort });
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        mb: 2,
        bgcolor: 'background.paper',
        boxShadow: theme.palette.mode === 'dark' ? 4 : 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'flex-end', xs: 'stretch' }}
        useFlexGap
        flexWrap="wrap"
      >
        {/* Species */}
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="species-label">Species</InputLabel>
          <Select
            labelId="species-label"
            value={species}
            label="Species"
            onChange={e => { setSpecies(e.target.value); setBreed(''); }}
          >
            {speciesOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Breed */}
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="breed-label">Breed</InputLabel>
          <Select
            labelId="breed-label"
            value={breed}
            label="Breed"
            onChange={e => setBreed(e.target.value)}
          >
            <MenuItem value="">Any</MenuItem>
            {breedOptions[species].map(b => (
              <MenuItem key={b} value={b}>{b}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Min Price */}
        <TextField
          label="Min Price"
          type="number"
          size="small"
          value={minPrice}
          onChange={e => setMinPrice(e.target.value)}
          inputProps={{ min: 0, style: { width: 80 } }}
          sx={{ maxWidth: 120 }}
        />
        {/* Max Price */}
        <TextField
          label="Max Price"
          type="number"
          size="small"
          value={maxPrice}
          onChange={e => setMaxPrice(e.target.value)}
          inputProps={{ min: 0, style: { width: 80 } }}
          sx={{ maxWidth: 120 }}
        />
        {/* Location */}
        <TextField
          label="Location"
          size="small"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="City or ZIP"
          sx={{ minWidth: 120 }}
        />
        {/* Search Icon Button */}
        <IconButton
          color="primary"
          aria-label="Search listings"
          onClick={handleSearch}
          sx={{ minWidth: 48, minHeight: 40, alignSelf: { xs: 'stretch', md: 'center' } }}
        >
          <SearchIcon />
        </IconButton>
        {/* Sort By */}
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            value={sort}
            label="Sort By"
            onChange={e => setSort(e.target.value)}
          >
            {sortOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Clear All Filters Button */}
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ClearAllIcon />}
          onClick={handleClear}
          sx={{ minWidth: 120, fontWeight: 600, alignSelf: { xs: 'stretch', md: 'center' }, whiteSpace: 'nowrap' }}
        >
          Clear All Filters
        </Button>
      </Stack>
    </Paper>
  );
};

export default MarketplaceFilterBar; 