import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { Box, Typography, useTheme } from '@mui/material';
import api from '../utils/api';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, shipped, delivered, cancelled
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      const data = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaClock style={{ color: theme.palette.warning.main }} />;
      case 'processing':
        return <FaBox style={{ color: theme.palette.info.main }} />;
      case 'shipped':
        return <FaTruck style={{ color: theme.palette.secondary.main }} />;
      case 'delivered':
        return <FaCheckCircle style={{ color: theme.palette.success.main }} />;
      case 'cancelled':
        return <FaTimesCircle style={{ color: theme.palette.error.main }} />;
      default:
        return <FaClock style={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bgcolor: 'warning.light', color: 'warning.dark' };
      case 'processing':
        return { bgcolor: 'info.light', color: 'info.dark' };
      case 'shipped':
        return { bgcolor: 'secondary.light', color: 'secondary.dark' };
      case 'delivered':
        return { bgcolor: 'success.light', color: 'success.dark' };
      case 'cancelled':
        return { bgcolor: 'error.light', color: 'error.dark' };
      default:
        return { bgcolor: 'action.hover', color: 'text.secondary' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ bgcolor: 'background.paper', p: 6, borderRadius: 3, boxShadow: 2 }}>
                <Box sx={{ height: 32, bgcolor: 'grey.200', borderRadius: 2, mb: 4 }} />
                <Box sx={{ height: 24, bgcolor: 'grey.200', borderRadius: 2 }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', py: 8 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4 }}>
        <Typography variant="h3" fontWeight={700} mb={8}>Order History</Typography>
        {error && <Typography color="error">{error}</Typography>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filteredOrders.map(order => (
            <Box key={order._id} sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2, p: 6 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Order #{order._id}</Typography>
              <Typography color="text.secondary" mb={2}>Placed on {formatDate(order.createdAt)}</Typography>
              {/* Add more order details as needed */}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default OrderHistory; 