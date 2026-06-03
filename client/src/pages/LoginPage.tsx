import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './AuthPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/hotels');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-page page-content">
      <div className="auth-container">
        <div className="auth-card glass-panel animate-fade">
          <div className="auth-header">
            <div className="auth-logo">🏨</div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to access your bookings</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner spinner-sm" /> : null}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
          </div>

          <div className="auth-demo">
            <p className="demo-title">Demo Accounts</p>
            <div className="demo-accounts">
              <button
                className="demo-btn"
                onClick={() => { setEmail('admin@demo.com'); setPassword('admin123'); }}
                type="button"
              >
                👑 Admin
              </button>
              <button
                className="demo-btn"
                onClick={() => { setEmail('user@demo.com'); setPassword('user1234'); }}
                type="button"
              >
                👤 User
              </button>
            </div>
            <p className="demo-note">Register first to create these accounts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
