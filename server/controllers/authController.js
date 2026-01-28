const db = require('../db');

// REGISTER USER
// This runs AFTER Firebase creates the user
async function register(req, res) {
  try {
    const { firebase_uid, email } = req.body;

    // Validate input
    if (!firebase_uid || !email) {
      return res.status(400).json({ error: 'firebase_uid and email are required' });
    }

    // Check if user already exists in our database
    const existingUser = await db.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [firebase_uid]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Insert new user into database
    const result = await db.query(
      'INSERT INTO users (firebase_uid, email, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [firebase_uid, email]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
}

// GET USER PROFILE
async function getProfile(req, res) {
  try {
    //from middleware auth.js
    const { uid } = req.user;

    // Get user from database
    const result = await db.query(
      'SELECT id, firebase_uid, email, preferences, created_at FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        preferences: user.preferences ? JSON.parse(user.preferences) : null,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
}

module.exports = {
  register,
  getProfile,
};