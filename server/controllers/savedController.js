const db = require('../db');

// GET all saved articles for a user
async function getSavedArticles(req, res) {
  try {
    const { uid } = req.user;

    // First, get user's database ID from firebase_uid
    const userResult = await db.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Get all saved articles for this user
    const result = await db.query(
      'SELECT * FROM saved_articles WHERE user_id = $1 ORDER BY saved_at DESC',
      [userId]
    );

    // Parse article_data from JSON string to object
    const articles = result.rows.map(row => ({
      id: row.id,
      article_data: row.article_data, // Already JSONB, no need to parse
      saved_at: row.saved_at,
    }));

    res.json({
      count: articles.length,
      articles: articles,
    });
  } catch (error) {
    console.error('Get saved articles error:', error);
    res.status(500).json({ error: 'Failed to get saved articles' });
  }
}

// SAVE an article
async function saveArticle(req, res) {
  try {
    const { uid } = req.user;
    const { article_data } = req.body;

    if (!article_data) {
      return res.status(400).json({ error: 'article_data is required' });
    }

    // Get user's database ID
    const userResult = await db.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Check if article already saved (prevent duplicates)
    const existingArticle = await db.query(
      'SELECT * FROM saved_articles WHERE user_id = $1 AND article_data->>\'url\' = $2',
      [userId, article_data.url]
    );

    if (existingArticle.rows.length > 0) {
      return res.status(400).json({ error: 'Article already saved' });
    }

    // Insert article
    const result = await db.query(
      'INSERT INTO saved_articles (user_id, article_data, saved_at) VALUES ($1, $2, NOW()) RETURNING *',
      [userId, JSON.stringify(article_data)]
    );

    const savedArticle = result.rows[0];

    res.status(201).json({
      message: 'Article saved successfully',
      article: {
        id: savedArticle.id,
        article_data: savedArticle.article_data,
        saved_at: savedArticle.saved_at,
      },
    });
  } catch (error) {
    console.error('Save article error:', error);
    res.status(500).json({ error: 'Failed to save article' });
  }
}

// DELETE a saved article
async function removeSavedArticle(req, res) {
  try {
    const { uid } = req.user;
    const { articleId } = req.params; // Get from URL parameter

    // Get user's database ID
    const userResult = await db.query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Delete article (only if it belongs to this user)
    const result = await db.query(
      'DELETE FROM saved_articles WHERE id = $1 AND user_id = $2 RETURNING *',
      [articleId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or does not belong to user' });
    }

    res.json({
      message: 'Article removed successfully',
      deleted_article_id: articleId,
    });
  } catch (error) {
    console.error('Remove article error:', error);
    res.status(500).json({ error: 'Failed to remove article' });
  }
}

module.exports = {
  getSavedArticles,
  saveArticle,
  removeSavedArticle,
};