 
const express = require('express');
const { createAllowance, getAllowances, getAllowanceById, updateAllowance, deleteAllowance } = require('../controllers/allowanceController');
const protect = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createAllowance);
router.get('/', protect, getAllowances);
router.get('/:id', protect, getAllowanceById);
router.put('/:id', protect, updateAllowance);
router.delete('/:id', protect, deleteAllowance);

module.exports = router;