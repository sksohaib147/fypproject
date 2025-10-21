const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('adminAuth: Token received:', token);
    if (!token) throw new Error('No token');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('adminAuth: Decoded token:', decoded);
    const admin = await Admin.findById(decoded.adminId);
    console.log('adminAuth: Admin found:', admin);

    if (!admin) {
      console.log('adminAuth: No admin found for token. Printing all admins in DB:');
      const allAdmins = await Admin.find();
      console.log('All admins:', allAdmins);
      throw new Error('No admin found for token');
    }

    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    console.error('adminAuth error:', error);
    res.status(401).json({ message: 'Please authenticate as admin' });
  }
};

module.exports = adminAuth; 