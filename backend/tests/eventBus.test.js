const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AppEventBus } = require('../services/eventBus');

test('publish() runs listeners asynchronously, after the current code', async () => {
  const bus = new AppEventBus();
  const order = [];
  const done = new Promise((resolve) => {
    bus.subscribe('demo', async (payload) => {
      order.push(`listener:${payload.n}`);
      resolve();
    });
  });

  bus.publish('demo', { n: 1 });
  order.push('after publish'); // the "HTTP response" happens here
  await done;

  assert.deepEqual(order, ['after publish', 'listener:1']);
  assert.equal(bus.stats.emitted, 1);
});

test('a failing listener is contained and counted, other listeners still run', async () => {
  const bus = new AppEventBus();
  const originalError = console.error;
  console.error = () => {};
  let otherRan = false;

  bus.subscribe('boom', async () => { throw new Error('listener failure'); });
  const done = new Promise((resolve) => {
    bus.subscribe('boom', async () => { otherRan = true; resolve(); });
  });

  bus.publish('boom');
  await done;
  await new Promise((r) => setImmediate(r));
  console.error = originalError;

  assert.equal(otherRan, true);
  assert.equal(bus.stats.failed, 1);
  assert.equal(bus.stats.handled, 1);
});

test('payload is stamped with the time it was published', async () => {
  const bus = new AppEventBus();
  const payload = await new Promise((resolve) => {
    bus.subscribe('stamp', async (p) => resolve(p));
    bus.publish('stamp', { id: 'x' });
  });
  assert.equal(payload.id, 'x');
  assert.ok(payload.at instanceof Date);
});
