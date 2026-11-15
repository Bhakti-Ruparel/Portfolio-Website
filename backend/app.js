// app.js
// Builds and configures the Express application (middleware pipeline + routes).
// It does NOT connect to MongoDB or listen on a port — server.js does that.
// Keeping them separate lets the tests import the app without a database.

const express = require('express');
const cors = require('cors');
const { config } = require('./config/env');
const { dbState } = require('./config/db');
const { cache } = require('./services/cache');
const { eventBus } = require('./services/eventBus');
const { isEnabled: aiEnabled } = require('./services/aiService');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aiRoutes = require('./routes/aiRoutes');
const activityRoutes = require('./routes/activityRoutes');

function buildAllowedOrigins() {
  const origins = new Set([config.frontendUrl, ...config.corsOrigins]);
  if (!config.isProduction) {
    // Vite dev server, Vite preview and the Docker frontend.
    ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:8080'].forEach((o) => origins.add(o));
  }
  return origins;
}

function createApp() {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);

  // ── Middleware pipeline — order matters ────────────────────────────────────
  // 1. Basic security headers (small subset of what helmet sets).
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // 2. CORS — only the configured frontend origins may call the API from a
  //    browser. Requests without an Origin header (curl, Postman, server-to-
  //    server, same-origin via nginx) are allowed.
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      exposedHeaders: ['X-Cache', 'RateLimit-Remaining', 'Retry-After'],
    })
  );

  // 3. JSON body parser with a size limit (rejects huge payloads with 413).
  app.use(express.json({ limit: '20kb' }));

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.get('/api/health', (req, res) => {
    const db = dbState();
    res.status(db === 'connected' ? 200 : 503).json({
      status: db === 'connected' ? 'ok' : 'degraded',
      db,
      uptimeSeconds: Math.round(process.uptime()),
      cache: cache.stats(),
      events: eventBus.stats,
      ai: { enabled: aiEnabled() },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/activity', activityRoutes);

  // Legacy paths kept for compatibility with the Practical 4/5 Postman guide
  // (backend/README.md): /tasks, /register, /login, /me ...
  app.use('/tasks', taskRoutes);
  app.use('/', authRoutes);

  app.get('/', (req, res) => {
    res.json({ success: true, message: 'Portfolio API is running', health: '/api/health' });
  });

  // ── 404 + centralized error handler (must be last) ────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
