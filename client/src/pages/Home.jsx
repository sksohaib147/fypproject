import React, { useState, useEffect } from 'react';
import { FaDog, FaCat, FaBone, FaGamepad, FaHome, FaStar, FaPaw } from 'react-icons/fa';
import { GiRabbit } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { Box, Typography, useTheme as useMuiTheme, Button, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../utils/api';
import { formatPKR } from '../utils/currency';
import { resolveImageUrl } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import HomeAdoptionModal from '../components/HomeAdoptionModal';
import HomeMarketplaceModal from '../components/HomeMarketplaceModal';

const categories = [
  { name: 'Dog Food', icon: <FaDog />, path: '/dog-food' },
  { name: 'Cat Food', icon: <FaCat />, path: '/cat-food' },
  { name: 'Rabbit Food', icon: <GiRabbit />, path: '/rabbit-food' },
  { name: 'Toys', icon: <FaGamepad />, path: '/toys' },
  { name: 'Belts and Cages', icon: <FaHome />, path: '/belts-and-cages' },
];

function ProductCard({ product, onClick }) {
  const theme = useMuiTheme();
  const imageUrl = resolveImageUrl(product.image || product.images?.[0]);
  
  console.log('ProductCard image URL:', imageUrl);
  console.log('Product:', product.name, 'Image path:', product.image || product.images?.[0]);
  
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: 192, 
        mx: 1, 
        bgcolor: 'background.paper', 
        borderRadius: 3, 
        boxShadow: 2, 
        cursor: 'pointer',
        '&:hover': { transform: 'translateY(-8px)', transition: 'transform 0.2s', boxShadow: 4 } 
      }}
      onClick={() => onClick(product)}
    >
      <img 
        src={imageUrl} 
        alt={product.name} 
        style={{ 
          height: 128, 
          width: '100%', 
          objectFit: 'cover', 
          borderTopLeftRadius: 12, 
          borderTopRightRadius: 12, 
          maxWidth: '100%' 
        }}
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Image failed to load:', e.target.src, 'for product:', product.name);
          e.target.src = '/placeholder.svg';
        }}
        onLoad={(e) => {
          console.log('Image loaded successfully:', product.name, 'from:', e.target.src);
        }}
      />
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </Typography>
        <Typography color="text.secondary" fontSize={14} mb={0.5}>
          {product.pricePKR !== undefined && product.pricePKR !== null && product.pricePKR !== '' ? formatPKR(product.pricePKR) : ''}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'warning.main', fontSize: 12 }}>
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} style={{ color: i < Math.round(product.rating || 0) ? theme.palette.warning.main : theme.palette.grey[300] }} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function PetCard({ pet, onClick }) {
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: 192, 
        mx: 1, 
        bgcolor: 'background.paper', 
        borderRadius: 3, 
        boxShadow: 2, 
        cursor: 'pointer',
        '&:hover': { transform: 'translateY(-8px)', transition: 'transform 0.2s', boxShadow: 4 } 
      }}
      onClick={() => onClick(pet)}
    >
      <img 
        src={resolveImageUrl(pet.image || pet.images?.[0] || pet.photos?.[0])} 
        alt={pet.title || pet.name || pet.breed} 
        style={{ 
          height: 128, 
          width: '100%', 
          objectFit: 'cover', 
          borderTopLeftRadius: 12, 
          borderTopRightRadius: 12, 
          maxWidth: '100%' 
        }}
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Image failed to load:', e.target.src, 'for pet:', pet.name || pet.breed);
          e.target.src = '/placeholder.svg';
        }}
        onLoad={(e) => {
          console.log('Image loaded successfully:', pet.name || pet.breed, 'from:', e.target.src);
        }}
      />
      <Box sx={{ p: 1.5, pb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pet.title || pet.name || pet.breed}
        </Typography>
        <Typography color="text.secondary" fontSize={14} mb={0.5}>
          {pet.breed || pet.category || 'Unknown Breed'}
        </Typography>
        {pet.pricePKR && <Typography color="success.main" fontWeight={700}>{formatPKR(pet.pricePKR)}</Typography>}
      </Box>
    </Box>
  );
}

