const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth'); // JWT middleware if needed
const {
  getAllEmployeesWithPayrolls,
  getEmployeeByIdWithPayrolls,
  getEmployeesByMonth,
  getPayrollsByMonth
} = require('../controllers/reportController');

router.use(protect); // protect all routes

// All employees + payrolls
router.get('/employees', getAllEmployeesWithPayrolls);

// Employee by ID + payrolls
router.get('/employees/:id', getEmployeeByIdWithPayrolls);

// Employees + payrolls by month (body: { month: "YYYY-MM" })
router.post('/employees/by-month', getEmployeesByMonth);

// Payrolls by month (body: { month: "YYYY-MM" })
router.post('/payrolls/by-month', getPayrollsByMonth);

module.exports = router;