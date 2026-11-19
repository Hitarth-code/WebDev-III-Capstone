const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

const getRoomsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    let roomQuery = { hotel: hotelId };

    if (guests && Number(guests) > 0) {
      roomQuery.capacity = { $gte: Number(guests) };
    }

    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const conflictingBookings = await Booking.find({
        hotel: hotelId,
        status: 'confirmed',
        $and: [
          { checkInDate: { $lt: checkOutDate } },
          { checkOutDate: { $gt: checkInDate } }
        ]
      }).select('room');

      const bookedRoomIds = conflictingBookings.map((b) => b.room.toString());

      roomQuery._id = { $nin: bookedRoomIds };
      roomQuery.isAvailable = true;
    }

    const rooms = await Room.find(roomQuery);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    const existingHotel = await Hotel.findById(hotel);
    if (!existingHotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (existingHotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const room = new Room({
      hotel,
      roomNumber,
      roomType,
      pricePerNight,
      capacity: capacity || 2,
      amenities: amenities || ['Free Wi-Fi', 'Air Conditioning', 'Television'],
      description: description || 'Clean and comfortable room with modern amenities.',
      image: image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
      isAvailable: true
    });

    const createdRoom = await room.save();
    res.status(201).json(createdRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
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

const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Booking.deleteMany({ room: room._id });
    await room.deleteOne();

    res.json({ message: 'Room deleted successfully' });
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
