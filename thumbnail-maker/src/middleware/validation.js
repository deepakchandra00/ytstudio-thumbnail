const { AppError } = require('../utils/errorHandler');

const validateRegistration = (req, res, next) => {
  const { email, password, name } = req.body;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  // Password validation
  if (!password || password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }

  // Name validation
  if (!name || name.trim().length < 2) {
    return next(new AppError('Please provide a valid name (minimum 2 characters)', 400));
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin
}; 