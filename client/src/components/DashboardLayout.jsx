import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box } from '@mui/material';

const DashboardLayout = () => {
  const { user } = useAuth();

  // Example role-based sidebar links
  const sidebarLinks = {
    buyer: [
      { to: '/dashboard', label: 'My Orders' },
      { to: '/dashboard/profile', label: 'Profile' },
    ],
    seller: [
      { to: '/dashboard', label: 'My Products' },
      { to: '/dashboard/orders', label: 'Orders' },
    ],
    admin: [
      { to: '/dashboard', label: 'Admin Home' },
      { to: '/dashboard/users', label: 'Manage Users' },
    ],
  };

  // Default to buyer if no user or role
  const links = sidebarLinks[user?.role] || sidebarLinks['buyer'];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="aside" sx={{ width: 256, bgcolor: 'background.paper', color: 'text.primary', p: 6 }}>
        <nav>
          <ul>
            {links.map(link => (
              <li key={link.to} style={{ marginBottom: 16 }}>
                <Link to={link.to} style={{ textDecoration: 'none', color: 'inherit' }}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Box>
      <Box component="main" sx={{ flex: 1, bgcolor: 'background.default', color: 'text.primary', p: 8 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout; 