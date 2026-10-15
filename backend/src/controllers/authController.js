import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { generateToken } from '../utils/token.js';
import { AppError } from '../utils/AppError.js';

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * @desc    Register a new student account (Public registration)
 * @route   POST /api/auth/register
 * @access  Public
 */
export async function register(req, res, next) {
  try {
    if (!isDbConnected()) {
      return next(new AppError('Database connection is currently unavailable.', 503));
    }
    const { fullName, email, password, rollNumber, department, academicYear, phone } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return next(new AppError('An account with this email address already exists.', 409));
    }

    // Check if student profile exists to link
    let studentProfileId = null;
    if (rollNumber) {
      const existingStudent = await Student.findOne({ rollNumber: rollNumber.trim().toUpperCase() });
      if (existingStudent) {
        studentProfileId = existingStudent._id;
      }
    }

    // Role is strictly forced to 'student'
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: password,
      role: 'student', // Strict enforcement: never admin
      rollNumber: rollNumber ? rollNumber.trim().toUpperCase() : undefined,
      department: department ? department.trim().toLowerCase() : '',
      academicYear: academicYear ? String(academicYear) : '',
      phone: phone ? phone.trim() : '',
      studentProfile: studentProfileId,
    });

    // If student record was found, update its userId reference
    if (studentProfileId) {
      await Student.findByIdAndUpdate(studentProfileId, { userId: newUser._id });
    }

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: {
        id: newUser._id.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        rollNumber: newUser.rollNumber || null,
        studentProfile: studentProfileId ? studentProfileId.toString() : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Login user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    if (!isDbConnected()) {
      return next(new AppError('Database connection is currently unavailable.', 503));
    }
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user with password included
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    // Safe error message: do not leak whether email or password was wrong
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Account has been deactivated. Please contact the administrator.', 401));
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber || null,
        studentProfile: user.studentProfile ? user.studentProfile.toString() : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Authenticated)
 */
export async function getMe(req, res, next) {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id ? user._id.toString() : user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        rollNumber: user.rollNumber || null,
        studentProfile: user.studentProfile ? user.studentProfile.toString() : null,
      },
    });
  } catch (error) {
    next(error);
  }
}
