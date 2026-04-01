 
const express = require('express');
const { createDeduction, getDeductions, getDeductionById, updateDeduction, deleteDeduction } = require('../controllers/deductionController');
const protect = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createDeduction);
router.get('/', protect, getDeductions);
router.get('/:id', protect, getDeductionById);
router.put('/:id', protect, updateDeduction);
router.delete('/:id', protect, deleteDeduction);

module.exports = router;