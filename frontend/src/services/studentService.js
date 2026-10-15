/**
 * Student Service — API layer for student operations.
 * Connects to Express /api/students endpoints via the centralized apiClient.
 */

import api from './apiClient.js';

/**
 * Get all students with optional filters.
 * GET /api/students?search=&department=&year=&status=&page=&limit=
 * @param {{ search?: string, department?: string, year?: string, status?: string, page?: number, limit?: number }} filters
 */
export async function getStudents(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.department) params.set('department', filters.department);
  if (filters.year) params.set('year', filters.year);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const qs = params.toString();
  const result = await api.get(`/students${qs ? `?${qs}` : ''}`);

  return {
    data: result.data || [],
    total: result.total || 0,
    page: result.page || 1,
    totalPages: result.totalPages || 1,
  };
}

/**
 * Get a single student by ID.
 * GET /api/students/:id
 * @param {string} id
 */
export async function getStudent(id) {
  const result = await api.get(`/students/${id}`);
  return { data: result.data };
}

/**
 * Create a new student record.
 * POST /api/students
 * @param {object} studentData
 */
export async function createStudent(studentData) {
  const result = await api.post('/students', studentData);
  return {
    data: result.data,
    message: result.message || 'Student record created successfully.',
  };
}

/**
 * Update an existing student record.
 * PUT /api/students/:id
 * @param {string} id
 * @param {object} updates
 */
export async function updateStudent(id, updates) {
  const result = await api.put(`/students/${id}`, updates);
  return {
    data: result.data,
    message: result.message || 'Student record updated successfully.',
  };
}

/**
 * Delete a student record permanently.
 * DELETE /api/students/:id
 * @param {string} id
 */
export async function deleteStudent(id) {
  const result = await api.delete(`/students/${id}`);
  return {
    data: result.data,
    message: result.message || 'Student record permanently deleted.',
  };
}

/**
 * Get dashboard aggregate statistics.
 * GET /api/students/stats/summary
 */
export async function getStudentStats() {
  const result = await api.get('/students/stats/summary');
  return { data: result.data };
}

/**
 * Export roster as CSV (client-side generation from API data).
 */
export async function exportRoster(filters = {}) {
  const { data } = await getStudents({ ...filters, limit: 1000 });
  const headers = ['Roll Number', 'Full Name', 'Email', 'Department', 'Year', 'CGPA', 'Attendance', 'Status'];
  const rows = data.map(s => [
    s.rollNumber, s.fullName, s.email, s.departmentLabel || s.department,
    `Year ${s.academicYear}`, s.cgpa, `${s.attendance}%`, s.status,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'apex_student_roster.csv';
  a.click();
  URL.revokeObjectURL(url);
  return { message: 'Roster exported.' };
}
