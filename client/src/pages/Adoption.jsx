import React, { useState, useEffect, useCallback } from 'react';
import AdoptionHero from '../components/adoption/AdoptionHero';
import AdoptionFilterBar from '../components/adoption/AdoptionFilterBar';
import AdoptionGrid from '../components/adoption/AdoptionGrid';
import AdoptionListingForm from '../components/adoption/AdoptionListingForm';
import AdoptionDetailModal from '../components/adoption/AdoptionDetailModal';
import { Fab, Zoom, useTheme, Pagination, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { formatPKR } from '../utils/currency';
import { resolveImageUrl } from '../utils/imageUtils';

const Adoption = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch pets from backend
  const fetchPets = useCallback(async (filterParams = {}, pageNum = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterParams.species) params.append('species', filterParams.species);
      if (filterParams.breed) params.append('breed', filterParams.breed);
      if (filterParams.age && Array.isArray(filterParams.age)) {
        if (filterParams.age[0] !== undefined) params.append('ageMin', filterParams.age[0]);
        if (filterParams.age[1] !== undefined) params.append('ageMax', filterParams.age[1]);
      }
      if (filterParams.size) params.append('size', filterParams.size);
      if (filterParams.gender) params.append('gender', filterParams.gender);
      if (filterParams.location) params.append('location', filterParams.location);
      if (filterParams.sort) params.append('sort', filterParams.sort);
      params.append('page', pageNum);
      params.append('limit', limit);
      const res = await api.get(`/adoptions?${params.toString()}`);
      setPets(Array.isArray(res.pets)
        ? res.pets.map(pet => ({
            ...pet,
            image: (pet.photos && pet.photos[0]) || pet.image || '/placeholder.jpg',
            name: pet.title || pet.name || 'Untitled',
            breed: pet.breed || 'Unknown',
            location: pet.location || 'Unknown',
            tags: pet.tags || [],
          }))
        : []);
      setTotal(res.total);
    } catch (err) {
      setPets([]);
      setTotal(0);
    }
    setLoading(false);
  }, [limit, page]);

  useEffect(() => {
    fetchPets(filters, page);
    // eslint-disable-next-line
  }, [fetchPets, filters, page]);

  // Fetch pet details for modal
  const handleViewDetails = async (pet) => {
    if (!user) return navigate('/login');
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const petDetail = await api.get(`/adoptions/${pet._id || pet.id}`);
      setSelectedPet(petDetail);
    } catch (err) {
      setSelectedPet(null);
    }
    setDetailLoading(false);
  };

  const handleAdopt = (pet) => {
    if (!user) return navigate('/login');
    // Navigate to chat with the pet owner
    navigate(`/chat/adoption/${pet._id || pet.id}/${pet.owner?._id || 'owner'}`);
  };

  const handleEditListing = (pet) => {
    if (!user) return navigate('/login');
    // Navigate to edit listing
    navigate(`/edit-listing/adoption/${pet._id || pet.id}`);
  };

  const handleFilterSearch = (filterParams) => {
    setFilters(filterParams);
  };

  const handleFormSubmit = (formData) => {
    fetchPets(filters);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <main className="w-full flex flex-col items-center bg-background text-primary min-h-[60vh]">
      {/* Hero Section */}
      <section className="w-full mb-6">
        <AdoptionHero />
      </section>

      {/* Main Content Container */}
      <div className="w-full max-w-6xl px-4">
        {/* Filter Bar */}
        {/* <section className="mb-8">
          <AdoptionFilterBar onSearch={handleFilterSearch} />
        </section> */}
        {/* Removed global search feature message */}

        {/* Pet Listings Grid */}
        <section className="mb-8">
          <AdoptionGrid
            pets={pets.map(pet => ({
              ...pet,
              image: resolveImageUrl(pet.image),
              pricePKR: pet.pricePKR ?? pet.price ?? '',
            }))}
            loading={loading}
            onViewDetails={handleViewDetails}
            onAdopt={handleAdopt}
            onEditListing={handleEditListing}
            showAdoptButton={true}
          />
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
      <AdoptionListingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Pet Detail Modal */}
      <AdoptionDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        pet={{ ...selectedPet, pricePKR: selectedPet?.pricePKR ?? selectedPet?.price ?? '' }}
        user={user}
        loading={detailLoading}
        onEditListing={handleEditListing}
      />

      {/* FAB: List a Pet for Adoption (always visible for review) */}
      <Zoom in={true}>
        <Fab
          color="primary"
          aria-label="List a Pet for Adoption"
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

export default Adoption; 