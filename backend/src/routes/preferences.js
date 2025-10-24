const express = require('express');
const { UserDailyPreference, UserEnergyPattern } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * GET /preferences/daily
 * Get user's daily preferences
 */
router.get('/daily', async (req, res) => {
  try {
    const preferences = await UserDailyPreference.findAll({
      where: { userId: req.user.id },
      order: [['dayOfWeek', 'ASC']]
    });

    res.json({ success: true, data: preferences });
  } catch (error) {
    console.error('Error fetching daily preferences:', error);
    res.status(500).json({ error: 'Failed to fetch daily preferences' });
  }
});

/**
 * PUT /preferences/daily
 * Update user's daily preferences
 */
router.put('/daily', async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!Array.isArray(preferences)) {
      return res.status(400).json({ error: 'Preferences must be an array' });
    }

    const results = [];
    
    for (const pref of preferences) {
      const [preference, created] = await UserDailyPreference.upsert({
        userId: req.user.id,
        dayOfWeek: pref.dayOfWeek,
        availableStartTime: pref.availableStartTime,
        availableEndTime: pref.availableEndTime,
        energyLevel: pref.energyLevel || 'medium'
      });
      
      results.push(preference);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error updating daily preferences:', error);
    res.status(500).json({ error: 'Failed to update daily preferences' });
  }
});

/**
 * GET /preferences/energy
 * Get user's energy patterns
 */
router.get('/energy', async (req, res) => {
  try {
    const patterns = await UserEnergyPattern.findAll({
      where: { userId: req.user.id },
      order: [['dayOfWeek', 'ASC'], ['timeSlotStart', 'ASC']]
    });

    res.json({ success: true, data: patterns });
  } catch (error) {
    console.error('Error fetching energy patterns:', error);
    res.status(500).json({ error: 'Failed to fetch energy patterns' });
  }
});

/**
 * PUT /preferences/energy
 * Update user's energy patterns
 */
router.put('/energy', async (req, res) => {
  try {
    const { patterns } = req.body;
    
    if (!Array.isArray(patterns)) {
      return res.status(400).json({ error: 'Patterns must be an array' });
    }

    // Clear existing patterns for this user
    await UserEnergyPattern.destroy({
      where: { userId: req.user.id }
    });

    // Create new patterns
    const results = [];
    for (const pattern of patterns) {
      const newPattern = await UserEnergyPattern.create({
        userId: req.user.id,
        dayOfWeek: pattern.dayOfWeek,
        timeSlotStart: pattern.timeSlotStart,
        timeSlotEnd: pattern.timeSlotEnd,
        energyLevel: pattern.energyLevel,
        productivityScore: pattern.productivityScore || 0.5
      });
      
      results.push(newPattern);
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error updating energy patterns:', error);
    res.status(500).json({ error: 'Failed to update energy patterns' });
  }
});

/**
 * POST /preferences/energy/default
 * Create default energy patterns for a user
 */
router.post('/energy/default', async (req, res) => {
  try {
    // Clear existing patterns
    await UserEnergyPattern.destroy({
      where: { userId: req.user.id }
    });

    // Create default patterns for each day
    const defaultPatterns = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      // Morning high energy (6 AM - 12 PM)
      defaultPatterns.push({
        userId: req.user.id,
        dayOfWeek,
        timeSlotStart: '06:00',
        timeSlotEnd: '12:00',
        energyLevel: 'high',
        productivityScore: 0.9
      });
      
      // Afternoon medium energy (12 PM - 6 PM)
      defaultPatterns.push({
        userId: req.user.id,
        dayOfWeek,
        timeSlotStart: '12:00',
        timeSlotEnd: '18:00',
        energyLevel: 'medium',
        productivityScore: 0.7
      });
      
      // Evening low energy (6 PM - 10 PM)
      defaultPatterns.push({
        userId: req.user.id,
        dayOfWeek,
        timeSlotStart: '18:00',
        timeSlotEnd: '22:00',
        energyLevel: 'low',
        productivityScore: 0.4
      });
    }

    const results = await UserEnergyPattern.bulkCreate(defaultPatterns);

    res.json({ 
      success: true, 
      message: 'Default energy patterns created',
      data: results 
    });
  } catch (error) {
    console.error('Error creating default energy patterns:', error);
    res.status(500).json({ error: 'Failed to create default energy patterns' });
  }
});

/**
 * GET /preferences/theme
 * Get user's theme preference
 */
router.get('/theme', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: { themePreference: req.user.themePreference } 
    });
  } catch (error) {
    console.error('Error fetching theme preference:', error);
    res.status(500).json({ error: 'Failed to fetch theme preference' });
  }
});

/**
 * PUT /preferences/theme
 * Update user's theme preference
 */
router.put('/theme', async (req, res) => {
  try {
    const { themePreference } = req.body;
    
    if (!['light', 'dark'].includes(themePreference)) {
      return res.status(400).json({ error: 'Theme must be light or dark' });
    }

    await req.user.update({ themePreference });

    res.json({ 
      success: true, 
      data: { themePreference: req.user.themePreference } 
    });
  } catch (error) {
    console.error('Error updating theme preference:', error);
    res.status(500).json({ error: 'Failed to update theme preference' });
  }
});

module.exports = router;
