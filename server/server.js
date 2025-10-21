require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const socketio = require('socket.io');
const session = require('express-session');
const passport = require('./passport');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Security middleware - temporarily disable CSP for development
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

// Serve uploaded files with proper CORS - MUST BE BEFORE API ROUTES
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  console.log(`Serving image: ${filename}`);
  console.log(`File path: ${filePath}`);
  
  // Set comprehensive CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range, Accept, Accept-Encoding, Accept-Language');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Type');
  res.header('Cache-Control', 'public, max-age=31536000');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  // Check if file exists
  if (!require('fs').existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return res.status(404).json({ error: 'File not found' });
  }
  
  console.log(`Sending file: ${filePath}`);
  // Send the file
  res.sendFile(filePath);
});

// Database connection with retry logic and timeout
const connectDB = async (retries = 5) => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts remaining)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts');
      process.exit(1);
    }
  }
};

// Initialize database connection
connectDB();

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const petRoutes = require('./routes/pets');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const reviewsRoutes = require('./routes/reviews');
const aboutRoutes = require('./routes/about');
const paymentRoutes = require('./routes/payments');
const adoptionsRoutes = require('./routes/adoptions');
const chatsRoutes = require('./routes/chats');
const uploadRoutes = require('./routes/upload');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/adoptions', adoptionsRoutes);
app.use('/api/chats', chatsRoutes);

// Debug route to test PUT requests
app.put('/api/test-put/:id', (req, res) => {
  console.log('Test PUT route hit with ID:', req.params.id);
  res.json({ message: 'Test PUT route working', id: req.params.id });
});

// Special CORS handling for upload routes
app.use('/api/upload', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use('/api/upload', uploadRoutes);

// Socket.io real-time chat - unified chat rooms
io.on('connection', (socket) => {
  // Join a room for this chat (listingType + listingId) - unified room for both users
  socket.on('joinRoom', ({ listingType, listingId, userId, ownerId }) => {
    const room = `${listingType}_${listingId}`;
    socket.join(room);
    console.log(`User ${userId} joined chat room: ${room}`);
  });

  // Listen for chat messages sent via socket
  socket.on('chatMessage', ({ listingType, listingId, userId, ownerId, message }) => {
    const room = `${listingType}_${listingId}`;
    // Broadcast to all in the room (both users will receive the message)
    io.to(room).emit('chatMessage', message);
    console.log(`Message sent to room ${room}:`, message.content);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.json(health);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    body: req.body,
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET
    }
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app; 