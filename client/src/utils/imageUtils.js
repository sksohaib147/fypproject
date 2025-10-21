// Comprehensive image handling utilities
// Supports: JPEG, PNG, GIF, WebP, SVG, and data URLs

// For images, we need the base URL without /api since images are served directly
const getImageBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove /api from the URL if it exists, since images are served directly
  return apiUrl.replace('/api', '');
};

/**
 * Enhanced image URL resolver with support for multiple formats
 * @param {string} imagePath - The image path or filename
 * @returns {string} - The resolved image URL
 */
export const resolveImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('No image path provided, using placeholder');
    return '/placeholder.svg';
  }
  
  if (typeof imagePath === 'string') {
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      console.log('Using full URL:', imagePath);
      return imagePath;
    }
    
    // If it's a data URL (base64), return as is
    if (imagePath.startsWith('data:')) {
      console.log('Using data URL');
      return imagePath;
    }
    
    // If it's a relative path starting with /, return as is
    if (imagePath.startsWith('/')) {
      console.log('Using relative path:', imagePath);
      return imagePath;
    }
    
    // If it's just a filename, construct the full URL with aggressive cache busting
    const imageBaseUrl = getImageBaseUrl();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const imageUrl = `${imageBaseUrl}/uploads/${imagePath}?v=${timestamp}&r=${random}`;
    console.log('Constructed image URL:', imageUrl);
    return imageUrl;
  }
  
  console.log('Invalid image path, using placeholder');
  return '/placeholder.svg';
};

/**
 * Enhanced error handler for images with fallback
 * @param {Event} e - The error event
 * @param {string} fallbackUrl - The fallback image URL
 */
export const handleImageError = (e, fallbackUrl = '/placeholder.svg') => {
  console.warn('Image failed to load:', e.target.src);
  e.target.src = fallbackUrl;
  e.target.onerror = null; // Prevent infinite loop
};

/**
 * Validate if an image URL is valid
 * @param {string} url - The image URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if it's a valid URL format
  try {
    new URL(url);
    return true;
  } catch {
    // If it's not a valid URL, check if it's a relative path or data URL
    return url.startsWith('/') || url.startsWith('data:') || url.includes('/uploads/');
  }
};

/**
 * Get image dimensions from URL (placeholder for future implementation)
 * @param {string} url - The image URL
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
};

/**
 * Preload images for better performance
 * @param {string[]} urls - Array of image URLs to preload
 * @returns {Promise<void>} - Promise that resolves when all images are loaded
 */
export const preloadImages = (urls) => {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load: ${url}`));
      img.src = url;
    });
  });
  
  return Promise.allSettled(promises);
};

/**
 * Format image size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export const formatImageSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file extension from image URL
 * @param {string} url - The image URL
 * @returns {string} - File extension (without dot)
 */
export const getImageExtension = (url) => {
  if (!url) return '';
  
  // Extract filename from URL
  const filename = url.split('/').pop().split('?')[0];
  const extension = filename.split('.').pop().toLowerCase();
  
  return extension;
};

/**
 * Check if image format is supported
 * @param {string} format - The image format/extension
 * @returns {boolean} - Whether the format is supported
 */
export const isSupportedImageFormat = (format) => {
  const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return supportedFormats.includes(format.toLowerCase());
};