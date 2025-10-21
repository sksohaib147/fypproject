import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { setUser, adminLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await adminLogin(username, password);
      if (result.success) {
        setLoading(false);
        navigate('/');
      } else {
        setError(result.error || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-lg shadow-md p-8 space-y-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Login</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
              <input
            name="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
                required
            className={`w-full px-3 py-2 border rounded transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
              />
          <div className="relative">
              <input
              name="password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
                required
              className={`w-full px-3 py-2 border rounded pr-10 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              className={`absolute inset-y-0 right-0 pr-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 