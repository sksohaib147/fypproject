import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDarkMode } = useTheme();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Use AuthContext login method
      const result = await login(form.email, form.password);
      if (result.success) {
        // Move token to sessionStorage if not remember
        if (!remember) {
          const token = localStorage.getItem('userToken');
          if (token) {
            sessionStorage.setItem('userToken', token);
            localStorage.removeItem('userToken');
          }
        }
        navigate('/');
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-lg shadow-md p-8 space-y-6 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Log In</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className={`w-full px-3 py-2 border rounded transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
          />

          <div className="relative">
            <input
              name="password"
              type={showPwd ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
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

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="remember" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Remember Me</label>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* OR / Social Login */}
        <div className={`text-center transition-colors duration-200 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>— OR —</div>
        <div className="space-y-2">
          <button
            onClick={() => (window.location.href = '/api/auth/google')}
            className={`w-full flex items-center justify-center gap-3 py-2 border rounded transition-colors duration-200 font-medium text-base ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white hover:bg-gray-800' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-100'}`}
            aria-label="Continue with Google"
          >
            <span className="flex items-center justify-center h-7 w-7">
              <img src="/logos/google.svg" alt="Google logo" className="h-7 w-7" />
            </span>
            <span className="flex-1 text-center">Continue with Google</span>
          </button>
        </div>

        <p className={`text-center text-sm transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Don’t have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
} 