 
const express = require('express');
const { createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const protect = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createEmployee);
router.get('/', protect, getEmployees);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, updateEmployee);
router.delete('/:id', protect, deleteEmployee);

module.exports = router;