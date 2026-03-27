const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');

// 1️⃣ All employees + payrolls
const getAllEmployeesWithPayrolls = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });

    const result = await Promise.all(
      employees.map(async (emp) => {
        const payrolls = await Payroll.find({ employee: emp._id }).sort({ paymentDate: -1 });
        return { employee: emp, payrolls };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2️⃣ Employee by ID + payrolls
const getEmployeeByIdWithPayrolls = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const payrolls = await Payroll.find({ employee: emp._id }).sort({ paymentDate: -1 });

    res.json({ employee: emp, payrolls });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3️⃣ Employees + payrolls by specific month (POST body)
const getPayrollsByMonth = async (req, res) => {
  const { payMonth } = req.body; // send { "payMonth": "YYYY-MM" }
  if (!payMonth) return res.status(400).json({ message: 'payMonth is required in format YYYY-MM' });

  try {
    // Find payrolls for the given month
    const payrolls = await Payroll.find({ payMonth })
      .populate('employee', 'name position phone') // get employee details
      .sort({ paymentDate: -1 });

    res.json({
      payMonth,
      payrolls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Optional: get employees with payrolls in the month
// ==============================
const getEmployeesByMonth = async (req, res) => {
  const { payMonth } = req.body;
  if (!payMonth) return res.status(400).json({ message: 'payMonth is required in format YYYY-MM' });

  try {
    const payrolls = await Payroll.find({ payMonth })
      .populate('employee', 'name position phone')
      .sort({ paymentDate: -1 });

    // Extract unique employees
    const uniqueEmployees = [];
    const ids = new Set();
    payrolls.forEach(p => {
      if (!ids.has(p.employee._id.toString())) {
        ids.add(p.employee._id.toString());
        uniqueEmployees.push(p.employee);
      }
    });

    res.json({
      payMonth,
      employees: uniqueEmployees,
      payrolls
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEmployeesWithPayrolls,
  getEmployeeByIdWithPayrolls,
  getEmployeesByMonth,
  getPayrollsByMonth
};