// services/notificationService.js
// Outgoing notifications (password reset link, new contact message).
//
// No SMTP library is installed, so these are logged to the server console.
// Security: the reset link (which is a credential) is printed ONLY outside
// production. In production we log that a reset happened, never the link.
// To send real e-mails later, install nodemailer and implement send() below;
// callers do not need to change.

const { config } = require('../config/env');

async function sendPasswordResetEmail(email, resetUrl) {
  if (!config.isProduction) {
    console.log(`🔐 [DEV ONLY] Password reset link for ${email}: ${resetUrl}`);
    return { delivered: false, reason: 'dev-log' };
  }
  console.log(`🔐 Password reset requested for ${email} (e-mail delivery not configured).`);
  return { delivered: false, reason: 'smtp-not-configured' };
}

async function notifyNewContactMessage({ messageId, name, email, subject }) {
  console.log(
    `📬 New contact message ${messageId} from ${name} <${email}>${subject ? ` — "${subject}"` : ''}`
  );
  return { delivered: false, reason: 'console' };
}

module.exports = { sendPasswordResetEmail, notifyNewContactMessage };
