 
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

module.exports = { createAllowance, getAllowances };