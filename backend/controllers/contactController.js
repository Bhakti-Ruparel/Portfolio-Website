// controllers/contactController.js
// Stores contact-form messages in MongoDB, then notifies in the background.

const ContactMessage = require('../models/ContactMessage');
const { eventBus, EVENTS } = require('../services/eventBus');

// POST /api/contact  (body already validated by validateContact → req.contact)
async function submitContact(req, res, next) {
  try {
    const saved = await ContactMessage.create(req.contact);

    eventBus.publish(EVENTS.CONTACT_RECEIVED, {
      messageId: saved._id,
      name: saved.name,
      email: saved.email,
      subject: saved.subject,
    });

    res.status(201).json({
      success: true,
      message: "Thanks! Your message has been received — I'll get back to you soon.",
      id: saved._id,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { submitContact };
