import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaUser, FaBars, FaTimes, FaSun, FaMoon, FaSearch, FaCog } from 'react-icons/fa';
import paw from '../assets/paw.svg'; // Place your paw SVG in src/assets/paw.svg
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material';
import GlobalSearchModal from './GlobalSearchModal';

function MenuProfile() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  return (
    <>
      <IconButton
        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        title="Profile"
        onClick={handleOpen}
      >
        <FaUser size={18} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => { handleClose(); navigate('/login'); }}>Login</MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate('/signup'); }}>Sign Up</MenuItem>
      </Menu>
    </>
  );
}

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState(null); // For future extensibility
  const [searchOpen, setSearchOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Box component="nav" sx={{ width: '100%', bgcolor: 'background.paper', color: 'text.primary', boxShadow: 1, position: 'sticky', top: 0, zIndex: 50, transition: 'background-color 0.3s' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <img src={paw} alt="Paws and Claws" style={{ height: 40, width: 'auto', marginRight: 8 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5, color: 'text.primary' }}>
                Paws and Claws Marketplace
              </Typography>
            </Link>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Typography
                sx={{
                  color: location.pathname === '/' ? 'primary.main' : 'text.secondary',
                  fontWeight: 500,
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 0.2s'
                }}
              >
                Home
              </Typography>
            </Link>
            <Link to="/adoption" style={{ textDecoration: 'none' }}>
              <Typography
                sx={{
                  color: location.pathname === '/adoption' ? 'primary.main' : 'text.secondary',
                  fontWeight: 500,
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 0.2s'
                }}
              >
                AdoptionHub
              </Typography>
            </Link>
            <Link to="/pcmarketplace" style={{ textDecoration: 'none' }}>
              <Typography
                sx={{
                  color: location.pathname === '/pcmarketplace' ? 'primary.main' : 'text.secondary',
                  fontWeight: 500,
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 0.2s'
                }}
              >
                P&CMarketplace
              </Typography>
            </Link>
            <Link to="/about" style={{ textDecoration: 'none' }}>
              <Typography
                sx={{
                  color: location.pathname === '/about' ? 'primary.main' : 'text.secondary',
                  fontWeight: 500,
                  '&:hover': { color: 'primary.main' },
                  transition: 'color 0.2s'
                }}
              >
                About
              </Typography>
            </Link>
          </Box>

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Search Icon */}
            <IconButton
              onClick={() => setSearchOpen(true)}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              title="Search"
            >
              <FaSearch size={18} />
            </IconButton>
            {/* Dark Mode Toggle */}
            <IconButton
              onClick={toggleDarkMode}
              sx={{ 
                p: 1, 
                borderRadius: 2, 
                bgcolor: 'action.hover', 
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.selected' }
              }}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
            </IconButton>

            {/* Wishlist */}
            {user && (
              <Link to="/wishlist" style={{ textDecoration: 'none' }}>
                <IconButton sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                  <FaHeart size={18} />
                </IconButton>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" style={{ textDecoration: 'none' }}>
              <IconButton sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              <FaShoppingCart size={18} />
              </IconButton>
            </Link>

            {/* User Menu */}
            {/* Desktop only: show profile icon or menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {user ? (
                <Link to="/profile" style={{ textDecoration: 'none' }}>
              <IconButton
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                title="Profile"
              >
                <FaUser size={18} />
              </IconButton>
                </Link>
              ) : (
                <MenuProfile />
              )}
            </Box>
            {/* Remove the always-visible (xs) profile icon/menu here */}

            {(user && (user.role === 'admin' || localStorage.getItem('isAdmin') === 'true')) && (
              <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
                <IconButton sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }} title="Admin Dashboard">
                  <FaCog size={18} />
                </IconButton>
              </Link>
            )}

            {/* Mobile menu button */}
            <IconButton
              onClick={toggleMobileMenu}
              sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </IconButton>
          </Box>
        </Box>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <Box sx={{ 
            display: { xs: 'block', md: 'none' }, 
            borderTop: 1, 
            borderColor: 'divider', 
            py: 2 
          }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link to="/" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                <Typography sx={{ color: location.pathname === '/' ? 'primary.main' : 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                  Home
                </Typography>
              </Link>
              <Link to="/adoption" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                <Typography sx={{ color: location.pathname === '/adoption' ? 'primary.main' : 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                  AdoptionHub
                </Typography>
              </Link>
              <Link to="/pcmarketplace" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                <Typography sx={{ color: location.pathname === '/pcmarketplace' ? 'primary.main' : 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                P&CMarketplace
                </Typography>
              </Link>
              <Link to="/about" style={{ textDecoration: 'none' }} onClick={() => setIsMobileMenuOpen(false)}>
                <Typography sx={{ color: location.pathname === '/about' ? 'primary.main' : 'text.secondary', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                About
                </Typography>
              </Link>
              {/* Remove profile icon/MenuProfile from here */}
            </Box>
          </Box>
        )}
      </Box>
      {/* Global Search Modal */}
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onSubmitSearch={(filters) => {
        // Build query params and navigate
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
        setSearchOpen(false);
        navigate(`/search?${queryParams.toString()}`);
      }} />
    </Box>
  );
};

export default Navbar; 