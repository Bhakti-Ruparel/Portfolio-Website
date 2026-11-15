// middleware/validateTask.js
// Validates the request body before it reaches the task controller.
// Keeps validation logic out of the handler (separation of concerns).
//
//   validateTask          → POST   (create): title is required
//   validateTask.partial  → PUT/PATCH (update): every field optional, but
//                            any field that IS sent must be valid
//
// Only whitelisted fields are copied into req.taskData, so a client can never
// set `user`, `_id`, `createdAt`, … through the request body.

const { CATEGORIES } = require('../models/Task');

function buildValidator({ requireTitle }) {
  return function validate(req, res, next) {
    const body = req.body || {};
    const data = {};
    const errors = {};

    if (body.title !== undefined || requireTitle) {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      // title must exist and must not be only whitespace
      if (!title) errors.title = 'Title is required';
      else if (title.length > 200) errors.title = 'Title must be 200 characters or fewer';
      else data.title = title;
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string') errors.description = 'Description must be text';
      else if (body.description.length > 1000) errors.description = 'Description must be 1000 characters or fewer';
      else data.description = body.description.trim();
    }

    if (body.completed !== undefined) {
      if (typeof body.completed !== 'boolean') errors.completed = 'completed must be true or false';
      else data.completed = body.completed;
    }

    if (body.dueDate !== undefined) {
      if (body.dueDate === null || body.dueDate === '') {
        data.dueDate = null;
      } else {
        const date = new Date(body.dueDate);
        if (Number.isNaN(date.getTime())) errors.dueDate = 'dueDate must be a valid date';
        else data.dueDate = date;
      }
    }

    if (body.category !== undefined) {
      if (!CATEGORIES.includes(body.category)) errors.category = 'Category must be "todo" or "task"';
      else data.category = body.category;
    }

    if (Object.keys(errors).length) {
      // Keep the original single-message shape the frontend already shows.
      return res.status(400).json({ message: Object.values(errors)[0], errors });
    }

    if (!requireTitle && Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }

    req.taskData = data;
    next(); // validation passed — continue to the controller
  };
}

const validateTask = buildValidator({ requireTitle: true });
validateTask.partial = buildValidator({ requireTitle: false });

module.exports = validateTask;
