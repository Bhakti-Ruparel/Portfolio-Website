// services/eventBus.js
// Practical 10 — Event-driven architecture with Node's built-in EventEmitter.
//
// Controllers PUBLISH events ("a task was created") and return their HTTP
// response immediately. LISTENERS (services/listeners.js) react afterwards:
// writing the activity log, invalidating caches, sending notifications.
// The controller does not know or care who is listening — that is the
// decoupling the event-driven pattern gives us.

const { EventEmitter } = require('events');

const EVENTS = Object.freeze({
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.loggedIn',
  PASSWORD_RESET_REQUESTED: 'user.passwordResetRequested',
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_DELETED: 'task.deleted',
  TASKS_CLEARED: 'task.clearedCompleted',
  CONTACT_RECEIVED: 'contact.received',
});

class AppEventBus extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
    this.stats = { emitted: 0, handled: 0, failed: 0 };
  }

  /**
   * publish(event, payload)
   * Defers listener execution with setImmediate so the HTTP response is
   * never delayed by listener work (a plain emit() runs listeners
   * synchronously, inside the request).
   */
  publish(event, payload = {}) {
    this.stats.emitted += 1;
    setImmediate(() => this.emit(event, { ...payload, at: new Date() }));
  }

  /**
   * subscribe(event, handler)
   * Wraps an async handler so a failing listener is logged and counted
   * instead of crashing the process with an unhandled rejection.
   */
  subscribe(event, handler) {
    this.on(event, async (payload) => {
      try {
        await handler(payload);
        this.stats.handled += 1;
      } catch (err) {
        this.stats.failed += 1;
        console.error(`❌ Listener for "${event}" failed:`, err.message);
      }
    });
  }
}

const eventBus = new AppEventBus();

module.exports = { eventBus, EVENTS, AppEventBus };
