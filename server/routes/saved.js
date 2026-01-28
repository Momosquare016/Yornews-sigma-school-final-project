const express = require('express');
const router = express.Router();
const {
  getSavedArticles,
  saveArticle,
  removeSavedArticle,
} = require('../controllers/savedController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET /api/saved - Get all saved articles
router.get('/', getSavedArticles);

// POST /api/saved - Save an article
router.post('/', saveArticle);

// DELETE /api/saved/:articleId - Remove saved article
router.delete('/:articleId', removeSavedArticle);

module.exports = router;