// controllers/activityController.js
// Read side of the event-driven activity log (written by services/listeners.js).

const ActivityLog = require('../models/ActivityLog');

// GET /api/activity?limit=20  (protected) — the current user's recent activity.
async function listActivity(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const items = await ActivityLog.find({ user: req.user.id })
      .select('event message createdAt')
      .sort({ createdAt: -1 }) // uses the (user, createdAt) index
      .limit(limit)
      .lean();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

module.exports = { listActivity };
