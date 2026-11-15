// services/cache.js
// Practical 9 — In-memory cache with TTL expiry and prefix invalidation.
//
// Why no Redis/node-cache? A small Map-based cache is enough for a single
// server instance, has zero dependencies, and every line can be explained in
// a viva. (If the API ever runs as several instances, swap this module for
// Redis — the get/set/delPrefix interface stays the same.)
//
// How it works:
//   • set(key, value, ttl) stores { value, expiresAt }.
//   • get(key) returns the value, or undefined if missing OR expired
//     (expired entries are deleted on read: "lazy expiry").
//   • A background sweep every 60 s removes expired entries nobody read.
//   • delPrefix('tasks:<userId>:') invalidates every cached list for a user
//     after they create/update/delete a task.
//   • maxEntries caps memory; the oldest entry is evicted first.

class MemoryCache {
  constructor({ defaultTtlSeconds = 60, maxEntries = 1000, sweepIntervalMs = 60000 } = {}) {
    this.defaultTtlMs = defaultTtlSeconds * 1000;
    this.maxEntries = maxEntries;
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;

    if (sweepIntervalMs > 0) {
      this.sweeper = setInterval(() => this.sweep(), sweepIntervalMs);
      // unref: the timer must not keep the process alive on shutdown/tests.
      this.sweeper.unref();
    }
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.misses += 1;
      return undefined;
    }
    this.hits += 1;
    return entry.value;
  }

  set(key, value, ttlSeconds) {
    const ttlMs = ttlSeconds === undefined ? this.defaultTtlMs : ttlSeconds * 1000;
    if (this.store.has(key)) this.store.delete(key); // refresh insertion order
    if (this.store.size >= this.maxEntries) {
      // Map keeps insertion order, so the first key is the oldest.
      this.store.delete(this.store.keys().next().value);
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  }

  del(key) {
    return this.store.delete(key);
  }

  delPrefix(prefix) {
    let removed = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) this.store.delete(key);
    }
  }

  clear() {
    this.store.clear();
  }

  stats() {
    const total = this.hits + this.misses;
    return {
      entries: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total ? Number((this.hits / total).toFixed(2)) : 0,
    };
  }

  /**
   * wrap(key, ttl, loader) — cache-aside helper:
   * return the cached value if present, otherwise run loader(), cache and
   * return its result. Second element tells the caller whether it was a hit.
   */
  async wrap(key, ttlSeconds, loader) {
    const cached = this.get(key);
    if (cached !== undefined) return [cached, true];
    const fresh = await loader();
    this.set(key, fresh, ttlSeconds);
    return [fresh, false];
  }
}

const { config } = require('../config/env');

const cache = new MemoryCache({ defaultTtlSeconds: config.cacheTtlSeconds });

// Key helpers so every module builds keys the same way.
const cacheKeys = {
  userTasksPrefix: (userId) => `tasks:${userId}:`,
  taskList: (userId, query) => `tasks:${userId}:list:${query}`,
  taskStats: (userId) => `tasks:${userId}:stats`,
  aiAnswer: (question) => `ai:answer:${question}`,
};

module.exports = { cache, cacheKeys, MemoryCache };
