const express = require('express');
const router = express.Router();
const { register, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', register);

// GET /api/auth/profile - Get user profile 
router.get('/profile', authenticateToken, getProfile);

module.exports = router;

