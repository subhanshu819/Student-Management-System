import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Generate a signed JSON Web Token for an authenticated user
 * @param {object} user - User document
 * @returns {string} Signed JWT
 */
export function generateToken(user) {
  const payload = {
    id: user._id ? user._id.toString() : user.id,
    email: user.email,
    role: user.role,
    rollNumber: user.rollNumber || null,
    studentProfile: user.studentProfile ? user.studentProfile.toString() : null,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verify a JSON Web Token
 * @param {string} token
 * @returns {object} Decoded token payload
 */
export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
