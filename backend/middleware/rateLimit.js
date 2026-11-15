// middleware/rateLimit.js
// Small fixed-window rate limiter (no dependency).
// Protects login/register/forgot-password from brute force, and the contact
// form + AI endpoint from spam / burning the AI quota.
//
// Each limiter keeps its own Map of  key(IP) → { count, resetAt }.
// When the window passes, the counter starts again from zero.

function rateLimit({ windowMs, max, message = 'Too many requests. Please try again later.', keyGenerator } = {}) {
  const hits = new Map();

  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, windowMs);
  sweeper.unref();

  function limiter(req, res, next) {
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil((entry.resetAt - now) / 1000)));

    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ message });
    }
    next();
  }

  limiter.reset = () => hits.clear();
  return limiter;
}

module.exports = rateLimit;
