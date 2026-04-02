 
const Deduction = require('../models/Deduction');
const { getNextGeneratedCode } = require('../utils/generatedIds');

const createDeduction = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      employee: req.body.employee || req.body.employeeId
    };

    const deductionCode = await getNextGeneratedCode(Deduction, 'deductionCode', 'DED_');
    const deduction = await Deduction.create({
      ...payload,
      deductionCode
    });
    const populatedDeduction = await Deduction.findById(deduction._id).populate('employee', 'name position');
    res.status(201).json(populatedDeduction);
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
    const payload = {
      ...req.body,
      employee: req.body.employee || req.body.employeeId
    };

    const { deductionCode, ...updateData } = payload;
    const updated = await Deduction.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Deduction not found' });
    const populatedDeduction = await Deduction.findById(updated._id).populate('employee', 'name position');
    res.json(populatedDeduction);
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
