// routes/authRoutes.js
// URL map for authentication. Handlers live in controllers/authController.js.
// Mounted at /api/auth (and at / for the legacy /register, /login, /me paths).

const express = require('express');
const protect = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const auth = require('../controllers/authController');

const router = express.Router();

// Brute-force protection: 20 attempts per IP per 15 minutes on credential endpoints.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many attempts. Please wait a few minutes and try again.',
});

router.post('/register', credentialLimiter, auth.register);
router.post('/login', credentialLimiter, auth.login);
router.post('/logout', protect, auth.logout);
router.get('/me', protect, auth.me);
router.post('/forgot-password', credentialLimiter, auth.forgotPassword);
router.post('/reset-password/:token', credentialLimiter, auth.resetPassword);

module.exports = router;
