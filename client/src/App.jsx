import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { useTheme, ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
import PCMarketplace from './pages/P&CMarketplace';
import Adoption from './pages/Adoption';
import ProductDetail from './pages/ProductDetail';
import PetDetail from './pages/PetDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Search from './pages/Search';
import Chat from './pages/Chat';
import EditListing from './pages/EditListing';
import AuthCallback from './pages/AuthCallback';

// Category pages
import DogFoodDropdown from './pages/DogFoodDropdown';
import CatFoodDropdown from './pages/CatFoodDropdown';
import RabbitFoodDropdown from './pages/RabbitFoodDropdown';
import ToysDropdown from './pages/ToysDropdown';
import BeltsAndCagesDropdown from './pages/BeltsAndCagesDropdown';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ListingsManagement from './pages/admin/ListingsManagement';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import AboutManagement from './pages/admin/AboutManagement';
import AdminProfile from './pages/admin/AdminProfile';

// Dashboard pages
import BuyerDashboardHome from './pages/dashboard/BuyerDashboardHome';
import SellerDashboardHome from './pages/dashboard/SellerDashboardHome';
import AdminDashboardHome from './pages/dashboard/AdminDashboardHome';

function AppContent() {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <NotificationProvider>
                <Router>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    color: 'text.primary'
                  }}>
                    <ErrorBoundary>
                      <Navbar />
                      <Box component="main" sx={{ flexGrow: 1 }}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/pcmarketplace" element={<PCMarketplace />} />
                          <Route path="/adoption" element={<Adoption />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/pet/:id" element={<PetDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/auth/callback" element={<AuthCallback />} />
                          {/* Profile route: restore ProtectedRoute for production */}
                          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                          <Route path="/order-success" element={<OrderSuccess />} />
                          <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/search" element={<Search />} />
                          <Route path="/chat/:listingType/:listingId/:userId/:ownerId" element={<Chat />} />
                          <Route path="/edit-listing/:listingType/:listingId" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
                          
                          {/* Category routes */}
                          <Route path="/dog-food" element={<DogFoodDropdown />} />
                          <Route path="/cat-food" element={<CatFoodDropdown />} />
                          <Route path="/rabbit-food" element={<RabbitFoodDropdown />} />
                          <Route path="/toys" element={<ToysDropdown />} />
                          <Route path="/belts-and-cages" element={<BeltsAndCagesDropdown />} />
                          
                          {/* Admin routes */}
                          <Route path="/admin/login" element={<AdminLogin />} />
                          <Route path="/admin/dashboard" element={
                            <ProtectedRoute requireAdmin={true}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          } />
                          <Route path="/admin/listings" element={<ProtectedRoute requireAdmin={true}><ListingsManagement /></ProtectedRoute>} />
                          <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>} />
                          <Route path="/admin/reports" element={<ProtectedRoute requireAdmin={true}><Reports /></ProtectedRoute>} />
                          <Route path="/admin/about" element={<ProtectedRoute requireAdmin={true}><AboutManagement /></ProtectedRoute>} />
                          <Route path="/admin/profile" element={<ProtectedRoute requireAdmin={true}><AdminProfile /></ProtectedRoute>} />
                          
                          {/* Dashboard routes */}
                          <Route path="/dashboard/buyer" element={<ProtectedRoute><BuyerDashboardHome /></ProtectedRoute>} />
                          <Route path="/dashboard/seller" element={<ProtectedRoute><SellerDashboardHome /></ProtectedRoute>} />
                          <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboardHome /></ProtectedRoute>} />
                        </Routes>
                      </Box>
                      <Footer />
                    </ErrorBoundary>
                  </Box>
                </Router>
              </NotificationProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}

export default App;
