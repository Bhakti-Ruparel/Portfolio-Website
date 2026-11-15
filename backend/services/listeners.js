// services/listeners.js
// Subscribes the background jobs to the event bus. Called once at startup
// (server.js). Every handler here runs AFTER the HTTP response was sent.
//
// Note: cache invalidation is NOT done here on purpose. It happens
// synchronously in the controller, because a client may re-fetch the list
// immediately after a write and must never receive stale cached data.

const { eventBus, EVENTS } = require('./eventBus');
const ActivityLog = require('../models/ActivityLog');
const { sendPasswordResetEmail, notifyNewContactMessage } = require('./notificationService');

let registered = false;

async function logActivity(userId, event, message, meta = {}) {
  await ActivityLog.create({ user: userId || null, event, message, meta });
}

function registerListeners() {
  if (registered) return; // idempotent (tests may call it twice)
  registered = true;

  eventBus.subscribe(EVENTS.USER_REGISTERED, ({ userId, email }) =>
    logActivity(userId, EVENTS.USER_REGISTERED, `Account created for ${email}`)
  );

  eventBus.subscribe(EVENTS.USER_LOGGED_IN, ({ userId }) =>
    logActivity(userId, EVENTS.USER_LOGGED_IN, 'Logged in')
  );

  // Slow work (sending an e-mail) moved out of the request: the user gets
  // the "check your inbox" response instantly.
  eventBus.subscribe(EVENTS.PASSWORD_RESET_REQUESTED, async ({ userId, email, resetUrl }) => {
    await sendPasswordResetEmail(email, resetUrl);
    await logActivity(userId, EVENTS.PASSWORD_RESET_REQUESTED, 'Password reset requested');
  });

  eventBus.subscribe(EVENTS.TASK_CREATED, ({ userId, task }) =>
    logActivity(userId, EVENTS.TASK_CREATED, `Created ${task.category} "${task.title}"`, {
      taskId: task._id,
    })
  );

  eventBus.subscribe(EVENTS.TASK_UPDATED, ({ userId, task, changes }) => {
    const message =
      changes.length === 1 && changes[0] === 'completed'
        ? `${task.completed ? 'Completed' : 'Re-opened'} "${task.title}"`
        : `Updated "${task.title}" (${changes.join(', ')})`;
    return logActivity(userId, EVENTS.TASK_UPDATED, message, { taskId: task._id, changes });
  });

  eventBus.subscribe(EVENTS.TASK_DELETED, ({ userId, task }) =>
    logActivity(userId, EVENTS.TASK_DELETED, `Deleted "${task.title}"`, { taskId: task._id })
  );

  eventBus.subscribe(EVENTS.TASKS_CLEARED, ({ userId, category, count }) =>
    logActivity(userId, EVENTS.TASKS_CLEARED, `Cleared ${count} completed ${category} item(s)`)
  );

  eventBus.subscribe(EVENTS.CONTACT_RECEIVED, ({ messageId, name, email, subject }) =>
    notifyNewContactMessage({ messageId, name, email, subject })
  );
}

module.exports = { registerListeners };
