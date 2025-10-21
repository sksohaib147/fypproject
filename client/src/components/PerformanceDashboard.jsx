import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Paper, Grid, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const PerformanceDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');
  const [stats, setStats] = useState({
    totalInteractions: 0,
    withinThreshold: 0,
    averageDuration: 0,
    minDuration: 0,
    maxDuration: 0,
    percentage: 0,
    meetsSRSRequirement: false
  });
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    metrics: {
      memoryUsage: 45.2,
      connectionCount: 1250,
      avgResponseTime: 850,
      errorRate: 1.2,
      uptime: 86400000
    },
    recommendations: []
  });
  const theme = useTheme();

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        // Simulate data updates
        setStats(prev => ({
          ...prev,
          totalInteractions: prev.totalInteractions + Math.floor(Math.random() * 5),
          withinThreshold: prev.withinThreshold + Math.floor(Math.random() * 3),
          averageDuration: Math.floor(Math.random() * 500) + 500,
          minDuration: Math.floor(Math.random() * 200) + 100,
          maxDuration: Math.floor(Math.random() * 1000) + 1500,
          percentage: Math.floor(Math.random() * 20) + 85,
          meetsSRSRequirement: Math.random() > 0.3
        }));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const handleExport = () => {
    const data = {
      stats,
      systemHealth,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setStats({
      totalInteractions: 0,
      withinThreshold: 0,
      averageDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      percentage: 0,
      meetsSRSRequirement: false
    });
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: 'primary.main',
          color: 'white',
          p: 1,
          borderRadius: '50%',
          boxShadow: 3,
          zIndex: 50,
          minWidth: 48,
          width: 48,
          height: 48
        }}
        title="Performance Dashboard"
      >
        ⏱️
      </Button>
    );
  }

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      bgcolor: 'background.paper', 
      color: 'text.primary', 
      border: 1, 
      borderColor: 'divider', 
      borderRadius: 2, 
      boxShadow: 6, 
      p: 3, 
      width: 384, 
      zIndex: 50, 
      maxHeight: 384, 
      overflowY: 'auto', 
      transition: 'background-color 0.3s' 
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>Performance Monitor</Typography>
        <IconButton
          onClick={() => setIsVisible(false)}
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          ✕
        </IconButton>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ display: 'flex', mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Button
          onClick={() => setActiveTab('performance')}
          sx={{
            px: 2,
            py: 1,
            color: activeTab === 'performance' ? 'primary.main' : 'text.secondary',
            borderBottom: activeTab === 'performance' ? 2 : 0,
            borderColor: 'primary.main',
            borderRadius: 0,
            '&:hover': { bgcolor: 'transparent' }
          }}
        >
          Performance
        </Button>
        <Button
          onClick={() => setActiveTab('system')}
          sx={{
            px: 2,
            py: 1,
            color: activeTab === 'system' ? 'primary.main' : 'text.secondary',
            borderBottom: activeTab === 'system' ? 2 : 0,
            borderColor: 'primary.main',
            borderRadius: 0,
            '&:hover': { bgcolor: 'transparent' }
          }}
        >
          System Health
        </Button>
      </Box>

      {activeTab === 'performance' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* SRS Compliance */}
          <Paper sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: stats.meetsSRSRequirement ? 'success.light' : 'error.light' 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={500}>SRS Compliance (95%)</Typography>
              <Typography variant="h6" fontWeight={700} color={stats.meetsSRSRequirement ? 'success.main' : 'error.main'}>
                {stats.percentage}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" fontSize={14}>
              {stats.meetsSRSRequirement ? '✅ Meeting requirement' : '❌ Below requirement'}
            </Typography>
          </Paper>

          {/* Key Metrics */}
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                <Typography variant="body2" fontWeight={500}>Total Interactions</Typography>
                <Typography variant="h6" fontWeight={700}>{stats.totalInteractions}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                <Typography variant="body2" fontWeight={500}>Within 2s</Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">{stats.withinThreshold}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Duration Stats */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Average Duration:</Typography>
              <Typography variant="body2" fontWeight={500}>{stats.averageDuration}ms</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Min Duration:</Typography>
              <Typography variant="body2" fontWeight={500} color="success.main">{stats.minDuration}ms</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Max Duration:</Typography>
              <Typography variant="body2" fontWeight={500} color={parseFloat(stats.maxDuration) > 2000 ? 'error.main' : 'success.main'}>
                {stats.maxDuration}ms
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {activeTab === 'system' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* System Health Status */}
          <Paper sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: systemHealth.status === 'healthy' ? 'success.light' : 
                     systemHealth.status === 'warning' ? 'warning.light' : 'error.light'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight={500}>System Status</Typography>
              <Typography variant="h6" fontWeight={700} color={
                systemHealth.status === 'healthy' ? 'success.main' : 
                systemHealth.status === 'warning' ? 'warning.main' : 'error.main'
              }>
                {systemHealth.status.toUpperCase()}
              </Typography>
            </Box>
          </Paper>

          {/* System Metrics */}
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                <Typography variant="body2" fontWeight={500}>Memory Usage</Typography>
                <Typography variant="h6" fontWeight={700} color={
                  systemHealth.metrics.memoryUsage > 80 ? 'error.main' : 
                  systemHealth.metrics.memoryUsage > 60 ? 'warning.main' : 'success.main'
                }>
                  {systemHealth.metrics.memoryUsage.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                <Typography variant="body2" fontWeight={500}>Active Connections</Typography>
                <Typography variant="h6" fontWeight={700} color={
                  systemHealth.metrics.connectionCount > 5000 ? 'error.main' : 
                  systemHealth.metrics.connectionCount > 2000 ? 'warning.main' : 'success.main'
                }>
                  {systemHealth.metrics.connectionCount}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Response Time and Error Rate */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Avg Response Time:</Typography>
              <Typography variant="body2" fontWeight={500} color={
                systemHealth.metrics.avgResponseTime > 2000 ? 'error.main' : 
                systemHealth.metrics.avgResponseTime > 1000 ? 'warning.main' : 'success.main'
              }>
                {systemHealth.metrics.avgResponseTime.toFixed(0)}ms
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Error Rate:</Typography>
              <Typography variant="body2" fontWeight={500} color={
                systemHealth.metrics.errorRate > 5 ? 'error.main' : 
                systemHealth.metrics.errorRate > 2 ? 'warning.main' : 'success.main'
              }>
                {systemHealth.metrics.errorRate.toFixed(2)}%
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Uptime:</Typography>
              <Typography variant="body2" fontWeight={500}>
                {Math.floor(systemHealth.metrics.uptime / 1000)}s
              </Typography>
            </Box>
          </Box>

          {/* Recommendations */}
          {systemHealth.recommendations.length > 0 && (
            <Paper sx={{ p: 1, borderRadius: 1, bgcolor: 'warning.light' }}>
              <Typography variant="body2" fontWeight={500} color="warning.dark" sx={{ mb: 0.5 }}>
                Recommendations:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {systemHealth.recommendations.map((rec, index) => (
                  <Typography key={index} variant="body2" component="li" color="warning.dark" fontSize={12}>
                    {rec}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={toggleMonitoring}
          variant="contained"
          size="small"
          sx={{
            flex: 1,
            bgcolor: isMonitoring ? 'error.main' : 'success.main',
            '&:hover': { bgcolor: isMonitoring ? 'error.dark' : 'success.dark' }
          }}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          size="small"
          sx={{ flex: 1, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}
        >
          Export Data
        </Button>
        <Button
          onClick={handleClear}
          variant="contained"
          size="small"
          sx={{ flex: 1, bgcolor: 'grey.600', '&:hover': { bgcolor: 'grey.700' } }}
        >
          Clear
        </Button>
      </Box>

      {/* Instructions */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {activeTab === 'performance' 
          ? 'Monitor interaction performance and SRS compliance.'
          : 'Monitor system health for concurrent user support.'
        }
      </Typography>
    </Box>
  );
};

export default PerformanceDashboard; 