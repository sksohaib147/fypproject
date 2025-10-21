const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds timeout (increased from 5 seconds)

// Enhanced utility function to get image URL with support for multiple formats
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a data URL (base64), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads/, convert to API endpoint
  if (imagePath.startsWith('/uploads/')) {
    const filename = imagePath.replace('/uploads/', '');
    return `${API_BASE_URL.replace('/api', '')}/uploads/${filename}?v=${Date.now()}`;
  }
  
  // If it's just a filename, assume it's in uploads
  return `${API_BASE_URL.replace('/api', '')}/uploads/${imagePath}?v=${Date.now()}`;
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      data: data
    });
    
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

// Retry logic for failed requests
const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

const getAuthToken = (endpoint) => {
  // For admin endpoints, try admin token first
  if (endpoint.startsWith('/admin/')) {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) return adminToken;
  }
  
  // For all endpoints, try user token
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  if (userToken) return userToken;
  
  // For admin endpoints, also try admin token as fallback
  if (endpoint.startsWith('/admin/')) {
    return localStorage.getItem('adminToken');
  }
  
  return null;
};

const api = {
  async get(endpoint, options = {}) {
    try {
      const token = getAuthToken(endpoint);
      const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },
  async post(endpoint, data, options = {}) {
    try {
      const token = getAuthToken(endpoint);
      console.log('API POST Debug:', {
        endpoint,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
      });
      
      const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API POST Error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  },
  async put(endpoint, data, options = {}) {
    try {
      const token = getAuthToken(endpoint);
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      console.log('API PUT Request URL:', fullUrl);
      console.log('API PUT Request Data:', data);
      
      const response = await fetchWithRetry(fullUrl, {
        method: 'PUT',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },
  async patch(endpoint, data, options = {}) {
    try {
      const token = getAuthToken(endpoint);
      const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API PATCH Error:', error);
      throw error;
    }
  },
  async delete(endpoint, options = {}) {
    try {
      const token = getAuthToken(endpoint);
      const response = await fetchWithRetry(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  // Health check with detailed status
  async checkHealth() {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
      if (!response.ok) {
        return false;
      }
      const health = await response.json();
      return health.status === 'ok' && health.mongodb === 'connected';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};

export default api; 

export async function getAdoptions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/adoptions?${query}`);
  if (!res.ok) throw new Error('Failed to fetch adoptions');
  return res.json();
}

export async function getAdoptionById(id) {
  const res = await fetch(`/api/adoptions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch adoption details');
  return res.json();
}

export async function createAdoption(data) {
  return api.post('/adoptions', data);
} 

export async function getChatHistory(listingType, listingId, userId, ownerId) {
  const res = await fetch(`http://localhost:5000/api/chats/${listingType}/${listingId}/${userId}/${ownerId}`);
  if (!res.ok) throw new Error('Failed to fetch chat history');
  return res.json();
}

export async function sendChatMessage(listingType, listingId, userId, ownerId, message, token) {
  const res = await fetch(`http://localhost:5000/api/chats/${listingType}/${listingId}/${userId}/${ownerId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(message),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
} 

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  const data = await res.json();
  // Return the filename
  return { url: data.url };
} 