import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../utils/api';
import { formatPKR } from '../../utils/currency';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  const [reports, setReports] = useState({
    salesData: [],
    userGrowth: [],
    topProducts: [],
    categoryDistribution: [],
    orderStatus: [],
    revenueStats: {
      total: 0,
      average: 0,
      growth: 0
    }
  });

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch order statistics
      const orderStats = await api.get('/orders/stats/overview');
      
      // Fetch orders for detailed analysis
      const orders = await api.get('/orders');
      const products = await api.get('/products');
      const users = await api.get('/users');

      // Process data for charts
      const salesData = processSalesData(orders, timeRange);
      const userGrowth = processUserGrowth(users, timeRange);
      const topProducts = processTopProducts(products);
      const categoryDistribution = processCategoryDistribution(products);
      const orderStatus = processOrderStatus(orders);

      setReports({
        salesData,
        userGrowth,
        topProducts,
        categoryDistribution,
        orderStatus,
        revenueStats: {
          total: orderStats.overview.totalRevenue,
          average: orderStats.overview.averageOrderValue,
          growth: calculateGrowth(salesData)
        }
      });
    } catch (err) {
      setError('Failed to load reports');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const processSalesData = (orders, days) => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      data.push({
        date: date.toLocaleDateString(),
        revenue,
        orders: dayOrders.length
      });
    }
    
    return data;
  };

  const processUserGrowth = (users, days) => {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayUsers = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate.toDateString() === date.toDateString();
      });
      
      data.push({
        date: date.toLocaleDateString(),
        users: dayUsers.length
      });
    }
    
    return data;
  };

  const processTopProducts = (products) => {
    return products
      .sort((a, b) => (b.ratings?.count || 0) - (a.ratings?.count || 0))
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        sales: product.ratings?.count || 0,
        revenue: (product.pricePKR * (product.ratings?.count || 0))
      }));
  };

  const processCategoryDistribution = (products) => {
    const categories = {};
    products.forEach(product => {
      categories[product.category] = (categories[product.category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };

  const processOrderStatus = (orders) => {
    const statuses = {};
    orders.forEach(order => {
      statuses[order.status] = (statuses[order.status] || 0) + 1;
    });
    
    return Object.entries(statuses).map(([status, count]) => ({
      status,
      count,
      percentage: (count / orders.length) * 100
    }));
  };

  const calculateGrowth = (salesData) => {
    if (salesData.length < 2) return 0;
    
    const recent = salesData.slice(-7).reduce((sum, day) => sum + day.revenue, 0);
    const previous = salesData.slice(-14, -7).reduce((sum, day) => sum + day.revenue, 0);
    
    if (previous === 0) return 100;
    return ((recent - previous) / previous) * 100;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const exportReport = (type) => {
    // Implementation for exporting reports
    console.log(`Exporting ${type} report`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics & Reports
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportReport('sales')}
              sx={{ mr: 1 }}
            >
              Export Sales
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => exportReport('users')}
            >
              Export Users
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Revenue Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" component="div">
                {formatPKR(reports.revenueStats.total)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {reports.revenueStats.growth >= 0 ? (
                  <TrendingUpIcon color="success" />
                ) : (
                  <TrendingDownIcon color="error" />
                )}
                <Typography
                  variant="body2"
                  color={reports.revenueStats.growth >= 0 ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {Math.abs(reports.revenueStats.growth).toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Average Order Value
              </Typography>
              <Typography variant="h4" component="div">
                {formatPKR(reports.revenueStats.average)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4" component="div">
                {reports.salesData.reduce((sum, day) => sum + day.orders, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales Trend */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reports.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reports.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reports.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Products by Sales
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reports.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Status */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Status Distribution
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.orderStatus.map((item) => (
                    <TableRow key={item.status}>
                      <TableCell>
                        <Chip
                          label={item.status}
                          color={item.status === 'paid' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{item.count}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={item.percentage}
                              sx={{ height: 8, borderRadius: 5 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {item.percentage.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 