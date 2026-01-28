const express = require('express');
const router = express.Router();
const { getNews } = require('../controllers/newsController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/news - Get personalized news
router.get('/', authenticateToken, getNews);

module.exports = router;