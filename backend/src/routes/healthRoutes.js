import { Router } from 'express';
import { getDbStatus } from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    System health check and database connectivity status
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getDbStatus();

  res.status(200).json({
    status: 'ok',
    service: 'student-management-api',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbStatus,
  });
});

export default router;
