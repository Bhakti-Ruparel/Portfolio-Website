// middleware/validateTask.js
// Validates the request body before it reaches the task route handler.
// Applied to POST /tasks and PUT /tasks/:id.
// Keeps validation logic out of the route handler (separation of concerns).

function validateTask(req, res, next) {
  const { title } = req.body;

  // title must exist and must not be only whitespace
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  next(); // validation passed — continue to the route handler
}

module.exports = validateTask;
