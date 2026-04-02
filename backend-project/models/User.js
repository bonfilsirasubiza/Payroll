 
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isStrongPassword, PASSWORD_STRENGTH_MESSAGE } = require('../utils/passwordStrength');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    validate: {
      validator: isStrongPassword,
      message: PASSWORD_STRENGTH_MESSAGE
    }
  },
  role: { type: String, enum: ['admin'], default: 'admin' }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return ;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  // next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
