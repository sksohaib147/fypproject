import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  LinearProgress,
  Stack,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';
import { uploadImage } from '../utils/api';
import { formatPKR } from '../utils/currency';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const speciesOptions = [
  { label: 'Dog', value: 'dog' },
  { label: 'Cat', value: 'cat' },
  { label: 'Rabbit', value: 'rabbit' },
  { label: 'General', value: 'general' },
];
const breedOptions = {
  dog: [
    'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle',
    'Beagle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund',
  ],
  cat: [
    'Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'Bengal',
    'Sphynx', 'British Shorthair', 'Abyssinian', 'Scottish Fold', 'Birman',
  ],
  rabbit: [
    'Holland Lop', 'Netherland Dwarf', 'Mini Rex', 'Lionhead', 'Flemish Giant',
    'English Lop', 'Dutch', 'Harlequin', 'Rex', 'Polish',
  ],
  general: [
    'Universal', 'Multi-species', 'All pets', 'General use',
  ],
};

const initialForm = {
  species: '',
  breed: '',
  photos: [],
  title: '',
  description: '',
  price: '',
  location: '',
  contact: '',
};

const MarketplaceListingForm = ({ open, onClose, onSubmit, hideBreedAndSpecies, defaultCategory, initialData }) => {
  // Define steps based on form type
  const steps = hideBreedAndSpecies
    ? ['Species', 'Photos', 'Details', 'Price', 'Review & Submit']
    : ['Species & Breed', 'Photos', 'Details', 'Price', 'Location & Contact', 'Review & Submit'];

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  // Initialize form with initial data if provided (for editing)
  useEffect(() => {
    if (initialData && open) {
      const editForm = {
        species: initialData.species || initialData.category?.toLowerCase() || '',
        breed: initialData.breed || '',
        photos: initialData.photos || initialData.images || [],
        title: initialData.title || initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || initialData.pricePKR || '',
        location: initialData.location || '',
        contact: initialData.contact || '',
      };
      setForm(editForm);
    } else if (!initialData) {
      setForm(initialForm);
    }
  }, [initialData, open]);

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    if (activeStep === 0) return;
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Photo upload logic (with backend upload)
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { url } = await uploadImage(file);
        uploadedUrls.push(url);
      }
      setForm((prev) => ({ ...prev, photos: [...prev.photos, ...uploadedUrls] }));
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to upload image(s).', severity: 'error' });
    }
    setUploading(false);
  };
  const handlePhotoRemove = (idx) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  };

  // Validation per step
  const validateStep = () => {
    let stepErrors = {};
    if (!hideBreedAndSpecies && activeStep === 0) {
      if (!form.species) stepErrors.species = 'Required';
      if (!form.breed) stepErrors.breed = 'Required';
    }
    if (hideBreedAndSpecies && activeStep === 0) {
      if (!form.species) stepErrors.species = 'Required';
    }
    // Photos step
    if (activeStep === 1) {
      if (!form.photos.length) stepErrors.photos = 'At least one photo required';
    }
    // Details step
    if (activeStep === 2) {
      if (!form.title) stepErrors.title = 'Required';
      if (!form.description) stepErrors.description = 'Required';
    }
    // Price step
    if (activeStep === 3) {
      if (!form.price || isNaN(form.price) || Number(form.price) <= 0) stepErrors.price = 'Valid price required';
    }
    if (!hideBreedAndSpecies && activeStep === 4) {
      if (!form.location) stepErrors.location = 'Required';
      if (!form.contact) stepErrors.contact = 'Required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    const pricePKR = Number(form.price || form.pricePKR);
    if (!pricePKR || pricePKR < 1) {
      setSnackbar({ open: true, message: 'Price is required and must be at least 1', severity: 'error' });
      return;
    }
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      // Map form fields to backend payload
      const payload = {
        ...form,
        pricePKR,
        name: form.title,
        description: form.description,
        images: form.photos, // Use images, not photos
        category: hideBreedAndSpecies && defaultCategory 
          ? defaultCategory 
          : (form.species
              ? (form.species === 'dog' ? 'Dogs' : form.species === 'cat' ? 'Cats' : form.species === 'rabbit' ? 'Rabbit Food' : 'Other')
              : 'Other'),
        stock: 1,
        location: form.location || 'Unknown',
        condition: 'New',
        slug: form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined,
      };
      if (onSubmit) await onSubmit(payload);
      setSnackbar({ open: true, message: 'Listing submitted for review!', severity: 'success' });
      setSubmitting(false);
      if (onClose) onClose();
      setActiveStep(0);
      setForm(initialForm);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to submit listing.', severity: 'error' });
      setSubmitting(false);
    }
  };

  // Step content
  const renderStep = () => {
    if (!hideBreedAndSpecies) {
      switch (activeStep) {
        case 0:
          return (
            <Stack spacing={2}>
              <FormControl fullWidth required error={!!errors.species}>
                <InputLabel>Species *</InputLabel>
                <Select
                  value={form.species}
                  label="Species *"
                  onChange={e => handleChange('species', e.target.value)}
                >
                  {speciesOptions.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
                {errors.species && <Typography color="error" variant="caption">{errors.species}</Typography>}
              </FormControl>
              <FormControl fullWidth required error={!!errors.breed}>
                <InputLabel>Breed *</InputLabel>
                <Select
                  value={form.breed}
                  label="Breed *"
                  onChange={e => handleChange('breed', e.target.value)}
                  disabled={!form.species}
                >
                  {(breedOptions[form.species] || []).map(b => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                  ))}
                </Select>
                {errors.breed && <Typography color="error" variant="caption">{errors.breed}</Typography>}
              </FormControl>
            </Stack>
          );
        case 1:
          return (
            <Stack spacing={2}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternateIcon />}
                disabled={uploading}
              >
                Upload Photos *
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handlePhotoUpload}
                />
              </Button>
              {errors.photos && <Typography color="error" variant="caption">{errors.photos}</Typography>}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {form.photos.map((photo, idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                    <img 
                      src={resolveImageUrl(photo)} 
                      alt={`Photo ${idx + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      crossOrigin="anonymous" 
                      onError={(e) => handleImageError(e)}
                    />
                    <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'white', color: 'error.main' }} onClick={() => handlePhotoRemove(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Stack>
          );
        case 2:
          return (
            <Stack spacing={2}>
              <TextField
                label="Title *"
                fullWidth
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
              />
              <TextField
                label="Description *"
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Stack>
          );
        case 3:
          return (
            <Stack spacing={2}>
              <TextField
                label="Price (PKR) *"
                fullWidth
                type="number"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 1, step: 1 }}
              />
            </Stack>
          );
        case 4:
          return (
            <Stack spacing={2}>
              <TextField
                label="Location *"
                fullWidth
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
                error={!!errors.location}
                helperText={errors.location}
              />
              <TextField
                label="Contact Info *"
                fullWidth
                value={form.contact}
                onChange={e => handleChange('contact', e.target.value)}
                error={!!errors.contact}
                helperText={errors.contact}
              />
            </Stack>
          );
        case 5:
          return (
            <Stack spacing={2}>
              <Typography variant="h6">Review Your Listing</Typography>
              <Typography><b>Title:</b> {form.title}</Typography>
              <Typography><b>Description:</b></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{form.description}</Typography>
              <Typography><b>Price:</b> {formatPKR(Number(form.price))}</Typography>
              <Typography><b>Location:</b> {form.location}</Typography>
              <Typography><b>Contact:</b> {form.contact}</Typography>
            </Stack>
          );
        default:
          return null;
      }
    } else {
      // Product categories: species only, no breed, no location/contact
      switch (activeStep) {
          case 0: // Species step
            return (
              <Stack spacing={2}>
                <FormControl fullWidth required error={!!errors.species}>
                  <InputLabel>Species *</InputLabel>
                  <Select
                    value={form.species}
                    label="Species *"
                    onChange={e => handleChange('species', e.target.value)}
                  >
                    {speciesOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                  {errors.species && <Typography color="error" variant="caption">{errors.species}</Typography>}
                </FormControl>
              </Stack>
            );
          case 1: // Photos step
          return (
            <Stack spacing={2}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AddPhotoAlternateIcon />}
                disabled={uploading}
              >
                Upload Photos *
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handlePhotoUpload}
                />
              </Button>
              {errors.photos && <Typography color="error" variant="caption">{errors.photos}</Typography>}
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {form.photos.map((photo, idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: 80, height: 80, borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                    <img 
                      src={resolveImageUrl(photo)} 
                      alt={`Photo ${idx + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      crossOrigin="anonymous" 
                      onError={(e) => handleImageError(e)}
                    />
                    <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'white', color: 'error.main' }} onClick={() => handlePhotoRemove(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Stack>
          );
        case 2: // Details step
          return (
            <Stack spacing={2}>
              <TextField
                label="Title *"
                fullWidth
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
              />
              <TextField
                label="Description *"
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Stack>
          );
        case 3: // Price step
          return (
            <Stack spacing={2}>
              <TextField
                label="Price (PKR) *"
                fullWidth
                type="number"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 1, step: 1 }}
              />
            </Stack>
          );
        case 4: // Review & Submit step
          return (
            <Stack spacing={2}>
              <Typography variant="h6">Review Your Listing</Typography>
              <Typography><b>Species:</b> {form.species}</Typography>
              <Typography><b>Category:</b> {defaultCategory || 'Other'}</Typography>
              <Typography><b>Title:</b> {form.title}</Typography>
              <Typography><b>Description:</b></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{form.description}</Typography>
              <Typography><b>Price:</b> {formatPKR(Number(form.price))}</Typography>
            </Stack>
          );
        default:
          return null;
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{hideBreedAndSpecies ? 'List a Product for Sale' : 'List a Pet for Sale'}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStep()}
        {submitting && <LinearProgress sx={{ mt: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={submitting}>Cancel</Button>
        {activeStep > 0 && <Button onClick={handleBack} disabled={submitting}>Back</Button>}
        {activeStep < steps.length - 1 && <Button onClick={handleNext} disabled={submitting}>Next</Button>}
        {activeStep === steps.length - 1 && <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>Submit</Button>}
      </DialogActions>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Dialog>
  );
};

export default MarketplaceListingForm; 