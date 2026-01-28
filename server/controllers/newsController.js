const db = require('../db');

// GET personalized news feed
// Will integrate News API and OpenAI on Day 5
async function getNews(req, res) {
  try {
    const { uid } = req.user;

    // Get user preferences
    const userResult = await db.query(
      'SELECT preferences FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const preferences = userResult.rows[0].preferences;

    // TODO Day 5: Fetch from News API based on preferences
    // TODO Day 5: Use OpenAI to summarize and rank articles

    // For now, return mock data
    res.json({
      message: 'News endpoint working - will integrate APIs on Day 5',
      user_preferences: preferences ? JSON.parse(preferences) : null,
      articles: [
        {
          title: 'Mock Article 1',
          url: 'https://example.com/article1',
          summary: 'This is a mock article summary',
          source: 'TechCrunch',
        },
      ],
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to get news' });
  }
}

module.exports = {
  getNews,
};