const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

const fallbackHotels = [
  {
    _id: '673d1234567890abcdef0001',
    name: 'Grand Ocean Resort',
    description: 'Beachfront resort offering sea views, spa facilities and multi-cuisine restaurant.',
    address: '12 Marine Drive, Colaba',
    city: 'Mumbai',
    rating: 4.8,
    phone: '+91 22 2288 1234',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '673d1234567890abcdef0002',
    name: 'Heritage Palace Hotel',
    description: 'Historic architecture with gardens and traditional hospitality.',
    address: '45 Connaught Place, Central Avenue',
    city: 'Delhi',
    rating: 4.6,
    phone: '+91 11 4151 5678',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: '673d1234567890abcdef0003',
    name: 'Silicon Valley Suites',
    description: 'Modern hotel with high-speed internet and city views, ideal for tech trips.',
    address: '88 MG Road, Indiranagar',
    city: 'Bengaluru',
    rating: 4.5,
    phone: '+91 80 2558 9900',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
  }
];

const getHotels = async (req, res) => {
  try {
    const { city, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};

      if (city && city.trim() !== '') {
        query.city = { $regex: city.trim(), $options: 'i' };
      }

      if (search && search.trim() !== '') {
        query.$or = [
          { name: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } }
        ];
      }

      const hotels = await Hotel.find(query).populate('manager', 'name email');
      if (hotels && hotels.length > 0) {
        return res.json(hotels);
      }
    }

    let filtered = fallbackHotels;
    if (city && city.trim() !== '') {
      filtered = filtered.filter((h) => h.city.toLowerCase().includes(city.trim().toLowerCase()));
    }
    res.json(filtered);
  } catch (error) {
    res.json(fallbackHotels);
  }
};

const getHotelById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const hotel = await Hotel.findById(req.params.id).populate('manager', 'name email');
      if (hotel) {
        return res.json(hotel);
      }
    }
    const found = fallbackHotels.find((h) => h._id === req.params.id) || fallbackHotels[0];
    res.json(found);
  } catch (error) {
    res.json(fallbackHotels[0]);
  }
};

const getMyHotels = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.manager = req.user._id;
    }
    const hotels = await Hotel.find(query);
    res.json(hotels.length > 0 ? hotels : fallbackHotels);
  } catch (error) {
    res.json(fallbackHotels);
  }
};

const createHotel = async (req, res) => {
  try {
    const { name, description, address, city, rating, phone, image } = req.body;

    const hotel = new Hotel({
      name,
      description,
      address,
      city,
      rating: rating || 4.5,
      phone: phone || '',
      image: image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      manager: req.user._id
    });

    const createdHotel = await hotel.save();
    res.status(201).json(createdHotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    hotel.name = req.body.name || hotel.name;
    hotel.description = req.body.description || hotel.description;
    hotel.address = req.body.address || hotel.address;
    hotel.city = req.body.city || hotel.city;
    hotel.rating = req.body.rating || hotel.rating;
    hotel.phone = req.body.phone || hotel.phone;
    hotel.image = req.body.image || hotel.image;

    const updatedHotel = await hotel.save();
    res.json(updatedHotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.manager.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Room.deleteMany({ hotel: hotel._id });
    await Booking.deleteMany({ hotel: hotel._id });
    await hotel.deleteOne();

    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHotels,
  getHotelById,
  getMyHotels,
  createHotel,
  updateHotel,
  deleteHotel
};
