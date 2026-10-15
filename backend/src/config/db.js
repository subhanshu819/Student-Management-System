import mongoose from 'mongoose';
import { env, checkDbConfig } from './env.js';

let isConnected = false;

export async function connectDB() {
  const dbCheck = checkDbConfig();
  if (!dbCheck.configured) {
    console.warn(`[MongoDB Warning] ${dbCheck.message}`);
    return false;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: !env.isProduction, // Build indexes in development
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database name: ${conn.connection.name}`);

    mongoose.connection.on('error', err => {
      console.error('[MongoDB] Runtime connection error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from MongoDB Atlas.');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[MongoDB] Reconnected to MongoDB Atlas.');
      isConnected = true;
    });

    return true;
  } catch (error) {
    isConnected = false;
    console.error(`[MongoDB Connection Error] ${error.message}`);
    return false;
  }
}

export function getDbStatus() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };

  const state = mongoose.connection.readyState;
  return {
    state: stateMap[state] || 'unknown',
    connected: state === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[MongoDB] Connection closed.');
  }
}
