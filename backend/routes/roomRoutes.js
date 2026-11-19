// Room Routes
const express = require('express');
const router = express.Router();
const {
  getRoomsByHotel,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.get('/hotel/:hotelId', getRoomsByHotel);
router.get('/:id', getRoomById);

// Protected routes (Hotel Manager and Admin only)
router.post('/', protect, authorize('hotel_manager', 'admin'), createRoom);
router.put('/:id', protect, authorize('hotel_manager', 'admin'), updateRoom);
router.delete('/:id', protect, authorize('hotel_manager', 'admin'), deleteRoom);

module.exports = router;
