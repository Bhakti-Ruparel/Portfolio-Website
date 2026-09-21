// server.js
// Entry point — configure Express, connect MongoDB, start server.

// ── 1. Load .env variables FIRST ─────────────────────────────────────────────
require('dotenv').config();

// ── 2. Imports ────────────────────────────────────────────────────────────────
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ── 3. Route modules ──────────────────────────────────────────────────────────
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

// ── 4. Create app ─────────────────────────────────────────────────────────────
const app = express();

// ── 5. Middleware — order matters ─────────────────────────────────────────────
app.use(cors());          // allow React (port 5173) to call this API
app.use(express.json());  // parse JSON request bodies into req.body

// ── 6. Routes ─────────────────────────────────────────────────────────────────
// Auth routes: /register  /login  /me
app.use('/api/auth', authRoutes);
app.use('/', authRoutes);

// Task CRUD routes — every route inside is JWT-protected via router.use(protect)
app.use('/tasks', taskRoutes);

// ── 7. Health check ───────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Task Manager API is running' });
});

// ── 8. 404 — no route matched ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── 9. Centralized error handler ──────────────────────────────────────────────
// Express identifies a 4-argument function as an error handler.
// Any route that calls next(err) lands here.
// This ensures no unhandled error ever leaks a stack trace to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

// ── 10. Connect to MongoDB, then start listening ──────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌  MongoDB connection failed:', error.message);
    process.exit(1);
  });
