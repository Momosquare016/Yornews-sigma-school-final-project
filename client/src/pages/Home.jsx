import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          Your Personalized News Dashboard
        </h1>
        <p className="hero-subtitle">
          Get AI-curated news based on your interests. Stay informed with summaries powered by artificial intelligence.
        </p>

        {/* CTA Buttons */}
        <div className="hero-buttons">
          {currentUser ? (
            <Link to="/news" className="btn btn-primary btn-large">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Log In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Curation</h3>
            <p>Describe your interests in natural language and let AI find the perfect articles for you</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Smart Summaries</h3>
            <p>Get concise AI-generated summaries of every article to quickly understand the content</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔖</div>
            <h3>Save for Later</h3>
            <p>Bookmark articles you want to read later and access them anytime</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Stay Updated</h3>
            <p>Get fresh news daily based on your evolving preferences</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;