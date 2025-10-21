const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files
  }
});

// Multer error handler middleware
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  next();
}

// CORS middleware for all upload routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  next();
});

// Handle OPTIONS requests
router.options('*', (req, res) => {
  res.sendStatus(200);
});

// GET /api/upload/:filename - serve images through API
router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Get file stats
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  // Determine content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'image/jpeg'; // default
  if (ext === '.png') contentType = 'image/png';
  else if (ext === '.gif') contentType = 'image/gif';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.svg') contentType = 'image/svg+xml';
  
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      ...corsHeaders,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      ...corsHeaders,
      'Content-Length': fileSize,
      'Content-Type': contentType,
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

// POST /api/upload - single image
router.post('/', (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      return next(err);
    }
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const filename = req.file.filename;
      res.json({ url: filename });
    } catch (error) {
      next(error);
    }
  });
}, multerErrorHandler);

module.exports = router; 