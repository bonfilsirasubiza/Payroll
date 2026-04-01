 
const Allowance = require('../models/Allowance');

const createAllowance = async (req, res) => {
  try {
    const allowance = await Allowance.create(req.body);
    res.status(201).json(allowance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllowances = async (req, res) => {
  try {
    const allowances = await Allowance.find().populate('employee', 'name position');
    res.json(allowances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllowanceById = async (req, res) => {
  try {
    const allowance = await Allowance.findById(req.params.id).populate('employee', 'name position');
    if (!allowance) return res.status(404).json({ message: 'Allowance not found' });
    res.json(allowance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAllowance = async (req, res) => {
  try {
    const updated = await Allowance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Allowance not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAllowance = async (req, res) => {
  try {
    const deleted = await Allowance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Allowance not found' });
    res.json({ message: 'Allowance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAllowance, getAllowances, getAllowanceById, updateAllowance, deleteAllowance };