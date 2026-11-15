// models/ContactMessage.js
// Messages submitted through the portfolio contact form.

const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, trim: true, default: '', maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  },
  { timestamps: true }
);

// Newest-first listing, optionally filtered by status.
contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
