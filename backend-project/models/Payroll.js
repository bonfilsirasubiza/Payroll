const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  payrollCode: { type: String, unique: true, sparse: true },
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  employeeName: {
    type: String,
    trim: true
  },
  basicSalary: { 
    type: Number, 
    required: true 
  },
  totalSalary: { 
    type: Number, 
    required: true 
  },
  paymentDate: { 
    type: Date, 
    default: Date.now 
  },
  payMonth: {  // new field for storing month and year
    type: String,  // format: "YYYY-MM"
    required: true
  }
});

module.exports = mongoose.model('Payroll', payrollSchema);