const Home = () => {
  const [randomProducts, setRandomProducts] = useState([]);
  const [randomAdoptions, setRandomAdoptions] = useState([]);
  const [randomPets, setRandomPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null); // 'product', 'adoption', 'marketplace'
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Fetch data for home page sections with random selection
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        // Force clear any cached image requests by adding a unique timestamp
        const cacheBuster = Date.now();
        console.log('Fetching home data with cache buster:', cacheBuster);
        
        // Test image URL to debug CORS issue
        const testImageUrl = `http://localhost:5000/uploads/image-1753783487274.jpg?v=${cacheBuster}`;
        console.log('Testing image URL:', testImageUrl);
        
        // Fetch random admin products (4 products) - ensure different on each refresh
        try {
          const timestamp = Date.now(); // Force cache busting
          const adminProducts = await api.get(`/products/random?t=${timestamp}&cb=${cacheBuster}`);
          console.log('Fetched admin products:', adminProducts);
          setRandomProducts(Array.isArray(adminProducts) ? adminProducts : []);
        } catch (error) {
          console.error('Error fetching admin products:', error);
          setRandomProducts([]);
        }

        // Fetch user adoption listings (4 pets for adoption) - ensure different on each refresh
        try {
          const timestamp = Date.now(); // Force cache busting
          const userAdoptions = await api.get(`/adoptions?limit=4&userCreated=true&t=${timestamp}&cb=${cacheBuster}`);
          console.log('Fetched user adoptions:', userAdoptions);
          setRandomAdoptions(userAdoptions?.pets || []);
        } catch (error) {
          console.error('Error fetching user adoptions:', error);
          setRandomAdoptions([]);
        }

        // Fetch user marketplace listings (4 pets for sale) - ensure different on each refresh
        try {
          const timestamp = Date.now(); // Force cache busting
          const userPets = await api.get(`/products?limit=4&userCreated=true&source=marketplace&t=${timestamp}&cb=${cacheBuster}`);
          console.log('Fetched user pets:', userPets);
          setRandomPets(userPets?.data || []);
        } catch (error) {
          console.error('Error fetching user pets:', error);
          setRandomPets([]);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
        setRandomProducts([]);
        setRandomAdoptions([]);
        setRandomPets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setSelectedItemType(null); // Reset type when a new item is selected
    setDetailModalOpen(true);
  };

  const handleAddToCart = (item) => {
    const product = { ...item, _id: item._id || item.id };
    addToCart(product, 'product');
    setDetailModalOpen(false);
  };

  const handleGoToCheckout = (item) => {
    const product = { ...item, _id: item._id || item.id };
    addToCart(product, 'product');
    setDetailModalOpen(false);
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 6, overflowX: 'hidden' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        {/* Creative Welcome Banner */}
        <Box
          sx={{
            mb: 6,
            p: { xs: 2, sm: 3, md: 3 },
            borderRadius: 4,
            minHeight: { xs: 180, sm: 200, md: 220 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 3,
            textAlign: 'center',
          }}
        >
          {/* Background image */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
              backgroundImage:
                "url('https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.8,
            }}
          />
          {/* Gradient overlay for texture and color */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              background: 'linear-gradient(90deg, rgba(254,240,138,0.8) 0%, rgba(187,247,208,0.8) 100%)',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%' }}>
            <FaPaw size={36} style={{ marginBottom: 8, color: '#1a202c' }} />
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a202c', textShadow: '0 2px 8px rgba(255,255,255,0.2)' }}>
              Welcome to Paws and Claws!
            </Typography>
            <Typography variant="h6" fontWeight={500} sx={{ color: '#374151' }}>
              Your one-stop solution for all your pet needs. Discover the best products, find loving pets for adoption, and connect with a vibrant pet community—all in one place!
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button variant="contained" color="primary" component={Link} to="/adoption">
                Explore AdoptionHub
              </Button>
              <Button variant="contained" color="primary" component={Link} to="/pcmarketplace">
                Shop Marketplace
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Categories */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight={700} mb={3}>Product Categories</Typography>
          <Box sx={{ display: 'flex', gap: 2,flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((category, index) => (
              <Link key={index} to={category.path} style={{ textDecoration: 'none' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  borderRadius: 2, 
                  boxShadow: 1,
                  '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s' }
                }}>
                  <Box sx={{ color: 'primary.main', fontSize: 24 }}>{category.icon}</Box>
                  <Typography variant="h6" color="text.primary">{category.name}</Typography>
                </Box>
              </Link>
            ))}
          </Box>
        </Box>

        {/* Best Selling Products - Random Admin Products */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight={700} mb={3}>Best Selling Products</Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : randomProducts.length === 0 ? (
            <Typography color="text.secondary">No products found.</Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, justifyContent: 'center' }}>
              {randomProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} onClick={(item) => {
                  setSelectedItem(item);
                  setSelectedItemType('product');
                  setDetailModalOpen(true);
                }} />
              ))}
            </Box>
          )}
        </Box>

        {/* Best Pets for Adoption - User Adoption Listings */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight={700} mb={3}>Best Pets for Adoption</Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : randomAdoptions.length === 0 ? (
            <Typography color="text.secondary">No pets for adoption found.</Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, justifyContent: 'center' }}>
              {randomAdoptions.map((pet) => (
                <PetCard key={pet._id || pet.id} pet={pet} onClick={(item) => {
                  setSelectedItem(item);
                  setSelectedItemType('adoption');
                  setDetailModalOpen(true);
                }} />
              ))}
            </Box>
          )}
        </Box>

        {/* Best Selling Pets - User Marketplace Listings */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight={700} mb={3}>Best Selling Pets</Typography>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : randomPets.length === 0 ? (
            <Typography color="text.secondary">No pets for sale found.</Typography>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, justifyContent: 'center' }}>
              {randomPets.map((pet) => (
                <PetCard key={pet._id || pet.id} pet={pet} onClick={(item) => {
                  setSelectedItem(item);
                  setSelectedItemType('marketplace');
                  setDetailModalOpen(true);
                }} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Adoption Modal for Homepage */}
      <HomeAdoptionModal
        open={detailModalOpen && selectedItemType === 'adoption'}
        onClose={() => setDetailModalOpen(false)}
        pet={selectedItem}
        user={user}
        loading={false}
      />

      {/* Marketplace Modal for Homepage */}
      <HomeMarketplaceModal
        open={detailModalOpen && selectedItemType === 'marketplace'}
        onClose={() => setDetailModalOpen(false)}
        pet={selectedItem}
        user={user}
        loading={false}
      />

      {/* Generic Modal for Products Only */}
      <Modal
        open={detailModalOpen && selectedItemType === 'product'}
        onClose={() => setDetailModalOpen(false)}
        aria-labelledby="detail-modal-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}>
          <IconButton
            onClick={() => setDetailModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary'
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Image */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <img
                  src={resolveImageUrl(selectedItem.image || selectedItem.images?.[0] || selectedItem.photos?.[0])}
                  alt={selectedItem.name || selectedItem.breed}
                  style={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 12
                  }}
                  onError={(e) => {
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </Box>
              
              {/* Details */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {selectedItem.name || selectedItem.breed}
                </Typography>
                
                {selectedItem.pricePKR && (
                  <Typography variant="h6" color="error.main" fontWeight={700} gutterBottom>
                    {formatPKR(selectedItem.pricePKR)}
                  </Typography>
                )}
                
                {selectedItem.description && (
                  <>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {selectedItem.description}
                    </Typography>
                  </>
                )}
                
                {selectedItem.breed && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Breed: {selectedItem.breed}
                  </Typography>
                )}
                
                {/* Action Buttons */}
                {selectedItem.pricePKR && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      onClick={() => handleAddToCart(selectedItem)}
                    >
                      ADD TO CART
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => handleGoToCheckout(selectedItem)}
                    >
                      PROCEED TO CHECKOUT
                    </Button>
                  </Box>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => setDetailModalOpen(false)}
                  >
                    BACK TO LISTINGS
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Home; 