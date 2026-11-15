// middleware/errorHandler.js
// 404 handler + centralized error handler.
// Express identifies a 4-argument function as an error handler. Any route
// that calls next(err) lands here, so no stack trace ever leaks to a client.

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Mongoose schema validation → 400 with per-field messages.
  if (err.name === 'ValidationError') {
    const errors = Object.fromEntries(
      Object.entries(err.errors || {}).map(([field, e]) => [field, e.message])
    );
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Malformed ObjectId that slipped past route checks.
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}` });
  }

  // Duplicate key (e.g. e-mail already registered).
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }

  // Malformed JSON body (express.json parse error).
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large' });
  }

  // CORS rejection from config in app.js.
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  // MongoDB unavailable (bufferCommands is off, so this fails fast).
  if (
    err.name === 'MongooseServerSelectionError' ||
    err.name === 'MongoNotConnectedError' ||
    /buffering|not connected|initial connection/i.test(err.message || '')
  ) {
    return res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
  }

  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('❌ Unhandled error:', err);
  res.status(status).json({
    message: status >= 500 ? 'Internal server error' : err.message,
  });
}

module.exports = { notFound, errorHandler };
