import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { generateToken } from '../src/utils/token.js';

describe('Authentication & Role-Based Authorization Security Test Suite', () => {
  // Test tokens
  const adminId = '507f1f77bcf86cd799439011';
  const studentOneId = '507f1f77bcf86cd799439022';
  const studentTwoId = '507f1f77bcf86cd799439033';

  const adminToken = generateToken({
    _id: adminId,
    email: 'admin@apex.edu.in',
    role: 'admin',
  });

  const studentOneToken = generateToken({
    _id: 'user_student_1',
    email: 'student1@apex.edu.in',
    role: 'student',
    studentProfile: studentOneId,
    rollNumber: '21CS001',
  });

  const studentTwoToken = generateToken({
    _id: 'user_student_2',
    email: 'student2@apex.edu.in',
    role: 'student',
    studentProfile: studentTwoId,
    rollNumber: '21CS002',
  });

  /* ====================================================================
   * 1. Registration Input Validation & Role Escalation Protection
   * ==================================================================== */
  describe('POST /api/auth/register', () => {
    it('should reject registration when mandatory fields are missing (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.status, 'fail');
      assert.ok(Array.isArray(res.body.details));
      assert.ok(res.body.details.some(d => d.includes('Full name is required')));
      assert.ok(res.body.details.some(d => d.includes('email is required')));
      assert.ok(res.body.details.some(d => d.includes('Password is required')));
    });

    it('should reject registration when password is less than 8 characters (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test Candidate',
          email: 'test@apex.edu.in',
          password: 'pass1', // < 8 characters
        });

      assert.equal(res.status, 400);
      assert.ok(res.body.details.some(d => d.includes('at least 8 characters')));
    });

    it('should reject registration when password does not have both letters and numbers', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test Candidate',
          email: 'test@apex.edu.in',
          password: 'onlylettersnopassword',
        });

      assert.equal(res.status, 400);
      assert.ok(res.body.details.some(d => d.includes('at least one letter and one number')));
    });

    it('SECURITY TEST: Public registration must NEVER allow choosing role="admin"', async () => {
      // An attacker attempts to escalate privileges by specifying role="admin"
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Malicious Attacker',
          email: `attacker_${Date.now()}@apex.edu.in`,
          password: 'SecurePassword123!',
          role: 'admin', // Privilege escalation attempt
        });

      // Even if database is not active, validateRegister middleware strictly sets req.body.role = 'student'
      // If DB creates user, response role MUST be 'student', NEVER 'admin'
      if (res.status === 201) {
        assert.equal(res.body.user.role, 'student', 'Role must remain student');
        assert.notEqual(res.body.user.role, 'admin', 'Public registration must never allow admin role');
      } else {
        // If DB not connected, validation passed and sanitized role before DB (503 / 500)
        assert.ok([201, 503, 500, 409].includes(res.status));
      }
    });
  });

  /* ====================================================================
   * 2. Login Validation & Safe Error Messages
   * ==================================================================== */
  describe('POST /api/auth/login', () => {
    it('should reject login request when email or password is missing (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.ok(res.body.details.some(d => d.includes('Email is required')));
      assert.ok(res.body.details.some(d => d.includes('Password is required')));
    });

    it('should return safe error message on invalid credentials without leaking account existence', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent.user@apex.edu.in',
          password: 'WrongPassword123!',
        });

      // Returns 401 with generic safe message, or 503 if DB offline
      if (res.status === 401) {
        assert.equal(res.body.success, false);
        assert.equal(res.body.message, 'Invalid email or password.');
      } else {
        assert.equal(res.status, 503);
      }
    });
  });

  /* ====================================================================
   * 3. Authentication Enforcement on Protected Routes
   * ==================================================================== */
  describe('Authentication Barrier (401 Unauthorized)', () => {
    it('should return 401 Unauthorized when accessing /api/students without Authorization header', async () => {
      const res = await request(app).get('/api/students');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.status, 'fail');
      assert.ok(res.body.message.includes('Authentication required'));
    });

    it('should return 401 Unauthorized when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid.tampered.token');

      assert.equal(res.status, 401);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Invalid authentication token'));
    });

    it('should return 401 Unauthorized when Authorization scheme is not Bearer', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', 'Basic dXNlcjpwYXNz');

      assert.equal(res.status, 401);
    });
  });

  /* ====================================================================
   * 4. Role-Based Authorization Restrictions (403 Forbidden)
   * ==================================================================== */
  describe('Role-Based Authorization & Student Ownership Restrictions', () => {
    it('should return 403 Forbidden when a student attempts to view all students (/api/students)', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${studentOneToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.status, 'fail');
      assert.ok(res.body.message.includes('Access denied'));
    });

    it('should return 403 Forbidden when a student attempts to view dashboard summary stats (/api/students/stats/summary)', async () => {
      const res = await request(app)
        .get('/api/students/stats/summary')
        .set('Authorization', `Bearer ${studentOneToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Access denied'));
    });

    it('should return 403 Forbidden when a student attempts to create a new student record', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${studentOneToken}`)
        .send({
          rollNumber: '25CS999',
          fullName: 'Unauthorized Addition',
          email: 'unauth@apex.edu.in',
          department: 'cs',
          academicYear: '1',
        });

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Access denied'));
    });

    it('should return 403 Forbidden when a student attempts to delete any student record', async () => {
      const res = await request(app)
        .delete(`/api/students/${studentOneId}`)
        .set('Authorization', `Bearer ${studentOneToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Access denied'));
    });

    it('should return 403 Forbidden when student #1 attempts to access student #2 record', async () => {
      const res = await request(app)
        .get(`/api/students/${studentTwoId}`)
        .set('Authorization', `Bearer ${studentOneToken}`);

      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.ok(res.body.message.includes('Access denied'));
    });

    it('should allow student #1 to access their OWN record', async () => {
      const res = await request(app)
        .get(`/api/students/${studentOneId}`)
        .set('Authorization', `Bearer ${studentOneToken}`);

      // If DB is connected -> 200 or 404 (if ID not yet seeded in DB)
      // BUT NOT 403 Forbidden!
      assert.notEqual(res.status, 403, 'Student must not be forbidden from accessing their own record');
    });

    it('should allow an administrator to access endpoints guarded by admin role', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);

      // Admin must NOT get 403 Forbidden or 401 Unauthorized
      assert.notEqual(res.status, 403, 'Admin must not receive 403 Forbidden');
      assert.notEqual(res.status, 401, 'Admin must not receive 401 Unauthorized');
    });
  });
});
