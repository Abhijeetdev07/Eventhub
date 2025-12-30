const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const { joinEvent, leaveEvent } = require('../controllers/rsvpController');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

const router = express.Router();

router.post('/', authMiddleware, upload.array('images', 5), createEvent);
router.get('/', getEvents);
router.post('/:id/rsvp', authMiddleware, joinEvent);
router.delete('/:id/rsvp', authMiddleware, leaveEvent);
router.get('/:id', getEventById);
router.patch('/:id', authMiddleware, upload.array('images', 5), updateEvent);
router.delete('/:id', authMiddleware, deleteEvent);

module.exports = router;
