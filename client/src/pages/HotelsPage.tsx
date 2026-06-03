import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hotel, SearchParams } from '../types';
import { hotelsApi } from '../api/hotels';
import HotelCard from '../components/ui/HotelCard';
import SearchBar from '../components/ui/SearchBar';
import './HotelsPage.css';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const cityParam = searchParams.get('city');

  const fetchHotels = async (params?: SearchParams) => {
    setIsLoading(true);
    setError('');
    try {
      const res = params && Object.keys(params).some((k) => params[k as keyof SearchParams])
        ? await hotelsApi.search(params)
        : await hotelsApi.getAll();
      setHotels(res.data.data);
    } catch {
      setError('Failed to load hotels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cityParam) {
      fetchHotels({ city: cityParam });
    } else {
      fetchHotels();
    }
  }, [cityParam]);

  const handleSearch = (params: SearchParams) => {
    fetchHotels(params);
  };

  return (
    <div className="hotels-page page-content">
      <div className="container">
        <div className="hotels-page-header">
          <h1 className="hotels-title display-heading">
            Discover <span className="gradient-text">World-Class</span> Hotels
          </h1>
          <p className="hotels-subtitle">
            {hotels.length > 0
              ? `${hotels.length} properties found worldwide`
              : 'Search to find your perfect stay'}
          </p>
        </div>

        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {isLoading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Finding the best hotels for you...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>⚠️ {error}</p>
            <button onClick={() => fetchHotels()} className="btn btn-primary">
              Try Again
            </button>
          </div>
        ) : hotels.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No hotels found</h3>
            <p>Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="hotels-grid">
            {hotels.map((hotel, i) => (
              <div key={hotel.id} style={{ animationDelay: `${i * 0.05}s` }}>
                <HotelCard hotel={hotel} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
