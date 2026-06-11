import { Link } from 'react-router-dom';
import { Hotel } from '../../types';
import StarRating from './StarRating';
import './HotelCard.css';

interface Props {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: Props) {
  const firstImage = hotel.images[0] || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800';

  return (
    <Link to={`/hotels/${hotel.id}`} className="hotel-card card animate-fade">
      <div className="hotel-card-image">
        <img
          src={firstImage}
          alt={hotel.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800';
          }}
        />
        <div className="hotel-card-badge">
          <span className="hotel-rating-badge">
            {hotel.rating.toFixed(1)} ★
          </span>
        </div>
      </div>

      <div className="hotel-card-body">
        <div className="hotel-card-header">
          <h3 className="hotel-card-name">{hotel.name}</h3>
          <div className="hotel-card-location">
            <span>{hotel.city}, {hotel.country}</span>
          </div>
        </div>

        <div className="hotel-card-stars">
          <StarRating rating={hotel.rating} />
          <span className="hotel-card-rating-text">{hotel.rating.toFixed(1)} Rating</span>
        </div>

        <p className="hotel-card-description">{hotel.description.slice(0, 100)}...</p>

        <div className="hotel-card-amenities">
          {hotel.amenities.slice(0, 4).map((a) => (
            <span key={a} className="amenity-tag">{a}</span>
          ))}
          {hotel.amenities.length > 4 && (
            <span className="amenity-tag amenity-more">+{hotel.amenities.length - 4}</span>
          )}
        </div>

        <div className="hotel-card-footer">
          <div className="hotel-price">
            <span className="price-amount">${hotel.price_per_night}</span>
            <span className="price-per">/ night</span>
          </div>
          <button className="btn btn-primary btn-sm">View Details</button>
        </div>
      </div>
    </Link>
  );
}
