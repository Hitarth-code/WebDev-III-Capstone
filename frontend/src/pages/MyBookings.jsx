import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingAPI.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setError('');
      setMessage('');
      await bookingAPI.cancel(bookingId);
      setMessage('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div>
      <div className="section-title">
        <h2>My Bookings</h2>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading reservations...</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '10px' }}>
          <h3>No bookings found.</h3>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Explore hotels to book a room.</p>
        </div>
      ) : (
        <div>
          {bookings.map((booking) => {
            const checkInFormatted = new Date(booking.checkInDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const checkOutFormatted = new Date(booking.checkOutDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-main">
                  <h3>{booking.hotel?.name || 'Hotel'}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    📍 {booking.hotel?.address}, {booking.hotel?.city}
                  </p>
                  <p className="booking-dates">
                    🗓️ <strong>{checkInFormatted}</strong> to <strong>{checkOutFormatted}</strong> ({booking.totalDays} Night{booking.totalDays > 1 ? 's' : ''})
                  </p>
                  <p style={{ fontSize: '13px', color: '#4b5563' }}>
                    Room: <strong>{booking.room?.roomType || 'Standard'}</strong> (#{booking.room?.roomNumber}) | Guests: {booking.guestCount}
                  </p>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span
                    className={`status-badge ${
                      booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled'
                    }`}
                  >
                    ● {booking.status}
                  </span>

                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937' }}>
                    ₹{booking.totalPrice}
                  </div>

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn btn-danger btn-sm"
                      style={{ marginTop: '6px' }}
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
