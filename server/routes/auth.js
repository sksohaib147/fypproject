const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const crypto = require('crypto');
const sendEmail = require('../utils/email');
const passport = require('../passport');

// Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Starting signup process...');
    console.log('Environment check:', {
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });

    const { firstName, lastName, email, password, address, phone } = req.body;
    console.log('Received signup data:', { firstName, lastName, email, address, phone });

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone) {
      console.log('Missing required fields:', { firstName, lastName, email, password, phone });
      return res.status(400).json({ 
        message: 'Please provide all required fields (firstName, lastName, email, password, phone)' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Validate phone format (basic)
    const phoneRegex = /^[0-9+\-() ]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number' });
    }

    // Check if user already exists (by email or phone)
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      console.log('User already exists:', email, phone);
      return res.status(400).json({ 
        message: 'An account with this email or phone already exists' 
      });
    }

    // Create new user
    console.log('Creating new user...');
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      address,
      phone
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully:', user._id);

    // Create user activity log
    console.log('Creating activity log...');
    const activity = new UserActivity({
      user: user._id,
      action: 'Signup',
      ipAddress: req.ip,
      details: {
        method: req.method,
        path: req.path
      }
    });
    await activity.save();
    console.log('Activity log created');

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined!');
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    console.log('Generating JWT token...');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('JWT token generated successfully');

    console.log('Sending success response...');
    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error details:', {
      message: error.message,
      stack: error.stack,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
        mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
      }
    });
    res.status(500).json({ 
      message: 'Error creating user account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Starting login process...');
    console.log('Environment check:', {
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Missing required fields:', { email, hasPassword: !!password });
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ 
        message: 'Please provide a valid email address' 
      });
    }

    // Find user
    console.log('Finding user...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      console.log('Suspended user attempted login:', email);
      return res.status(403).json({ 
        message: 'Account has been suspended. Please contact support.' 
      });
    }

    // Check password
    console.log('Verifying password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Create user activity log
    console.log('Creating activity log...');
    const activity = new UserActivity({
      user: user._id,
      action: 'Login',
      ipAddress: req.ip,
      details: {
        method: req.method,
        path: req.path
      }
    });
    await activity.save();
    console.log('Activity log created');

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined!');
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    console.log('Generating JWT token...');
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('JWT token generated successfully');

    console.log('Sending success response...');
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
        mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
      }
    });
    res.status(500).json({ 
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Reset your password: ${resetUrl}`,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    });
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending password reset email', error: error.message });
  }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// Send email verification
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.json({ message: 'Email already verified' });
    const token = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = token;
    await user.save();
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      text: `Verify your email: ${verifyUrl}`,
      html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email address.</p>`
    });
    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification email', error: error.message });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/callback/google', passport.authenticate('google', { 
  failureRedirect: process.env.FRONTEND_URL + '/login',
  failureFlash: true
}), (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(process.env.FRONTEND_URL + '/login?error=google_auth_failed');
    }
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(process.env.FRONTEND_URL + '/login?error=google_auth_failed');
  }
});



module.exports = router; 