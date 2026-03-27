const Payroll = require('../models/Payroll');
const Allowance = require('../models/Allowance');
const Deduction = require('../models/Deduction');
const Employee = require('../models/Employee');

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
    const payroll = await Payroll.create({
      employee,
      basicSalary,
      totalSalary,
      paymentDate: date,
      payMonth
    });

    res.status(201).json({
      message: 'Payroll added successfully',
      payroll
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

    // If employee is being updated, check it exists
    if (employee) {
      const empExists = await Employee.findById(employee);
      if (!empExists) return res.status(404).json({ message: 'Employee not found' });
    }

    // Recalculate totalSalary if basicSalary or employee changed
    let totalSalary = req.body.totalSalary; // default to whatever is sent
    if (basicSalary || employee) {
      const targetEmployee = employee || (await Payroll.findById(req.params.id)).employee;
      const allowances = await Allowance.find({ employee: targetEmployee });
      const deductions = await Deduction.find({ employee: targetEmployee });
      const totalAllowance = allowances.reduce((sum, a) => sum + a.amount, 0);
      const totalDeduction = deductions.reduce((sum, d) => sum + d.amount, 0);
      totalSalary = (basicSalary || (await Payroll.findById(req.params.id)).basicSalary) + totalAllowance - totalDeduction;
    }

    // Update payMonth if paymentDate changed
    let payMonth;
    if (paymentDate) {
      const date = new Date(paymentDate);
      payMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { ...req.body, totalSalary, ...(payMonth && { payMonth }) },
      { new: true, runValidators: true }
    );

    if (!updatedPayroll) return res.status(404).json({ message: 'Payroll not found' });

    res.json({
      message: 'Payroll updated successfully',
      payroll: updatedPayroll
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