// server.js
// Entry point of the application.
// Responsibilities: configure Express, connect to MongoDB, start the HTTP server.

// ── 1. Load environment variables from .env FIRST ────────────────────────────
// This must be the very first line so that all other require()s can read
// process.env.MONGO_URI, process.env.PORT, etc.
require('dotenv').config();

// ── 2. Import packages ────────────────────────────────────────────────────────
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ── 3. Import our task router ─────────────────────────────────────────────────
const taskRoutes = require('./routes/taskRoutes');

// ── 4. Create the Express application ────────────────────────────────────────
const app = express();

// ── 5. Middleware ─────────────────────────────────────────────────────────────
// Middleware runs on EVERY request before it reaches a route handler.

// cors() allows the React frontend (running on a different port, e.g. 5173)
// to call this API without getting a "blocked by CORS policy" browser error.
app.use(cors());

// express.json() parses incoming requests with JSON bodies.
// Without this, req.body would be undefined for POST/PUT requests.
app.use(express.json());

// ── 6. Routes ─────────────────────────────────────────────────────────────────
// Mount the task router at /tasks.
// All routes defined in taskRoutes.js become:
//   GET    /tasks
//   GET    /tasks/:id
//   POST   /tasks
//   PUT    /tasks/:id
//   DELETE /tasks/:id
app.use('/tasks', taskRoutes);

// ── 7. Root route — quick health check ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Task Manager API is running' });
});

// ── 8. 404 handler — catches any route that was not matched above ─────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── 9. Connect to MongoDB, then start the server ──────────────────────────────
// We connect to the database FIRST. Only after a successful connection do we
// start listening for HTTP requests — this way no request can arrive before
// the database is ready.

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
    // Exit the process — there is no point running the server without a DB
    process.exit(1);
  });
