
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    agree: false,
  });
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { isDarkMode } = useTheme();

  // -- Helpers --
  const calculateStrength = pwd => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  // -- Handlers --
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'password') {
      setStrength(calculateStrength(value));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.agree) {
      setError('You must agree to Terms & Privacy Policy');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!form.phone) {
      setError('Please enter your phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Use AuthContext signup method
      const result = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-sm w-full rounded-lg shadow-md p-4 space-y-4 transition-colors duration-200 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Account</h2>
        {error && <div className="text-red-600 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name & Email */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            className={`w-full px-3 py-2 border rounded transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            required
            className={`w-full px-3 py-2 border rounded transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
          />

          {/* Password & Strength */}
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
          <div className="h-2 w-full bg-gray-200 rounded">
            <div
              className={`h-full rounded ${
                strength <= 1
                  ? 'bg-red-500'
                  : strength === 2
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${(strength / 4) * 100}%` }}
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              name="confirm"
              type={showPwd ? 'text' : 'password'}
              value={form.confirm}
              onChange={handleChange}
              placeholder="Confirm Password"
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

          {/* Phone Number */}
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            required
            className={`w-full px-3 py-2 border rounded transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white border-gray-700 placeholder-gray-400' : 'bg-white text-gray-900 border-gray-300 placeholder-gray-500'}`}
          />

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="agree"
              name="agree"
              type="checkbox"
              checked={form.agree}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="agree" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              I agree to the{' '}
              <a href="/terms" className="text-blue-500 hover:underline">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-500 hover:underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
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

        <p className={`text-center text-xs transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
} 