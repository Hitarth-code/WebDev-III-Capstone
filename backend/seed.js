const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stayeasy';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    await Booking.deleteMany();
    await Room.deleteMany();
    await Hotel.deleteMany();
    await User.deleteMany();

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@stayeasy.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 9876543210'
    });

    const manager = await User.create({
      name: 'Rahul Sharma',
      email: 'manager@stayeasy.com',
      password: 'password123',
      role: 'hotel_manager',
      phone: '+91 9812345678'
    });

    const guest = await User.create({
      name: 'Priya Patel',
      email: 'guest@stayeasy.com',
      password: 'password123',
      role: 'guest',
      phone: '+91 9123456780'
    });

    const hotel1 = await Hotel.create({
      name: 'Grand Ocean Resort',
      description: 'Beachfront resort offering sea views, spa facilities and multi-cuisine restaurant.',
      address: '12 Marine Drive, Colaba',
      city: 'Mumbai',
      rating: 4.8,
      phone: '+91 22 2288 1234',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      manager: manager._id
    });

    const hotel2 = await Hotel.create({
      name: 'Heritage Palace Hotel',
      description: 'Historic architecture with gardens and traditional hospitality.',
      address: '45 Connaught Place, Central Avenue',
      city: 'Delhi',
      rating: 4.6,
      phone: '+91 11 4151 5678',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      manager: manager._id
    });

    const hotel3 = await Hotel.create({
      name: 'Silicon Valley Suites',
      description: 'Modern hotel with high-speed internet and city views, ideal for tech trips.',
      address: '88 MG Road, Indiranagar',
      city: 'Bengaluru',
      rating: 4.5,
      phone: '+91 80 2558 9900',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      manager: admin._id
    });

    const rooms = await Room.insertMany([
      {
        hotel: hotel1._id,
        roomNumber: '101',
        roomType: 'Standard',
        pricePerNight: 2500,
        capacity: 2,
        amenities: ['Free Wi-Fi', 'Air Conditioning', 'Television'],
        description: 'Standard comfortable room with queen bed.',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        isAvailable: true
      },
      {
        hotel: hotel1._id,
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
        hotel: hotel1._id,
        roomNumber: '301',
        roomType: 'Suite',
        pricePerNight: 8000,
        capacity: 4,
        amenities: ['Free Wi-Fi', 'Living Area', 'Jacuzzi', 'Breakfast'],
        description: 'Large luxury suite with panoramic ocean view.',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        isAvailable: true
      },
      {
        hotel: hotel2._id,
        roomNumber: '102',
        roomType: 'Standard',
        pricePerNight: 2200,
        capacity: 2,
        amenities: ['Free Wi-Fi', 'Air Conditioning', 'Work Desk'],
        description: 'Cosy room with traditional decor.',
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
        isAvailable: true
      },
      {
        hotel: hotel2._id,
        roomNumber: '202',
        roomType: 'Deluxe',
        pricePerNight: 4000,
        capacity: 3,
        amenities: ['Free Wi-Fi', 'Air Conditioning', 'Garden View'],
        description: 'Spacious deluxe room facing palace gardens.',
        image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
        isAvailable: true
      },
      {
        hotel: hotel2._id,
        roomNumber: '302',
        roomType: 'Family Suite',
        pricePerNight: 6500,
        capacity: 5,
        amenities: ['Free Wi-Fi', 'Two Queen Beds', 'Dining Table'],
        description: 'Spacious suite designed for families.',
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
        isAvailable: true
      },
      {
        hotel: hotel3._id,
        roomNumber: '103',
        roomType: 'Standard',
        pricePerNight: 2800,
        capacity: 2,
        amenities: ['High Speed Wi-Fi', 'Desk', 'Air Conditioning'],
        description: 'Smart tech room for business travelers.',
        image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
        isAvailable: true
      },
      {
        hotel: hotel3._id,
        roomNumber: '203',
        roomType: 'Deluxe',
        pricePerNight: 5200,
        capacity: 3,
        amenities: ['High Speed Wi-Fi', 'City Skyline View', 'Coffee Maker'],
        description: 'Deluxe room with city view.',
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
        isAvailable: true
      }
    ]);

    const today = new Date();
    const checkInSample = new Date(today);
    checkInSample.setDate(today.getDate() + 5);
    const checkOutSample = new Date(today);
    checkOutSample.setDate(today.getDate() + 8);

    await Booking.create([
      {
        user: guest._id,
        hotel: hotel1._id,
        room: rooms[0]._id,
        checkInDate: checkInSample,
        checkOutDate: checkOutSample,
        totalDays: 3,
        totalPrice: 7500,
        guestCount: 2,
        status: 'confirmed'
      },
      {
        user: guest._id,
        hotel: hotel2._id,
        room: rooms[3]._id,
        checkInDate: new Date('2026-10-01'),
        checkOutDate: new Date('2026-10-04'),
        totalDays: 3,
        totalPrice: 6600,
        guestCount: 2,
        status: 'confirmed'
      },
      {
        user: guest._id,
        hotel: hotel3._id,
        room: rooms[6]._id,
        checkInDate: new Date('2026-09-15'),
        checkOutDate: new Date('2026-09-17'),
        totalDays: 2,
        totalPrice: 5600,
        guestCount: 1,
        status: 'cancelled'
      }
    ]);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
