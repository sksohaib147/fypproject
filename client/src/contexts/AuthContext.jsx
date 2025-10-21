import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate token and fetch user data
  const validateAndFetchUser = async (token, isAdmin = false) => {
    try {
      let data;
      if (isAdmin) {
        data = await api.get('/admin/me', { headers: { Authorization: `Bearer ${token}` } });
        console.log('Admin validation response:', data);
        
        // Map 'id' to '_id' if it exists
        const normalizedData = {
          ...data,
          _id: data._id || data.id
        };
        
        if (!normalizedData._id) {
          console.error('Admin data missing _id field:', data);
          throw new Error('Invalid admin data received from server');
        }
        setUser({ ...normalizedData, token, role: 'admin' });
      } else {
        data = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        console.log('User validation response:', data);
        
        // Map 'id' to '_id' if it exists
        const normalizedData = {
          ...data,
          _id: data._id || data.id
        };
        
        if (!normalizedData._id) {
          console.error('User data missing _id field:', data);
          throw new Error('Invalid user data received from server');
        }
        setUser({ ...normalizedData, token });
      }
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      // Clear invalid tokens
      if (isAdmin) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAdmin');
      } else {
        localStorage.removeItem('userToken');
        sessionStorage.removeItem('userToken');
      }
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        const userToken = localStorage.getItem('userToken');
        const sessionToken = sessionStorage.getItem('userToken');
        const isAdminFlag = localStorage.getItem('isAdmin');

        // If no tokens exist, clear any existing user state
        if (!adminToken && !userToken && !sessionToken) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Try admin token first
        if (adminToken && isAdminFlag === 'true') {
          const isValid = await validateAndFetchUser(adminToken, true);
          if (isValid) {
            setLoading(false);
            return;
          }
        }

        // Try user token
        const token = userToken || sessionToken;
        if (token) {
          const isValid = await validateAndFetchUser(token, false);
          if (isValid) {
            setLoading(false);
            return;
          }
        }

        // If we get here, no valid tokens found
        setUser(null);
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      
      // Store token
      localStorage.setItem('userToken', data.token);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdmin');
      
      // Set user state - ensure we have the complete user object
      const userData = data.user || data;
      
      // Map 'id' to '_id' if it exists
      const normalizedUserData = {
        ...userData,
        _id: userData._id || userData.id
      };
      
      console.log('Login response:', { 
        fullData: JSON.stringify(data, null, 2),
        userData: JSON.stringify(userData, null, 2),
        normalizedUserData: JSON.stringify(normalizedUserData, null, 2),
        hasUserId: !!normalizedUserData._id,
        userId: normalizedUserData._id
      });
      
      // Ensure we have the required fields
      if (!normalizedUserData._id) {
        console.error('User data missing _id field:', JSON.stringify(userData, null, 2));
        console.warn('Continuing without _id field for debugging...');
        // Don't throw error for now, just log the issue
      }
      
      setUser({ ...normalizedUserData, token: data.token });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred during login'
      };
    }
  };

  const adminLogin = async (username, password) => {
    try {
      const data = await api.post('/admin/login', { username, password });
      
      // Store tokens
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('userToken', data.token); // Store as both
      localStorage.setItem('isAdmin', 'true');
      
      // Fetch latest admin info
      const me = await api.get('/admin/me', { headers: { Authorization: `Bearer ${data.token}` } });
      setUser({ ...me, token: data.token, role: 'admin' });
      return { success: true };
    } catch (error) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      localStorage.removeItem('isAdmin');
      setUser(null);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred during admin login'
      };
    }
  };

  const signup = async (userData) => {
    try {
      // Split name into firstName and lastName
      let firstName = '', lastName = '';
      if (userData.name) {
        const parts = userData.name.trim().split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ') || '';
      }
      const payload = {
        firstName,
        lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone
      };
      const data = await api.post('/auth/signup', payload);
      
      // Store token
      localStorage.setItem('userToken', data.token);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdmin');
      
      // Set user state - normalize the user data
      const userDataFromResponse = data.user || data;
      const normalizedUserData = {
        ...userDataFromResponse,
        _id: userDataFromResponse._id || userDataFromResponse.id
      };
      setUser({ ...normalizedUserData, token: data.token });
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'An error occurred during signup'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    sessionStorage.removeItem('userToken');
    setUser(null);
    // Force a page reload to ensure clean state
    window.location.reload();
  };

  const forceLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    sessionStorage.removeItem('userToken');
    setUser(null);
    window.location.reload();
  };

  const updateProfile = async (userData) => {
    try {
      // Use correct token for user or admin
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('userToken');
      let data;
      if (user && user.role === 'admin' && adminToken) {
        data = await api.post('/admin/update-profile', userData, { headers: { Authorization: `Bearer ${adminToken}` } });
      } else if (userToken) {
        data = await api.put('/users/me', userData, { headers: { Authorization: `Bearer ${userToken}` } });
      }
      if (data) {
        setUser(prev => ({ ...prev, ...data }));
      }
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred while updating profile'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    signup,
    logout,
    forceLogout,
    updateProfile,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 