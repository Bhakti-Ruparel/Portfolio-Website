// server.js
// Entry point — validate config, connect MongoDB, register event listeners,
// start the HTTP server, and shut down cleanly on SIGTERM/SIGINT
// (Docker sends SIGTERM on `docker compose down`).

const { config, assertRequiredConfig } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const { createApp } = require('./app');
const { registerListeners } = require('./services/listeners');
const { isEnabled: aiEnabled } = require('./services/aiService');

async function start() {
  try {
    assertRequiredConfig();
  } catch (err) {
    console.error(`❌  ${err.message}. Copy backend/.env.example to backend/.env and fill it in.`);
    process.exit(1);
  }

  try {
    await connectDB(config.mongoUri);
    console.log('✅  MongoDB connected successfully');
  } catch (error) {
    console.error('❌  MongoDB connection failed:', error.message);
    process.exit(1);
  }

  registerListeners();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`🚀  Server running on http://localhost:${config.port} (${config.nodeEnv})`);
    console.log(`🤖  AI assistant: ${aiEnabled() ? `enabled (${config.hf.model})` : 'disabled — set HF_TOKEN to enable'}`);
  });

  async function shutdown(signal) {
    console.log(`\n${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      console.log('👋  Server closed');
      process.exit(0);
    });
    // Force-exit if connections don't close within 10 s.
    setTimeout(() => process.exit(1), 10000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
