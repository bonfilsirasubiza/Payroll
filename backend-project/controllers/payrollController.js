const Payroll = require('../models/Payroll');
const Allowance = require('../models/Allowance');
const Deduction = require('../models/Deduction');
const Employee = require('../models/Employee');
const { getNextGeneratedCode } = require('../utils/generatedIds');

const getEmployeeDisplayName = (employee, fallback = 'Unknown Employee') => (
  employee?.name ||
  employee?.fullName ||
  employee?.email ||
  employee?.employeeCode ||
  fallback
);

// ==============================
// Create Payroll
// ==============================
const createPayroll = async (req, res) => {
  const { employee, basicSalary, paymentDate } = req.body;

  try {
    // 1️⃣ Check employee exists
    const emp = await Employee.findById(employee);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    // 2️⃣ Fetch allowances & deductions for employee
    const allowances = await Allowance.find({ employee });
    const deductions = await Deduction.find({ employee });

    const totalAllowance = allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalDeduction = deductions.reduce((sum, d) => sum + d.amount, 0);

    const totalSalary = basicSalary + totalAllowance - totalDeduction;

    // 3️⃣ Calculate payMonth from paymentDate or today
    const date = new Date(paymentDate || Date.now());
    const payMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    // 4️⃣ Create payroll
    const payrollCode = await getNextGeneratedCode(Payroll, 'payrollCode', 'PAY_');
    const payroll = await Payroll.create({
      employee,
      employeeName: getEmployeeDisplayName(emp),
      basicSalary,
      totalSalary,
      paymentDate: date,
      payMonth,
      payrollCode
    });

    const populatedPayroll = await Payroll.findById(payroll._id).populate('employee', 'name position phone');

    res.status(201).json({
      message: 'Payroll added successfully',
      payroll: populatedPayroll
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Get All Payrolls
// ==============================
const getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find()
      .populate('employee', 'name position phone')
      .sort({ paymentDate: -1 });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Get Payroll By ID
// ==============================
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employee', 'name position phone');

    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updatePayroll = async (req, res) => {
  try {
    const { employee, basicSalary, paymentDate } = req.body;
    const existingPayroll = await Payroll.findById(req.params.id);
    if (!existingPayroll) return res.status(404).json({ message: 'Payroll not found' });

    let resolvedEmployeeId = existingPayroll.employee;
    let resolvedEmployeeName = existingPayroll.employeeName || '';

    // If employee is being updated, check it exists
    if (employee) {
      const empExists = await Employee.findById(employee);
      if (!empExists) return res.status(404).json({ message: 'Employee not found' });
      resolvedEmployeeId = employee;
      resolvedEmployeeName = getEmployeeDisplayName(empExists);
    } else if (!resolvedEmployeeName && resolvedEmployeeId) {
      const currentEmployee = await Employee.findById(resolvedEmployeeId);
      resolvedEmployeeName = getEmployeeDisplayName(currentEmployee, existingPayroll.employeeName || 'Unknown Employee');
    }

    // Recalculate totalSalary if basicSalary or employee changed
    let totalSalary = req.body.totalSalary; // default to whatever is sent
    if (basicSalary || employee) {
      const targetEmployee = resolvedEmployeeId;
      const allowances = await Allowance.find({ employee: targetEmployee });
      const deductions = await Deduction.find({ employee: targetEmployee });
      const totalAllowance = allowances.reduce((sum, a) => sum + a.amount, 0);
      const totalDeduction = deductions.reduce((sum, d) => sum + d.amount, 0);
      totalSalary = (basicSalary || existingPayroll.basicSalary) + totalAllowance - totalDeduction;
    }

    // Update payMonth if paymentDate changed
    let payMonth;
    if (paymentDate) {
      const date = new Date(paymentDate);
      payMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    const { payrollCode, ...updateData } = req.body;
    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        employee: resolvedEmployeeId,
        employeeName: resolvedEmployeeName,
        totalSalary,
        ...(payMonth && { payMonth })
      },
      { new: true, runValidators: true }
    );

    if (!updatedPayroll) return res.status(404).json({ message: 'Payroll not found' });

    const populatedPayroll = await Payroll.findById(updatedPayroll._id).populate('employee', 'name position phone');

    res.json({
      message: 'Payroll updated successfully',
      payroll: populatedPayroll
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Delete Payroll By ID
// ==============================
const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });

    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll
};
