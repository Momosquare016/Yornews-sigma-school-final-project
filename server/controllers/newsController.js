const db = require('../db');
const { fetchArticles } = require('../services/newsApi');
const { summarizeArticles, rankArticles, isRateLimited } = require('../services/groq');

// Database-based caching - works across serverless instances
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

// GET personalized news feed
async function getNews(req, res) {
  try {
    const { uid } = req.user;

    console.log('Fetching news for user:', uid);

    // Check if rate limited - return error message
    if (isRateLimited()) {
      return res.status(429).json({
        error: 'Daily AI limit reached',
        message: 'AI features are temporarily unavailable. Please try again tomorrow!',
        rateLimited: true,
        articles: [],
      });
    }

    // Get user preferences and cached news
    const userResult = await db.query(
      'SELECT preferences, news_cache, cache_updated_at FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { preferences, news_cache, cache_updated_at } = userResult.rows[0];

    if (!preferences) {
      return res.json({
        message: 'No preferences set. Please set your preferences first.',
        articles: [],
      });
    }

    // Check if we have valid cached news
    if (news_cache && cache_updated_at) {
      const cacheAge = Date.now() - new Date(cache_updated_at).getTime();
      if (cacheAge < CACHE_DURATION) {
        console.log('Returning cached news for user:', uid);
        const cached = JSON.parse(news_cache);
        return res.json({ ...cached, cached: true });
      }
    }

    console.log('User preferences:', preferences);

    // Fetch fresh articles from News API
    const articles = await fetchArticles(preferences);

    if (articles.length === 0) {
      return res.json({
        message: 'No articles found. Try adjusting your preferences.',
        articles: [],
      });
    }

    console.log(`Fetched ${articles.length} articles from News API`);

    // Filter out articles without required fields
    const validArticles = articles.filter(article =>
      article.title &&
      article.url &&
      article.title !== '[Removed]'
    );

    console.log(`${validArticles.length} valid articles after filtering`);

    // Process up to 20 articles for AI enrichment
    const articlesToProcess = validArticles.slice(0, 20);

    // Generate summaries with Groq AI
    console.log(`Generating AI summaries for ${articlesToProcess.length} articles...`);
    const summaries = await summarizeArticles(articlesToProcess);

    // Check if we got rate limited during processing
    if (isRateLimited()) {
      return res.status(429).json({
        error: 'Daily AI limit reached',
        message: 'AI features are temporarily unavailable. Please try again tomorrow!',
        rateLimited: true,
        articles: [],
      });
    }

    // Calculate relevance scores with Groq AI
    console.log('Calculating relevance scores...');
    const scores = await rankArticles(articlesToProcess, preferences);

    // Combine articles with summaries and scores
    const enrichedArticles = articlesToProcess.map((article, index) => ({
      ...article,
      summary: summaries[index],
      relevanceScore: scores[index],
    }));

    // Sort by relevance score (highest first)
    enrichedArticles.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`Returning ${enrichedArticles.length} articles`);

    const response = {
      count: enrichedArticles.length,
      articles: enrichedArticles,
    };

    // Save to database cache
    await db.query(
      'UPDATE users SET news_cache = $1, cache_updated_at = NOW() WHERE firebase_uid = $2',
      [JSON.stringify(response), uid]
    );

    res.json(response);
  } catch (error) {
    console.error('Get news error:', error);

    // Check if it's a rate limit error
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Daily AI limit reached',
        message: 'AI features are temporarily unavailable. Please try again tomorrow!',
        rateLimited: true,
        articles: [],
      });
    }

    res.status(500).json({
      error: 'Failed to fetch news',
      details: error.message
    });
  }
}

module.exports = {
  getNews,
};
