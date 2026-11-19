// Booking Routes
const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Routes for logged-in users (Guests, Managers, Admins)
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

// Management route for Hotel Managers and Admin
router.get('/all', protect, authorize('hotel_manager', 'admin'), getAllBookings);

module.exports = router;
