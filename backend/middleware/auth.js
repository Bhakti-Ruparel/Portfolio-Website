// middleware/auth.js
// JWT authentication middleware.
// Attaches the decoded token payload to req.user and calls next().
// Applied to all /tasks routes and GET /me.

const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Header must exist AND look like "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized: No token provided or malformed authorization header',
    });
  }

  const token = authHeader.split(' ')[1]; // everything after "Bearer "

  // jwt.verify throws synchronously on failure, so we wrap it in try/catch
  // so the server never crashes from a bad token.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, iat, exp }
    next();             // token is valid — hand off to the route handler
  } catch (err) {
    // Distinguish between expired tokens and completely invalid ones
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = protect;
