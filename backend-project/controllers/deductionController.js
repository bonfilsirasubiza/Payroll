 
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
    const formattedDeductions = deductions.map(deduction => {
      if (!deduction.employee) {
        return {
          ...deduction.toObject(),
          employee: { name: 'Unknown Employee', position: 'N/A' }
        };
      }
      return deduction;
    });
    res.json(formattedDeductions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeductionById = async (req, res) => {
  try {
    const deduction = await Deduction.findById(req.params.id).populate('employee', 'name position');
    if (!deduction) return res.status(404).json({ message: 'Deduction not found' });
    res.json(deduction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDeduction = async (req, res) => {
  try {
    const updated = await Deduction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Deduction not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDeduction = async (req, res) => {
  try {
    const deleted = await Deduction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Deduction not found' });
    res.json({ message: 'Deduction deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDeduction, getDeductions, getDeductionById, updateDeduction, deleteDeduction };