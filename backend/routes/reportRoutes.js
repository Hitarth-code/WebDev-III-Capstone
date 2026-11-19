// Report Routes
const express = require('express');
const router = express.Router();
const { getReportsDashboard } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Dashboard reports using MongoDB aggregation pipeline
// Accessible only to Hotel Managers and Admin
router.get('/dashboard', protect, authorize('hotel_manager', 'admin'), getReportsDashboard);

module.exports = router;
