import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

const VALID_STATUSES = ['active', 'on_leave', 'suspended', 'graduated', 'probation'];
const VALID_GENDERS = ['Male', 'Female', 'Other'];
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates request parameter :id is a valid MongoDB ObjectId
 */
export function validateObjectId(req, res, next) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError(`Invalid student ID format: "${id}". Must be a 24-character hexadecimal string.`, 400));
  }
  next();
}

/**
 * Validates request payload when creating a new student record
 */
export function validateCreateStudent(req, res, next) {
  // Normalize fields before validation
  const {
    rollNumber,
    fullName,
    email: rawEmail,
    department: rawDept,
    academicYear,
    cgpa,
    attendance,
    status,
    gender,
  } = req.body;
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : rawEmail;
  const department = typeof rawDept === 'string' ? rawDept.trim().toLowerCase() : rawDept;
  const errors = [];

  // Required fields
  if (!rollNumber || typeof rollNumber !== 'string' || !rollNumber.trim()) {
    errors.push('Student roll / enrolment number (rollNumber) is required');
  }

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    errors.push('Full legal name (fullName) is required');
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Institutional email address (email) is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!department || typeof department !== 'string' || !department.trim()) {
    errors.push('Department code (department) is required');
  }

  if (!academicYear || (typeof academicYear !== 'string' && typeof academicYear !== 'number')) {
    errors.push('Academic year (academicYear) is required');
  }

  // Optional fields format checks
  if (cgpa !== undefined && cgpa !== null) {
    const numCgpa = Number(cgpa);
    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      errors.push('CGPA must be a number between 0.0 and 10.0');
    }
  }

  if (attendance !== undefined && attendance !== null) {
    const numAtt = Number(attendance);
    if (isNaN(numAtt) || numAtt < 0 || numAtt > 100) {
      errors.push('Attendance must be a number between 0 and 100');
    }
  }

  if (status && !VALID_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (gender && !VALID_GENDERS.includes(gender)) {
    errors.push(`Gender must be one of: ${VALID_GENDERS.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new AppError('Student validation failed', 400, errors));
  }

  next();
}

/**
 * Validates request payload when updating an existing student record
 */
export function validateUpdateStudent(req, res, next) {
  const { fullName, email, cgpa, attendance, status, gender } = req.body;
  const errors = [];

  if (fullName !== undefined && (!fullName || typeof fullName !== 'string' || !fullName.trim())) {
    errors.push('Full legal name cannot be empty');
  }

  if (email !== undefined) {
    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Email cannot be empty');
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push('Please provide a valid email address');
    }
  }

  if (cgpa !== undefined && cgpa !== null) {
    const numCgpa = Number(cgpa);
    if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
      errors.push('CGPA must be a number between 0.0 and 10.0');
    }
  }

  if (attendance !== undefined && attendance !== null) {
    const numAtt = Number(attendance);
    if (isNaN(numAtt) || numAtt < 0 || numAtt > 100) {
      errors.push('Attendance must be a number between 0 and 100');
    }
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
    errors.push(`Gender must be one of: ${VALID_GENDERS.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new AppError('Student update validation failed', 400, errors));
  }

  next();
}
