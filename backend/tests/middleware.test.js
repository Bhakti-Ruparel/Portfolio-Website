const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const validateTask = require('../middleware/validateTask');
const validateContact = require('../middleware/validateContact');
const rateLimit = require('../middleware/rateLimit');

// Minimal fake Express req/res for testing middleware in isolation.
function run(middleware, body, reqExtra = {}) {
  const req = { body, ip: '1.2.3.4', ...reqExtra };
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    setHeader(k, v) { this.headers[k] = v; },
  };
  let nextCalled = false;
  middleware(req, res, () => { nextCalled = true; });
  return { req, res, nextCalled };
}

describe('validateTask (create)', () => {
  test('rejects a missing or blank title with 400', () => {
    assert.equal(run(validateTask, {}).res.statusCode, 400);
    assert.equal(run(validateTask, { title: '   ' }).res.body.message, 'Title is required');
  });

  test('whitelists fields — user/_id from the body are ignored', () => {
    const { req, nextCalled } = run(validateTask, {
      title: '  Buy milk ',
      category: 'todo',
      user: 'someone-else',
      _id: 'abc',
    });
    assert.equal(nextCalled, true);
    assert.deepEqual(req.taskData, { title: 'Buy milk', category: 'todo' });
  });

  test('rejects invalid category, completed and dueDate', () => {
    assert.equal(run(validateTask, { title: 'x', category: 'other' }).res.statusCode, 400);
    assert.equal(run(validateTask, { title: 'x', completed: 'yes' }).res.statusCode, 400);
    assert.equal(run(validateTask, { title: 'x', dueDate: 'not-a-date' }).res.statusCode, 400);
  });

  test('accepts and converts a dueDate', () => {
    const { req } = run(validateTask, { title: 'x', dueDate: '2026-12-01' });
    assert.ok(req.taskData.dueDate instanceof Date);
  });
});

describe('validateTask.partial (update)', () => {
  test('allows toggling completed without sending the title', () => {
    const { req, nextCalled } = run(validateTask.partial, { completed: true });
    assert.equal(nextCalled, true);
    assert.deepEqual(req.taskData, { completed: true });
  });

  test('rejects an empty update and a blank title', () => {
    assert.equal(run(validateTask.partial, {}).res.body.message, 'Nothing to update');
    assert.equal(run(validateTask.partial, { title: '' }).res.statusCode, 400);
  });

  test('allows clearing the due date with null', () => {
    const { req } = run(validateTask.partial, { dueDate: null });
    assert.equal(req.taskData.dueDate, null);
  });
});

describe('validateContact', () => {
  const valid = { name: 'Asha', email: 'Asha@Example.com', message: 'Hello, I would like to talk.' };

  test('passes valid input and normalises email', () => {
    const { req, nextCalled } = run(validateContact, valid);
    assert.equal(nextCalled, true);
    assert.equal(req.contact.email, 'asha@example.com');
  });

  test('returns per-field errors', () => {
    const { res } = run(validateContact, { name: 'A', email: 'nope', message: 'short' });
    assert.equal(res.statusCode, 400);
    assert.deepEqual(Object.keys(res.body.errors).sort(), ['email', 'message', 'name']);
  });

  test('rejects the honeypot field', () => {
    assert.equal(run(validateContact, { ...valid, website: 'http://spam' }).res.statusCode, 400);
  });
});

describe('rateLimit', () => {
  test('allows `max` requests then answers 429', () => {
    const limiter = rateLimit({ windowMs: 60000, max: 2 });
    assert.equal(run(limiter, {}).nextCalled, true);
    assert.equal(run(limiter, {}).nextCalled, true);
    const third = run(limiter, {});
    assert.equal(third.nextCalled, false);
    assert.equal(third.res.statusCode, 429);
    assert.ok(third.res.headers['Retry-After']);
  });

  test('counts clients separately by IP', () => {
    const limiter = rateLimit({ windowMs: 60000, max: 1 });
    assert.equal(run(limiter, {}, { ip: '10.0.0.1' }).nextCalled, true);
    assert.equal(run(limiter, {}, { ip: '10.0.0.2' }).nextCalled, true);
    assert.equal(run(limiter, {}, { ip: '10.0.0.1' }).nextCalled, false);
  });
});
