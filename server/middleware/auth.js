const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    let user = null;
    // Try user first
    if (decoded.userId) {
      user = await User.findById(decoded.userId).select('-password');
      if (user) {
        if (user.isSuspended) {
          return res.status(403).json({ message: 'Account has been suspended' });
        }
        req.user = user;
        return next();
      }
    }
    // Try admin
    if (decoded.adminId) {
      const admin = await Admin.findById(decoded.adminId);
      if (admin) {
        // Synthesize a user-like object for admin
        req.user = {
          _id: admin._id,
          username: admin.username,
          email: admin.email,
          avatar: admin.avatar,
          role: 'admin',
          isAdmin: true
        };
        return next();
      }
    }
    return res.status(401).json({ message: 'User or admin not found' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 