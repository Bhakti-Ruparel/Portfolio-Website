// controllers/taskController.js
// Business logic for the Task resource (used by both /todo and /tasks pages).
//
// Authorization: EVERY query includes { user: req.user.id }, so a user can
// only read or change their own tasks. Asking for someone else's task ID
// returns 404 (not 403), so the API does not even confirm that it exists.
//
// Caching (Practical 9): list + stats responses are cached per user for
// CACHE_TTL_SECONDS. Any write calls invalidateUserCache() BEFORE replying,
// so the next read is always fresh.
//
// Events (Practical 10): writes publish an event; listeners write the
// activity log in the background.

const mongoose = require('mongoose');
const Task = require('../models/Task');
const { cache, cacheKeys } = require('../services/cache');
const { eventBus, EVENTS } = require('../services/eventBus');

const LIST_FIELDS = 'title description completed dueDate category createdAt updatedAt';
const MAX_LIMIT = 100;

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function invalidateUserCache(userId) {
  cache.delPrefix(cacheKeys.userTasksPrefix(userId));
}

function parseListQuery(query) {
  const filter = {};
  if (query.category === 'todo' || query.category === 'task') filter.category = query.category;
  if (query.completed === 'true') filter.completed = true;
  if (query.completed === 'false') filter.completed = false;

  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || MAX_LIMIT, 1), MAX_LIMIT);
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  return { filter, limit, page };
}

// GET /api/tasks?category=todo|task&completed=true|false&page=1&limit=50
async function listTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const { filter, limit, page } = parseListQuery(req.query);
    const key = cacheKeys.taskList(userId, JSON.stringify({ filter, limit, page }));

    const [payload, hit] = await cache.wrap(key, undefined, async () => {
      const query = { user: userId, ...filter };
      // Run the page query and the total count in parallel.
      const [tasks, total] = await Promise.all([
        Task.find(query)
          .select(LIST_FIELDS)        // projection: only the fields the UI needs
          .sort({ createdAt: -1 })    // matches the (user, category, createdAt) index
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),                    // plain JS objects: faster, less memory
        Task.countDocuments(query),
      ]);
      return { data: tasks, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    });

    res.set('X-Cache', hit ? 'HIT' : 'MISS');
    res.status(200).json({ success: true, ...payload });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/stats — counts per category, cached.
async function getTaskStats(req, res, next) {
  try {
    const userId = req.user.id;
    const [stats, hit] = await cache.wrap(cacheKeys.taskStats(userId), undefined, async () => {
      const rows = await Task.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            completed: { $sum: { $cond: ['$completed', 1, 0] } },
          },
        },
      ]);
      const result = {
        todo: { total: 0, completed: 0, active: 0 },
        task: { total: 0, completed: 0, active: 0 },
      };
      for (const row of rows) {
        if (result[row._id]) {
          result[row._id] = { total: row.total, completed: row.completed, active: row.total - row.completed };
        }
      }
      return result;
    });

    res.set('X-Cache', hit ? 'HIT' : 'MISS');
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/:id
async function getTask(req, res, next) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id }).lean();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks
async function createTask(req, res, next) {
  try {
    const task = await Task.create({ ...req.taskData, user: req.user.id });
    invalidateUserCache(req.user.id);
    eventBus.publish(EVENTS.TASK_CREATED, { userId: req.user.id, task: task.toObject() });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// PUT/PATCH /api/tasks/:id — only the fields sent are changed.
async function updateTask(req, res, next) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.taskData },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });

    invalidateUserCache(req.user.id);
    eventBus.publish(EVENTS.TASK_UPDATED, {
      userId: req.user.id,
      task: task.toObject(),
      changes: Object.keys(req.taskData),
    });
    res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res, next) {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    invalidateUserCache(req.user.id);
    eventBus.publish(EVENTS.TASK_DELETED, { userId: req.user.id, task: task.toObject() });
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/tasks/completed?category=todo|task
// One deleteMany instead of N separate DELETE requests from the browser.
async function clearCompleted(req, res, next) {
  try {
    const { category } = req.query;
    if (category !== 'todo' && category !== 'task') {
      return res.status(400).json({ message: 'category query parameter must be "todo" or "task"' });
    }
    const result = await Task.deleteMany({ user: req.user.id, category, completed: true });

    invalidateUserCache(req.user.id);
    eventBus.publish(EVENTS.TASKS_CLEARED, { userId: req.user.id, category, count: result.deletedCount });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTasks,
  getTaskStats,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  clearCompleted,
};
