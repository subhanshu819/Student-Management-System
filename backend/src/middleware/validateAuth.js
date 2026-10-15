import { AppError } from '../utils/AppError.js';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate registration request body.
 * Enforces strong password rules and guarantees role cannot be overridden to admin.
 */
export function validateRegister(req, res, next) {
  const { fullName, email, password, confirmPassword } = req.body;
  const errors = [];

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters long.');
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Institutional email is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid institutional email address.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.push('Password must contain at least one letter and one number.');
    }
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push('Password and confirm password do not match.');
  }

  // SECURITY ENFORCEMENT: Public registration MUST NEVER allow users to choose the admin role
  if (req.body.role && req.body.role !== 'student') {
    // Override silently or reject with informative safety notice
    req.body.role = 'student';
  } else {
    req.body.role = 'student';
  }

  if (errors.length > 0) {
    return next(new AppError('Registration validation failed', 400, errors));
  }

  next();
}

/**
 * Validate login request body.
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return next(new AppError('Login validation failed', 400, errors));
  }

  next();
}
