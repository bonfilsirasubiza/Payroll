export const PASSWORD_STRENGTH_MESSAGE = 'Password must be at least 6 characters and include a letter, a number, and a symbol.';

export const STRONG_PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{6,}$/;

export const isStrongPassword = (password) => STRONG_PASSWORD_PATTERN.test(password);
