// models/Task.js
// Defines the shape of a Task document in MongoDB using Mongoose.
//
// One collection serves both frontend pages:
//   category: 'todo' → the quick To-Do list   (/todo)
//   category: 'task' → the Task Manager       (/tasks)
// Every task belongs to the user who created it (field `user`).

const mongoose = require('mongoose');

const CATEGORIES = ['todo', 'task'];

// A Schema is a blueprint — it tells Mongoose what fields each document must/can have.
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,                             // removes leading/trailing whitespace
      maxlength: [200, 'Title must be 200 characters or fewer'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description must be 1000 characters or fewer'],
    },
    completed: {
      type: Boolean,
      default: false, // every new task starts as incomplete
    },
    dueDate: {
      type: Date,
      default: null,
    },
    category: {
      type: String,
      enum: { values: CATEGORIES, message: 'Category must be "todo" or "task"' },
      default: 'task',
    },
    // Owner — a reference to the User document. This is what makes
    // "every user sees only their own tasks" (authorization) possible.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task owner is required'],
    },
  },
  {
    // createdAt + updatedAt managed by Mongoose.
    timestamps: true,
  }
);

// ── Indexes (Practical 9: query optimisation) ────────────────────────────────
// The main list query is:
//   Task.find({ user, category }).sort({ createdAt: -1 })
// A compound index on exactly (user, category, createdAt) lets MongoDB find
// the user's tasks AND return them already sorted, without a collection scan
// or an in-memory sort. Verify with:  Task.find({...}).sort({...}).explain()
taskSchema.index({ user: 1, category: 1, createdAt: -1 });

// Used by "clear completed" and the stats aggregation (filters on completed).
taskSchema.index({ user: 1, category: 1, completed: 1 });

// mongoose.model() compiles the schema into a Model class.
// 'Task' → MongoDB will store documents in a collection called 'tasks' (auto-pluralised).
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
module.exports.CATEGORIES = CATEGORIES;
