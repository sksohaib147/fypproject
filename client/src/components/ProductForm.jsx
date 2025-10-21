import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPKR } from '../utils/currency';
import { validateImage, validateProduct } from '../utils/ecommerce';
import { Box, Button, Typography, IconButton } from '@mui/material';
import ImageUpload from './ImageUpload';

const ProductForm = ({ initialData, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePKR: '',
    originalPricePKR: '',
    category: '',
    condition: '',
    images: [],
    stock: 1,
    location: '',
    tags: [],
    shipping: {
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      freeShipping: false
    },
    ...initialData
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pkrPrice, setPkrPrice] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (formData.pricePKR) {
      setPkrPrice(formatPKR(parseFloat(formData.pricePKR)));
    }
  }, [formData.pricePKR]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [name]: value
      }
    }));
  };

  const handleDimensionsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        dimensions: {
          ...prev.shipping.dimensions,
          [name]: value
        }
      }
    }));
  };

  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value
      }
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validation = validateProduct(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        pricePKR: parseFloat(formData.pricePKR),
      };
      await onSubmit(payload);
      navigate('/products');
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'An error occurred while saving the product'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography variant="body2" color="text.secondary">
          Product Name
        </Typography>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 ${
            errors.name ? 'border-red-500' : ''
          }`}
          required
        />
        {errors.name && (
          <Typography color="error.main" variant="body2" sx={{ mt: 0.5 }}>
            {errors.name}
          </Typography>
        )}
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          Description
        </Typography>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 ${
            errors.description ? 'border-red-500' : ''
          }`}
          required
        />
        {errors.description && (
          <Typography color="error.main" variant="body2" sx={{ mt: 0.5 }}>
            {errors.description}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Price (PKR)
          </Typography>
          <input
            type="number"
            name="pricePKR"
            value={formData.pricePKR}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            required
            min="0"
          />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Original Price (PKR)
          </Typography>
          <input
            type="number"
            name="originalPricePKR"
            value={formData.originalPricePKR}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            min="0"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Category
          </Typography>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 ${
              errors.category ? 'border-red-500' : ''
            }`}
            required
          >
            <option value="">Select a category</option>
            <option value="Dogs">Dogs</option>
            <option value="Cats">Cats</option>
            <option value="Birds">Birds</option>
            <option value="Fish">Fish</option>
            <option value="Other">Other</option>
            <option value="Rabbit Food">Rabbit Food</option>
            <option value="Toys">Toys</option>
            <option value="Belts and Cages">Belts and Cages</option>
          </select>
          {errors.category && (
            <Typography color="error.main" variant="body2" sx={{ mt: 0.5 }}>
              {errors.category}
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Condition
          </Typography>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 ${
              errors.condition ? 'border-red-500' : ''
            }`}
            required
          >
            <option value="">Select condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
          {errors.condition && (
            <Typography color="error.main" variant="body2" sx={{ mt: 0.5 }}>
              {errors.condition}
            </Typography>
          )}
        </Box>
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          Location
        </Typography>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 ${
            errors.location ? 'border-red-500' : ''
          }`}
          required
        />
        {errors.location && (
          <Typography color="error.main" variant="body2" sx={{ mt: 0.5 }}>
            {errors.location}
          </Typography>
        )}
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          Stock Quantity
        </Typography>
        <input
          type="number"
          id="stock"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          required
        />
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          Tags
        </Typography>
        <Box sx={{ mt: 1 }}>
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Add tags (press Enter)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          />
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.tags.map((tag, index) => (
              <Box
                key={index}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'action.active'
                }}
              >
                {tag}
                <IconButton
                  type="button"
                  onClick={() => removeTag(tag)}
                  sx={{ ml: 0.5, color: 'action.active' }}
                >
                  ×
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, color: 'text.primary' }}>
          Shipping Information
        </Typography>
        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Weight (kg)
            </Typography>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.shipping.weight}
              onChange={handleShippingChange}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="freeShipping"
              name="freeShipping"
              checked={formData.shipping.freeShipping}
              onChange={handleShippingChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="freeShipping" className="ml-2 block text-sm text-gray-900">
              Free Shipping
            </label>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
            Dimensions (cm)
          </Typography>
          <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Length
              </Typography>
              <input
                type="number"
                id="length"
                name="length"
                value={formData.shipping.dimensions.length}
                onChange={handleDimensionsChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Width
              </Typography>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.shipping.dimensions.width}
                onChange={handleDimensionsChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Height
              </Typography>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.shipping.dimensions.height}
                onChange={handleDimensionsChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box>
        <Typography variant="body2" color="text.secondary">
          Product Images
        </Typography>
        <ImageUpload images={formData.images} onChange={imgs => setFormData(prev => ({ ...prev, images: imgs }))} maxImages={5} />
        {errors.images && (
          <Typography color="error.main" variant="body2" sx={{ mt: 0.5 }}>
            {errors.images}
          </Typography>
        )}
      </Box>

      {errors.submit && (
        <Box sx={{ 
          borderRadius: 2, 
          bgcolor: 'error.light', 
          p: 2, 
          mb: 2 
        }}>
          <Typography variant="body2" color="error.dark" fontWeight={500}>
            {errors.submit}
          </Typography>
        </Box>
      )}

      <Box>
        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          fullWidth
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            py: 1.5,
            '&:hover': { bgcolor: 'error.dark' },
            '&:disabled': { opacity: 0.5 }
          }}
        >
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProductForm; 