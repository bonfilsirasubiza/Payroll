const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
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