// middleware/auth.js
// JWT authentication middleware.
// Attaches the decoded token payload to req.user and calls next().
// Applied to all /tasks routes and GET /me.

const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized: No token provided or malformed authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'JWT secret is not configured' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = protect;
