const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../backend/config/db');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('../backend/routes/authRoutes'));
app.use('/api/hotels', require('../backend/routes/hotelRoutes'));
app.use('/api/rooms', require('../backend/routes/roomRoutes'));
app.use('/api/bookings', require('../backend/routes/bookingRoutes'));
app.use('/api/reports', require('../backend/routes/reportRoutes'));

app.get('/api', (req, res) => {
  res.json({ message: 'Stay.in API is running' });
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

module.exports = app;
