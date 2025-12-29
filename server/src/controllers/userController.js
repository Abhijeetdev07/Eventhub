const Rsvp = require('../models/Rsvp');
const Event = require('../models/Event');

async function getMyAttendingEvents(req, res) {
  try {
    const userId = req.user.id;

    const rsvps = await Rsvp.find({ userId }).select('eventId');
    const eventIds = rsvps.map((r) => r.eventId);

    const events = await Event.find({ _id: { $in: eventIds } }).sort({ dateTime: 1 });

    return res.json(events);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getMyCreatedEvents(req, res) {
  try {
    const userId = req.user.id;

    const events = await Event.find({ createdBy: userId }).sort({ dateTime: 1 });

    return res.json(events);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getMyAttendingEventsAlias(req, res) {
  return getMyAttendingEvents(req, res);
}

module.exports = {
  getMyAttendingEvents,
  getMyCreatedEvents,
  getMyAttendingEventsAlias,
};
