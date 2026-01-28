const express = require('express');
const router = express.Router();
const { getPreferences, updatePreferences } = require('../controllers/preferencesController');
const { authenticateToken } = require('../middleware/auth');

// All preference routes require authentication
router.use(authenticateToken);

// GET /api/preferences - Get user preferences
router.get('/', getPreferences);

// POST /api/preferences - Update preferences
router.post('/', updatePreferences);

module.exports = router;