import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const AboutManagement = () => {
  const [aboutData, setAboutData] = useState({
    hero: {
      title: '',
      subtitle: '',
      description: ''
    },
    mission: {
      title: '',
      description: ''
    },
    vision: {
      title: '',
      description: ''
    },
    features: [],
    statistics: {
      petsAdopted: 0,
      happyCustomers: 0,
      productsSold: 0
    },
    contact: {
      email: '',
      phone: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await axios.get('/api/about');
      setAboutData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load about page content');
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setAboutData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...aboutData.features];
    newFeatures[index] = {
      ...newFeatures[index],
      [field]: value
    };
    setAboutData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setAboutData(prev => ({
      ...prev,
      features: [
        ...prev.features,
        { icon: 'FaPaw', title: '', description: '' }
      ]
    }));
  };

  const removeFeature = (index) => {
    setAboutData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/about', aboutData);
      setSuccess(true);
      setSaving(false);
    } catch (err) {
      setError('Failed to save changes');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage About Page Content
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Hero Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Hero Section</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={aboutData.hero.title}
                onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={aboutData.hero.subtitle}
                onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={aboutData.hero.description}
                onChange={(e) => handleInputChange('hero', 'description', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Mission & Vision */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Mission</Typography>
              <TextField
                fullWidth
                label="Title"
                value={aboutData.mission.title}
                onChange={(e) => handleInputChange('mission', 'title', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={aboutData.mission.description}
                onChange={(e) => handleInputChange('mission', 'description', e.target.value)}
                required
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Vision</Typography>
              <TextField
                fullWidth
                label="Title"
                value={aboutData.vision.title}
                onChange={(e) => handleInputChange('vision', 'title', e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={aboutData.vision.description}
                onChange={(e) => handleInputChange('vision', 'description', e.target.value)}
                required
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Features */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Features</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={addFeature}
              variant="outlined"
            >
              Add Feature
            </Button>
          </Box>
          {aboutData.features.map((feature, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <IconButton onClick={() => removeFeature(index)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Icon Name"
                    value={feature.icon}
                    onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={feature.title}
                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Description"
                    value={feature.description}
                    onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                    required
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Paper>

        {/* Statistics */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Pets Adopted"
                value={aboutData.statistics.petsAdopted}
                onChange={(e) => handleInputChange('statistics', 'petsAdopted', parseInt(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Happy Customers"
                value={aboutData.statistics.happyCustomers}
                onChange={(e) => handleInputChange('statistics', 'happyCustomers', parseInt(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Products Sold"
                value={aboutData.statistics.productsSold}
                onChange={(e) => handleInputChange('statistics', 'productsSold', parseInt(e.target.value))}
                required
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Contact Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Contact Information</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={aboutData.contact.email}
                onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={aboutData.contact.phone}
                onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Changes saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AboutManagement; 