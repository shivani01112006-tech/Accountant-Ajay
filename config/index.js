/**
 * Centralized Configuration Module
 * Ajay Singla Accounting Portfolio & Management Platform
 */

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv,
  isProduction,
  isTest,

  db: {
    path: process.env.DB_PATH
      ? path.resolve(process.cwd(), process.env.DB_PATH)
      : path.resolve(__dirname, '../db/database.sqlite')
  },

  session: {
    secret: process.env.SESSION_SECRET || 'dev-insecure-secret-ajay-singla-session-2026-min-32-chars',
    maxAgeMs: 30 * 60 * 1000 // 30 minutes rolling expiration
  },

  security: {
    ipHashSalt: process.env.IP_HASH_SALT || 'dev-salt-ajay-singla-ip-hash-2026-secret'
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@ajaysingla.com',
    username: process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || 'admin@ajaysingla.com',
    password: process.env.ADMIN_PASSWORD || 'AdminSecure123!'
  }
};

if (isProduction && config.session.secret.startsWith('dev-insecure')) {
  console.warn('[SECURITY WARNING] Running in production with default insecure SESSION_SECRET!');
}

module.exports = Object.freeze(config);
