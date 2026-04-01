const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const { getReport, getReportWithAdvancedFilters } = require('../controllers/reportController');

router.use(protect);

// Single unified endpoint for all reports
router.post('/report', getReport);

// Optional: Advanced filtering endpoint
router.post('/report/advanced', getReportWithAdvancedFilters);

module.exports = router;