import { useState } from 'react';
import { SearchParams } from '../../types';
import './SearchBar.css';

interface Props {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading }: Props) {
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      city: city || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
    });
  };

  const handleReset = () => {
    setCity(''); setMinPrice(''); setMaxPrice('');
    setMinRating('');
    onSearch({});
  };

  return (
    <form className="search-bar glass-panel animate-fade" onSubmit={handleSubmit}>
      <div className="search-main-row">
        <div className="search-field search-field-city">
          <label className="search-label">Destination</label>
          <input
            id="search-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or country..."
            className="form-input"
          />
        </div>



        <div className="search-actions">
          <button type="submit" className="btn btn-primary" disabled={isLoading} id="search-submit">
            {isLoading ? <span className="spinner spinner-sm" /> : null}
            Search
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="btn btn-secondary btn-icon"
            title="More filters"
          >
            Filters
          </button>
        </div>
      </div>

      {expanded && (
        <div className="search-filters animate-fade">
          <div className="filter-group">
            <label className="search-label">Min Price/Night ($)</label>
            <input
              id="filter-min-price"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="form-input"
            />
          </div>
          <div className="filter-group">
            <label className="search-label">Max Price/Night ($)</label>
            <input
              id="filter-max-price"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              min="0"
              className="form-input"
            />
          </div>
          <div className="filter-group">
            <label className="search-label">Min Rating</label>
            <select
              id="filter-rating"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="form-input"
            >
              <option value="">Any</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          <button type="button" onClick={handleReset} className="btn btn-ghost btn-sm">
            Clear Filters
          </button>
        </div>
      )}
    </form>
  );
}
