const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const {
  getMyAttendingEvents,
  getMyCreatedEvents,
  getMyAttendingEventsAlias,
} = require('../controllers/userController');

const router = express.Router();

router.get('/me/attending', authMiddleware, getMyAttendingEvents);
router.get('/me/created-events', authMiddleware, getMyCreatedEvents);
router.get('/me/attending-events', authMiddleware, getMyAttendingEventsAlias);

module.exports = router;
