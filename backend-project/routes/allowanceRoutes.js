 
const express = require('express');
const { createAllowance, getAllowances } = require('../controllers/allowanceController');
const protect = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createAllowance);
router.get('/', protect, getAllowances);

module.exports = router;