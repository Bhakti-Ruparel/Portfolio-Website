// routes/taskRoutes.js
// All CRUD routes for the Task resource.
// Every route is protected by the JWT auth middleware.
// POST and PUT also run the validateTask middleware before the handler.

const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const protect = require('../middleware/auth');
const validateTask = require('../middleware/validateTask');

const router = express.Router();

// Apply protect to every route in this router.
// Any request without a valid Bearer token will be rejected before
// reaching any handler below.
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Check whether a string is a valid MongoDB ObjectId.
// ─────────────────────────────────────────────────────────────────────────────
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /tasks  — return all tasks, newest first
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /tasks/:id  — return one task by MongoDB ObjectId
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /tasks  — create a new task
// validateTask runs first: rejects the request if title is missing/empty.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', validateTask, async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;
    const task = new Task({ title, description, completed });
    const savedTask = await task.save();
    res.status(201).json({ success: true, data: savedTask });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /tasks/:id  — update an existing task
// validateTask runs first on updates too (can't clear the title).
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', validateTask, async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /tasks/:id  — remove a task permanently
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
