import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Create MUI theme based on dark mode
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#FF6B6B',
        light: '#FF8E8E',
        dark: '#E64A4A',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#4ECDC4',
        light: '#71D7D0',
        dark: '#2BB3A9',
        contrastText: '#FFFFFF',
      },
      background: {
        default: isDarkMode ? '#111827' : '#F7F7F7',
        paper: isDarkMode ? '#1a1a1a' : '#FFFFFF',
      },
      text: {
        primary: isDarkMode ? '#FFFFFF' : '#2D3436',
        secondary: isDarkMode ? '#B0B3B8' : '#636E72',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 8,
    },
  });

  useEffect(() => {
    console.log('Theme effect running. isDarkMode:', isDarkMode);
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    console.log('toggleDarkMode called. Current isDarkMode:', isDarkMode);
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 