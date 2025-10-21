# Paws and Claws - Pet Marketplace

This project has been migrated from Create React App to Vite for improved development experience and faster build times.

## Migration Changes

### What Changed:
- **Build Tool**: Migrated from Create React App to Vite
- **Entry Point**: Changed from `src/index.js` to `src/main.jsx`
- **HTML Template**: Moved from `public/index.html` to root `index.html`
- **Static Assets**: Moved from `public/` folder to root directory
- **Environment Variables**: Changed from `REACT_APP_` to `VITE_` prefix
- **API Configuration**: Updated to use Vite's proxy configuration

### Key Benefits:
- ⚡ **Faster Development**: Hot Module Replacement (HMR) is significantly faster
- 🚀 **Faster Builds**: Production builds are much quicker
- 📦 **Smaller Bundle**: Better tree-shaking and optimization
- 🔧 **Modern Tooling**: Uses modern ES modules and build tools

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, Cart, etc.)
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.js          # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
└── static assets       # favicon.ico, manifest.json, etc.
```

## API Configuration

The API is configured to proxy requests to the backend server running on port 5000. The proxy is set up in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

## Deployment

For GitHub Pages deployment:
```bash
npm run deploy
```

## Troubleshooting

### Common Issues:

1. **Port Already in Use**: Vite uses port 5173 by default. If it's occupied, Vite will automatically try the next available port.

2. **Environment Variables**: Make sure to use `VITE_` prefix for environment variables instead of `REACT_APP_`.

3. **Import Issues**: Vite requires explicit file extensions for some imports. Make sure to include `.js` or `.jsx` extensions where needed.

4. **Static Assets**: All static assets should be in the root directory, not in a `public` folder.

## Migration Notes

- All React components work the same way
- JSX syntax is unchanged
- React Router configuration remains the same
- Material-UI components work without changes
- Context providers and hooks work identically

## Performance Improvements

After migration to Vite, you should notice:
- Faster development server startup
- Instant hot module replacement
- Faster production builds
- Better development experience overall
