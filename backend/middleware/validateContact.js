// middleware/validateContact.js
// Validates and normalises the contact form body before it reaches the controller.
// Rules mirror src/components/ContactForm.jsx (the frontend checks are only for UX;
// these are the ones that actually protect the database).

const EMAIL_RE = /^\S+@\S+\.\S+$/;

function validateContact(req, res, next) {
  const body = req.body || {};
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const subject = String(body.subject ?? '').trim();
  const message = String(body.message ?? '').trim();
  const errors = {};

  if (name.length < 2 || name.length > 80) errors.name = 'Name must be 2–80 characters';
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'A valid email is required';
  if (subject.length > 120) errors.subject = 'Subject must be 120 characters or fewer';
  if (message.length < 10 || message.length > 2000) errors.message = 'Message must be 10–2000 characters';

  // Honeypot: real users never fill a hidden "website" field; bots often do.
  if (body.website) errors.website = 'Rejected';

  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Please fix the highlighted fields', errors });
  }

  req.contact = { name, email, subject, message };
  next();
}

module.exports = validateContact;
