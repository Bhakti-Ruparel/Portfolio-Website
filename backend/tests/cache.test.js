// Run with: npm test   (Node's built-in test runner, no extra dependencies)
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MemoryCache } = require('../services/cache');

test('stores and returns values until they expire', async () => {
  const cache = new MemoryCache({ sweepIntervalMs: 0 });
  cache.set('a', 1, 0.05); // 50 ms
  assert.equal(cache.get('a'), 1);
  await new Promise((r) => setTimeout(r, 70));
  assert.equal(cache.get('a'), undefined, 'expired entry must not be returned');
  assert.equal(cache.stats().entries, 0, 'expired entry is removed on read');
});

test('delPrefix invalidates only matching keys', () => {
  const cache = new MemoryCache({ sweepIntervalMs: 0 });
  cache.set('tasks:u1:list:a', 1);
  cache.set('tasks:u1:stats', 2);
  cache.set('tasks:u2:list:a', 3);
  assert.equal(cache.delPrefix('tasks:u1:'), 2);
  assert.equal(cache.get('tasks:u1:stats'), undefined);
  assert.equal(cache.get('tasks:u2:list:a'), 3);
});

test('evicts the oldest entry when full', () => {
  const cache = new MemoryCache({ maxEntries: 2, sweepIntervalMs: 0 });
  cache.set('first', 1);
  cache.set('second', 2);
  cache.set('third', 3);
  assert.equal(cache.get('first'), undefined);
  assert.equal(cache.get('third'), 3);
});

test('wrap() calls the loader once, then serves from cache', async () => {
  const cache = new MemoryCache({ sweepIntervalMs: 0 });
  let calls = 0;
  const loader = async () => { calls += 1; return { n: 42 }; };
  const [first, hit1] = await cache.wrap('k', 60, loader);
  const [second, hit2] = await cache.wrap('k', 60, loader);
  assert.deepEqual(first, { n: 42 });
  assert.equal(second, first);
  assert.equal(hit1, false);
  assert.equal(hit2, true);
  assert.equal(calls, 1);
  assert.equal(cache.stats().hits, 1);
});
