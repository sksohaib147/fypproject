import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      include: "**/*.{jsx,js,ts,tsx}",
    })
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000', // Proxy uploads for image preview reliability
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'stripe-vendor': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          'icons-vendor': ['react-icons'],
          // Feature chunks
          'auth': ['./src/contexts/AuthContext.jsx'],
          'cart': ['./src/contexts/CartContext.jsx'],
          'wishlist': ['./src/contexts/WishlistContext.jsx'],
          'language': ['./src/contexts/LanguageContext.jsx'],
          // Page chunks
          'pages': [
            './src/pages/Home.jsx',
            './src/pages/Products.jsx',
            './src/pages/Profile.jsx',
            './src/pages/Cart.jsx',
            './src/pages/Checkout.jsx'
          ],
          'admin': [
            './src/pages/admin/AdminDashboard.jsx',
            './src/pages/admin/AdminLogin.jsx',
            './src/pages/admin/AboutManagement.jsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
}) 