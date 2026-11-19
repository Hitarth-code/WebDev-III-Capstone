// Hotel Model
// Represents hotels managed by hotel managers or admin
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter hotel name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter hotel description']
  },
  address: {
    type: String,
    required: [true, 'Please enter hotel address']
  },
  city: {
    type: String,
    required: [true, 'Please enter city name'],
    trim: true
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  phone: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
