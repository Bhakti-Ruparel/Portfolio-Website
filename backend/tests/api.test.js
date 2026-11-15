// HTTP-level tests of the Express pipeline WITHOUT a database.
// They prove routing, auth middleware, validation, CORS, error handling and
// the "fail fast when MongoDB is down" behaviour. CRUD against a real
// MongoDB is covered by the manual checklist in API_DOCUMENTATION.md.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_unit_tests_only_0123456789';
process.env.HF_TOKEN = '';
process.env.FRONTEND_URL = 'http://localhost:5173';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { createApp } = require('../app');

let server;
let base;
const token = jwt.sign({ id: '507f1f77bcf86cd799439011', email: 't@example.com' }, process.env.JWT_SECRET);

before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((r) => server.close(r)));

async function call(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, headers: res.headers, body: text ? JSON.parse(text) : null };
}

const auth = { Authorization: `Bearer ${token}` };

test('GET /api/health reports the database as disconnected (503)', async () => {
  const res = await call('/api/health');
  assert.equal(res.status, 503);
  assert.equal(res.body.db, 'disconnected');
  assert.equal(res.body.ai.enabled, false);
});

test('unknown routes return JSON 404', async () => {
  const res = await call('/api/nope');
  assert.equal(res.status, 404);
  assert.match(res.body.message, /Route not found/);
});

test('task routes require a Bearer token (401)', async () => {
  assert.equal((await call('/api/tasks')).status, 401);
  assert.equal((await call('/api/tasks', { headers: { Authorization: 'Bearer not.a.jwt' } })).status, 401);
  // legacy mount is protected too
  assert.equal((await call('/tasks')).status, 401);
});

test('validation runs before the database: blank title → 400', async () => {
  const res = await call('/api/tasks', { method: 'POST', body: { title: '' }, headers: auth });
  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'Title is required');
});

test('invalid ObjectId → 400 without touching the database', async () => {
  const res = await call('/api/tasks/not-an-id', { headers: auth });
  assert.equal(res.status, 400);
});

test('valid request while MongoDB is down fails fast with 503', async () => {
  const res = await call('/api/tasks', { headers: auth });
  assert.equal(res.status, 503);
});

test('register validates input (400) before querying MongoDB', async () => {
  const res = await call('/api/auth/register', { method: 'POST', body: { name: 'A', email: 'x', password: '1' } });
  assert.equal(res.status, 400);
});

test('contact form validation returns per-field errors', async () => {
  const res = await call('/api/contact', { method: 'POST', body: { name: '', email: 'bad', message: '' } });
  assert.equal(res.status, 400);
  assert.ok(res.body.errors.email);
});

test('AI assistant is optional: status says disabled and chat answers 503', async () => {
  const status = await call('/api/ai/status');
  assert.equal(status.status, 200);
  assert.equal(status.body.enabled, false);

  const chat = await call('/api/ai/chat', { method: 'POST', body: { message: 'Who is Bhakti?' } });
  assert.equal(chat.status, 503);
});

test('AI chat validates the question', async () => {
  const res = await call('/api/ai/chat', { method: 'POST', body: { message: '' } });
  assert.equal(res.status, 400);
});

test('malformed JSON body → 400', async () => {
  const res = await call('/api/contact', { method: 'POST', body: '{"name":' });
  assert.equal(res.status, 400);
});

test('CORS: configured origin allowed, unknown origin rejected (403)', async () => {
  const ok = await call('/api/ai/status', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(ok.headers.get('access-control-allow-origin'), 'http://localhost:5173');

  const blocked = await call('/api/ai/status', { headers: { Origin: 'https://evil.example' } });
  assert.equal(blocked.status, 403);
});

test('security headers are set and x-powered-by is hidden', async () => {
  const res = await call('/');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-powered-by'), null);
});
