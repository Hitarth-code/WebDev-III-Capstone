import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hotelAPI } from '../services/api';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async (searchParams = {}) => {
    try {
      setLoading(true);
      setError('');
      const data = await hotelAPI.getAll(searchParams);
      setHotels(data);
    } catch (err) {
      setError(err.message || 'Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }
    fetchHotels({ city });
  };

  const handleViewRooms = (hotelId) => {
    const query = new URLSearchParams();
    if (checkIn) query.append('checkIn', checkIn);
    if (checkOut) query.append('checkOut', checkOut);
    if (guests) query.append('guests', guests);
    navigate(`/hotel/${hotelId}?${query.toString()}`);
  };

  return (
    <div>
      <div className="hero-banner">
        <h1>Find Your Stay with StayEasy</h1>
        <p>Book hotels and comfortable rooms easily.</p>

        <form onSubmit={handleSearch} className="search-box">
          <div className="search-field">
            <label>City</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Delhi, Bengaluru"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Check-in</label>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Check-out</label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Guests</label>
            <input
              type="number"
              min="1"
              max="10"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
            Search
          </button>
        </form>
      </div>

      <div className="section-title">
        <span>Available Hotels ({hotels.length})</span>
        {city && (
          <button
            onClick={() => {
              setCity('');
              fetchHotels();
            }}
            className="btn btn-outline btn-sm"
          >
            Clear Filter
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading hotels...</div>
      ) : hotels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '10px' }}>
          <h3>No hotels found.</h3>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Try searching another city.</p>
        </div>
      ) : (
        <div className="hotels-grid">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="hotel-card">
              <img
                src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                alt={hotel.name}
                className="hotel-image"
              />
              <div className="hotel-content">
                <div className="hotel-header">
                  <h3 className="hotel-name">{hotel.name}</h3>
                  <span className="hotel-rating">★ {hotel.rating}</span>
                </div>
                <div className="hotel-location">
                  📍 {hotel.address}, {hotel.city}
                </div>
                <p className="hotel-desc">{hotel.description}</p>
                <button
                  onClick={() => handleViewRooms(hotel._id)}
                  className="btn btn-primary btn-block"
                >
                  View Rooms
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
