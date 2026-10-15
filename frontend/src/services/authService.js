/**
 * Auth Service — connects to the Express /api/auth endpoints.
 * Manages JWT tokens via the centralized apiClient.
 */

import api, { setToken, clearToken, getToken } from './apiClient.js';

/**
 * Sign in with institutional email and password.
 * POST /api/auth/login
 */
export async function signIn(identifier, password) {
  if (!identifier || !password) {
    throw new Error('Please provide your institutional email and password.');
  }

  const result = await api.post('/auth/login', {
    email: identifier.trim(),
    password,
  });

  // Store the JWT token
  if (result.token) {
    setToken(result.token);
  }

  return {
    data: result.user,
    message: result.message || 'Sign in successful.',
  };
}

/**
 * Sign out — clear stored token
 */
export async function signOut() {
  clearToken();
  return { message: 'Signed out.' };
}

/**
 * Get current authenticated user profile.
 * GET /api/auth/me
 */
export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const result = await api.get('/auth/me');
    return result.user || null;
  } catch {
    // Token expired or invalid
    clearToken();
    return null;
  }
}

/**
 * Register a new student account.
 * POST /api/auth/register
 */
export async function registerStudent(formData) {
  if (!formData.fullName || !formData.email || !formData.password) {
    throw new Error('All required fields must be filled.');
  }

  const result = await api.post('/auth/register', {
    fullName: formData.fullName.trim(),
    email: formData.email.trim(),
    password: formData.password,
    rollNumber: formData.rollNumber?.trim() || '',
    department: formData.department || '',
    academicYear: formData.academicYear || '',
    phone: formData.phone || '',
  });

  return {
    data: result.user,
    message: result.message || 'Registration submitted.',
  };
}

/**
 * Check if a user is currently authenticated (has a token).
 */
export function isAuthenticated() {
  return !!getToken();
}
