// Room Controller
// Handles Room CRUD operations and date overlap availability queries
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

// @desc    Get rooms by hotel ID with optional date availability filter
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
const getRoomsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    let roomQuery = { hotel: hotelId };

    // Capacity filter
    if (guests && Number(guests) > 0) {
      roomQuery.capacity = { $gte: Number(guests) };
    }

    // Availability search by dates (Overlap Query)
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      // Find all confirmed bookings that overlap with requested date range
      // Overlap condition: booking.checkInDate < req.checkOutDate && booking.checkOutDate > req.checkInDate
      const conflictingBookings = await Booking.find({
        hotel: hotelId,
        status: 'confirmed',
        $and: [
          { checkInDate: { $lt: checkOutDate } },
          { checkOutDate: { $gt: checkInDate } }
        ]
      }).select('room');

      // Get list of booked room IDs
      const bookedRoomIds = conflictingBookings.map((b) => b.room.toString());

      // Filter out rooms that are already booked in this date range
      roomQuery._id = { $nin: bookedRoomIds };
      roomQuery.isAvailable = true;
    }

    const rooms = await Room.find(roomQuery);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel', 'name city address');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Private (Hotel Manager / Admin)
const createRoom = async (req, res) => {
  try {
    const {
      hotel,
      roomNumber,
      roomType,
      pricePerNight,
      capacity,
      amenities,
      description,
      image
    } = req.body;

    // Verify hotel exists
    const existingHotel = await Hotel.findById(hotel);
    if (!existingHotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check manager authorization if not admin
    if (existingHotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to add rooms to this hotel' });
    }

    const room = new Room({
      hotel,
      roomNumber,
      roomType,
      pricePerNight,
      capacity: capacity || 2,
      amenities: amenities || ['Free Wi-Fi', 'Air Conditioning', 'Television'],
      description: description || 'Comfortable and clean room with modern amenities.',
      image: image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
      isAvailable: true
    });

    const createdRoom = await room.save();
    res.status(201).json(createdRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private (Hotel Manager / Admin)
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check authorization
    if (room.hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this room' });
    }

    room.roomNumber = req.body.roomNumber || room.roomNumber;
    room.roomType = req.body.roomType || room.roomType;
    room.pricePerNight = req.body.pricePerNight !== undefined ? req.body.pricePerNight : room.pricePerNight;
    room.capacity = req.body.capacity || room.capacity;
    room.amenities = req.body.amenities || room.amenities;
    room.description = req.body.description || room.description;
    room.image = req.body.image || room.image;
    if (req.body.isAvailable !== undefined) {
      room.isAvailable = req.body.isAvailable;
    }

    const updatedRoom = await room.save();
    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private (Hotel Manager / Admin)
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check authorization
    if (room.hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this room' });
    }

    await Booking.deleteMany({ room: room._id });
    await room.deleteOne();

    res.json({ message: 'Room removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRoomsByHotel,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
