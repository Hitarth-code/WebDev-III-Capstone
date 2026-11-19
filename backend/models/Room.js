const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe', 'Suite', 'Family Suite']
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 2
  },
  amenities: {
    type: [String],
    default: ['Free Wi-Fi', 'Air Conditioning', 'Television']
  },
  description: {
    type: String,
    default: 'Clean and comfortable room with modern amenities.'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
