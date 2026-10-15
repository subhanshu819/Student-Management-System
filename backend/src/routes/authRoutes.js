import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middleware/validateAuth.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
