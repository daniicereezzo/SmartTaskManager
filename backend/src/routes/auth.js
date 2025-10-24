const express = require('express');
const { User } = require('../models');
const { generateToken, verifyGoogleToken } = require('../middleware/auth');
const GoogleCalendarService = require('../services/GoogleCalendarService');

const router = express.Router();

/**
 * POST /auth/google
 * Authenticate user with Google OAuth
 */
router.post('/google', verifyGoogleToken, async (req, res) => {
  try {
    const { googleUser } = req;
    
    // Find or create user
    let user = await User.findOne({
      where: { googleId: googleUser.googleId }
    });

    if (!user) {
      // Create new user
      user = await User.create({
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: googleUser.name,
        pictureUrl: googleUser.picture
      });
    } else {
      // Update existing user info
      await user.update({
        email: googleUser.email,
        name: googleUser.name,
        pictureUrl: googleUser.picture
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        pictureUrl: user.pictureUrl,
        hasGoogleCalendar: !!user.googleId
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * GET /auth/google/url
 * Get Google OAuth URL
 */
router.get('/google/url', (req, res) => {
  try {
    const authUrl = GoogleCalendarService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

/**
 * POST /auth/google/callback
 * Handle Google OAuth callback
 */
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Exchange code for tokens
    const tokens = await GoogleCalendarService.getTokensFromCode(code);
    
    // In a real implementation, you would store these tokens securely
    // and associate them with the user
    
    res.json({
      success: true,
      message: 'Google Calendar connected successfully',
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      }
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
});

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // In a real implementation, you would verify the refresh token
    // and generate a new access token
    
    res.json({
      success: true,
      message: 'Token refresh not implemented yet'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
