import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const FEATURES = [
  { icon: '01', title: 'Aura Luxury Concierge', desc: 'Converse with our digital intelligence to search, customize, and secure your reservation naturally.' },
  { icon: '02', title: 'Heritage & Palace Collection', desc: 'From royal Maharaja suites in Udaipur to tranquil beachfront villas in Goa.' },
  { icon: '03', title: 'Seamless Stays', desc: 'Secure booking in seconds with instant digital confirmation and dedicated concierge coordination.' },
  { icon: '04', title: 'Discreet Security', desc: 'End-to-end encryption and JWT authorization safeguards your travel portfolio.' },
  { icon: '05', title: 'Instant Notifications', desc: 'Receive automated booking updates and real-time confirmations via secure SMTP email logs.' },
  { icon: '06', title: 'Refined Visuals', desc: 'Enjoy a responsive, bespoke user experience optimized across all modern mobile and desktop viewports.' },
];

const DESTINATIONS = [
  { city: 'Udaipur', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', count: 3 },
  { city: 'Jaipur', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', count: 3 },
  { city: 'Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80', count: 3 },
  { city: 'Agra', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80', count: 2 },
  { city: 'Goa', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', count: 3 },
  { city: 'New Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80', count: 2 },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [homeCity, setHomeCity] = useState('');

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeCity.trim()) {
      navigate(`/hotels?city=${encodeURIComponent(homeCity.trim())}`);
    } else {
      navigate('/hotels');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="hero hero-gradient">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge animate-fade">
              <span>✦</span> Bespoke Luxury Concierge
            </div>
            <h1 className="hero-title display-heading animate-fade">
              Regal Stays
              <br />
              <span className="gold-text">Refined by Aura</span>
            </h1>
            <p className="hero-subtitle animate-fade">
              Discover a curated collection of 20+ five-star palaces and resorts across India. 
              Indulge in classic Indian hospitality combined with bespoke digital orchestration.
            </p>

            <form className="home-search-bar animate-fade" onSubmit={handleHomeSearch}>
              <input 
                type="text" 
                placeholder="Search destinations (e.g. Udaipur, Jaipur, Mumbai...)" 
                value={homeCity} 
                onChange={(e) => setHomeCity(e.target.value)}
                className="home-search-input"
              />
              <button type="submit" className="btn btn-primary home-search-btn">
                Search
              </button>
            </form>

            <div className="hero-stats animate-fade">
              <div className="stat">
                <span className="stat-number">20+</span>
                <span className="stat-label">Royal Estates</span>
              </div>
              <div className="stat">
                <span className="stat-number">8+</span>
                <span className="stat-label">Indian Cities</span>
              </div>
              <div className="stat">
                <span className="stat-number">5★</span>
                <span className="stat-label">Luxury Standards</span>
              </div>
              <div className="stat">
                <span className="stat-number">Aura</span>
                <span className="stat-label">Digital Concierge</span>
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
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Bespoke Comfort</span>
            <h2 className="section-title">The Aura Experience</h2>
            <p className="section-subtitle">
              Enjoy five-star luxury amenities integrated with an advanced conversational companion.
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
                  <p className="destination-count">{d.count} Hotel{d.count > 1 ? 's' : ''}</p>
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
              <div className="ai-cta-icon">✦</div>
              <h2 className="ai-cta-title display-heading">
                Converse with <span className="gold-text">Aura Concierge</span>
              </h2>
              <p className="ai-cta-desc">
                "Find me a 5-star heritage suite in Udaipur with lake views under $500 for two guests next week."
                — state your preferences naturally.
              </p>
              <Link to="/register" className="btn btn-primary btn-lg" id="cta-get-started">
                Begin Conversation
              </Link>
            </div>
            <div className="ai-chat-preview">
              <div className="preview-message preview-user">
                Suggest a heritage palace in Jaipur for two guests
              </div>
              <div className="preview-message preview-ai">
                ✦ I highly recommend the Rambagh Palace in Jaipur. Originally built in 1835, this former residence of the Maharaja features magnificent gardens and heritage suites starting from $420/night.
              </div>
              <div className="preview-message preview-user">
                Please book the palace suite for next week
              </div>
              <div className="preview-message preview-ai">
                ✦ Booking successfully confirmed at Rambagh Palace! Reservation ID: BK-20260604-A9B3. A confirmation email has been logged to your account.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
