const db = require('../db');

// GET user preferences
async function getPreferences(req, res) {
  try {
    const { uid } = req.user; // From authenticateToken middleware

    const result = await db.query(
      'SELECT preferences FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const preferences = result.rows[0].preferences;

    res.json({
      preferences: preferences ? JSON.parse(preferences) : null,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
}

// UPDATE user preferences (natural language input)
async function updatePreferences(req, res) {
  try {
    const { uid } = req.user;
    const { preferenceText } = req.body; // User's natural language input

    if (!preferenceText) {
      return res.status(400).json({ error: 'preferenceText is required' });
    }

    // TODO Day 5: Call OpenAI API to parse natural language
    
    const parsedPreferences = {
      raw_input: preferenceText,
      topics: [], // Will populate with AI on Day 5
      categories: [],
      timeframe: '7 days',
      parsed_at: new Date().toISOString(),
    };

    // Update database
    const result = await db.query(
      'UPDATE users SET preferences = $1 WHERE firebase_uid = $2 RETURNING preferences',
      [JSON.stringify(parsedPreferences), uid]
    );

    res.json({
      message: 'Preferences updated successfully',
      preferences: JSON.parse(result.rows[0].preferences),
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
}

module.exports = {
  getPreferences,
  updatePreferences,
};