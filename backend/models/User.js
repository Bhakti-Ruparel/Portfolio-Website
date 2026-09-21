// models/User.js
// Mongoose schema for a registered user.
// Passwords are NEVER stored plain-text — only the bcrypt hash goes in the DB.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,        // MongoDB creates a unique index on this field
      trim: true,
      lowercase: true,     // store emails in lower-case so "User@X.com" == "user@x.com"
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
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

userSchema.pre('save', async function nextHashPassword(next) {
  // Only hash on create or when password changes
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
