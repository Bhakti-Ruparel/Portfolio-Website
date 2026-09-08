// models/User.js
// Mongoose schema for a registered user.
// Passwords are NEVER stored plain-text — only the bcrypt hash goes in the DB.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,        // MongoDB creates a unique index on this field
      trim: true,
      lowercase: true,     // store emails in lower-case so "User@X.com" == "user@x.com"
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
  },
  {
    // { timestamps: true } auto-adds:
    //   createdAt — set once when the document is first saved
    //   updatedAt — updated every time the document is saved
    // Mongoose manages both; we never set them manually.
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
