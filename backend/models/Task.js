// models/Task.js
// Defines the shape of a Task document in MongoDB using Mongoose.

const mongoose = require('mongoose');

// A Schema is a blueprint — it tells Mongoose what fields each document must/can have.
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'], // 400 is returned automatically when missing
    trim: true,                             // removes leading/trailing whitespace
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false, // every new task starts as incomplete
  },
  createdAt: {
    type: Date,
    default: Date.now, // automatically set to the current timestamp on creation
  },
});

// mongoose.model() compiles the schema into a Model class.
// 'Task' → MongoDB will store documents in a collection called 'tasks' (auto-pluralised).
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
