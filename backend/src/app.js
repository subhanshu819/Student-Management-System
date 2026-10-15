import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Request logger
if (env.isProduction) {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV === 'production') {
        // In production, allow the deployed frontend origin (or any) by reflecting the request origin
        return callback(null, true);
      }
      // Existing whitelist logic for development
      if (!origin) return callback(null, true);
      const configuredOrigins = env.CORS_ORIGIN
        ? env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
        : [];
      const defaultAllowed = ['http://localhost', 'http://localhost:80', 'http://localhost:5173', 'http://127.0.0.1:5173'];
      const allowedOrigins = [...new Set([...configuredOrigins, ...defaultAllowed])];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Apex University Student Management System API',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      students: 'GET /api/students',
      studentStats: 'GET /api/students/stats/summary',
    },
  });
});

// Mount API routes
app.use('/api', apiRouter);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
