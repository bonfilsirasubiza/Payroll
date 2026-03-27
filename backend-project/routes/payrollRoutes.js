 
const express = require('express');
const {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll
} = require('../controllers/payrollController');
const protect = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createPayroll);
router.get('/', protect, getPayrolls);
router.get('/:id', protect, getPayrollById);
router.put('/:id', protect, updatePayroll);
router.delete('/:id', protect, deletePayroll);

module.exports = router;