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
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage, createAdoption } from '../../utils/api';
import { resolveImageUrl, handleImageError } from '../../utils/imageUtils';

const steps = [
  'Species & Breed',
  'Photos',
  'Details',
  'Age & Health',
  'Location & Contact',
  'Review & Submit',
];

const speciesOptions = [
  { label: 'Dog', value: 'dog' },
  { label: 'Cat', value: 'cat' },
  { label: 'Rabbit', value: 'rabbit' },
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
};
const sizeOptions = ['Small', 'Medium', 'Large'];
const genderOptions = ['Male', 'Female'];
const healthOptions = ['Healthy', 'Special Needs', 'Vaccinated', 'Neutered/Spayed'];

const initialForm = {
  species: '',
  breed: '',
  photos: [],
  title: '',
  description: '',
  age: '',
  gender: '',
  size: '',
  health: '',
  location: '',
  contact: '',
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const AdoptionListingForm = ({ open, onClose, onSubmit, initialData }) => {
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
        species: initialData.species || '',
        breed: initialData.breed || '',
        photos: initialData.photos || [],
        title: initialData.title || '',
        description: initialData.description || '',
        age: initialData.age || '',
        gender: initialData.gender || '',
        size: initialData.size || '',
        health: initialData.health || '',
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
  const handleBack = () => setActiveStep((prev) => prev - 1);

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
    if (activeStep === 0) {
      if (!form.species) stepErrors.species = 'Required';
      if (!form.breed) stepErrors.breed = 'Required';
    }
    if (activeStep === 1) {
      if (!form.photos.length) stepErrors.photos = 'At least one photo required';
    }
    if (activeStep === 2) {
      if (!form.title) stepErrors.title = 'Required';
      if (!form.description) stepErrors.description = 'Required';
    }
    if (activeStep === 3) {
      if (!form.age) stepErrors.age = 'Required';
      if (!form.gender) stepErrors.gender = 'Required';
      if (!form.size) stepErrors.size = 'Required';
      if (!form.health) stepErrors.health = 'Required';
    }
    if (activeStep === 4) {
      if (!form.location) stepErrors.location = 'Required';
      if (!form.contact) stepErrors.contact = 'Required';
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      // Map frontend fields to server expected fields
      const payload = {
        title: form.title,
        species: form.species,
        breed: form.breed,
        age: Number(form.age),
        gender: form.gender.toLowerCase(),
        size: form.size,
        description: form.description,
        photos: form.photos,
        location: form.location
      };
      await createAdoption(payload);
      setSnackbar({ open: true, message: 'Listing submitted for review!', severity: 'success' });
      setSubmitting(false);
      if (onSubmit) onSubmit(form);
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
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={2}>
            <FormControl fullWidth required error={!!errors.species}>
              <InputLabel>Species</InputLabel>
              <Select
                value={form.species}
                label="Species"
                onChange={e => handleChange('species', e.target.value)}
              >
                {speciesOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </Select>
              {errors.species && <Typography color="error" variant="caption">{errors.species}</Typography>}
            </FormControl>
            <FormControl fullWidth required error={!!errors.breed}>
              <InputLabel>Breed</InputLabel>
              <Select
                value={form.breed}
                label="Breed"
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
              color={errors.photos ? 'error' : 'primary'}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Photos'}
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handlePhotoUpload}
              />
            </Button>
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
            {errors.photos && <Typography color="error" variant="caption">{errors.photos}</Typography>}
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={2}>
            <TextField
              label="Title"
              fullWidth
              required
              value={form.title}
              onChange={e => handleChange('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
            />
            <TextField
              label="Description"
              fullWidth
              required
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
              label="Age (years)"
              type="number"
              fullWidth
              required
              value={form.age}
              onChange={e => handleChange('age', e.target.value)}
              error={!!errors.age}
              helperText={errors.age}
              inputProps={{ min: 0, max: 20 }}
            />
            <FormControl fullWidth required error={!!errors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={form.gender}
                label="Gender"
                onChange={e => handleChange('gender', e.target.value)}
              >
                {genderOptions.map(g => (
                  <MenuItem key={g} value={g}>{g}</MenuItem>
                ))}
              </Select>
              {errors.gender && <Typography color="error" variant="caption">{errors.gender}</Typography>}
            </FormControl>
            <FormControl fullWidth required error={!!errors.size}>
              <InputLabel>Size</InputLabel>
              <Select
                value={form.size}
                label="Size"
                onChange={e => handleChange('size', e.target.value)}
              >
                {sizeOptions.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
              {errors.size && <Typography color="error" variant="caption">{errors.size}</Typography>}
            </FormControl>
            <FormControl fullWidth required error={!!errors.health}>
              <InputLabel>Health Status</InputLabel>
              <Select
                value={form.health}
                label="Health Status"
                onChange={e => handleChange('health', e.target.value)}
              >
                {healthOptions.map(h => (
                  <MenuItem key={h} value={h}>{h}</MenuItem>
                ))}
              </Select>
              {errors.health && <Typography color="error" variant="caption">{errors.health}</Typography>}
            </FormControl>
          </Stack>
        );
      case 4:
        return (
          <Stack spacing={2}>
            <TextField
              label="Location"
              fullWidth
              required
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              error={!!errors.location}
              helperText={errors.location}
            />
            <TextField
              label="Contact Info"
              fullWidth
              required
              value={form.contact}
              onChange={e => handleChange('contact', e.target.value)}
              error={!!errors.contact}
              helperText={errors.contact}
            />
          </Stack>
        );
      case 5:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review Listing</Typography>
            <Stack spacing={1}>
              <Typography><b>Species:</b> {form.species}</Typography>
              <Typography><b>Breed:</b> {form.breed}</Typography>
              <Typography><b>Title:</b> {form.title}</Typography>
              <Typography><b>Description:</b></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{form.description}</Typography>
              <Typography><b>Age:</b> {form.age}</Typography>
              <Typography><b>Gender:</b> {form.gender}</Typography>
              <Typography><b>Size:</b> {form.size}</Typography>
              <Typography><b>Health:</b> {form.health}</Typography>
              <Typography><b>Location:</b> {form.location}</Typography>
              <Typography><b>Contact:</b> {form.contact}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {form.photos.map((photo, idx) => (
                  <Box key={idx} sx={{ position: 'relative', width: 56, height: 56, borderRadius: 2, overflow: 'hidden', boxShadow: 1 }}>
                    <img 
                      src={resolveImageUrl(photo)} 
                      alt={`Photo ${idx + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      crossOrigin="anonymous" 
                      onError={(e) => handleImageError(e)}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>List a Pet for Adoption</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <LinearProgress variant="determinate" value={((activeStep + 1) / steps.length) * 100} sx={{ mb: 2 }} />
          {renderStep()}
        </DialogContent>
        <DialogActions>
          {activeStep > 0 && (
            <Button onClick={handleBack} color="inherit" disabled={submitting}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 && (
            <Button onClick={handleNext} variant="contained" color="primary" disabled={submitting}>
              Next
            </Button>
          )}
          {activeStep === steps.length - 1 && (
            <Button onClick={handleSubmit} variant="contained" color="success" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
          <Button onClick={onClose} color="secondary" disabled={submitting}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdoptionListingForm; 