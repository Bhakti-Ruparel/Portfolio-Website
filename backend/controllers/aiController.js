// controllers/aiController.js
// HTTP layer for the portfolio AI assistant.

const { askPortfolioAssistant, isEnabled, AiServiceError } = require('../services/aiService');
const { cache, cacheKeys } = require('../services/cache');
const { config } = require('../config/env');

const MAX_QUESTION_LENGTH = 500;
const ANSWER_CACHE_SECONDS = 600;

// GET /api/ai/status — lets the frontend show/hide the assistant.
function status(req, res) {
  res.status(200).json({
    enabled: isEnabled(),
    provider: 'huggingface',
    model: isEnabled() ? config.hf.model : null,
  });
}

// POST /api/ai/chat  { message: string, history?: [{role, content}] }
async function chat(req, res, next) {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
  const history = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!message) {
    return res.status(400).json({ message: 'Please type a question.' });
  }
  if (message.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({ message: `Questions must be ${MAX_QUESTION_LENGTH} characters or fewer.` });
  }
  if (!isEnabled()) {
    return res.status(503).json({ message: 'The AI assistant is not configured on this server.', enabled: false });
  }

  try {
    // Only first questions (no conversation history) are cached: the same
    // question from many visitors costs one API call per 10 minutes.
    const cacheable = history.length === 0;
    const key = cacheKeys.aiAnswer(message.toLowerCase().replace(/\s+/g, ' '));

    if (cacheable) {
      const cached = cache.get(key);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json({ success: true, ...cached, cached: true });
      }
    }

    const result = await askPortfolioAssistant(message, history);
    if (cacheable) cache.set(key, result, ANSWER_CACHE_SECONDS);

    res.set('X-Cache', 'MISS');
    res.status(200).json({ success: true, ...result, cached: false });
  } catch (err) {
    if (err instanceof AiServiceError) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

module.exports = { status, chat };
