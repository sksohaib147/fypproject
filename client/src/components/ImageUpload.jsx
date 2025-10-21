import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadImage } from '../utils/api';
import { resolveImageUrl, handleImageError } from '../utils/imageUtils';

const ImageUpload = ({ images, onChange, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }
    setUploading(true);
    setError('');
    try {
      const uploadPromises = files.map(file => uploadImage(file).then(res => res.url));
      const urls = await Promise.all(uploadPromises);
      onChange([...images, ...urls]);
    } catch (err) {
      setError('Failed to upload image(s).');
    }
    setUploading(false);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <Box>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        multiple
        onChange={handleImageChange}
      />
      <label htmlFor="image-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={images.length >= maxImages || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
      </label>
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {images.length} of {maxImages} images uploaded
      </Typography>
      <ImageList sx={{ mt: 2 }} cols={4} rowHeight={100}>
        {images.map((image, index) => (
          <ImageListItem key={index}>
            <img
              src={resolveImageUrl(image)}
              alt={`Uploaded ${index + 1}`}
              loading="lazy"
              style={{ height: '100%', objectFit: 'cover' }}
              onError={(e) => handleImageError(e)}
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
              onClick={() => handleRemoveImage(index)}
            >
              <DeleteIcon />
            </IconButton>
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default ImageUpload; 