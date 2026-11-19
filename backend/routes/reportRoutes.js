const express = require('express');
const router = express.Router();
const { getReportsDashboard } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('hotel_manager', 'admin'), getReportsDashboard);

module.exports = router;
