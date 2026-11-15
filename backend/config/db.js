// config/db.js
// MongoDB connection helpers (Mongoose).

const mongoose = require('mongoose');

// Fail fast instead of silently queueing queries while disconnected.
// Without this, a request made while MongoDB is down hangs for 10 s.
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

async function connectDB(uri) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  // Build the indexes declared in each schema (Task, ActivityLog, ...).
  // Done explicitly AFTER connecting: with bufferCommands off, Mongoose's
  // automatic index build runs at model-load time (before the connection is
  // open) and silently fails. createIndexes() only CREATES missing indexes;
  // it never drops existing ones or touches documents.
  await Promise.all(
    mongoose.modelNames().map((name) =>
      mongoose.model(name).createIndexes().catch((err) => {
        console.warn(`⚠️  Could not create indexes for ${name}: ${err.message}`);
      })
    )
  );
  return mongoose.connection;
}

function dbState() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

async function disconnectDB() {
  await mongoose.connection.close();
}

module.exports = { connectDB, dbState, disconnectDB };
