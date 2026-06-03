import { Booking } from '../../types';
import './BookingCard.css';

interface Props {
  booking: Booking;
  onCancel?: (id: string) => void;
  onModify?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function calcNights(checkIn: string, checkOut: string): number {
  return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
}

const STATUS_ICON: Record<string, string> = {
  confirmed: '✅',
  modified: '✏️',
  cancelled: '❌',
  completed: '🏁',
};

export default function BookingCard({ booking, onCancel, onModify }: Props) {
  const nights = calcNights(booking.check_in, booking.check_out);
  const hotelImage = (() => {
    try {
      const imgs = JSON.parse(booking.hotel_image || '[]');
      return Array.isArray(imgs) ? imgs[0] : imgs;
    } catch { return booking.hotel_image; }
  })();

  return (
    <div className="booking-card card animate-fade">
      <div className="booking-card-image">
        <img
          src={hotelImage || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400'}
          alt={booking.hotel_name}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400';
          }}
        />
      </div>

      <div className="booking-card-content">
        <div className="booking-card-header">
          <div>
            <h3 className="booking-hotel-name">{booking.hotel_name}</h3>
            <p className="booking-hotel-location">
              📍 {booking.hotel_city}, {booking.hotel_country}
            </p>
          </div>
          <span className={`badge badge-${booking.status}`}>
            {STATUS_ICON[booking.status]} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        <div className="booking-details-grid">
          <div className="booking-detail">
            <span className="detail-label">Booking ID</span>
            <span className="detail-value booking-id">{booking.id}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Room Type</span>
            <span className="detail-value">{booking.room_type}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Check-in</span>
            <span className="detail-value">{formatDate(booking.check_in)}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Check-out</span>
            <span className="detail-value">{formatDate(booking.check_out)}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{nights} night{nights !== 1 ? 's' : ''}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Guests</span>
            <span className="detail-value">👤 {booking.guests}</span>
          </div>
        </div>

        {booking.special_requests && (
          <div className="booking-requests">
            <span className="detail-label">Special Requests:</span>
            <p>{booking.special_requests}</p>
          </div>
        )}

        <div className="booking-card-footer">
          <div className="booking-total">
            <span className="detail-label">Total</span>
            <span className="booking-price">${booking.total_price.toFixed(2)}</span>
          </div>

          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <div className="booking-actions">
              {onModify && (
                <button
                  onClick={() => onModify(booking.id)}
                  className="btn btn-secondary btn-sm"
                >
                  ✏️ Modify
                </button>
              )}
              {onCancel && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="btn btn-danger btn-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
