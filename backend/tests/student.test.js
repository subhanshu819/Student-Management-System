import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';
import { mockDb } from './helpers/mockDb.js';

describe('Student CRUD & Directory Operations Test Suite', () => {
  const adminId = '507f1f77bcf86cd799439011';
  const studentOneId = '507f1f77bcf86cd799439022';
  const studentTwoId = '507f1f77bcf86cd799439033';

  let adminToken;
  let studentOneToken;
  let studentTwoToken;
  let sampleStudent;

  before(async () => {
    mockDb.install();

    adminToken = generateToken({
      _id: adminId,
      email: 'admin@apex.edu.in',
      role: 'admin',
    });

    studentOneToken = generateToken({
      _id: 'user_student_1',
      email: 'student1@apex.edu.in',
      role: 'student',
      studentProfile: studentOneId,
      rollNumber: '24CS001',
    });

    studentTwoToken = generateToken({
      _id: 'user_student_2',
      email: 'student2@apex.edu.in',
      role: 'student',
      studentProfile: studentTwoId,
      rollNumber: '24CS002',
    });
  });

  after(() => {
    mockDb.uninstall();
  });

  beforeEach(() => {
    mockDb.reset();
  });

  /* ====================================================================
   * 1. CREATE Student (POST /api/students)
   * ==================================================================== */
  describe('POST /api/students — Create Student Record', () => {
    it('should allow admin to create a valid student record (201 Created)', async () => {
      const payload = {
        rollNumber: '24CS101',
        fullName: 'Devansh Pandey',
        email: 'devansh.pandey@apex.edu.in',
        department: 'cs',
        departmentLabel: 'Computer Science & Engineering',
        academicYear: '1',
        cgpa: 9.15,
        attendance: 96.5,
        status: 'active',
        gender: 'Male',
      };

      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.rollNumber, '24CS101');
      assert.equal(res.body.data.fullName, 'Devansh Pandey');
      assert.equal(res.body.data.avatarInitials, 'DP');
      assert.ok(res.body.data.id);
    });

    it('should reject creation when required fields are missing (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '',
          fullName: '',
          email: 'not-an-email',
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(Array.isArray(res.body.details));
      assert.ok(res.body.details.some(d => d.includes('rollNumber')));
      assert.ok(res.body.details.some(d => d.includes('fullName')));
      assert.ok(res.body.details.some(d => d.includes('email')));
    });

    it('should reject creation with invalid CGPA or Attendance bounds (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '24CS102',
          fullName: 'Ananya Roy',
          email: 'ananya.roy@apex.edu.in',
          department: 'cs',
          academicYear: '1',
          cgpa: 11.5, // Exceeds 10.0
          attendance: 150, // Exceeds 100%
        });

      assert.equal(res.status, 400);
      assert.ok(res.body.details.some(d => d.includes('CGPA must be a number between 0.0 and 10.0')));
      assert.ok(res.body.details.some(d => d.includes('Attendance must be a number between 0 and 100')));
    });

    it('should reject creation when requested by a student account (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${studentOneToken}`)
        .send({
          rollNumber: '24CS103',
          fullName: 'Hacker Student',
          email: 'hacker@apex.edu.in',
          department: 'cs',
          academicYear: '1',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
    });
  });

  /* ====================================================================
   * 2. READ Student Directory (GET /api/students)
   * ==================================================================== */
  describe('GET /api/students — Listing, Filtering, and Search', () => {
    beforeEach(async () => {
      // Seed 3 students in memory
      await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '24CS001',
          fullName: 'Aarav Sharma',
          email: 'aarav.sharma@apex.edu.in',
          department: 'cs',
          academicYear: '1',
          status: 'active',
          cgpa: 8.9,
          attendance: 92,
        });

      await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '24EC002',
          fullName: 'Bhavna Sen',
          email: 'bhavna.sen@apex.edu.in',
          department: 'ece',
          academicYear: '2',
          status: 'active',
          cgpa: 9.3,
          attendance: 95,
        });

      await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '23ME003',
          fullName: 'Chetan Bhagat',
          email: 'chetan.bhagat@apex.edu.in',
          department: 'mech',
          academicYear: '3',
          status: 'on_leave',
          cgpa: 7.4,
          attendance: 80,
        });
    });

    it('should allow admin to list all students with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.total, 3);
      assert.equal(res.body.data.length, 3);
      assert.equal(res.body.page, 1);
    });

    it('should filter students by department query', async () => {
      const res = await request(app)
        .get('/api/students?department=ece')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].rollNumber, '24EC002');
    });

    it('should filter students by academicYear and status', async () => {
      const res = await request(app)
        .get('/api/students?year=3&status=on_leave')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].fullName, 'Chetan Bhagat');
    });

    it('should search students by text matching name, rollNumber, or email', async () => {
      const res = await request(app)
        .get('/api/students?search=aarav')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.data.length, 1);
      assert.equal(res.body.data[0].fullName, 'Aarav Sharma');
    });
  });

  /* ====================================================================
   * 3. READ Single Student (GET /api/students/:id)
   * ==================================================================== */
  describe('GET /api/students/:id — Get Single Student Profile', () => {
    let createdId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '24CS001',
          fullName: 'Aarav Sharma',
          email: 'aarav.sharma@apex.edu.in',
          department: 'cs',
          academicYear: '1',
        });
      createdId = res.body.data.id;
    });

    it('should return 400 Bad Request for an invalid ObjectId format', async () => {
      const res = await request(app)
        .get('/api/students/invalid-format-id-123')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Invalid student ID format'));
    });

    it('should return 404 Not Found when student does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const res = await request(app)
        .get(`/api/students/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Student not found'));
    });

    it('should return student profile successfully for an admin', async () => {
      const res = await request(app)
        .get(`/api/students/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, createdId);
      assert.equal(res.body.data.fullName, 'Aarav Sharma');
    });
  });

  /* ====================================================================
   * 4. UPDATE Student (PUT /api/students/:id)
   * ==================================================================== */
  describe('PUT /api/students/:id — Update Student Record', () => {
    let createdId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '24CS001',
          fullName: 'Aarav Sharma',
          email: 'aarav.sharma@apex.edu.in',
          department: 'cs',
          academicYear: '1',
          cgpa: 8.5,
          attendance: 90,
        });
      createdId = res.body.data.id;
    });

    it('should update student details successfully for an admin', async () => {
      const res = await request(app)
        .put(`/api/students/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Aarav Sharma Updated',
          cgpa: 9.1,
          attendance: 94.5,
          status: 'active',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.fullName, 'Aarav Sharma Updated');
      assert.equal(res.body.data.cgpa, 9.1);
      assert.equal(res.body.data.attendance, 94.5);
    });

    it('should reject update with invalid data (400 Bad Request)', async () => {
      const res = await request(app)
        .put(`/api/students/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email-pattern',
          cgpa: -2.0,
        });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.details.some(d => d.includes('valid email')));
      assert.ok(res.body.details.some(d => d.includes('CGPA must be a number')));
    });

    it('should return 404 Not Found when updating a non-existent student', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const res = await request(app)
        .put(`/api/students/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fullName: 'Someone Else' });

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });

  /* ====================================================================
   * 5. DELETE Student (DELETE /api/students/:id)
   * ==================================================================== */
  describe('DELETE /api/students/:id — Delete Student Record', () => {
    let createdId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '24CS001',
          fullName: 'Aarav Sharma',
          email: 'aarav.sharma@apex.edu.in',
          department: 'cs',
          academicYear: '1',
        });
      createdId = res.body.data.id;
    });

    it('should delete existing student record permanently for an admin', async () => {
      const res = await request(app)
        .delete(`/api/students/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.message.includes('deleted permanently'));

      // Verify it's gone
      const getRes = await request(app)
        .get(`/api/students/${createdId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      assert.equal(getRes.status, 404);
    });

    it('should return 404 Not Found when deleting a non-existent student', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const res = await request(app)
        .delete(`/api/students/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
    });
  });

  /* ====================================================================
   * 6. AGGREGATE SUMMARY STATS (GET /api/students/stats/summary)
   * ==================================================================== */
  describe('GET /api/students/stats/summary — Dashboard Metrics', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rollNumber: '24CS001',
          fullName: 'Aarav Sharma',
          email: 'aarav.sharma@apex.edu.in',
          department: 'cs',
          academicYear: '1',
          cgpa: 8.0,
          attendance: 90,
          status: 'active',
        });
    });

    it('should compute aggregate metrics for admin dashboard', async () => {
      const res = await request(app)
        .get('/api/students/stats/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.totalStudents, 1);
      assert.equal(res.body.data.activeStudents, 1);
      assert.ok(Array.isArray(res.body.data.departments));
    });
  });
});
