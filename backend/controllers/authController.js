// controllers/authController.js
// Registration, login, logout, profile and password reset.
// (Logic moved here from routes/authRoutes.js so routes only describe URLs.)

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { config } = require('../config/env');
const { eventBus, EVENTS } = require('../services/eventBus');

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const GENERIC_RESET_MESSAGE =
  'If an account with that email exists, a password reset link has been sent.';

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function publicUser(user) {
  return { _id: user._id, name: user.name, email: user.email };
}

// POST /api/auth/register
// Creates a new user. Password is hashed by the User pre-save hook.
// 201 on success, 409 if the email is already taken.
async function register(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email }).select('_id').lean();
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });
    eventBus.publish(EVENTS.USER_REGISTERED, { userId: user._id, email: user.email });

    res.status(201).json({ message: 'User registered successfully', user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
// Returns a signed JWT. Failure message is generic — never reveal which field was wrong.
async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email });
    const isMatch = user ? await bcrypt.compare(password, user.password) : false;
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id.toString(), email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });

    eventBus.publish(EVENTS.USER_LOGGED_IN, { userId: user._id });
    res.status(200).json({ message: 'Login successful', token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout (protected)
// JWTs are stateless: the client deletes its token. This endpoint exists so
// the client has one consistent place to call and the request is authenticated.
function logout(req, res) {
  res.status(200).json({ message: 'Logout successful' });
}

// GET /api/auth/me (protected)
async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('name email createdAt').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/forgot-password
// Always answers with the same generic message (no account enumeration).
// The e-mail is "sent" by an event listener after the response.
async function forgotPassword(req, res, next) {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: GENERIC_RESET_MESSAGE });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS;
    await user.save();

    eventBus.publish(EVENTS.PASSWORD_RESET_REQUESTED, {
      userId: user._id,
      email,
      resetUrl: `${config.frontendUrl}/reset-password/${rawToken}`,
    });

    res.status(200).json({ message: GENERIC_RESET_MESSAGE });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/reset-password/:token
async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const newPassword = String(req.body.password || '');

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword; // re-hashed by the pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, forgotPassword, resetPassword };
