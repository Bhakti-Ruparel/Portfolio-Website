// routes/taskRoutes.js
// All CRUD routes for the Task resource live here.
// server.js mounts this router at /tasks, so every path below is relative to that.

const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const router = express.Router(); // a mini Express app — just handles routes

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Check whether a string is a valid MongoDB ObjectId.
// MongoDB IDs look like: 6657f3c2a1b2c3d4e5f60001
// If an invalid ID reaches findById(), Mongoose throws a CastError → 500.
// We catch that before it happens and return a clean 400 instead.
// ─────────────────────────────────────────────────────────────────────────────
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /tasks
// Returns every task in the database, newest first.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // find({}) = no filter → return all documents
    // sort({ createdAt: -1 }) = newest first (-1 = descending)
    const tasks = await Task.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /tasks/:id
// Returns a single task that matches the given MongoDB ObjectId.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  // 1. Validate the id format before touching the DB
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID format',
    });
  }

  try {
    const task = await Task.findById(req.params.id);

    // findById returns null if no document is found — that is a 404
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /tasks
// Creates a new task from the JSON body sent by the client.
// Expected body: { "title": "...", "description": "...", "completed": false }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    // Manual check — title is required; give a clear message rather than a Mongoose stack trace
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    // new Task() creates an in-memory document; .save() writes it to MongoDB
    const task = new Task({ title, description, completed });
    const savedTask = await task.save();

    // 201 = "Created" — the standard HTTP status for a new resource
    res.status(201).json({
      success: true,
      data: savedTask,
    });
  } catch (error) {
    // Mongoose validation errors have a name of 'ValidationError'
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /tasks/:id
// Updates an existing task. Only the fields sent in the body are changed.
// Expected body (any subset of): { "title": "...", "description": "...", "completed": true }
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID format',
    });
  }

  try {
    // findByIdAndUpdate options:
    //   new: true   → return the updated document (not the old one)
    //   runValidators: true → run schema validations on the updated fields too
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /tasks/:id
// Removes the task with the given id from MongoDB permanently.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID format',
    });
  }

  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // 200 with a message is friendlier than 204 (no content) for a beginner API
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
});

module.exports = router;
