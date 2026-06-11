import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-name">AURA <span className="gold-text">AI</span></span>
        </Link>

        <div className="navbar-links">
          <Link to="/hotels" className={`nav-link ${isActive('/hotels') ? 'active' : ''}`}>
            Hotels
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
                My Bookings
              </Link>
              <Link to="/chat" className={`nav-link nav-link-ai ${isActive('/chat') ? 'active' : ''}`}>
                <span>✨</span> AI Assistant
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          <button
            id="dark-mode-toggle"
            className="btn btn-ghost btn-icon"
            onClick={toggleDarkMode}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <div className="navbar-user">
              <Link to="/profile" className="user-avatar" title="Profile">
                {user?.name?.charAt(0).toUpperCase()}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
