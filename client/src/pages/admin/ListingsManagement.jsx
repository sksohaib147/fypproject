import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Pagination,
  Checkbox
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Block as RejectIcon,
  Add as AddIcon
} from '@mui/icons-material';
import api from '../../utils/api';
import { useRef } from 'react';
import { formatPKR } from '../../utils/currency';
import { getImageUrl } from '../../utils/api';

const ListingsManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    pricePKR: '',
    category: '',
    stock: '',
    status: 'available'
  });
  const [productsPage, setProductsPage] = useState(1);
  const [productsLimit] = useState(12);
  const [productsTotal, setProductsTotal] = useState(0);
  const [petsPage, setPetsPage] = useState(1);
  const [petsLimit] = useState(12);
  const [petsTotal, setPetsTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loadingItems, setLoadingItems] = useState(new Set()); // Track loading state for individual items
  const [successMessage, setSuccessMessage] = useState(''); // Track success messages
  const [selectedItems, setSelectedItems] = useState(new Set()); // Track selected items for bulk actions
  const intervalRef = useRef();

  // Debug authentication
  useEffect(() => {
    console.log('Auth Debug Info:');
    console.log('adminToken:', localStorage.getItem('adminToken') ? 'exists' : 'missing');
    console.log('userToken:', localStorage.getItem('userToken') ? 'exists' : 'missing');
    console.log('isAdmin:', localStorage.getItem('isAdmin'));
    
    // Test admin authentication
    const testAdminAuth = async () => {
      try {
        console.log('Testing admin authentication...');
        const response = await api.get('/admin/me');
        console.log('✅ Admin auth working:', response);
      } catch (err) {
        console.log('❌ Admin auth failed:', err.message);
      }
    };
    
    testAdminAuth();
  }, []);

  useEffect(() => {
    fetchData();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchData, 10000);
    return () => clearInterval(intervalRef.current);
  }, [productsPage, productsLimit, petsPage, petsLimit, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching data...'); // Debug log
      
      const [productsResponse, adoptionsResponse] = await Promise.all([
        api.get(`/admin/products?page=${productsPage}&limit=${productsLimit}`),
        api.get(`/admin/adoptions?page=${petsPage}&limit=${petsLimit}`)
      ]);
      
      console.log('Products response:', productsResponse); // Debug log
      console.log('Adoptions response:', adoptionsResponse); // Debug log
      
      let products = productsResponse.data || [];
      if (statusFilter !== 'all') {
        products = products.filter(p => p.status === statusFilter);
      }
      
      console.log('Filtered products:', products); // Debug log
      
      setProducts(products);
      setProductsTotal(productsResponse.total || 0);
      setPets(adoptionsResponse.data || []);
      setPetsTotal(adoptionsResponse.total || 0);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load listings');
      setProducts([]);
      setProductsTotal(0);
      setPets([]);
      setPetsTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item, type) => {
    setSelectedItem({ ...item, type });
    setEditForm({
      name: item.name,
      description: item.description,
      pricePKR: type === 'product' ? item.pricePKR : item.price,
      category: item.category || item.type,
      stock: type === 'product' ? item.stock : '',
      status: item.status
    });
    setEditDialogOpen(true);
  };

  const handleUpdateItem = async () => {
    try {
      setLoading(true);
      const endpoint = selectedItem.type === 'product' ? '/products' : '/adoptions';
      await api.put(`${endpoint}/${selectedItem._id}`, editForm);
      await fetchData();
      setEditDialogOpen(false);
      setSelectedItem(null);
    } catch (err) {
      setError('Failed to update listing');
      console.error('Error updating listing:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (item, type) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const itemId = item.id || item._id;
      console.log('Deleting item:', { itemId, type });
      
      if (type === 'product') {
        await api.delete(`/admin/products/${itemId}`);
      } else {
        await api.delete(`/admin/adoptions/${itemId}`);
      }
      
      await fetchData();
      setSuccessMessage(`${type === 'product' ? 'Product' : 'Pet'} deleted successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(`Failed to delete ${type}: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (item, newStatus, type) => {
    const itemId = item.id || item._id; // Use id if available, otherwise _id
    const itemKey = `${type}-${itemId}`;
    
    console.log('handleStatusChange called:', { item, newStatus, type, itemId }); // Debug log
    
    try {
      setLoadingItems(prev => new Set([...prev, itemKey]));
      setError('');
      setSuccessMessage('');
      
      if (newStatus === 'available') {
        // Approve the item
        if (type === 'product') {
          console.log('Approving product:', itemId);
          await api.put(`/admin/products/${itemId}/approve`, { approved: true });
        } else {
          console.log('Approving adoption:', itemId);
          await api.put(`/admin/adoptions/${itemId}/approve`, { approved: true });
        }
        setSuccessMessage(`${type === 'product' ? 'Product' : 'Pet'} approved successfully!`);
      } else if (newStatus === 'pending') {
        // Reject the item
        if (type === 'product') {
          console.log('Rejecting product:', itemId);
          await api.put(`/admin/products/${itemId}/approve`, { approved: false });
        } else {
          console.log('Rejecting adoption:', itemId);
          await api.put(`/admin/adoptions/${itemId}/approve`, { approved: false });
        }
        setSuccessMessage(`${type === 'product' ? 'Product' : 'Pet'} rejected successfully!`);
      } else {
        // For other status changes, use the regular update endpoint
        const endpoint = type === 'product' ? '/admin/products' : '/admin/adoptions';
        console.log('Updating status:', { endpoint, itemId, newStatus });
        await api.put(`${endpoint}/${itemId}`, { status: newStatus });
        setSuccessMessage(`Status updated to ${newStatus} successfully!`);
      }
      
      console.log('Operation successful, refreshing data...');
      await fetchData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error in handleStatusChange:', err);
      setError(`Failed to update status: ${err.message || 'Unknown error'}`);
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleBulkAction = async (action, type) => {
    if (selectedItems.size === 0) return;
    
    console.log('Bulk action called:', { action, type, selectedItems: Array.from(selectedItems) });
    
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const promises = Array.from(selectedItems).map(itemKey => {
        const [itemType, itemId] = itemKey.split('-');
        if (itemType !== type) return Promise.resolve();
        
        console.log(`Processing ${action} for ${itemType}:`, itemId);
        
        if (action === 'approve') {
          if (type === 'product') {
            return api.put(`/admin/products/${itemId}/approve`, { approved: true });
          } else {
            return api.put(`/admin/adoptions/${itemId}/approve`, { approved: true });
          }
        } else if (action === 'reject') {
          if (type === 'product') {
            return api.put(`/admin/products/${itemId}/approve`, { approved: false });
          } else {
            return api.put(`/admin/adoptions/${itemId}/approve`, { approved: false });
          }
        }
        return Promise.resolve();
      });
      
      await Promise.all(promises);
      await fetchData();
      
      setSuccessMessage(`${selectedItems.size} ${type === 'product' ? 'products' : 'pets'} ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setSelectedItems(new Set());
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(`Error in bulk ${action}:`, err);
      setError(`Failed to ${action} items: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (items, type) => {
    const itemKeys = items.map(item => `${type}-${item.id || item._id}`);
    setSelectedItems(new Set(itemKeys));
  };

  const handleSelectItem = (itemId, type, checked) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      const itemKey = `${type}-${itemId}`;
      if (checked) {
        newSet.add(itemKey);
      } else {
        newSet.delete(itemKey);
      }
      return newSet;
    });
  };

  const handleProductsPageChange = (event, value) => {
    setProductsPage(value);
  };
  const handlePetsPageChange = (event, value) => {
    setPetsPage(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'pending':
        return 'warning';
      case 'sold':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderProductsTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedItems.size > 0 && selectedItems.size < products.length}
                checked={selectedItems.size === products.length && products.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleSelectAll(products, 'product');
                  } else {
                    setSelectedItems(new Set());
                  }
                }}
              />
            </TableCell>
            <TableCell>Product</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.has(`product-${product.id || product._id}`)}
                  onChange={(e) => handleSelectItem(product.id || product._id, 'product', e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <CardMedia
                    component="img"
                    sx={{ width: 50, height: 50, mr: 2, borderRadius: 1 }}
                    image={
                      product.images && product.images[0] 
                        ? getImageUrl(product.images[0])
                        : '/placeholder.jpg'
                    }
                    alt={product.name}
                    crossOrigin="anonymous"
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.description.substring(0, 50)}...
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={product.category} size="small" />
              </TableCell>
              <TableCell>{formatPKR(product.pricePKR)}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Chip
                  label={product.status}
                  color={getStatusColor(product.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {product.seller?.firstName} {product.seller?.lastName}
              </TableCell>
              <TableCell>
                <Tooltip title="View Details">
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Product">
                  <IconButton 
                    size="small"
                    onClick={() => handleEditItem(product, 'product')}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Approve">
                  <IconButton 
                    size="small"
                    onClick={() => handleStatusChange(product, 'available', 'product')}
                    disabled={loading || loadingItems.has(`product-${product.id || product._id}`) || product.status === 'available'}
                    color="success"
                  >
                    {loadingItems.has(`product-${product.id || product._id}`) ? (
                      <CircularProgress size={16} color="success" />
                    ) : (
                      <ApproveIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton 
                    size="small"
                    onClick={() => handleStatusChange(product, 'pending', 'product')}
                    disabled={loading || loadingItems.has(`product-${product.id || product._id}`) || product.status === 'pending'}
                    color="error"
                  >
                    {loadingItems.has(`product-${product.id || product._id}`) ? (
                      <CircularProgress size={16} color="error" />
                    ) : (
                      <RejectIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Product">
                  <IconButton 
                    size="small"
                    onClick={() => handleDeleteItem(product, 'product')}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderPetsTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedItems.size > 0 && selectedItems.size < pets.length}
                checked={selectedItems.size === pets.length && pets.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleSelectAll(pets, 'pet');
                  } else {
                    setSelectedItems(new Set());
                  }
                }}
              />
            </TableCell>
            <TableCell>Pet</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Breed</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pets.map((pet) => (
            <TableRow key={pet._id}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedItems.has(`pet-${pet.id || pet._id}`)}
                  onChange={(e) => handleSelectItem(pet.id || pet._id, 'pet', e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <CardMedia
                    component="img"
                    sx={{ width: 50, height: 50, mr: 2, borderRadius: 1 }}
                    image={
                      pet.images && pet.images[0] 
                        ? getImageUrl(pet.images[0])
                        : pet.photos && pet.photos[0]
                          ? getImageUrl(pet.photos[0])
                          : '/placeholder.jpg'
                    }
                    alt={pet.name}
                    crossOrigin="anonymous"
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {pet.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pet.description.substring(0, 50)}...
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip label={pet.type} size="small" />
              </TableCell>
              <TableCell>{pet.breed}</TableCell>
              <TableCell>{pet.age} years</TableCell>
              <TableCell>{formatPKR(pet.price)}</TableCell>
              <TableCell>
                <Chip
                  label={pet.status}
                  color={getStatusColor(pet.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {pet.seller?.firstName} {pet.seller?.lastName}
              </TableCell>
              <TableCell>
                <Tooltip title="View Details">
                  <IconButton size="small">
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Pet">
                  <IconButton 
                    size="small"
                    onClick={() => handleEditItem(pet, 'pet')}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Approve">
                  <IconButton 
                    size="small"
                    onClick={() => handleStatusChange(pet, 'available', 'pet')}
                    disabled={loading || loadingItems.has(`pet-${pet.id || pet._id}`) || pet.status === 'available'}
                    color="success"
                  >
                    {loadingItems.has(`pet-${pet.id || pet._id}`) ? (
                      <CircularProgress size={16} color="success" />
                    ) : (
                      <ApproveIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject">
                  <IconButton 
                    size="small"
                    onClick={() => handleStatusChange(pet, 'pending', 'pet')}
                    disabled={loading || loadingItems.has(`pet-${pet.id || pet._id}`) || pet.status === 'pending'}
                    color="error"
                  >
                    {loadingItems.has(`pet-${pet.id || pet._id}`) ? (
                      <CircularProgress size={16} color="error" />
                    ) : (
                      <RejectIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Pet">
                  <IconButton 
                    size="small"
                    onClick={() => handleDeleteItem(pet, 'pet')}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading && products.length === 0 && pets.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Listings Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label={`Products (${productsTotal})`} />
            <Tab label={`Pets (${petsTotal})`} />
          </Tabs>
          <Box display="flex" alignItems="center" gap={2}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={e => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
              </Select>
            </FormControl>
            
            {/* Test Button */}
            <Button 
              variant="outlined" 
              size="small"
              onClick={async () => {
                try {
                  console.log('Testing approve endpoint...');
                  const testProduct = products[0];
                  if (testProduct) {
                    console.log('Testing with product:', testProduct);
                    await api.put(`/admin/products/${testProduct.id || testProduct._id}/approve`, { approved: true });
                    console.log('✅ Approve test successful!');
                    setSuccessMessage('Test approve successful!');
                  } else {
                    console.log('No products to test with');
                  }
                } catch (err) {
                  console.error('❌ Approve test failed:', err);
                  setError(`Test failed: ${err.message}`);
                }
              }}
            >
              Test Approve
            </Button>
            
            {/* Bulk Actions */}
            {selectedItems.size > 0 && (
              <Box display="flex" gap={1}>
                <Button 
                  variant="contained" 
                  color="success" 
                  size="small"
                  onClick={() => handleBulkAction('approve', activeTab === 0 ? 'product' : 'pet')}
                  disabled={loading}
                >
                  Approve Selected ({selectedItems.size})
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={() => handleBulkAction('reject', activeTab === 0 ? 'product' : 'pet')}
                  disabled={loading}
                >
                  Reject Selected ({selectedItems.size})
                </Button>
              </Box>
            )}
            
            <Button variant="contained" startIcon={<AddIcon />}>
              Add New {activeTab === 0 ? 'Product' : 'Pet'}
            </Button>
          </Box>
        </Box>

        {activeTab === 0 ? (
          <>
            {renderProductsTable()}
            {/* Products Pagination */}
            {productsTotal > productsLimit && (
              <Box display="flex" justifyContent="center" my={2}>
                <Pagination
                  count={Math.ceil(productsTotal / productsLimit)}
                  page={productsPage}
                  onChange={handleProductsPageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        ) : (
          <>
            {renderPetsTable()}
            {/* Pets Pagination */}
            {petsTotal > petsLimit && (
              <Box display="flex" justifyContent="center" my={2}>
                <Pagination
                  count={Math.ceil(petsTotal / petsLimit)}
                  page={petsPage}
                  onChange={handlePetsPageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Edit {selectedItem?.type === 'product' ? 'Product' : 'Pet'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price (PKR)"
                  type="number"
                  value={editForm.pricePKR}
                  onChange={(e) => setEditForm({ ...editForm, pricePKR: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={editForm.category}
                    label="Category"
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {selectedItem?.type === 'product' ? (
                      <>
                        <MenuItem value="Dogs">Dogs</MenuItem>
                        <MenuItem value="Cats">Cats</MenuItem>
                        <MenuItem value="Birds">Birds</MenuItem>
                        <MenuItem value="Fish">Fish</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </>
                    ) : (
                      <>
                        <MenuItem value="dog">Dog</MenuItem>
                        <MenuItem value="cat">Cat</MenuItem>
                        <MenuItem value="rabbit">Rabbit</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              {selectedItem?.type === 'product' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock"
                    type="number"
                    value={editForm.stock}
                    onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status}
                    label="Status"
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="sold">Sold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateItem} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete {selectedItem?.type === 'product' ? 'Product' : 'Pet'}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedItem?.name}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleDeleteItem(selectedItem, selectedItem?.type)} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListingsManagement; 