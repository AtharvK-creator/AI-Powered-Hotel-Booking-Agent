import { useState, useEffect } from 'react';
import { Booking } from '../types';
import { bookingsApi } from '../api/bookings';
import BookingCard from '../components/ui/BookingCard';
import './BookingsPage.css';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingsApi.getMyBookings();
      setBookings(res.data.data);
    } catch {
      // handle silently
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadBookings(); }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsApi.cancel(id);
      await loadBookings();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      alert(msg || 'Failed to cancel booking');
    }
  };

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const FILTERS = ['all', 'confirmed', 'modified', 'cancelled', 'completed'];

  return (
    <div className="bookings-page page-content">
      <div className="container">
        <div className="bookings-header">
          <div>
            <h1 className="bookings-title display-heading">My Bookings</h1>
            <p className="bookings-subtitle">
              {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="bookings-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              id={`filter-${f}`}
              className={`filter-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && ` (${bookings.length})`}
              {f !== 'all' && ` (${bookings.filter((b) => b.status === f).length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Loading your bookings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧳</div>
            <h3 className="empty-state-title">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p>Ready to plan your next adventure?</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
