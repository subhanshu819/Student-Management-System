import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

async function startServer() {
  // Connect to MongoDB Atlas (returns false if credentials not yet configured or connection fails)
  await connectDB();

  server = app.listen(env.PORT, () => {
    console.log(`-----------------------------------------------------`);
    console.log(` Apex University Student Management API Server`);
    console.log(` Port:         http://localhost:${env.PORT}`);
    console.log(` Health Check: http://localhost:${env.PORT}/api/health`);
    console.log(` Environment:  ${env.NODE_ENV}`);
    console.log(`-----------------------------------------------------`);
  });
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n[Process] Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', err => {
  console.error('[Process] Uncaught Exception:', err);
  process.exit(1);
});

startServer();
