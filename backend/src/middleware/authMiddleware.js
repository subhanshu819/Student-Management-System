import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { verifyToken } from '../utils/token.js';
import { AppError } from '../utils/AppError.js';

/**
 * Authentication middleware: verifies JWT and attaches user to request
 */
export async function authenticate(req, res, next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in with a valid token.', 401));
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Authentication token has expired. Please log in again.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }

    // Check if database is connected to fetch fresh user
    if (mongoose.connection.readyState === 1) {
      const currentUser = await User.findById(decoded.id).select('+password');
      if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }
      if (!currentUser.isActive) {
        return next(new AppError('This user account has been deactivated.', 401));
      }
      req.user = currentUser;
    } else {
      // In disconnected or mock mode, use decoded token payload
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        rollNumber: decoded.rollNumber,
        studentProfile: decoded.studentProfile,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based authorization middleware: restricts access to specific roles
 * @param  {...string} roles - e.g. 'admin', 'student'
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('Access denied. You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
}

/**
 * Student record authorization middleware:
 * Admins can access and manage all student records.
 * Students can only access and view/edit their own student record.
 */
export async function authorizeStudentRecordAccess(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return next(new AppError('Authentication required.', 401));
    }

    // Admins have full access
    if (user.role === 'admin') {
      return next();
    }

    // For students, check their own record ownership
    const requestedStudentId = req.params.id;

    // Students cannot delete any records
    if (req.method === 'DELETE') {
      return next(new AppError('Access denied. Only administrators may delete student records.', 403));
    }

    // If database is connected, look up student record to verify ownership
    if (mongoose.connection.readyState === 1 && requestedStudentId) {
      const student = await Student.findById(requestedStudentId);
      if (!student) {
        return next(new AppError(`Student not found with id: "${requestedStudentId}"`, 404));
      }

      // Check ownership via studentProfile ID, userId, email, or rollNumber
      const isOwner =
        (user.studentProfile && user.studentProfile.toString() === student._id.toString()) ||
        (student.userId && student.userId.toString() === user._id.toString()) ||
        (student.email && student.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.rollNumber && student.rollNumber && user.rollNumber.toUpperCase() === student.rollNumber.toUpperCase());

      if (!isOwner) {
        return next(new AppError("Access denied. You may only access your own student record.", 403));
      }

      // If updating, student cannot modify restricted registrar fields
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const restrictedFields = ['rollNumber', 'cgpa', 'attendance', 'status', 'department', 'academicYear', 'facultyAdvisor'];
        for (const field of restrictedFields) {
          if (req.body[field] !== undefined) {
            delete req.body[field];
          }
        }
      }

      // Attach resolved student to request for downstream handlers
      req.targetStudent = student;
    } else {
      // In disconnected mode / test mode
      const userProfileId = user.studentProfile ? user.studentProfile.toString() : null;
      const isOwner = userProfileId === requestedStudentId || user.id === requestedStudentId;
      if (!isOwner) {
        return next(new AppError("Access denied. You may only access your own student record.", 403));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
