import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store token
      localStorage.setItem('userToken', token);
      
      // Fetch user info using the token
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch user info');
        }
      })
      .then(userData => {
        // Set user in context
        setUser({ ...userData, token });
        navigate('/'); // Redirect to home or dashboard
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
        // Clear invalid token
        localStorage.removeItem('userToken');
        navigate('/login');
      });
    } else {
      // No token, redirect to login
      navigate('/login');
    }
    // eslint-disable-next-line
  }, [navigate, setUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-gray-700 dark:text-gray-200">Logging you in...</div>
    </div>
  );
};

export default AuthCallback; 