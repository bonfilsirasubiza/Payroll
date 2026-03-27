 
const express = require('express');
const { createEmployee, getEmployees } = require('../controllers/employeeController');
const protect = require('../middleware/auth');
const router = express.Router();

router.post('/', protect, createEmployee);
router.get('/', protect, getEmployees);

module.exports = router;