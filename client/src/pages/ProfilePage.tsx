import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      await updateProfile({ name, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to update profile');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page page-content">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <span className={`badge ${user.role === 'admin' ? 'badge-confirmed' : 'badge-modified'}`}>
              {user.role === 'admin' ? '👑 Admin' : '👤 User'}
            </span>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card glass-panel animate-fade">
            <h3 className="profile-card-title">Edit Profile</h3>

            {saved && (
              <div className="success-banner">✅ Profile updated successfully!</div>
            )}
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={user.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-phone">Phone (Optional)</label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <button
                id="save-profile"
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? <span className="spinner spinner-sm" /> : null}
                Save Changes
              </button>
            </form>
          </div>

          <div className="profile-info-card glass-panel animate-fade">
            <h3 className="profile-card-title">Account Info</h3>
            <div className="info-items">
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Account Role</span>
                <span className="info-value">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">User ID</span>
                <span className="info-value info-id">{user.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
