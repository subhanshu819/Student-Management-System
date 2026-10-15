import mongoose from 'mongoose';
import { Student } from '../models/Student.js';
import { AppError } from '../utils/AppError.js';

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * @desc    Get all students with filtering, search, sorting and pagination
 * @route   GET /api/students
 * @access  Public
 */
export async function getStudents(req, res, next) {
  try {
    if (!isDbConnected()) {
      return next(new AppError('Database is currently offline. Please ensure MongoDB Atlas is connected.', 503));
    }
    const { search, department, year, academicYear, status, page = 1, limit = 50, sort = '-createdAt' } = req.query;

    const query = {};

    // Filter by department
    if (department) {
      query.department = department.toLowerCase();
    }

    // Filter by academic year
    const yearFilter = year || academicYear;
    if (yearFilter) {
      query.academicYear = String(yearFilter);
    }

    // Filter by enrollment status
    if (status) {
      query.status = status;
    }

    // Text / Regex Search across name, roll number, email
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { rollNumber: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(query).sort(sort).skip(skip).limit(limitNum).lean({ virtuals: true }),
      Student.countDocuments(query),
    ]);

    // Format virtual id for lean results
    const formattedStudents = students.map(s => ({
      ...s,
      id: s._id ? s._id.toString() : s.id,
      _id: undefined,
      __v: undefined,
    }));

    res.status(200).json({
      success: true,
      count: formattedStudents.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: formattedStudents,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 * @access  Public
 */
export async function getStudentById(req, res, next) {
  try {
    if (req.targetStudent) {
      return res.status(200).json({
        success: true,
        data: req.targetStudent,
      });
    }

    if (!isDbConnected()) {
      return next(new AppError('Database is currently offline. Please ensure MongoDB Atlas is connected.', 503));
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return next(new AppError(`Student not found with id: "${req.params.id}"`, 404));
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Create new student record
 * @route   POST /api/students
 * @access  Public
 */
export async function createStudent(req, res, next) {
  try {
    if (!isDbConnected()) {
      return next(new AppError('Database is currently offline. Please ensure MongoDB Atlas is connected.', 503));
    }
    const newStudent = await Student.create(req.body);

    res.status(201).json({
      success: true,
      message: `Student ${newStudent.fullName} registered successfully.`,
      data: newStudent,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update existing student record
 * @route   PUT /api/students/:id
 * @access  Public
 */
export async function updateStudent(req, res, next) {
  try {
    if (!isDbConnected()) {
      return next(new AppError('Database is currently offline. Please ensure MongoDB Atlas is connected.', 503));
    }
    // If rollNumber cannot be altered by design, prevent modification here:
    const updates = { ...req.body };
    delete updates.id;
    delete updates._id;

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedStudent) {
      return next(new AppError(`Student not found with id: "${req.params.id}"`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete student record permanently
 * @route   DELETE /api/students/:id
 * @access  Public
 */
export async function deleteStudent(req, res, next) {
  try {
    if (!isDbConnected()) {
      return next(new AppError('Database is currently offline. Please ensure MongoDB Atlas is connected.', 503));
    }
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return next(new AppError(`Student not found with id: "${req.params.id}"`, 404));
    }

    res.status(200).json({
      success: true,
      message: `Student record (${student.rollNumber}) deleted permanently.`,
      data: { id: student._id.toString(), rollNumber: student.rollNumber },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get aggregate statistics for student dashboard
 * @route   GET /api/students/stats/summary
 * @access  Public
 */
export async function getStudentStats(req, res, next) {
  try {
    if (!isDbConnected()) {
      return next(new AppError('Database is currently offline. Please ensure MongoDB Atlas is connected.', 503));
    }
    const [total, active, onLeave, suspended, deptBreakdown, averages] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: 'active' }),
      Student.countDocuments({ status: 'on_leave' }),
      Student.countDocuments({ status: 'suspended' }),
      Student.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 }, deptLabel: { $first: '$departmentLabel' } } },
        { $sort: { count: -1 } },
      ]),
      Student.aggregate([
        {
          $group: {
            _id: null,
            avgCgpa: { $avg: '$cgpa' },
            avgAttendance: { $avg: '$attendance' },
          },
        },
      ]),
    ]);

    const stats = {
      totalStudents: total,
      activeStudents: active,
      onLeaveStudents: onLeave,
      suspendedStudents: suspended,
      averageCgpa: averages[0] ? Number(averages[0].avgCgpa.toFixed(2)) : 0,
      averageAttendance: averages[0] ? Number(averages[0].avgAttendance.toFixed(1)) : 0,
      departments: deptBreakdown.map(d => ({
        code: d._id,
        label: d.deptLabel || d._id,
        count: d.count,
      })),
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
