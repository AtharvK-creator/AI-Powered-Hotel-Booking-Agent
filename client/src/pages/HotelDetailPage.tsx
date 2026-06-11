import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Hotel } from '../types';
import { hotelsApi } from '../api/hotels';
import { bookingsApi } from '../api/bookings';
import { useAuthStore } from '../store/authStore';
import StarRating from '../components/ui/StarRating';
import './HotelDetailPage.css';

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!id) return;
    hotelsApi.getById(id)
      .then((res) => {
        setHotel(res.data.data);
        if (res.data.data.room_types.length > 0) {
          setSelectedRoom(res.data.data.room_types[0].type);
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    return Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
  })();

  const selectedRoomObj = hotel?.room_types.find((r) => r.type === selectedRoom);
  const totalPrice = selectedRoomObj ? selectedRoomObj.price * nights : 0;

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!checkIn || !checkOut) { setBookingError('Please select check-in and check-out dates'); return; }
    if (nights <= 0) { setBookingError('Check-out must be after check-in'); return; }

    setIsBooking(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const res = await bookingsApi.create({
        hotelId: hotel!.id,
        roomType: selectedRoom,
        checkIn,
        checkOut,
        guests,
        specialRequests: specialRequests || undefined,
      });
      setBookingSuccess(`🎉 Booking confirmed! ID: ${res.data.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setBookingError(msg || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-content loading-center">
        <div className="spinner" />
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="page-content empty-state">
        <div className="empty-state-icon">✦</div>
        <h2>Hotel not found</h2>
        <Link to="/hotels" className="btn btn-primary">Browse Hotels</Link>
      </div>
    );
  }

  return (
    <div className="hotel-detail-page page-content">
      {/* Image Gallery */}
      <div className="hotel-gallery">
        <div className="gallery-main">
          <img
            src={hotel.images[activeImage] || hotel.images[0]}
            alt={hotel.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800';
            }}
          />
        </div>
        {hotel.images.length > 1 && (
          <div className="gallery-thumbs">
            {hotel.images.map((img, i) => (
              <button
                key={i}
                className={`gallery-thumb ${activeImage === i ? 'active' : ''}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container hotel-detail-layout">
        {/* Left: Details */}
        <div className="hotel-info animate-fade">
          <div className="hotel-info-header">
            <div>
              <h1 className="hotel-detail-name">{hotel.name}</h1>
              <p className="hotel-detail-location">{hotel.address}</p>
            </div>
            <div className="hotel-detail-rating">
              <StarRating rating={hotel.rating} />
              <span className="rating-number">{hotel.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="hotel-detail-description">{hotel.description}</p>

          {/* Amenities */}
          <div className="hotel-section">
            <h3 className="hotel-section-title">Amenities</h3>
            <div className="amenities-list">
              {hotel.amenities.map((a) => (
                <div key={a} className="amenity-item">
                  <span className="amenity-check">✓</span> {a}
                </div>
              ))}
            </div>
          </div>

          {/* Room Types */}
          <div className="hotel-section">
            <h3 className="hotel-section-title">Room Types</h3>
            <div className="rooms-list">
              {hotel.room_types.map((room) => (
                <div
                  key={room.type}
                  className={`room-card ${selectedRoom === room.type ? 'selected' : ''}`}
                  onClick={() => setSelectedRoom(room.type)}
                >
                  <div className="room-header">
                    <div>
                      <h4 className="room-type-name">{room.type}</h4>
                      <p className="room-desc">{room.description}</p>
                      <p className="room-capacity">Up to {room.capacity} Guests</p>
                    </div>
                    <div className="room-price-block">
                      <span className="room-price">${room.price}</span>
                      <span className="room-per">/night</span>
                    </div>
                  </div>
                  {selectedRoom === room.type && (
                    <div className="room-selected-badge">Selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="booking-form-container animate-slide">
          <div className="booking-form glass-panel">
            <h3 className="booking-form-title">Reserve Your Stay</h3>

            {bookingSuccess ? (
              <div className="booking-success">
                <div className="success-icon">✦</div>
                <p>{bookingSuccess}</p>
                <Link to="/bookings" className="btn btn-primary btn-full">View My Bookings</Link>
                <button onClick={() => setBookingSuccess('')} className="btn btn-ghost btn-sm">
                  Book Another
                </button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Room Type</label>
                  <select
                    id="book-room-type"
                    className="form-input"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                  >
                    {hotel.room_types.map((r) => (
                      <option key={r.type} value={r.type}>
                        {r.type} — ${r.price}/night
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Check-in</label>
                  <input
                    id="book-checkin"
                    type="date"
                    className="form-input"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={today}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Check-out</label>
                  <input
                    id="book-checkout"
                    type="date"
                    className="form-input"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || today}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Guests</label>
                  <select
                    id="book-guests"
                    className="form-input"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                  >
                    {Array.from({ length: selectedRoomObj?.capacity || 4 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Requests (Optional)</label>
                  <textarea
                    id="book-requests"
                    className="form-input"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Early check-in, dietary requirements..."
                    rows={3}
                  />
                </div>

                {nights > 0 && (
                  <div className="price-summary">
                    <div className="price-row">
                      <span>${selectedRoomObj?.price}/night × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="price-total">
                      <strong>Total</strong>
                      <strong className="total-amount">${totalPrice.toFixed(2)}</strong>
                    </div>
                  </div>
                )}

                {bookingError && <div className="auth-error">{bookingError}</div>}

                <button
                  id="confirm-booking"
                  className="btn btn-primary btn-full"
                  onClick={handleBook}
                  disabled={isBooking}
                >
                  {isBooking ? <span className="spinner spinner-sm" /> : null}
                  {isBooking ? 'Confirming...' : isAuthenticated ? 'Confirm Booking' : 'Sign In to Book'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
