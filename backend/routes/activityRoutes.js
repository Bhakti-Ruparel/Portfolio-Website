// routes/activityRoutes.js — the logged-in user's activity log (event-driven).

const express = require('express');
const protect = require('../middleware/auth');
const { listActivity } = require('../controllers/activityController');

const router = express.Router();

router.get('/', protect, listActivity);

module.exports = router;
