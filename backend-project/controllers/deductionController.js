 
const Deduction = require('../models/Deduction');

const createDeduction = async (req, res) => {
  try {
    const deduction = await Deduction.create(req.body);
    res.status(201).json(deduction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeductions = async (req, res) => {
  try {
    const deductions = await Deduction.find().populate('employee', 'name position');
    res.json(deductions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDeduction, getDeductions };