import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="brand-icon">🏨</span>
          <span className="brand-name">Hotel<span className="gradient-text">AI</span></span>
          <p className="footer-tagline">Your AI-powered hotel booking companion</p>
        </div>
        <div className="footer-links-group">
          <h4>Explore</h4>
          <Link to="/hotels">Browse Hotels</Link>
          <Link to="/chat">AI Assistant</Link>
          <Link to="/bookings">My Bookings</Link>
        </div>
        <div className="footer-links-group">
          <h4>Account</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 HotelAI. Built with ❤️ for premium travel experiences.</p>
      </div>
    </footer>
  );
}
