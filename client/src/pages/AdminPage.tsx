import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { AdminStats, User, Booking } from '../types';
import './AdminPage.css';

type Tab = 'overview' | 'users' | 'bookings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [sRes, uRes, bRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getUsers(),
          adminApi.getBookings(),
        ]);
        setStats(sRes.data.data);
        setUsers(uRes.data.data);
        setBookings(bRes.data.data);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const STATUS_COLOR: Record<string, string> = {
    confirmed: 'badge-confirmed',
    modified: 'badge-modified',
    cancelled: 'badge-cancelled',
    completed: 'badge-completed',
  };

  if (isLoading) {
    return (
      <div className="page-content loading-center">
        <div className="spinner" />
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page page-content">
      <div className="container">
        <div className="admin-header">
          <h1 className="admin-title display-heading">
            👑 Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="admin-subtitle">Hotel Booking AI — Management Console</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <div className="stat-card-icon">👥</div>
              <div className="stat-card-value">{stats.totalUsers}</div>
              <div className="stat-card-label">Total Users</div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-card-icon">🏨</div>
              <div className="stat-card-value">{stats.totalHotels}</div>
              <div className="stat-card-label">Active Hotels</div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-card-icon">📋</div>
              <div className="stat-card-value">{stats.totalBookings}</div>
              <div className="stat-card-label">Total Bookings</div>
            </div>
            <div className="stat-card stat-card-revenue glass-panel">
              <div className="stat-card-icon">💰</div>
              <div className="stat-card-value">${stats.totalRevenue.toLocaleString()}</div>
              <div className="stat-card-label">Total Revenue</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          {(['overview', 'users', 'bookings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              id={`admin-tab-${tab}`}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="animate-fade">
            <div className="admin-overview-grid">
              <div className="admin-card glass-panel">
                <h3>Recent Bookings</h3>
                <div className="mini-table">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="mini-row">
                      <span className="mini-id">{b.id}</span>
                      <span>{(b as unknown as { hotel_name: string }).hotel_name}</span>
                      <span className={`badge ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                      <span className="mini-price">${b.total_price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card glass-panel">
                <h3>Recent Users</h3>
                <div className="mini-table">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="mini-row">
                      <div className="mini-user-avatar">{u.name.charAt(0)}</div>
                      <div>
                        <p className="mini-name">{u.name}</p>
                        <p className="mini-email">{u.email}</p>
                      </div>
                      <span className={`badge ${u.role === 'admin' ? 'badge-confirmed' : 'badge-modified'}`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="admin-table-wrap animate-fade">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">{u.name.charAt(0)}</div>
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-confirmed' : 'badge-modified'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="admin-table-wrap animate-fade">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Hotel</th>
                  <th>Guest</th>
                  <th>Check-in</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td><span className="booking-id">{b.id}</span></td>
                    <td>{(b as unknown as { hotel_name: string }).hotel_name}</td>
                    <td>{(b as unknown as { user_name: string }).user_name}</td>
                    <td>{new Date(b.check_in).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="table-price">${b.total_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
