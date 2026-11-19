// Booking Controller
// Handles booking creation with clash prevention, booking history, and cancellations
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// @desc    Create a new booking (checks for date clash overlap)
// @route   POST /api/bookings
// @access  Private (Guest, Hotel Manager, Admin)
const createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, checkInDate, checkOutDate, guestCount } = req.body;

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid check-in or check-out date' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Double-check date clash prevention using overlap query
    // Clashing condition: existing.checkInDate < new.checkOutDate AND existing.checkOutDate > new.checkInDate
    const existingConflict = await Booking.findOne({
      room: roomId,
      status: 'confirmed',
      $and: [
        { checkInDate: { $lt: end } },
        { checkOutDate: { $gt: start } }
      ]
    });

    if (existingConflict) {
      return res.status(400).json({
        message: 'This room is already booked for the selected dates. Please choose different dates or another room.'
      });
    }

    // Calculate total days and price
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = totalDays * room.pricePerNight;

    const booking = new Booking({
      user: req.user._id,
      hotel: hotelId,
      room: roomId,
      checkInDate: start,
      checkOutDate: end,
      totalDays,
      totalPrice,
      guestCount: guestCount || 1,
      status: 'confirmed'
    });

    const savedBooking = await booking.save();
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('hotel', 'name address city image')
      .populate('room', 'roomNumber roomType pricePerNight');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking history for the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('hotel', 'name address city phone image')
      .populate('room', 'roomNumber roomType pricePerNight amenities')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only booking owner or admin can cancel
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'This booking is already cancelled' });
    }

    booking.status = 'cancelled';
    const updatedBooking = await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin or Hotel Manager for their hotels)
// @route   GET /api/bookings
// @access  Private (Hotel Manager / Admin)
const getAllBookings = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'hotel_manager') {
      // Find hotels managed by this manager
      const myHotels = await Hotel.find({ manager: req.user._id }).select('_id');
      const hotelIds = myHotels.map((h) => h._id);
      query.hotel = { $in: hotelIds };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('hotel', 'name city')
      .populate('room', 'roomNumber roomType pricePerNight')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings
};
