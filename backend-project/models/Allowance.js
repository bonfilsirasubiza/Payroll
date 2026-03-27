 
const mongoose = require('mongoose');

const allowanceSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true }
});

module.exports = mongoose.model('Allowance', allowanceSchema);