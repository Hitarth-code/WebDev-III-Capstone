// Hotel Details & Room Booking Page
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

  // Date filters
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(searchParams.get('guests') || 1);

  // Booking Modal State
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

      // Query rooms with current date filters
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

  // Open booking modal
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

  // Calculate total days and price
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

  // Confirm booking
  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      setBookingError('');

      const { days, total } = calculateTotal();

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
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading hotel details...</div>;
  }

  if (!hotel) {
    return <div className="alert alert-error">Hotel not found.</div>;
  }

  const { days, total } = calculateTotal();

  return (
    <div>
      {/* Hotel Banner Information */}
      <div className="hotel-banner">
        <img src={hotel.image} alt={hotel.name} className="hotel-banner-img" />
        <div className="hotel-banner-info">
          <div className="hotel-header">
            <div>
              <h1 style={{ fontSize: '28px', color: '#111827' }}>{hotel.name}</h1>
              <p className="hotel-location" style={{ fontSize: '15px', marginTop: '4px' }}>
                📍 {hotel.address}, {hotel.city}
              </p>
            </div>
            <span className="hotel-rating" style={{ fontSize: '16px', padding: '4px 12px' }}>
              ★ {hotel.rating}
            </span>
          </div>
          <p style={{ color: '#4b5563', marginTop: '12px', fontSize: '15px' }}>{hotel.description}</p>
          {hotel.phone && (
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
              📞 Contact: {hotel.phone}
            </p>
          )}
        </div>
      </div>

      {/* Date Availability Filter Bar */}
      <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '16px', color: '#374151' }}>
          Check Room Availability by Dates (Overlap Query Protection)
        </h3>
        <form onSubmit={handleFilterRooms} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div className="search-field">
            <label>Check-in Date</label>
            <input
              type="date"
              value={checkIn}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Check-out Date</label>
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
            🔄 Check Availability
          </button>
        </form>
      </div>

      {/* Available Rooms Section */}
      <div className="section-title">
        <span>Available Rooms ({rooms.length})</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '10px' }}>
          <h3>No rooms available for the selected dates or capacity.</h3>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Try adjusting your check-in/check-out dates or guest count.
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
                  {room.roomType} - Room #{room.roomNumber}
                </h3>
                <div className="room-meta">
                  <span>👥 Up to {room.capacity} Guests</span>
                  <span>✅ Instant Confirmation</span>
                </div>
                <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
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
                  style={{ marginTop: '10px' }}
                >
                  Book This Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Confirmation Modal */}
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

            <div style={{ marginBottom: '16px' }}>
              <p><strong>Hotel:</strong> {hotel.name}</p>
              <p><strong>Room:</strong> {selectedRoom.roomType} (#{selectedRoom.roomNumber})</p>
              <p><strong>Check-in:</strong> {checkIn}</p>
              <p><strong>Check-out:</strong> {checkOut}</p>
              <p><strong>Duration:</strong> {days} Night(s)</p>
              <p><strong>Guests:</strong> {guests} Guest(s)</p>
              <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb' }}>
                Total Amount: ₹{total}
              </p>
              <small style={{ color: '#6b7280' }}>*Pay at hotel during check-in</small>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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
                {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
