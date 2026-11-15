// models/ActivityLog.js
// Written ASYNCHRONOUSLY by event listeners (services/listeners.js), never by
// the request handlers themselves. See Practical 10 in PRACTICALS_IMPLEMENTATION.md.

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    event: { type: String, required: true },     // e.g. 'task.created'
    message: { type: String, default: '' },      // human-readable summary
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// "Recent activity for this user" query.
activityLogSchema.index({ user: 1, createdAt: -1 });

// TTL index: MongoDB deletes log entries automatically 30 days after creation,
// so the log can never grow without bound.
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
