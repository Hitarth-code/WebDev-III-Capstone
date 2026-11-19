const express = require('express');
const router = express.Router();
const {
  getHotels,
  getHotelById,
  getMyHotels,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.get('/manager/my-hotels', protect, authorize('hotel_manager', 'admin'), getMyHotels);
router.post('/', protect, authorize('hotel_manager', 'admin'), createHotel);
router.put('/:id', protect, authorize('hotel_manager', 'admin'), updateHotel);
router.delete('/:id', protect, authorize('hotel_manager', 'admin'), deleteHotel);

module.exports = router;
