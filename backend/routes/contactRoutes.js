// routes/contactRoutes.js — public contact form endpoint.

const express = require('express');
const rateLimit = require('../middleware/rateLimit');
const validateContact = require('../middleware/validateContact');
const { submitContact } = require('../controllers/contactController');

const router = express.Router();

// Anti-spam: 5 messages per IP per 15 minutes.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'You have sent several messages already. Please try again later.',
});

router.post('/', contactLimiter, validateContact, submitContact);

module.exports = router;
