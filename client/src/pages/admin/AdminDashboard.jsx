import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  CssBaseline,
  Divider,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tooltip,
  Chip,
  Avatar,
  IconButton,
  CardMedia,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HistoryIcon from '@mui/icons-material/History';
import BlockIcon from '@mui/icons-material/Block';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { formatPKR } from '../../utils/currency';
import { getImageUrl } from '../../utils/api';

const drawerWidth = 240;

const sections = [
  { key: 'users', label: 'Users', icon: <PeopleIcon /> },
  { key: 'listings', label: 'Listings', icon: <ListAltIcon /> },
  { key: 'pending', label: 'Product Ads', icon: <AssignmentIcon /> },
  { key: 'orders', label: 'Orders & Cashouts', icon: <MonetizationOnIcon /> },
  { key: 'activity', label: 'User Activity', icon: <HistoryIcon /> },
];

const PRODUCT_CATEGORIES = [
  'Dogs',
  'Cats',
  'Other',
  'Birds',
  'Fish',
  'Rabbit Food',
  'Toys',
  'Belts and Cages',
];

const ModernNavbar = ({ activeSection, setActiveSection, user, avatarVersion, navigate }) => (
  <Box sx={{
    width: '100%',
    bgcolor: 'background.paper',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 3,
    py: 0,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
    background: 'linear-gradient(90deg, #ff6f61 0%, #ffb88c 100%)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <IconButton color="inherit" onClick={() => navigate('/')}> <HomeIcon /> </IconButton>
      <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, letterSpacing: 1, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <span style={{ fontWeight: 900, letterSpacing: 2 }}>Admin Dashboard</span>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 4 }}>
        {sections.map((section) => (
          <Button
            key={section.key}
            startIcon={section.icon}
            onClick={() => setActiveSection(section.key)}
            sx={{
              color: activeSection === section.key ? '#fff' : 'rgba(255,255,255,0.7)',
              fontWeight: activeSection === section.key ? 700 : 500,
              fontSize: 16,
              px: 2,
              py: 1,
              borderRadius: 2,
              background: activeSection === section.key ? 'rgba(255,255,255,0.18)' : 'transparent',
              boxShadow: activeSection === section.key ? 2 : 0,
              transition: 'background 0.2s, color 0.2s',
              '&:hover': { background: 'rgba(255,255,255,0.12)', color: '#fff' },
            }}
          >
            {section.label}
          </Button>
        ))}
      </Box>
    </Box>
    <IconButton onClick={() => navigate('/admin/profile')} sx={{ ml: 2 }}>
      <Avatar src={user?.avatar ? user.avatar + '?v=' + avatarVersion : undefined} sx={{ bgcolor: 'primary.main', color: 'white' }}>{(user?.username?.[0] || 'A').toUpperCase()}</Avatar>
    </IconButton>
  </Box>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('users');
  const [productListings, setProductListings] = useState([]);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [statusMenuId, setStatusMenuId] = useState(null);
  const [pendingAds, setPendingAds] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [avatarVersion, setAvatarVersion] = useState(Date.now());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [listingsRefreshKey, setListingsRefreshKey] = useState(0);

  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      // Admin should see ALL products regardless of status
      const allProductsRes = await api.get('/admin/products');
      const allProducts = allProductsRes.data || [];
      const filtered = allProducts.filter(p => PRODUCT_CATEGORIES.includes(p.category || ''));
      setProductListings(filtered);
    } catch (err) {
      setProductListings([]);
    }
  }, []);

  const fetchPendingAds = useCallback(async () => {
    try {
      console.log('Fetching pending ads...'); // Debug log
      
      // Test image URL accessibility
      const testImageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/image-1752769481595.jpg`;
      console.log('Testing image URL:', testImageUrl);
      
      try {
        const testResponse = await fetch(testImageUrl);
        console.log('Test image response status:', testResponse.status);
        console.log('Test image response headers:', testResponse.headers);
      } catch (testError) {
        console.error('Test image fetch failed:', testError);
      }
      
      // Fetch all listings (marketplace and adoption) using the new endpoint
      const listingsRes = await api.get('/admin/listings');
      console.log('Listings response:', listingsRes); // Debug log
      const listingsData = listingsRes.data || [];
      
      const formattedListings = listingsData.map(item => {
        console.log('Processing item:', item); // Debug individual items
        console.log('Item photos:', item.photos); // Debug photos
        console.log('Item images:', item.images); // Debug images
        console.log('Item photos type:', typeof item.photos); // Debug photos type
        console.log('Item images type:', typeof item.images); // Debug images type
        console.log('Item photos length:', item.photos ? item.photos.length : 0); // Debug photos length
        console.log('Item images length:', item.images ? item.images.length : 0); // Debug images length
        
        if (item.species) {
          // This is an adoption
          const formattedItem = {
            ...item,
            id: item._id,
            title: `${item.species} - ${item.breed}` || 'Adoption',
            type: 'adoption',
            name: `${item.species} - ${item.breed}`,
            description: item.description,
            price: null,
            images: item.photos || []
          };
          console.log('Formatted adoption item:', formattedItem); // Debug formatted item
          return formattedItem;
        } else {
          // This is a product
          const formattedItem = {
            ...item,
            id: item._id,
            title: item.name,
            type: 'product',
            images: item.images || []
          };
          console.log('Formatted product item:', formattedItem); // Debug formatted item
          return formattedItem;
        }
      });
      
      console.log('Formatted listings:', formattedListings); // Debug log
      setPendingAds(formattedListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setPendingAds([]);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      const ordersData = res.data?.data || res.data || [];
      setOrders(ordersData);
    } catch (err) {
      setOrders([]);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchProducts();
  }, [user, fetchProducts, listingsRefreshKey]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchPendingAds();
  }, [user, fetchPendingAds]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchOrders();
  }, [user, fetchOrders]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchUsers();
  }, [user, fetchUsers]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchUser = async () => {
      try {
        const currentUser = await api.get('/users/me');
        // setUser(currentUser); // This line is removed as per the edit hint
      } catch (err) {
        // setUser(null); // This line is removed as per the edit hint
      }
    };
    fetchUser();
  }, [user]);

  const handleBanUser = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/suspend`);
      // Refresh users after successful operation
      await fetchUsers();
    } catch (err) {
      console.error('Error banning user:', err);
    }
  };
  const handleUnbanUser = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/suspend`);
      // Refresh users after successful operation
      await fetchUsers();
    } catch (err) {
      console.error('Error unbanning user:', err);
    }
  };

  const handleStatusMenuOpen = (event, id) => {
    setStatusAnchorEl(event.currentTarget);
    setStatusMenuId(id);
  };
  const handleStatusMenuClose = () => {
    setStatusAnchorEl(null);
    setStatusMenuId(null);
  };
  const handleStatusChange = async (listing, newStatus) => {
    try {
      if (newStatus === 'outofstock') {
        // For out of stock, set stock to 0
        await api.put(`/admin/products/${listing._id}`, { stock: 0 });
      } else {
        // For status changes, use the admin route
        const updateData = { status: newStatus };
        // If marking as available and item is out of stock, restore stock to 1
        if (newStatus === 'available' && listing.stock === 0) {
          updateData.stock = 1;
        }
        await api.put(`/admin/products/${listing._id}`, updateData);
      }
      // Refresh the data after successful update
      await fetchProducts();
      handleStatusMenuClose();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleApproveAd = async (ad) => {
    try {
      if (ad.type === 'adoption') {
        await api.put(`/admin/adoptions/${ad.id}/approve`, { approved: true });
      } else {
        await api.put(`/admin/products/${ad.id}/approve`, { approved: true });
      }
      // Refresh data after successful operation
      await fetchProducts();
      await fetchPendingAds();
    } catch (err) {
      console.error('Error approving ad:', err);
    }
  };
  const handleDisapproveAd = async (ad) => {
    try {
      if (ad.type === 'adoption') {
        await api.put(`/admin/adoptions/${ad.id}/approve`, { approved: false });
      } else {
        await api.put(`/admin/products/${ad.id}/approve`, { approved: false });
      }
      // Refresh data after successful operation  
      await fetchProducts();
      await fetchPendingAds();
    } catch (err) {
      console.error('Error disapproving ad:', err);
    }
  };

  const handleDeleteAd = async (ad) => {
    try {
      if (ad.type === 'adoption') {
        await api.delete(`/admin/adoptions/${ad.id}`);
      } else {
        await api.delete(`/admin/products/${ad.id}`);
      }
      // Refresh data after successful operation  
      await fetchProducts();
      await fetchPendingAds();
    } catch (err) {
      console.error('Error deleting ad:', err);
    }
  };

  const handleConfirmOrder = async (order) => {
    try {
      console.log('Confirming order:', order._id);
      const response = await api.patch(`/orders/${order._id}/status`, { status: 'confirmed' });
      console.log('Order confirmed successfully:', response);
      // Refresh data after successful operation
      await fetchOrders();
    } catch (err) {
      console.error('Error confirming order:', err);
      alert('Error confirming order: ' + (err.message || 'Unknown error'));
    }
  };
  
  const handleRejectOrder = async (order) => {
    try {
      console.log('Rejecting order:', order._id);
      const response = await api.patch(`/orders/${order._id}/status`, { status: 'cancelled' });
      console.log('Order rejected successfully:', response);
      // Refresh data after successful operation
      await fetchOrders();
    } catch (err) {
      console.error('Error rejecting order:', err);
      alert('Error rejecting order: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDeleteListing = async () => {
    if (!listingToDelete) return;
    try {
      // Use the correct admin endpoint
      await api.delete(`/admin/products/${listingToDelete._id}`);
      // Refresh the data after successful delete
      await fetchProducts();
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    } catch (err) {
      console.error('Error deleting listing:', err);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      console.log('Updating quantity for product:', productId, 'to:', newQuantity);
      const response = await api.put(`/admin/products/${productId}`, { stock: newQuantity });
      console.log('Quantity updated successfully:', response);
      // Refresh the products data
      await fetchProducts();
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Error updating quantity: ' + (err.message || 'Unknown error'));
    }
  };

  const handleIncreaseQuantity = async (product) => {
    const newQuantity = (product.stock || 0) + 1;
    await handleUpdateQuantity(product._id, newQuantity);
  };

  const handleDecreaseQuantity = async (product) => {
    const newQuantity = Math.max(0, (product.stock || 0) - 1);
    await handleUpdateQuantity(product._id, newQuantity);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'users':
    return (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
            <Typography variant="h5" mb={2} fontWeight={700} color="primary.main">User Management</Typography>
            <TableContainer component={Box} sx={{ borderRadius: 3, boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>Profile</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u._id} hover sx={{ transition: 'background 0.2s' }}>
                      <TableCell>
                        <Avatar src={u.avatar ? u.avatar + '?v=' + avatarVersion : undefined} alt={u.name} sx={{ bgcolor: 'primary.main' }}>
                          {(u.name ? u.name.split(' ').map(n => n[0]).join('') : (u.firstName ? u.firstName[0] : '') + (u.lastName ? u.lastName[0] : '')).toUpperCase()}
                        </Avatar>
                      </TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={u.role} color={u.role === 'admin' ? 'primary' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>{u.joinedAt}</TableCell>
                      <TableCell align="center">
                        {u.isSuspended ? (
                          <>
                            <Chip label="Suspended" color="error" size="small" sx={{ mr: 1 }} />
                            <Tooltip title="Unsuspend User">
                              <span>
                                <IconButton color="success" onClick={() => handleUnbanUser(u)}>
                                  <BlockIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Suspend User">
                            <span>
                              <IconButton color="error" onClick={() => handleBanUser(u)} disabled={u.role === 'admin'}>
                                <BlockIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      case 'listings':
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
      <Typography variant="h5" mb={2} fontWeight={700} color="primary.main">Pending Listings for Review</Typography>
      <TableContainer component={Box} sx={{ borderRadius: 3, boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell>Images</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingAds.map(ad => (
              <TableRow key={ad.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {ad.images && ad.images.length > 0 ? ad.images.slice(0, 3).map((img, idx) => {
                      const imageUrl = getImageUrl(img);
                      
                      console.log('Image URL constructed:', imageUrl); // Debug log
                      console.log('Original image data:', img); // Debug original data
                      
                      return (
                        <CardMedia 
                          key={idx} 
                          component="img" 
                          sx={{ width: 40, height: 40, borderRadius: 1 }} 
                          image={imageUrl}
                          alt={ad.name || ad.title} 
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.error('Image failed to load:', imageUrl);
                            console.error('Error details:', e);
                            e.target.src = '/placeholder.svg';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', imageUrl);
                          }}
                        />
                      );
                    }) : (
                      <Typography variant="caption" color="text.secondary">No images</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{ad.name || ad.title || 'No Title'}</TableCell>
                <TableCell>{ad.description}</TableCell>
                <TableCell>{ad.price ? `PKR ${formatPKR(ad.price)}` : '-'}</TableCell>
                <TableCell>
                  <Chip 
                    label={ad.status || 'pending'} 
                    color={ad.status === 'pending' ? 'warning' : ad.status === 'available' ? 'success' : 'error'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={ad.type === 'adoption' ? 'AdoptionHub' : (ad.source === 'marketplace' ? 'P&CMarketplace' : ad.source === 'category' ? ad.category || 'Product Category' : ad.source || 'Unknown')} 
                    color={ad.type === 'adoption' ? 'primary' : 'secondary'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={e => handleStatusMenuOpen(e, ad.id)}><MoreVertIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDeleteAd(ad)}><DeleteIcon /></IconButton>
                  <Menu anchorEl={statusAnchorEl} open={statusMenuId === ad.id} onClose={handleStatusMenuClose}>
                    <MenuItem onClick={() => handleApproveAd(ad)}>Approve</MenuItem>
                    <MenuItem onClick={() => handleDisapproveAd(ad)}>Disapprove</MenuItem>
                    <MenuItem onClick={() => handleDeleteAd(ad)}>Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
      case 'pending':
        // 1. Product Ads tab: Show all product category listings regardless of status
        const allProductAds = productListings; // No status filter
        return (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
            <Typography variant="h5" mb={2} fontWeight={700} color="primary.main">Product Ads</Typography>
            <TableContainer component={Box} sx={{ borderRadius: 3, boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>Images</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allProductAds.map(ad => (
                    <TableRow key={ad._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {ad.images.map((img, idx) => (
                            <CardMedia 
                              key={idx} 
                              component="img" 
                              sx={{ width: 40, height: 40, borderRadius: 1 }} 
                              image={getImageUrl(img)} 
                              alt={ad.name || ad.title} 
                              crossOrigin="anonymous"
                              onError={(e) => {
                                console.error('Image failed to load:', getImageUrl(img));
                                e.target.src = '/placeholder.svg';
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{ad.name || ad.title || 'No Title'}</TableCell>
                      <TableCell>{ad.description}</TableCell>
                      <TableCell>{ad.pricePKR ? `PKR ${formatPKR(ad.pricePKR)}` : '-'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDecreaseQuantity(ad)}
                            disabled={ad.stock <= 0}
                            sx={{ 
                              minWidth: '32px', 
                              height: '32px',
                              '&:hover': {
                                backgroundColor: 'error.light'
                              }
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              minWidth: '40px', 
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color: ad.stock === 0 ? 'error.main' : 'text.primary'
                            }}
                          >
                            {ad.stock || 0}
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => handleIncreaseQuantity(ad)}
                            sx={{ 
                              minWidth: '32px', 
                              height: '32px',
                              '&:hover': {
                                backgroundColor: 'success.light'
                              }
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ad.stock === 0 ? 'Out of Stock' : ad.status} 
                          color={ad.stock === 0 ? 'default' : ad.status === 'pending' ? 'warning' : ad.status === 'available' ? 'success' : ad.status === 'sold' ? 'error' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ad.category || 'Unknown Category'} 
                          color="secondary" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={e => handleStatusMenuOpen(e, ad._id)}><MoreVertIcon /></IconButton>
                        <IconButton color="error" onClick={() => { setListingToDelete(ad); setDeleteDialogOpen(true); }}><DeleteIcon /></IconButton>
                        <Menu anchorEl={statusAnchorEl} open={statusMenuId === ad._id} onClose={handleStatusMenuClose}>
                          <MenuItem onClick={() => handleStatusChange(ad, 'available')}>Mark as Available</MenuItem>
                          <MenuItem onClick={() => handleStatusChange(ad, 'outofstock')}>Mark as Out of Stock</MenuItem>
                          <MenuItem onClick={() => handleStatusChange(ad, 'sold')}>Mark as Sold</MenuItem>
                          <MenuItem onClick={() => handleStatusChange(ad, 'pending')}>Mark as Pending</MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DialogTitle>Delete Listing</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this listing? This action cannot be undone.</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleDeleteListing} color="error" variant="contained">Delete</Button>
              </DialogActions>
            </Dialog>
          </Paper>
        );
      case 'orders':
        return (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
            <Typography variant="h5" mb={2} fontWeight={700} color="primary.main">Orders & Cashouts</Typography>
            <TableContainer component={Box} sx={{ borderRadius: 3, boxShadow: 1, maxHeight: '70vh', overflow: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ minWidth: 100, fontWeight: 'bold', fontSize: '0.875rem' }}>User</TableCell>
                    <TableCell sx={{ minWidth: 140, fontWeight: 'bold', fontSize: '0.875rem' }}>Email</TableCell>
                    <TableCell sx={{ minWidth: 100, fontWeight: 'bold', fontSize: '0.875rem' }}>Phone</TableCell>
                    <TableCell sx={{ minWidth: 80, fontWeight: 'bold', fontSize: '0.875rem' }}>Address</TableCell>
                    <TableCell sx={{ minWidth: 70, fontWeight: 'bold', fontSize: '0.875rem' }}>City</TableCell>
                    <TableCell sx={{ minWidth: 80, fontWeight: 'bold', fontSize: '0.875rem' }}>Province</TableCell>
                    <TableCell sx={{ minWidth: 180, fontWeight: 'bold', fontSize: '0.875rem' }}>Products</TableCell>
                    <TableCell sx={{ minWidth: 90, fontWeight: 'bold', fontSize: '0.875rem' }}>Amount</TableCell>
                    <TableCell sx={{ minWidth: 100, fontWeight: 'bold', fontSize: '0.875rem' }}>Method</TableCell>
                    <TableCell sx={{ minWidth: 80, fontWeight: 'bold', fontSize: '0.875rem' }}>Status</TableCell>
                    <TableCell sx={{ minWidth: 120, fontWeight: 'bold', fontSize: '0.875rem' }}>Transaction ID</TableCell>
                    <TableCell align="center" sx={{ minWidth: 120, fontWeight: 'bold', fontSize: '0.875rem' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(o => (
                    <TableRow key={o._id || o.id} hover>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{o.user?.firstName} {o.user?.lastName}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word', fontSize: '0.875rem' }}>{o.user?.email}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{o.user?.phone}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word', fontSize: '0.875rem', maxWidth: 80 }}>{o.shippingAddress?.street || o.user?.address || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{o.shippingAddress?.city || 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{o.shippingAddress?.state || 'N/A'}</TableCell>
                      <TableCell sx={{ wordBreak: 'break-word', maxWidth: 180, fontSize: '0.875rem' }}>
                        {o.products?.map(item => item.product?.name).filter(Boolean).join(', ') || 
                         o.pets?.map(item => item.pet?.name).filter(Boolean).join(', ') || 
                         'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>PKR {formatPKR(o.amount || o.totalAmount)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            o.paymentMethod === 'easypaisa' ? 'EasyPaisa' : 
                            o.paymentMethod === 'jazzcash' ? 'JazzCash' : 
                            o.paymentMethod === 'cashondelivery' ? 'Cash on Delivery' : 
                            o.paymentMethod === 'stripe' ? 'Stripe' : 
                            o.paymentMethod === 'paypal' ? 'PayPal' : 
                            o.paymentMethod === 'cash' ? 'Cash' : 
                            o.paymentMethod || 'Unknown'
                          }
                          color={
                            o.paymentMethod === 'easypaisa' ? 'primary' :
                            o.paymentMethod === 'jazzcash' ? 'secondary' :
                            o.paymentMethod === 'cashondelivery' ? 'default' :
                            'default'
                          }
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={o.status} 
                          color={
                            o.status === 'pending' ? 'warning' : 
                            o.status === 'confirmed' ? 'success' : 
                            o.status === 'cancelled' ? 'error' : 
                            o.status === 'paid' ? 'info' :
                            o.status === 'shipped' ? 'primary' :
                            o.status === 'delivered' ? 'success' :
                            o.status === 'refunded' ? 'secondary' :
                            'default'
                          } 
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {o.paymentMethod === 'cashondelivery' ? 'N/A' : (o.transactionId || 'N/A')}
                      </TableCell>
                      <TableCell align="center">
                        {o.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button 
                              color="success" 
                              variant="contained" 
                              size="small" 
                              sx={{ 
                                minWidth: '70px',
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: 2,
                                fontSize: '0.75rem',
                                '&:hover': {
                                  boxShadow: 4
                                }
                              }} 
                              onClick={() => handleConfirmOrder(o)}
                            >
                              Confirm
                            </Button>
                            <Button 
                              color="error" 
                              variant="outlined" 
                              size="small" 
                              sx={{ 
                                minWidth: '70px',
                                fontWeight: 600,
                                textTransform: 'none',
                                borderWidth: 2,
                                fontSize: '0.75rem',
                                '&:hover': {
                                  borderWidth: 2,
                                  backgroundColor: 'error.main',
                                  color: 'white'
                                }
                              }} 
                              onClick={() => handleRejectOrder(o)}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      case 'activity':
        return (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', boxShadow: 3 }}>
            <Typography variant="h5" mb={2} fontWeight={700} color="primary.main">User Activity</Typography>
            <TableContainer component={Box} sx={{ borderRadius: 3, boxShadow: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Detail</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Mock activity data removed */}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      {/* 2. Modern navbar redesign */}
      {/* Replace Drawer and AppBar with a horizontal top navigation bar */}
      <ModernNavbar activeSection={activeSection} setActiveSection={setActiveSection} user={user} avatarVersion={avatarVersion} navigate={navigate} />
      {/* Remove Drawer and AppBar, insert new Navbar at the top */}
      {/* ... (navbar code will be inserted here, see below for details) ... */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 }, mt: 0, pt: '80px', bgcolor: 'background.default', minHeight: '100vh', overflowX: 'hidden' }}>
        {renderSection()}
      </Box>
    </Box>
  );
};

export default AdminDashboard; 