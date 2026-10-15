/**
 * Centralized API Client
 * ─────────────────────────────────────────────────────────
 * Single fetch wrapper that attaches the JWT token, handles
 * JSON serialization / deserialization, and normalizes error
 * responses so every consumer gets a consistent interface.
 *
 * Usage:
 *   import api from './apiClient';
 *   const { data } = await api.get('/students');
 *   const { data } = await api.post('/auth/login', { email, password });
 */

const API_BASE = '/api';

// ── Token helpers ───────────────────────────────────────

const TOKEN_KEY = 'apex_auth_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Error class ─────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// ── Core request fn ─────────────────────────────────────

async function request(method, path, body = null, options = {}) {
  const url = `${API_BASE}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...options,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(url, config);

  // Try to parse JSON regardless of status
  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    // Build a user-friendly message
    const msg =
      json?.message ||
      json?.error ||
      (json?.details && json.details.join('. ')) ||
      `Request failed (${res.status})`;
    const details = json?.details || [];

    // Auto-logout on 401
    if (res.status === 401) {
      clearToken();
    }

    throw new ApiError(msg, res.status, details);
  }

  return json;
}

// ── Convenience methods ─────────────────────────────────

const api = {
  get: (path, opts) => request('GET', path, null, opts),
  post: (path, body, opts) => request('POST', path, body, opts),
  put: (path, body, opts) => request('PUT', path, body, opts),
  delete: (path, opts) => request('DELETE', path, null, opts),
};

export default api;
