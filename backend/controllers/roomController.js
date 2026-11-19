const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');

const fallbackRooms = [
  {
    _id: '673d2234567890abcdef0001',
    hotel: '673d1234567890abcdef0001',
    roomNumber: '101',
    roomType: 'Standard',
    pricePerNight: 2500,
    capacity: 2,
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Television'],
    description: 'Standard comfortable room with king bed.',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    _id: '673d2234567890abcdef0002',
    hotel: '673d1234567890abcdef0001',
    roomNumber: '201',
    roomType: 'Deluxe',
    pricePerNight: 4500,
    capacity: 3,
    amenities: ['Free Wi-Fi', 'Air Conditioning', 'Sea View Balcony'],
    description: 'Deluxe sea view room with private balcony.',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  },
  {
    _id: '673d2234567890abcdef0003',
    hotel: '673d1234567890abcdef0001',
    roomNumber: '301',
    roomType: 'Suite',
    pricePerNight: 8000,
    capacity: 4,
    amenities: ['Free Wi-Fi', 'Living Area', 'Jacuzzi', 'Breakfast'],
    description: 'Large luxury suite with panoramic ocean view.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    isAvailable: true
  }
];

const getRoomsByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    if (mongoose.connection.readyState === 1) {
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
      if (rooms && rooms.length > 0) {
        return res.json(rooms);
      }
    }

    res.json(fallbackRooms);
  } catch (error) {
    res.json(fallbackRooms);
  }
};

const getRoomById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const room = await Room.findById(req.params.id).populate('hotel', 'name city address');
      if (room) {
        return res.json(room);
      }
    }
    const found = fallbackRooms.find((r) => r._id === req.params.id) || fallbackRooms[0];
    res.json(found);
  } catch (error) {
    res.json(fallbackRooms[0]);
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
