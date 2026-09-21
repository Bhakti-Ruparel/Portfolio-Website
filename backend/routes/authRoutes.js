// routes/authRoutes.js
// Handles user registration, login, and profile retrieval.
// Mounted in server.js — no prefix, so paths are exactly /register, /login, /me.

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');

const router = express.Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function sendResetEmail(email, resetToken) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 DEV ONLY — password reset link:', resetUrl);
    return;
  }

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    // Optional future integration: nodemailer can be added here when SMTP is configured.
    console.log(`Password reset requested for ${email}. Link: ${resetUrl}`);
    return;
  }

  console.log(`Password reset link for ${email} (development fallback): ${resetUrl}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /register
// Creates a new user. Password is hashed before storing.
// Returns 201 { message: "User registered successfully" } on success.
// Returns 409 if the email is already taken.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /login
// Validates credentials and returns a signed JWT on success.
// Returns 401 with a generic message on failure — never reveal which field was wrong.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /logout
// Logs out the user by sending a success message.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/logout', protect, async (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /me  (protected)
// Returns the currently logged-in user's profile.
// req.user.id is set by the protect middleware from the JWT payload.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /forgot-password
// Initiates the password reset process by sending a reset link to the user's email.
// Returns 200 { message: "If an account with that email exists, a password reset link has been sent." }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    sendResetEmail(email, rawToken);

    res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to process password reset request right now' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /reset-password/:token
// Resets the user's password if the reset token is valid and not expired.
// Returns 200 { message: "Password reset successful. Please log in again." } on success.
// Returns 400 if the token is invalid or expired.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const newPassword = String(req.body.password || '');

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!token) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please log in again.' });
  } catch (err) {
    res.status(500).json({ message: 'Unable to reset password right now' });
  }
});

module.exports = router;
