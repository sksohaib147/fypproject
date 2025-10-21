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
const sizeOptions = ['Small', 'Medium', 'Large'];
const genderOptions = ['Male', 'Female'];
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Distance', value: 'distance' },
  { label: 'Featured', value: 'featured' },
];

const AdoptionFilterBar = ({ onSearch }) => {
  const theme = useTheme();
  const [species, setSpecies] = useState('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState([0, 15]);
  const [size, setSize] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');

  const handleClear = () => {
    setSpecies('dog');
    setBreed('');
    setAge([0, 15]);
    setSize('');
    setGender('');
    setLocation('');
    setSort('newest');
    if (onSearch) onSearch({ species: 'dog', breed: '', age: [0, 15], size: '', gender: '', location: '', sort: 'newest' });
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ species, breed, age, size, gender, location, sort });
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
        {/* Age Range */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Min Age"
            type="number"
            size="small"
            value={age[0]}
            onChange={e => setAge([Number(e.target.value), age[1]])}
            inputProps={{ min: 0, max: age[1], style: { width: 50 } }}
            sx={{ maxWidth: 90 }}
          />
          <Typography variant="body2" color="text.secondary">-</Typography>
          <TextField
            label="Max Age"
            type="number"
            size="small"
            value={age[1]}
            onChange={e => setAge([age[0], Number(e.target.value)])}
            inputProps={{ min: age[0], max: 20, style: { width: 50 } }}
            sx={{ maxWidth: 90 }}
          />
        </Stack>
        {/* Size */}
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="size-label">Size</InputLabel>
          <Select
            labelId="size-label"
            value={size}
            label="Size"
            onChange={e => setSize(e.target.value)}
          >
            <MenuItem value="">Any</MenuItem>
            {sizeOptions.map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Gender */}
        <ToggleButtonGroup
          value={gender}
          exclusive
          onChange={(_, val) => setGender(val)}
          size="small"
          aria-label="Gender"
          sx={{ minWidth: 120 }}
        >
          <ToggleButton value="Male" aria-label="Male">Male</ToggleButton>
          <ToggleButton value="Female" aria-label="Female">Female</ToggleButton>
        </ToggleButtonGroup>
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
          aria-label="Search pets"
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

export default AdoptionFilterBar; 