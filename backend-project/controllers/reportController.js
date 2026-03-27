const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');
const Allowance = require('../models/Allowance');
const Deduction = require("../models/Deduction");

// 1️⃣ All employees + payrolls
const getAllEmployeesWithPayrolls = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });

    const result = await Promise.all(
      employees.map(async (emp) => {
        const payrolls = await Payroll.find({ employee: emp._id }).sort({ paymentDate: -1 });

        // ✅ FIX: format payroll data
        const formattedPayrolls = await Promise.all(
          payrolls.map(async (p) => {
            const allowances = await Allowance.find({ employee: emp._id });
            const deductions = await Deduction.find({ employee: emp._id });

            const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
            const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

            return {
              employeeName: emp.name,
              basicSalary: p.basicSalary,
              paymentMonth: p.payMonth,
              totalSalary: p.totalSalary,
              totalAllowances,
              totalDeductions
            };
          })
        );

        return formattedPayrolls;
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

    const result = await Promise.all(
      payrolls.map(async (p) => {
        const allowances = await Allowance.find({ employee: emp._id });
        const deductions = await Deduction.find({ employee: emp._id });

        const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
        const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

        return {
          employeeName: emp.name,
          basicSalary: p.basicSalary,
          paymentMonth: p.payMonth,
          totalSalary: p.totalSalary,
          totalAllowances,
          totalDeductions
        };
      })
    );

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3️⃣ Full Payroll Report (already correct)
const getFullPayrollReport = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('employee', 'name')
      .sort({ paymentDate: -1 });

    const report = await Promise.all(
      payrolls.map(async (p) => {
        const allowances = await Allowance.find({ employee: p.employee._id });
        const deductions = await Deduction.find({ employee: p.employee._id });

        const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
        const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

        return {
          employeeName: p.employee.name,
          basicSalary: p.basicSalary,
          paymentMonth: p.payMonth,
          totalSalary: p.totalSalary,
          totalAllowances,
          totalDeductions
        };
      })
    );

    res.json(report);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4️⃣ Employees by month
const getEmployeesByMonth = async (req, res) => {
  const { payMonth } = req.body;

  if (!payMonth) {
    return res.status(400).json({ message: 'payMonth is required' });
  }

  try {
    const payrolls = await Payroll.find({ payMonth })
      .populate('employee', 'name')
      .sort({ paymentDate: -1 });

    const result = await Promise.all(
      payrolls.map(async (p) => {
        const allowances = await Allowance.find({ employee: p.employee._id });
        const deductions = await Deduction.find({ employee: p.employee._id });

        const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
        const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

        return {
          employeeName: p.employee.name,
          basicSalary: p.basicSalary,
          paymentMonth: p.payMonth,
          totalSalary: p.totalSalary,
          totalAllowances,
          totalDeductions
        };
      })
    );

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEmployeesWithPayrolls,
  getEmployeeByIdWithPayrolls,
  getEmployeesByMonth,
  getFullPayrollReport
};