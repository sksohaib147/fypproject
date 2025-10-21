import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Avatar,
  TextField,
  Divider,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  useTheme,
  Chip,
  Pagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import api, { uploadImage } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';
import { formatPKR } from '../utils/currency';
import { getImageUrl } from '../utils/api';

// Sidebar menu component (styled & interactive)
const AccountSidebar = ({ activeSection, setActiveSection }) => {
  const theme = useTheme();
  return (
    <Box sx={{ width: '100%', maxWidth: 280, mb: 8, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: 3 }}>
      <Box sx={{ fontSize: 13, mb: 2, color: 'text.secondary' }}>
        <Link to="/" style={{ color: theme.palette.text.secondary, textDecoration: 'underline' }}>Home</Link>
        <span style={{ margin: '0 4px', color: theme.palette.text.disabled }}>/</span>
        <span style={{ color: theme.palette.text.primary, fontWeight: 700 }}>My Account</span>
      </Box>
      <Box mb={4}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>Manage My Account</Typography>
        <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
          <Box
            component="li"
            sx={{
              color: activeSection === 'profile' ? 'primary.main' : 'text.secondary',
              fontWeight: activeSection === 'profile' ? 600 : 400,
              cursor: 'pointer',
              mb: 0.5,
              '&:hover': { color: 'primary.main' },
              transition: 'color 0.2s',
            }}
          onClick={() => setActiveSection('profile')}
        >
          My Profile
          </Box>
          <Box
            component="li"
            sx={{
              color: activeSection === 'listings' ? 'primary.main' : 'text.secondary',
              fontWeight: activeSection === 'listings' ? 600 : 400,
              cursor: 'pointer',
              mb: 0.5,
              '&:hover': { color: 'primary.main' },
              transition: 'color 0.2s',
            }}
            onClick={() => setActiveSection('listings')}
          >
            My Active Listings
          </Box>
        </Box>
      </Box>
      <Box mb={4}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>My Orders</Typography>
        <Box component="ul" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
          <Box component="li" sx={{ color: activeSection === 'returns' ? 'primary.main' : 'text.secondary', fontWeight: activeSection === 'returns' ? 600 : 400, cursor: 'pointer', mb: 0.5, '&:hover': { color: 'primary.main' } }} onClick={() => setActiveSection('returns')}>My Returns</Box>
          <Box component="li" sx={{ color: activeSection === 'cancellations' ? 'primary.main' : 'text.secondary', fontWeight: activeSection === 'cancellations' ? 600 : 400, cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={() => setActiveSection('cancellations')}>My Cancellations</Box>
        </Box>
      </Box>
    </Box>
  );
};

// Profile Edit Form (controlled, styled)
const ProfileEditForm = () => {
  const theme = useTheme();
  const { user, loading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [newAvatar, setNewAvatar] = useState(null);
  const [preview, setPreview] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        address: user.address || ''
      });
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Preview selected image
  useEffect(() => {
    if (!newAvatar) {
      setPreview('');
      return;
    }
    const objectUrl = URL.createObjectURL(newAvatar);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [newAvatar]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add handleAvatarChange for avatar file input
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatar(e.target.files[0]);
      setConfirmOpen(true);
    }
  };

  // Handle avatar upload and confirmation
  const handleConfirmAvatar = async () => {
    try {
      if (newAvatar) {
        const { url } = await uploadImage(newAvatar);
        setAvatar(url);
        setForm(prev => ({ ...prev, avatar: url }));
      }
    setNewAvatar(null);
    setPreview('');
    setConfirmOpen(false);
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  const handleCancelAvatar = () => {
    setNewAvatar(null);
    setPreview('');
    setConfirmOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const result = await updateProfile({ ...form, avatar });
      if (result.success) {
      setSuccess('Profile updated successfully!');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      const res = await api.delete('/users/me');
      if (!res.ok) throw new Error('Failed to delete account');
      logout();
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to delete account');
    }
  };

  // Remove loading and !user checks
  // if (loading) return <div className="text-center text-gray-500">Loading user...</div>;
  // if (!user) return <div className="text-center text-gray-500">Please log in to view your profile.</div>;

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: 2,
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        mt: 0,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'primary.main' }}>
        Edit Your Profile
      </Typography>
      {/* Profile Picture Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Avatar
          src={preview || avatar || ''}
          alt="Profile Picture"
          sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 32 }}
        >
          {(!preview && !avatar) ? (user?.firstName?.[0] || '') : ''}
        </Avatar>
        <label htmlFor="avatar-upload">
          <input
            accept="image/*"
            id="avatar-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
            {avatar ? 'Change Picture' : 'Upload Picture'}
          </Button>
        </label>
      </Box>
      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancelAvatar}>
        <DialogTitle>Confirm Profile Picture</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to update your profile picture?</DialogContentText>
          {preview && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Avatar src={preview} alt="New Profile" sx={{ width: 96, height: 96 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAvatar} color="secondary">Cancel</Button>
          <Button onClick={handleConfirmAvatar} color="primary" variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={6}>
          <TextField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
            size="small"
            variant="outlined"
          />
        </Grid>
      </Grid>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
          Password Changes
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Current Password"
              type="password"
              name="currentPassword"
              disabled
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="New Password"
              type="password"
              name="newPassword"
              disabled
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Confirm New Password"
              type="password"
              name="confirmNewPassword"
              disabled
              fullWidth
              size="small"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>
      {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
      {success && <Typography color="success.main" sx={{ mb: 1 }}>{success}</Typography>}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
        <Button variant="outlined" color="error" onClick={handleDeleteAccount}>
            Delete Account
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

// My Payment Options Form (styled)
const MyPaymentOptionsForm = () => {
  const { user, loading } = useAuth();
  const [form, setForm] = useState({
    cardholder: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    // Fetch current user's payment option
    const fetchPaymentOption = async () => {
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        const res = await api.get('/payment-options/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setForm({
              cardholder: data.cardholder || '',
              cardNumber: data.cardNumber || '',
              expiry: data.expiry || '',
              cvv: data.cvv || ''
            });
          }
        }
      } catch (err) {
        // ignore fetch error
      }
    };
    fetchPaymentOption();
  }, [user]);

  const validate = () => {
    const errors = {};
    // Cardholder: required, only letters and spaces
    if (!form.cardholder.trim()) {
      errors.cardholder = 'Cardholder name is required';
    } else if (!/^[A-Za-z ]+$/.test(form.cardholder.trim())) {
      errors.cardholder = 'Cardholder name must contain only letters and spaces';
    }
    // Card Number: required, 16 digits
    if (!form.cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(form.cardNumber.trim())) {
      errors.cardNumber = 'Card number must be 16 digits';
    }
    // Expiry: required, MM/YY, not in the past
    if (!form.expiry.trim()) {
      errors.expiry = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(form.expiry.trim())) {
      errors.expiry = 'Expiry must be in MM/YY format';
    } else {
      // Check not in the past
      const [mm, yy] = form.expiry.split('/');
      const now = new Date();
      const expDate = new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, 1);
      if (expDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
        errors.expiry = 'Expiry date cannot be in the past';
      }
    }
    // CVV: required, 3 or 4 digits
    if (!form.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(form.cvv.trim())) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }
    return errors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const res = await api.post('/payment-options', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save payment option');
      setSuccess('Payment option saved!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500">Loading user...</div>;
  if (!user) return <div className="text-center text-gray-500">Please log in to view your payment options.</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-lg mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4 text-red-500">My Payment Options</h3>
      <div className="mb-4">
        <label className="block font-medium mb-1">Cardholder Name</label>
        <input type="text" name="cardholder" value={form.cardholder} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500" />
        {fieldErrors.cardholder && <div className="text-red-500 text-sm mt-1">{fieldErrors.cardholder}</div>}
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Card Number</label>
        <input type="text" name="cardNumber" value={form.cardNumber} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500" />
        {fieldErrors.cardNumber && <div className="text-red-500 text-sm mt-1">{fieldErrors.cardNumber}</div>}
      </div>
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <label className="block font-medium mb-1">Expiry Date</label>
          <input type="text" name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500" />
          {fieldErrors.expiry && <div className="text-red-500 text-sm mt-1">{fieldErrors.expiry}</div>}
        </div>
        <div className="flex-1">
          <label className="block font-medium mb-1">CVV</label>
          <input type="password" name="cvv" value={form.cvv} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-red-500" />
          {fieldErrors.cvv && <div className="text-red-500 text-sm mt-1">{fieldErrors.cvv}</div>}
        </div>
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-60">
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

const getToken = () => localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

const Profile = () => {
  const theme = useTheme();
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [listingsOpen, setListingsOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  // 3-dot menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuListingId, setMenuListingId] = useState(null);
  const handleMenuOpen = (event, id) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuListingId(id);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuListingId(null);
  };

  // Add state for returns/cancellations modals and mock data
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [cancellationsOpen, setCancellationsOpen] = useState(false);
  const [returns, setReturns] = useState([]);
  const [cancellations, setCancellations] = useState([]);
  const { notify } = useNotification();

  // Add pagination state
  const [listingsPage, setListingsPage] = useState(1);
  const [listingsLimit] = useState(8);
  const [listingsTotal, setListingsTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit] = useState(8);
  const [ordersTotal, setOrdersTotal] = useState(0);

  // Fetch active listings from backend - ONLY USER'S LISTINGS
  useEffect(() => {
    if (!user) return;
    const fetchUserListings = async () => {
      try {
        const [adoptions, products] = await Promise.all([
          api.get(`/adoptions?owner=${user._id}&page=${listingsPage}&limit=${listingsLimit}`),
          api.get(`/products?seller=${user._id}&page=${listingsPage}&limit=${listingsLimit}`),
        ]);
        const adoptionListings = (adoptions.pets || []).map(a => ({
          id: a._id,
          title: a.title || a.name || 'Adoption Listing',
          type: 'adoption',
          description: a.description || '',
          images: a.photos?.length ? a.photos : [a.image],
          details: a.description || '',
          status: a.status,
          pricePKR: a.price,
        }));
        const productListings = (products.data || products).map(p => ({
          id: p._id,
          title: p.name || 'Product Listing',
          type: 'marketplace',
          description: p.description || '',
          images: p.images?.length ? p.images : [p.image],
          details: p.description || '',
          status: p.status,
          pricePKR: p.price,
        }));
        // Combine and sort by creation date
        const allListings = [...adoptionListings, ...productListings]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setActiveListings(allListings);
        setListingsTotal(adoptions.total + products.total);
      } catch (err) {
        console.error('Error fetching user listings:', err);
        setActiveListings([]);
      }
    };
    fetchUserListings();
  }, [user, listingsPage, listingsLimit]);

  const handleListingsPageChange = (event, value) => {
    setListingsPage(value);
  };

  // Fetch orders and filter for history, returns, cancellations
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get(`/orders?page=${ordersPage}&limit=${ordersLimit}`);
        setOrders(res.data || []);
        setOrdersTotal(res.total || 0);
        setReturns((res.data || []).filter(o => o.status === 'refunded'));
        setCancellations((res.data || []).filter(o => o.status === 'cancelled'));
      } catch (err) {
        setOrders([]);
        setOrdersTotal(0);
        setReturns([]);
        setCancellations([]);
      }
    };
    fetchOrders();
  }, [user, ordersPage, ordersLimit]);

  const handleOrdersPageChange = (event, value) => {
    setOrdersPage(value);
  };

  // Open modals when sidebar section is selected
  useEffect(() => {
    setReturnsOpen(activeSection === 'returns');
    setCancellationsOpen(activeSection === 'cancellations');
  }, [activeSection]);

  // Open listings modal when sidebar section is selected
  useEffect(() => {
    if (activeSection === 'listings') setListingsOpen(true);
    else setListingsOpen(false);
  }, [activeSection]);

  // Mark as Sold and Delete Ad
  const handleMarkAsSold = async () => {
    if (!menuListingId) return handleMenuClose();
    const listing = activeListings.find(l => l.id === menuListingId);
    if (!listing) return handleMenuClose();
    try {
      if (listing.type === 'adoption') {
        await api.put(`/adoptions/${listing.id}`, { status: 'sold' });
      } else {
        await api.put(`/products/${listing.id}`, { status: 'sold' });
      }
      setActiveListings(listings => listings.map(l => l.id === listing.id ? { ...l, status: 'sold' } : l));
    } catch (err) {
      // Optionally show error
    }
    handleMenuClose();
  };
  const handleDeleteAd = async () => {
    if (!menuListingId) return handleMenuClose();
    const listing = activeListings.find(l => l.id === menuListingId);
    if (!listing) return handleMenuClose();
    try {
      if (listing.type === 'adoption') {
        await api.delete(`/adoptions/${listing.id}`);
      } else {
        await api.delete(`/products/${listing.id}`);
      }
      setActiveListings(listings => listings.filter(l => l.id !== listing.id));
    } catch (err) {
      // Optionally show error
    }
    handleMenuClose();
  };

  const fetchUserListings = async () => {
    try {
      if (!user) return;
      if (activeTab === 0) {
        const data = await api.get(`/pets?seller=${user._id}`);
        setPets(data);
      } else {
        const data = await api.get(`/products?seller=${user._id}`);
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchOrders = async () => {
    setError('');
    try {
      if (!user) return;
      const res = await api.get('/orders?user=' + user._id);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/auth/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      // TODO: Update user context with new data
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListing = async (id, type) => {
    try {
      await api.delete(`/${type}/${id}`);
        fetchUserListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  // Add menu state for returns/cancellations
  const [orderMenuAnchorEl, setOrderMenuAnchorEl] = useState(null);
  const [orderMenuProductId, setOrderMenuProductId] = useState(null);
  const handleOrderMenuOpen = (event, productId) => {
    setOrderMenuAnchorEl(event.currentTarget);
    setOrderMenuProductId(productId);
  };
  const handleOrderMenuClose = () => {
    setOrderMenuAnchorEl(null);
    setOrderMenuProductId(null);
  };
  const handleOrderAgain = (productId) => {
    // Navigate to product detail page
    window.location.href = `/product/${productId}`;
    handleOrderMenuClose();
  };

  // When setting selectedListing, ensure pricePKR is set
  const handleViewDetails = (listing) => {
    setSelectedListing({ ...listing, pricePKR: listing.pricePKR ?? listing.price ?? '' });
    setDetailOpen(true);
    setDetailLoading(false);
  };

  // Remove any checks for authentication and always render the profile page
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
        {/* Layout: Sidebar left, content right */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'flex-start' },
          gap: 4,
        }}>
        {/* Sidebar menu */}
          <Box sx={{
            minWidth: { md: 300 },
            maxWidth: { md: 320 },
            flexShrink: 0,
            alignSelf: { xs: 'stretch', md: 'flex-start' },
            ml: { xs: 0, md: -6 }, // Move sidebar further left on desktop
          }}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={user?.avatar}
                  alt="Profile"
                  sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 24, mr: 2 }}
                >
                  {user?.firstName?.[0] || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
          </Box>
              </Box>
              
              {/* Logout Button */}
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                fullWidth
                sx={{ mb: 2 }}
              >
                Logout
              </Button>

              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant={activeSection === 'profile' ? 'contained' : 'text'}
                  onClick={() => setActiveSection('profile')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Profile Settings
                </Button>
                <Button
                  variant={activeSection === 'listings' ? 'contained' : 'text'}
                  onClick={() => setActiveSection('listings')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                My Active Listings
                </Button>
                <Button
                  variant={activeSection === 'orders' ? 'contained' : 'text'}
                  onClick={() => setActiveSection('orders')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Order History
                </Button>
                <Button
                  variant={activeSection === 'payment' ? 'contained' : 'text'}
                  onClick={() => setActiveSection('payment')}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Payment Options
                </Button>
                        </Box>
            </Paper>
                        </Box>

          {/* Main content area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Conditionally render Edit Profile section */}
            {activeSection === 'profile' && (
              <Box sx={{ mb: 4, mt: 0, width: '100%', maxWidth: 600 }}>
                <ProfileEditForm />
              </Box>
            )}

            {/* My Active Listings */}
            {activeSection === 'listings' && (
              <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
                <Typography variant="h5" fontWeight={600} mb={3}>
                  My Active Listings
                </Typography>
                {activeListings.length === 0 ? (
                  <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                    You haven't posted any listings yet.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {activeListings.map((listing) => (
                      <Grid item xs={12} sm={6} md={4} key={listing.id}>
                        <Card sx={{ height: '100%' }}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={getImageUrl(listing.images?.[0])}
                            alt={listing.title}
                          />
                          <CardContent>
                            <Typography variant="h6" noWrap>
                              {listing.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {listing.description}
                            </Typography>
                            <Chip 
                              label={listing.type} 
                              color="primary" 
                              size="small" 
                              sx={{ mt: 1 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
                      </Paper>
            )}

            {/* My Payment Options Form */}
            {activeSection === 'payment' && (
              <Box sx={{ mb: 4, mt: 0, width: '100%', maxWidth: 600 }}>
                <MyPaymentOptionsForm />
                  </Box>
                )}

            {/* Returns Modal */}
            <Dialog open={returnsOpen} onClose={() => setActiveSection('profile')} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                My Returns
                <IconButton onClick={() => setActiveSection('profile')}><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent>
                {returns.length === 0 ? (
                  <Typography color="text.secondary">No returned products found.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {returns.map(item => (
                      <Paper key={item.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
                        <Box sx={{ width: 64, height: 64, flexShrink: 0, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.200', mr: 2 }}>
                          <img src={item.image} alt={item.title} style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'cover' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                        </Box>
                        <IconButton onClick={e => handleOrderMenuOpen(e, item.productId)} sx={{ ml: 1 }}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={orderMenuAnchorEl}
                          open={Boolean(orderMenuAnchorEl) && orderMenuProductId === item.productId}
                          onClose={handleOrderMenuClose}
                        >
                          <MenuItem onClick={() => handleOrderAgain(item.productId)}>Order Again</MenuItem>
                        </Menu>
                      </Paper>
                    ))}
                  </Box>
                )}
              </DialogContent>
            </Dialog>
            {/* Cancellations Modal */}
            <Dialog open={cancellationsOpen} onClose={() => setActiveSection('profile')} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                My Cancellations
                <IconButton onClick={() => setActiveSection('profile')}><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent>
                {cancellations.length === 0 ? (
                  <Typography color="text.secondary">No cancelled products found.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {cancellations.map(item => (
                      <Paper key={item.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
                        <Box sx={{ width: 64, height: 64, flexShrink: 0, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.200', mr: 2 }}>
                          <img src={item.image} alt={item.title} style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'cover' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.title}</Typography>
                        </Box>
                        <IconButton onClick={e => handleOrderMenuOpen(e, item.productId)} sx={{ ml: 1 }}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={orderMenuAnchorEl}
                          open={Boolean(orderMenuAnchorEl) && orderMenuProductId === item.productId}
                          onClose={handleOrderMenuClose}
                        >
                          <MenuItem onClick={() => handleOrderAgain(item.productId)}>Order Again</MenuItem>
                        </Menu>
                      </Paper>
                    ))}
                  </Box>
                )}
              </DialogContent>
            </Dialog>
            {/* Listing Detail Modal */}
            <Dialog open={!!selectedListing} onClose={() => setSelectedListing(null)} maxWidth="xs" fullWidth>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {selectedListing?.title}
                <IconButton onClick={() => setSelectedListing(null)}><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent>
                {/* All images */}
                {selectedListing?.images && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto' }}>
                    {selectedListing.images.map((img, idx) => (
                      <Box key={idx} sx={{ width: 80, height: 80, borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.200' }}>
                        <img src={img} alt={`Listing ${idx + 1}`} style={{ width: '100%', maxWidth: '100%', height: 'auto', objectFit: 'cover' }} crossOrigin="anonymous" />
              </Box>
                    ))}
              </Box>
            )}
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedListing?.details}</Typography>
                {/* Add more details as needed */}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedListing(null)}>Close</Button>
              </DialogActions>
            </Dialog>
            {error && <Typography color="error" align="center" sx={{ mb: 4 }}>{error}</Typography>}
        {user && (
              <Paper sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 4, mb: 4 }}>
                <form onSubmit={handleUpdateProfile}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        fullWidth
                        size="small"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {isEditing ? (
                  <>
                        <Button type="submit" variant="contained" color="primary" disabled={saving}>
                          {saving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button variant="outlined" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                  </>
                ) : (
                      <Button variant="contained" color="primary" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                )}
                  </Box>
            </form>
              </Paper>
        )}
        {/* Order History */}
            <Box sx={{ width: '100%', maxWidth: 600 }}>
              <Paper sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 4, mt: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Order History
                </Typography>
          {orders.length === 0 ? (
                  <Typography color="text.secondary">No orders found.</Typography>
          ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.95rem' }}>
                <thead>
                        <tr style={{ background: theme.palette.action.hover }}>
                          <th style={{ padding: '8px 16px', textAlign: 'left' }}>Order ID</th>
                          <th style={{ padding: '8px 16px', textAlign: 'left' }}>Date</th>
                          <th style={{ padding: '8px 16px', textAlign: 'left' }}>Total</th>
                          <th style={{ padding: '8px 16px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                          <tr key={order._id} style={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <td style={{ padding: '8px 16px' }}>{order._id}</td>
                            <td style={{ padding: '8px 16px' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</td>
                            <td style={{ padding: '8px 16px' }}>${order.total}</td>
                            <td style={{ padding: '8px 16px' }}>
                              {order.status && (
                                <Chip
                                  label={
                                    order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                  }
                                  color={
                                    order.status === 'pending' ? 'warning'
                                    : order.status === 'confirmed' ? 'success'
                                    : order.status === 'rejected' ? 'error'
                                    : order.status === 'shipped' ? 'info'
                                    : order.status === 'delivered' ? 'success'
                                    : order.status === 'cancelled' ? 'error'
                                    : order.status === 'refunded' ? 'info'
                                    : 'default'
                                  }
                                  size="small"
                                />
                              )}
                            </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                  </Box>
          )}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* Listings Pagination */}
      {listingsTotal > listingsLimit && (
        <Box display="flex" justifyContent="center" my={2}>
          <Pagination
            count={Math.ceil(listingsTotal / listingsLimit)}
            page={listingsPage}
            onChange={handleListingsPageChange}
            color="primary"
          />
        </Box>
      )}
      {/* Orders Pagination */}
      {ordersTotal > ordersLimit && (
        <Box display="flex" justifyContent="center" my={2}>
          <Pagination
            count={Math.ceil(ordersTotal / ordersLimit)}
            page={ordersPage}
            onChange={handleOrdersPageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default Profile; 