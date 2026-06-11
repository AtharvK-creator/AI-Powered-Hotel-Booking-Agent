import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { AdminStats, User, Booking } from '../types';
import './AdminPage.css';

type Tab =
  | 'overview'
  | 'users'
  | 'bookings'
  | 'ai_cost_analytics'
  | 'recommendation_analytics'
  | 'user_journey_analytics'
  | 'security_analytics'
  | 'system_health';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // New analytics states
  const [costAnalytics, setCostAnalytics] = useState<any>(null);
  const [journeyAnalytics, setJourneyAnalytics] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [biInsights, setBiInsights] = useState<string[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);

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

  const fetchTabData = async (tab: Tab) => {
    try {
      if (tab === 'ai_cost_analytics') {
        const [cRes, bRes] = await Promise.all([
          adminApi.getCostAnalytics(),
          adminApi.getBiInsights()
        ]);
        setCostAnalytics(cRes.data.data);
        setBiInsights(bRes.data.data.insights || []);
      } else if (tab === 'user_journey_analytics' || tab === 'recommendation_analytics') {
        const jRes = await adminApi.getJourneyAnalytics();
        setJourneyAnalytics(jRes.data.data);
      } else if (tab === 'security_analytics') {
        const sRes = await adminApi.getSecurityAuditLogs();
        setSecurityLogs(sRes.data.data);
      } else if (tab === 'system_health') {
        const hRes = await adminApi.getSystemHealthLive();
        setSystemHealth(hRes.data.data);
      }
    } catch (err) {
      console.error(`Failed to fetch tab data for ${tab}`, err);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    fetchTabData(activeTab);

    let interval: any;
    if (activeTab === 'system_health') {
      interval = setInterval(async () => {
        try {
          const hRes = await adminApi.getSystemHealthLive();
          setSystemHealth(hRes.data.data);
        } catch (err) {
          console.error('Failed to poll system health', err);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, isLoading]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await adminApi.exportMetrics();
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('Failed to export CSV metrics.');
    } finally {
      setIsExporting(false);
    }
  };

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
            Admin <span className="gold-text">Dashboard</span>
          </h1>
          <p className="admin-subtitle">Aura Luxury Hotels — Management Console</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card glass-panel">
              <div className="stat-card-value">{stats.totalUsers}</div>
              <div className="stat-card-label">Total Users</div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-card-value">{stats.totalHotels}</div>
              <div className="stat-card-label">Active Hotels</div>
            </div>
            <div className="stat-card glass-panel">
              <div className="stat-card-value">{stats.totalBookings}</div>
              <div className="stat-card-label">Total Bookings</div>
            </div>
            <div className="stat-card stat-card-revenue glass-panel">
              <div className="stat-card-value">${stats.totalRevenue.toLocaleString()}</div>
              <div className="stat-card-label">Total Revenue</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs-wrapper">
          <div className="admin-tabs">
            {([
              'overview',
              'users',
              'bookings',
              'ai_cost_analytics',
              'recommendation_analytics',
              'user_journey_analytics',
              'security_analytics',
              'system_health',
            ] as Tab[]).map((tab) => (
              <button
                key={tab}
                id={`admin-tab-${tab}`}
                className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
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
                      <span>{(b as any).hotel_name}</span>
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
                    <td>{(b as any).hotel_name}</td>
                    <td>{(b as any).user_name}</td>
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

        {/* AI Cost Analytics */}
        {activeTab === 'ai_cost_analytics' && costAnalytics && (
          <div className="animate-fade">
            <div className="analytics-actions-row">
              <button 
                onClick={handleExportCsv} 
                disabled={isExporting}
                className="btn btn-gold btn-export"
              >
                {isExporting ? 'Exporting...' : '📥 Export AI Metrics CSV'}
              </button>
            </div>
            
            <div className="sub-grid">
              <div className="stat-card glass-panel">
                <div className="stat-card-value">{costAnalytics.summary.totalRequests.toLocaleString()}</div>
                <div className="stat-card-label">Total AI Requests</div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-card-value">{costAnalytics.summary.cacheHitRate}%</div>
                <div className="stat-card-label">Cache Hit Rate</div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-card-value">${costAnalytics.summary.estimatedCostUsd.toFixed(2)}</div>
                <div className="stat-card-label">Estimated AI Cost</div>
              </div>
              <div className="stat-card stat-card-revenue glass-panel">
                <div className="stat-card-value">${costAnalytics.summary.estimatedSavingsUsd.toFixed(2)}</div>
                <div className="stat-card-label">Estimated Cache Savings</div>
              </div>
            </div>

            <div className="admin-card glass-panel m-top-6">
              <h3>Token Savings & Performance</h3>
              <div className="performance-row m-bottom-3">
                <div className="perf-label">Input Tokens Used:</div>
                <div className="perf-val font-display">{costAnalytics.summary.inputTokens.toLocaleString()}</div>
              </div>
              <div className="performance-row m-bottom-3">
                <div className="perf-label">Output Tokens Used:</div>
                <div className="perf-val font-display">{costAnalytics.summary.outputTokens.toLocaleString()}</div>
              </div>
              <div className="performance-row m-bottom-3">
                <div className="perf-label">Tokens Saved by Cache:</div>
                <div className="perf-val font-display text-green">{costAnalytics.summary.savedTokens.toLocaleString()}</div>
              </div>
              <div className="performance-row">
                <div className="perf-label">Average Response Latency:</div>
                <div className="perf-val font-display">{costAnalytics.summary.avgResponseTimeMs} ms</div>
              </div>
            </div>

            <div className="admin-card glass-panel m-top-6">
              <h3>AI Providers Breakdown</h3>
              <div className="providers-breakdown-container">
                {costAnalytics.providers.map((p: any) => (
                  <div key={p.provider} className="provider-card">
                    <div className="provider-header-row">
                      <h4>{p.provider}</h4>
                      <span className="badge badge-completed">{p.successRate}% success rate</span>
                    </div>
                    <div className="provider-details-grid">
                      <div>
                        <span className="p-label">Requests:</span>
                        <span className="p-val">{p.requests}</span>
                      </div>
                      <div>
                        <span className="p-label">Tokens:</span>
                        <span className="p-val">{p.totalTokens.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="p-label">Est. Cost:</span>
                        <span className="p-val gold-text">${p.estimatedCostUsd.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="p-label">Fallbacks:</span>
                        <span className="p-val text-orange">{p.fallbackCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card glass-panel m-top-6">
              <h3>Dynamic BI & Operation Insights</h3>
              <ul className="bi-insights-list">
                {biInsights.map((insight: string, idx: number) => (
                  <li key={idx} className="bi-insight-item">
                    <span className="bullet">✦</span> {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recommendation Analytics */}
        {activeTab === 'recommendation_analytics' && journeyAnalytics && (
          <div className="animate-fade">
            <div className="sub-grid-3">
              <div className="stat-card glass-panel">
                <div className="stat-card-value">{journeyAnalytics.conversionStats.completed}</div>
                <div className="stat-card-label">Completed Bookings</div>
              </div>
              <div className="stat-card glass-panel">
                <div className="stat-card-value">{journeyAnalytics.conversionStats.cancelled}</div>
                <div className="stat-card-label">Cancelled Bookings</div>
              </div>
              <div className="stat-card stat-card-revenue glass-panel">
                <div className="stat-card-value">{journeyAnalytics.conversionStats.completionRate}%</div>
                <div className="stat-card-label">Booking Completion Rate</div>
              </div>
            </div>

            <div className="admin-overview-grid m-top-6">
              <div className="admin-card glass-panel">
                <h3>Top Searched Destinations</h3>
                <div className="mini-table">
                  {journeyAnalytics.popularDestinations.map((d: any, idx: number) => (
                    <div key={idx} className="mini-row">
                      <span className="mini-id">#0{idx + 1}</span>
                      <span className="font-semibold">{d.destination}</span>
                      <span className="mini-price font-normal">{d.count} requests</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="admin-card glass-panel">
                <h3>Most Viewed Hotel Showrooms</h3>
                <div className="mini-table">
                  {journeyAnalytics.mostViewedHotels.map((h: any, idx: number) => (
                    <div key={idx} className="mini-row">
                      <span className="mini-id">#0{idx + 1}</span>
                      <span className="font-semibold">{h.hotelName}</span>
                      <span className="mini-price font-normal">{h.count} views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Journey Funnel */}
        {activeTab === 'user_journey_analytics' && journeyAnalytics && (
          <div className="admin-card glass-panel animate-fade">
            <h3>E2E Booking Conversion Funnel</h3>
            <p className="funnel-subtitle m-bottom-6">Visualization of user interactions from initial hotel search to completed booking.</p>
            <div className="funnel-container">
              {journeyAnalytics.funnel.map((step: any, idx: number) => {
                const widthPercent = 100 - (idx * 8);
                return (
                  <div 
                    key={idx} 
                    className="funnel-step" 
                    style={{ width: `${widthPercent}%`, margin: '0 auto var(--space-4)' }}
                  >
                    <div className="funnel-step-header">
                      <span className="funnel-step-name">{step.stage}</span>
                      <span className="funnel-step-value">{step.count} ({step.conversionPercent}%)</span>
                    </div>
                    <div className="funnel-step-bar-wrap">
                      <div className="funnel-step-bar" style={{ width: `${step.conversionPercent}%` }} />
                    </div>
                    {step.dropOffPercent > 0 && (
                      <div className="funnel-step-dropoff text-orange">
                        🔻 Drop-off: {step.dropOffPercent}% from previous stage
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Security Analytics */}
        {activeTab === 'security_analytics' && (
          <div className="admin-card glass-panel animate-fade">
            <h3>Security Audits & Suspicious Logs</h3>
            <p className="funnel-subtitle m-bottom-4">Audited security events, input sanitization blocks, and suspicious login attempt details.</p>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action Event</th>
                    <th>Actor / Subject</th>
                    <th>Trigger Details</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted">No security alert events logged. System is secure.</td>
                    </tr>
                  ) : (
                    securityLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="white-space-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${
                            log.action.includes('BLOCKED') || log.action.includes('SUSPICIOUS') 
                              ? 'badge-cancelled' 
                              : 'badge-completed'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.user_id || 'ANONYMOUS/IP'}</td>
                        <td className="log-details-cell">
                          <pre className="log-details-json">{log.details || 'N/A'}</pre>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Health Monitor */}
        {activeTab === 'system_health' && systemHealth && (
          <div className="animate-fade">
            <div className="system-health-grid">
              
              <div className="health-card glass-panel">
                <h4>CPU LOAD</h4>
                <div className="gauge-value m-bottom-2">{systemHealth.cpuUsage}%</div>
                <div className="gauge-progress-bar-wrap">
                  <div 
                    className={`gauge-progress-bar ${
                      systemHealth.cpuUsage > 80 
                        ? 'bg-danger' 
                        : systemHealth.cpuUsage > 50 
                          ? 'bg-warning' 
                          : 'bg-success'
                    }`} 
                    style={{ width: `${systemHealth.cpuUsage}%` }} 
                  />
                </div>
                <p className="health-label m-top-3">1-minute load avg relative to cores</p>
              </div>

              <div className="health-card glass-panel">
                <h4>MEMORY USAGE</h4>
                <div className="heap-info m-top-2">
                  <div className="perf-row m-bottom-2">
                    <span>Process Heap:</span>
                    <span className="font-semibold font-display">{(systemHealth.memoryUsage.processHeap / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="perf-row m-bottom-2">
                    <span>Free OS Memory:</span>
                    <span className="font-semibold font-display">{(systemHealth.memoryUsage.free / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                  </div>
                  <div className="perf-row">
                    <span>Total OS Memory:</span>
                    <span className="font-semibold font-display">{(systemHealth.memoryUsage.total / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                  </div>
                </div>
              </div>

              <div className="health-card glass-panel">
                <h4>DATA CONNECTION LATENCY</h4>
                <div className="latency-info m-top-2">
                  <div className="latency-row m-bottom-3">
                    <span className="status-dot status-green" />
                    <span className="l-name">SQLite DB:</span>
                    <span className="l-val font-semibold font-display text-green">{systemHealth.sqliteHealth.latencyMs} ms</span>
                  </div>
                  <div className="latency-row">
                    <span className={`status-dot ${systemHealth.redisHealth.status === 'online' ? 'status-green' : 'status-orange'}`} />
                    <span className="l-name">Redis Cache:</span>
                    <span className={`l-val font-semibold font-display ${systemHealth.redisHealth.status === 'online' ? 'text-green' : 'text-orange'}`}>
                      {systemHealth.redisHealth.status === 'online' ? `${systemHealth.redisHealth.latencyMs} ms` : 'Offline (Fallback)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="health-card glass-panel">
                <h4>AI KEY PROVIDER SYSTEM</h4>
                <div className="ai-providers-health-list m-top-2">
                  <div className="provider-health-row m-bottom-2">
                    <span>Gemini:</span>
                    <span className={`badge badge-${systemHealth.providersHealth.gemini}`}>
                      {systemHealth.providersHealth.gemini.toUpperCase()}
                    </span>
                  </div>
                  <div className="provider-health-row m-bottom-2">
                    <span>Groq:</span>
                    <span className={`badge badge-${systemHealth.providersHealth.groq}`}>
                      {systemHealth.providersHealth.groq.toUpperCase()}
                    </span>
                  </div>
                  <div className="provider-health-row">
                    <span>OpenRouter:</span>
                    <span className={`badge badge-${systemHealth.providersHealth.openrouter}`}>
                      {systemHealth.providersHealth.openrouter.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
