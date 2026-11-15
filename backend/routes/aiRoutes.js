// routes/aiRoutes.js — public portfolio assistant.

const express = require('express');
const rateLimit = require('../middleware/rateLimit');
const ai = require('../controllers/aiController');

const router = express.Router();

// Protects the (free, limited) Hugging Face quota: 10 questions per IP per minute.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many questions in a short time. Please wait a minute.',
});

router.get('/status', ai.status);
router.post('/chat', aiLimiter, ai.chat);

module.exports = router;
