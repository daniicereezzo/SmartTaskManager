const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has Google Calendar connected
 */
const requireGoogleCalendar = (req, res, next) => {
  if (!req.user.googleId) {
    return res.status(400).json({ 
      error: 'Google Calendar connection required',
      requiresGoogleAuth: true
    });
  }
  next();
};

/**
 * Generate JWT token for user
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Verify Google OAuth token
 */
const verifyGoogleToken = async (req, res, next) => {
  try {
    const { googleToken } = req.body;
    
    if (!googleToken) {
      return res.status(400).json({ error: 'Google token required' });
    }

    // In a real implementation, you would verify the Google token
    // using Google's token verification endpoint
    // For now, we'll assume it's valid and extract user info
    
    const userInfo = {
      googleId: 'google_user_id', // Extract from verified token
      email: 'user@example.com',
      name: 'User Name',
      picture: 'https://example.com/picture.jpg'
    };

    req.googleUser = userInfo;
    next();
  } catch (error) {
    console.error('Google token verification error:', error);
    return res.status(401).json({ error: 'Invalid Google token' });
  }
};

module.exports = {
  authenticateToken,
  requireGoogleCalendar,
  generateToken,
  verifyGoogleToken
};
