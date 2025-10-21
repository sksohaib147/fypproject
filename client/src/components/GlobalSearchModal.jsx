import React, { useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AdvancedSearch from './AdvancedSearch';
import SearchResults from './SearchResults';
import { Box, Button } from '@mui/material';
import api from '../utils/api';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const GlobalSearchModal = ({ open, onClose, onSubmitSearch }) => {
  const [filters, setFilters] = useState({});

  // Handler for AdvancedSearch changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handler for submit (e.g., Enter key or button)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitSearch) onSubmitSearch(filters);
    if (onClose) onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 5 }}>
        Global Search
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ minWidth: { xs: 320, sm: 500, md: 700 }, p: { xs: 1, sm: 3 } }}>
        <form onSubmit={handleSubmit}>
          <AdvancedSearch onSearch={handleFilterChange} type="global" />
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Button type="submit" variant="contained" color="primary">
              Search
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearchModal; 