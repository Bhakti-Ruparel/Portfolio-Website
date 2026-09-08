// routes/authRoutes.js
// Handles user registration, login, and profile retrieval.
// Mounted in server.js — no prefix, so paths are exactly /register, /login, /me.

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// POST /register
// Creates a new user. Password is hashed before storing.
// Returns 201 { message: "User registered successfully" } on success.
// Returns 409 if the email is already taken.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check for duplicate email before attempting to save
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered. Please sign in.' });
    }

    // Hash the password — cost factor 10 is the standard for web apps
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Return exactly this shape — no token, no user object
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    next(err); // passes to centralized error handler in server.js
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /login
// Validates credentials and returns a signed JWT on success.
// Returns 401 with a generic message on failure — never reveal which field was wrong.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Look up the user (case-insensitive because we store lowercase)
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // bcrypt.compare works even if user is null (timing-safe — no early return)
    const passwordMatch = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatch) {
      // Generic message — do NOT tell the client which field was wrong
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Sign the token — payload contains only the user's MongoDB _id
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /me  (protected)
// Returns the currently logged-in user's profile.
// req.user.id is set by the protect middleware from the JWT payload.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    // select('-password') excludes the password field from the result
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return only the safe fields
    res.status(200).json({
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
