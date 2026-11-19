const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');

const inMemoryBookings = [
  {
    _id: 'bk_1',
    user: '673d00000000000000000003',
    hotel: {
      _id: '673d1234567890abcdef0001',
      name: 'Grand Ocean Resort',
      city: 'Mumbai',
      address: '12 Marine Drive, Colaba'
    },
    room: {
      _id: '673d2234567890abcdef0001',
      roomNumber: '101',
      roomType: 'Standard',
      pricePerNight: 2500
    },
    checkInDate: new Date(Date.now() + 86400000 * 2),
    checkOutDate: new Date(Date.now() + 86400000 * 5),
    totalDays: 3,
    totalPrice: 7500,
    guestCount: 2,
    status: 'confirmed',
    createdAt: new Date()
  }
];

const createBooking = async (req, res) => {
  try {
    const { hotelId, roomId, checkInDate, checkOutDate, guestCount } = req.body;

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid check-in or check-out date' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    if (mongoose.connection.readyState === 1) {
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

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
          message: 'This room is already booked for the selected dates.'
        });
      }

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

      return res.status(201).json(populatedBooking);
    }

    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const pricePerNight = 2500;
    const totalPrice = totalDays * pricePerNight;

    const newBooking = {
      _id: 'bk_' + Date.now(),
      user: req.user?._id || 'guest_user',
      hotel: {
        _id: hotelId || '673d1234567890abcdef0001',
        name: 'Grand Ocean Resort',
        city: 'Mumbai',
        address: '12 Marine Drive, Colaba'
      },
      room: {
        _id: roomId || '673d2234567890abcdef0001',
        roomNumber: '101',
        roomType: 'Standard',
        pricePerNight
      },
      checkInDate: start,
      checkOutDate: end,
      totalDays,
      totalPrice,
      guestCount: guestCount || 1,
      status: 'confirmed',
      createdAt: new Date()
    };

    inMemoryBookings.unshift(newBooking);
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bookings = await Booking.find({ user: req.user._id })
        .populate('hotel', 'name address city phone image')
        .populate('room', 'roomNumber roomType pricePerNight amenities')
        .sort({ createdAt: -1 });

      return res.json(bookings);
    }

    res.json(inMemoryBookings);
  } catch (error) {
    res.json(inMemoryBookings);
  }
};

const cancelBooking = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const booking = await Booking.findById(req.params.id);

      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to cancel this booking' });
      }

      if (booking.status === 'cancelled') {
        return res.status(400).json({ message: 'Booking already cancelled' });
      }

      booking.status = 'cancelled';
      const updatedBooking = await booking.save();

      return res.json({
        message: 'Booking cancelled successfully',
        booking: updatedBooking
      });
    }

    const booking = inMemoryBookings.find((b) => b._id === req.params.id);
    if (booking) {
      booking.status = 'cancelled';
    }
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (req.user.role === 'hotel_manager') {
        const myHotels = await Hotel.find({ manager: req.user._id }).select('_id');
        const hotelIds = myHotels.map((h) => h._id);
        query.hotel = { $in: hotelIds };
      }

      const bookings = await Booking.find(query)
        .populate('user', 'name email phone')
        .populate('hotel', 'name city')
        .populate('room', 'roomNumber roomType pricePerNight')
        .sort({ createdAt: -1 });

      return res.json(bookings);
    }

    res.json(inMemoryBookings);
  } catch (error) {
    res.json(inMemoryBookings);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings
};
