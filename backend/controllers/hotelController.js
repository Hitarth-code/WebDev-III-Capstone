const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const getHotels = async (req, res) => {
  try {
    const { city, search } = req.query;
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
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('manager', 'name email');
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyHotels = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.manager = req.user._id;
    }
    const hotels = await Hotel.find(query);
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
