import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { hotelAPI, roomAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HotelDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || 1);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    fetchHotelAndRooms();
  }, [id]);

  const fetchHotelAndRooms = async () => {
    try {
      setLoading(true);
      setError('');

      const hotelData = await hotelAPI.getById(id);
      setHotel(hotelData);

      const params = {};
      if (checkIn) params.checkIn = checkIn;
      if (checkOut) params.checkOut = checkOut;
      if (guests) params.guests = guests;

      const roomsData = await roomAPI.getByHotel(id, params);
      setRooms(roomsData);
    } catch (err) {
      setError(err.message || 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterRooms = (e) => {
    e.preventDefault();
    if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }
    fetchRoomsOnly();
  };

  const fetchRoomsOnly = async () => {
    try {
      setLoading(true);
      const params = {};
      if (checkIn) params.checkIn = checkIn;
      if (checkOut) params.checkOut = checkOut;
      if (guests) params.guests = guests;

      const roomsData = await roomAPI.getByHotel(id, params);
      setRooms(roomsData);
    } catch (err) {
      setError(err.message || 'Failed to filter rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (room) => {
    if (!isAuthenticated) {
      alert('Please log in or register to book a room.');
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates first.');
      return;
    }

    setBookingError('');
    setBookingSuccess('');
    setSelectedRoom(room);
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !selectedRoom) return { days: 0, total: 0 };
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.abs(end - start);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
    return {
      days,
      total: days * selectedRoom.pricePerNight
    };
  };

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      setBookingError('');

      await bookingAPI.create({
        hotelId: hotel._id,
        roomId: selectedRoom._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: Number(guests)
      });

      setBookingSuccess('Booking confirmed successfully!');
      setTimeout(() => {
        setSelectedRoom(null);
        navigate('/my-bookings');
      }, 1500);
    } catch (err) {
      setBookingError(err.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading && !hotel) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading property details...</div>;
  }

  if (!hotel) {
    return <div className="alert alert-error">Hotel not found.</div>;
  }

  const { days, total } = calculateTotal();

  return (
    <div>
      <div className="hotel-banner">
        <img src={hotel.image} alt={hotel.name} className="hotel-banner-img" />
        <div className="hotel-banner-info">
          <div className="hotel-header">
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', color: '#ffffff' }}>
                {hotel.name}
              </h1>
              <p className="hotel-location" style={{ fontSize: '15px', marginTop: '6px' }}>
                📍 {hotel.address}, {hotel.city}
              </p>
            </div>
            <span className="hotel-rating" style={{ fontSize: '16px', padding: '4px 14px' }}>
              ★ {hotel.rating}
            </span>
          </div>
          <p style={{ color: '#cbd5e1', marginTop: '14px', fontSize: '15px', lineHeight: '1.6' }}>
            {hotel.description}
          </p>
          {hotel.phone && (
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#94a3b8' }}>
              📞 Concierge: {hotel.phone}
            </p>
          )}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', padding: '20px 24px', borderRadius: 'var(--radius-md)', marginBottom: '32px', backdropFilter: 'blur(16px)' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', color: '#f8fafc', fontWeight: '600' }}>
          Select Dates to Check Real-Time Availability
        </h3>
        <form onSubmit={handleFilterRooms} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
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

          <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>
            Check Availability
          </button>
        </form>
      </div>

      <div className="section-title">
        <span>Available Rooms & Suites ({rooms.length})</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
          <h3>No rooms available for the selected dates.</h3>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>
            Please select different dates to browse available suites.
          </p>
        </div>
      ) : (
        <div className="rooms-list">
          {rooms.map((room) => (
            <div key={room._id} className="room-card">
              <img
                src={room.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'}
                alt={room.roomType}
                className="room-img"
              />
              <div className="room-info">
                <h3>
                  {room.roomType} — Room #{room.roomNumber}
                </h3>
                <div className="room-meta">
                  <span>👥 Accommodates {room.capacity} Guests</span>
                  <span>✨ Instant Confirmation</span>
                </div>
                <p style={{ fontSize: '13.5px', color: '#cbd5e1', marginBottom: '10px' }}>
                  {room.description}
                </p>
                <div className="room-amenities">
                  {room.amenities &&
                    room.amenities.map((item, idx) => (
                      <span key={idx} className="amenity-chip">
                        {item}
                      </span>
                    ))}
                </div>
              </div>

              <div className="room-pricing">
                <div className="room-price">₹{room.pricePerNight}</div>
                <div className="room-per-night">per night</div>
                <button
                  onClick={() => handleOpenBooking(room)}
                  className="btn btn-success"
                  style={{ marginTop: '12px' }}
                >
                  Reserve Suite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Your Reservation</h3>
              <button onClick={() => setSelectedRoom(null)} className="modal-close-btn">
                ✕
              </button>
            </div>

            {bookingError && <div className="alert alert-error">{bookingError}</div>}
            {bookingSuccess && <div className="alert alert-success">{bookingSuccess}</div>}

            <div style={{ marginBottom: '20px', lineHeight: '1.8' }}>
              <p><strong>Property:</strong> {hotel.name}</p>
              <p><strong>Room:</strong> {selectedRoom.roomType} (#{selectedRoom.roomNumber})</p>
              <p><strong>Check-in:</strong> {checkIn}</p>
              <p><strong>Check-out:</strong> {checkOut}</p>
              <p><strong>Duration:</strong> {days} Night{days > 1 ? 's' : ''}</p>
              <p><strong>Guests:</strong> {guests} Person(s)</p>
              <hr style={{ margin: '14px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
              <p style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8' }}>
                Total: ₹{total}
              </p>
              <small style={{ color: '#94a3b8' }}>*Pay upon arrival at the hotel front desk</small>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedRoom(null)}
                className="btn btn-secondary"
                disabled={bookingLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="btn btn-primary"
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Confirming...' : 'Complete Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
