import { Link } from 'react-router-dom';
import './LandingPage.css';

const FEATURES = [
  { icon: '🤖', title: 'AI-Powered Assistant', desc: 'Chat with our Grok-powered AI to search, book, and manage your stays naturally.' },
  { icon: '🏨', title: '20+ Premium Hotels', desc: 'From Maldives overwater villas to Santorini cliffside retreats worldwide.' },
  { icon: '⚡', title: 'Instant Booking', desc: 'Book in seconds with real-time confirmation and unique booking IDs.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT authentication, encrypted data, your details stay safe.' },
  { icon: '📧', title: 'Email Confirmations', desc: 'Automatic confirmation, modification, and cancellation notifications.' },
  { icon: '📱', title: 'Responsive Design', desc: 'Flawless experience on desktop, tablet, and mobile.' },
];

const DESTINATIONS = [
  { city: 'New York', img: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?w=500', count: 2 },
  { city: 'Paris', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500', count: 1 },
  { city: 'Tokyo', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500', count: 2 },
  { city: 'Maldives', img: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=500', count: 1 },
  { city: 'Dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500', count: 1 },
  { city: 'Santorini', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500', count: 1 },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero hero-gradient">
        <div className="container hero-content">
          <div className="hero-badge animate-fade">
            <span>✨</span> AI-Powered Hotel Booking
          </div>
          <h1 className="hero-title display-heading animate-fade">
            Find Your Perfect
            <br />
            <span className="gradient-text">Hotel Stay</span>
          </h1>
          <p className="hero-subtitle animate-fade">
            Let our AI assistant guide you through 20+ world-class hotels.
            Search, book, modify, and cancel — all through natural conversation.
          </p>
          <div className="hero-actions animate-fade">
            <Link to="/hotels" id="hero-browse-hotels" className="btn btn-primary btn-lg">
              🏨 Browse Hotels
            </Link>
            <Link to="/register" id="hero-try-ai" className="btn btn-secondary btn-lg">
              ✨ Try AI Assistant
            </Link>
          </div>

          <div className="hero-stats animate-fade">
            <div className="stat">
              <span className="stat-number">20+</span>
              <span className="stat-label">Hotels</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">15+</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">5★</span>
              <span className="stat-label">Max Rating</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">AI</span>
              <span className="stat-label">Powered by Grok</span>
            </div>
          </div>
        </div>

        <div className="hero-image-grid">
          {DESTINATIONS.slice(0, 4).map((d) => (
            <div key={d.city} className="hero-image-card">
              <img src={d.img} alt={d.city} />
              <div className="hero-image-label">{d.city}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Why Choose Us</span>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">
              A complete hotel booking platform with AI at its core
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card card-glass animate-fade" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Top Picks</span>
            <h2 className="section-title">Popular Destinations</h2>
          </div>
          <div className="destinations-grid">
            {DESTINATIONS.map((d) => (
              <Link key={d.city} to={`/hotels?city=${d.city}`} className="destination-card">
                <img src={d.img} alt={d.city} />
                <div className="destination-overlay">
                  <h3 className="destination-name">{d.city}</h3>
                  <p className="destination-count">{d.count} hotel{d.count > 1 ? 's' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI CTA */}
      <section className="section">
        <div className="container">
          <div className="ai-cta glass-panel">
            <div className="ai-cta-content">
              <div className="ai-cta-icon">🤖</div>
              <h2 className="ai-cta-title display-heading">
                Chat with Our <span className="gradient-text">AI Assistant</span>
              </h2>
              <p className="ai-cta-desc">
                "Find me a 5-star hotel in Paris under $500 for 2 guests next weekend"
                — just say it naturally!
              </p>
              <Link to="/register" className="btn btn-primary btn-lg" id="cta-get-started">
                Get Started Free
              </Link>
            </div>
            <div className="ai-chat-preview">
              <div className="preview-message preview-user">
                🧳 Find me a hotel in Maldives for 2
              </div>
              <div className="preview-message preview-ai">
                🤖 Found 1 stunning overwater villa in the Maldives! Maldives Water Villas starting at $1,200/night with private pool...
              </div>
              <div className="preview-message preview-user">
                Book it for next week!
              </div>
              <div className="preview-message preview-ai">
                ✅ Booking confirmed! ID: BK-20240603-X7F2. Confirmation email sent!
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
