 
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeCode: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  phone: { type: String, required: true },
  basicSalary: { type: Number, required: true, min: 0 }
});

module.exports = mongoose.model('Employee', employeeSchema);
