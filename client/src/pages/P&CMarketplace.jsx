import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import MarketplaceDetailModal from '../components/MarketplaceDetailModal';
import MarketplaceListingForm from '../components/MarketplaceListingForm';
import MarketplaceListingCard from '../components/MarketplaceListingCard';
import MarketplaceHero from '../components/MarketplaceHero';
import MarketplaceFilterBar from '../components/MarketplaceFilterBar';
import { Fab, Zoom, useTheme, Pagination, Box, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../utils/api';

const PCMarketplace = () => {
  const [listings, setListings] = useState([]); // [{...listing, price, ...}]
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();

  // Placeholder fetch for marketplace listings
  const fetchListings = useCallback(async (filterParams = {}, pageNum = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Map species to category if present
      if (filterParams.category) params.append('category', filterParams.category);
      else if (filterParams.species) params.append('category', filterParams.species);
      if (filterParams.minPrice) params.append('minPrice', filterParams.minPrice);
      if (filterParams.maxPrice) params.append('maxPrice', filterParams.maxPrice);
      if (filterParams.location) params.append('location', filterParams.location);
      if (filterParams.sort) params.append('sort', filterParams.sort);
      params.append('page', pageNum);
      params.append('limit', limit);
      // Filter for user-created products only (not admin products)
      params.append('userCreated', 'true');
      // Filter for marketplace products only
      params.append('source', 'marketplace');
      const res = await api.get(`/products?${params.toString()}`);
      console.log('P&CMarketplace API response:', res);
      setListings(Array.isArray(res.data)
        ? res.data.map(item => {
            const processedItem = {
              ...item,
              price: item.pricePKR ?? item.price ?? 0,
              photos: item.images || [],
              image: (item.images && item.images[0]) || item.image || '/placeholder.svg',
              name: item.name || 'Untitled',
              breed: item.breed || 'Unknown',
              location: item.location || 'Unknown',
              tags: item.tags || [],
              pricePKR: item.pricePKR ?? item.price ?? '',
            };
            console.log('Processed listing item:', processedItem);
            return processedItem;
          })
        : []);
      setTotal(res.total);
    } catch (err) {
      setListings([]);
      setTotal(0);
    }
    setLoading(false);
  }, [limit, page]);

  useEffect(() => {
    fetchListings(filters, page);
    // eslint-disable-next-line
  }, [fetchListings, filters, page]);

  // Fetch listing details for modal
  const handleViewDetails = async (listing) => {
    if (!user) return navigate('/login');
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      setSelectedListing(listing); // TODO: Replace with real fetch
    } catch (err) {
      setSelectedListing(null);
    }
    setDetailLoading(false);
  };

  const handleContactSeller = (listing) => {
    if (!user) return navigate('/login');
    // Navigate to chat with the seller
    navigate(`/chat/marketplace/${listing._id || listing.id}/${listing.owner?._id || listing.seller?._id || 'seller'}`);
  };

  const handleEditListing = (listing) => {
    if (!user) return navigate('/login');
    // Navigate to edit listing
    navigate(`/edit-listing/marketplace/${listing._id || listing.id}`);
  };

  const handleFilterSearch = (filterParams) => {
    setFilters(filterParams);
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Add source field to indicate this is from marketplace
      const payload = {
        ...formData,
        source: 'marketplace'
      };
      await api.post('/products', payload);
      notify('Listing submitted for review!', 'success');
      fetchListings(filters);
    } catch (err) {
      notify('Failed to submit listing', 'error');
    }
    setFormOpen(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <main className="w-full flex flex-col items-center bg-background text-primary min-h-[60vh]">
      {/* Hero Section */}
      <section className="w-full mb-6">
        <MarketplaceHero />
      </section>

      {/* Main Content Container */}
      <div className="w-full max-w-6xl px-4">
        {/* Filter Bar */}
        {/* <section className="mb-8">
          <MarketplaceFilterBar onSearch={handleFilterSearch} />
        </section> */}
        {/* Removed global search feature message */}

        {/* Listings Grid */}
        <section className="mb-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-400 dark:text-gray-500 mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No listings found</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Try adjusting your filters to find what you're looking for.</p>
              <button
                onClick={() => setFilters({})}
                className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <Grid container spacing={3}>
              {listings.map(listing => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={listing._id || listing.id}>
                  <MarketplaceListingCard
                    listing={listing}
                    onViewDetails={() => handleViewDetails(listing)}
                    onContactSeller={() => handleContactSeller(listing)}
                    onEditListing={() => handleEditListing(listing)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </section>

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
      </div>

      {/* Listing Form (Modal) */}
      <MarketplaceListingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Listing Detail Modal */}
      <MarketplaceDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        listing={{ ...selectedListing, pricePKR: selectedListing?.pricePKR ?? selectedListing?.price ?? '' }}
        user={user}
        loading={detailLoading}
        onContactSeller={handleContactSeller}
        onEditListing={handleEditListing}
        showProductActions={false}
        hideLocation={false}
      />

      {/* FAB: List a Pet/Product for Sale */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="List a Pet/Product for Sale"
          onClick={() => user ? setFormOpen(true) : navigate('/login')}
          sx={{
            position: 'fixed',
            bottom: { xs: 24, md: 40 },
            right: { xs: 24, md: 40 },
            zIndex: 1200,
            boxShadow: 6,
          }}
        >
          <AddIcon fontSize="large" />
        </Fab>
      </Zoom>
    </main>
  );
};

export default PCMarketplace; 