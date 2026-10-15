import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost,http://localhost:80,http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_key_apex_university_2026_super_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  isProduction: process.env.NODE_ENV === 'production',
};

// Check if MONGODB_URI is configured properly
export function checkDbConfig() {
  if (!env.MONGODB_URI || env.MONGODB_URI.includes('<username>')) {
    return {
      configured: false,
      message: 'MONGODB_URI is not yet configured or contains placeholders. Please update backend/.env with your MongoDB Atlas connection string.',
    };
  }
  return { configured: true };
}
