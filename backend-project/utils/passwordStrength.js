const PASSWORD_STRENGTH_MESSAGE = 'Password must be at least 6 characters and include a letter, a number, and a symbol.';

const STRONG_PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{6,}$/;

const isStrongPassword = (password) => STRONG_PASSWORD_PATTERN.test(password);

module.exports = {
  PASSWORD_STRENGTH_MESSAGE,
  isStrongPassword
};
