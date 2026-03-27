 
const express = require('express');
const { createDeduction, getDeductions } = require('../controllers/deductionController');
const protect = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createDeduction);
router.get('/', protect, getDeductions);

module.exports = router;