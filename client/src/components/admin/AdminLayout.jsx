import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaShoppingBag,
  FaUsers,
  FaBox,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import { Box } from '@mui/material';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <FaShoppingBag />, label: 'Orders' },
    { path: '/admin/products', icon: <FaBox />, label: 'Products' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users' },
    { path: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics' },
    { path: '/admin/about', icon: <FaInfoCircle />, label: 'About Page' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Mobile Sidebar Toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-red-500 text-white md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <Box component="aside" sx={{ position: 'fixed', insetY: 0, left: 0, zIndex: 40, width: 256, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 2, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.2s', height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <Box sx={{ p: 4, borderBottom: 1, borderColor: 'divider' }}>
            <h1 className="text-2xl font-bold" style={{ color: '#ef4444' }}>Admin Panel</h1>
          </Box>

          {/* Navigation */}
          <Box component="nav" sx={{ flex: 1, p: 4 }}>
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8,
                  background: location.pathname === item.path ? '#fff1f2' : 'transparent',
                  color: location.pathname === item.path ? '#ef4444' : 'inherit',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  textDecoration: 'none',
                  marginBottom: 8,
                  transition: 'background 0.2s, color 0.2s'
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </Box>

          {/* Logout Button */}
          <Box sx={{ p: 4, borderTop: 1, borderColor: 'divider' }}>
            <button
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', color: 'inherit', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </Box>
        </Box>

      {/* Main Content */}
      <Box component="main" sx={{ minHeight: '100vh', ml: { md: 256 }, bgcolor: 'background.default', color: 'text.primary', p: 8, transition: 'margin-left 0.2s' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 