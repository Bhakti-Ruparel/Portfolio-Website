// config/env.js
// Reads environment variables ONCE, applies defaults, and exposes a frozen
// config object. Everything else imports `config` instead of touching
// process.env directly, so all settings are documented in one place.

require('dotenv').config();

function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function toList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV || 'development';

const config = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: toInt(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  // Extra allowed origins (comma separated), e.g. your Vercel domain(s).
  corsOrigins: toList(process.env.CORS_ORIGINS),
  // Set to 1 when running behind a reverse proxy (nginx, Render, Railway)
  // so req.ip is the real client IP for rate limiting.
  trustProxy: toInt(process.env.TRUST_PROXY, 0),
  cacheTtlSeconds: toInt(process.env.CACHE_TTL_SECONDS, 60),
  hf: Object.freeze({
    token: process.env.HF_TOKEN || '',
    model: process.env.HF_MODEL || 'meta-llama/Llama-3.1-8B-Instruct',
    baseUrl: (process.env.HF_BASE_URL || 'https://router.huggingface.co/v1').replace(/\/$/, ''),
    timeoutMs: toInt(process.env.HF_TIMEOUT_MS, 20000),
  }),
});

/**
 * Throws if a required setting is missing. Called by server.js before
 * connecting, so a misconfigured deployment fails fast with a clear message
 * instead of failing on the first login request.
 */
function assertRequiredConfig() {
  const missing = [];
  if (!config.mongoUri) missing.push('MONGO_URI');
  if (!config.jwtSecret) missing.push('JWT_SECRET');
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
  if (config.isProduction && config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
}

module.exports = { config, assertRequiredConfig };
