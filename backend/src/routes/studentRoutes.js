import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
} from '../controllers/studentController.js';
import {
  validateObjectId,
  validateCreateStudent,
  validateUpdateStudent,
} from '../middleware/validateStudent.js';
import {
  authenticate,
  authorize,
  authorizeStudentRecordAccess,
} from '../middleware/authMiddleware.js';

const router = Router();

// Protect all student routes with JWT authentication
router.use(authenticate);

// Aggregate stats: Admin only
router.get('/stats/summary', authorize('admin'), getStudentStats);

// Directory collection: Admin only can view all students or register new records via portal
router.route('/')
  .get(authorize('admin'), getStudents)
  .post(authorize('admin'), validateCreateStudent, createStudent);

// Individual record access: Admin can manage all, Student may only access their own
router.route('/:id')
  .get(validateObjectId, authorizeStudentRecordAccess, getStudentById)
  .put(validateObjectId, authorizeStudentRecordAccess, validateUpdateStudent, updateStudent)
  .delete(validateObjectId, authorize('admin'), deleteStudent);

export default router;
