const mongoose = require('mongoose');

const Event = require('../models/Event');
const Rsvp = require('../models/Rsvp');

async function joinEvent(req, res) {
  const eventId = req.params.id;
  const userId = req.user.id;

  const session = await mongoose.startSession();

  try {
    let updatedEvent;

    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);

      if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        throw err;
      }

      try {
        await Rsvp.create(
          [
            {
              eventId,
              userId,
              status: 'going',
            },
          ],
          { session }
        );
      } catch (err) {
        if (err && err.code === 11000) {
          const dupErr = new Error('You already RSVPed to this event');
          dupErr.statusCode = 409;
          throw dupErr;
        }

        throw err;
      }

      updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          rsvpCount: { $lt: event.capacity },
        },
        {
          $inc: { rsvpCount: 1 },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedEvent) {
        const fullErr = new Error('Event is full');
        fullErr.statusCode = 409;
        throw fullErr;
      }
    });

    return res.status(201).json({
      message: 'RSVP confirmed',
      event: updatedEvent,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;

    if (statusCode === 500 && err && typeof err.message === 'string') {
      if (err.message.includes('Transaction numbers are only allowed')) {
        return res.status(500).json({
          message: 'Transactions are not supported by this MongoDB setup. Use MongoDB Atlas (replica set) for RSVP concurrency safety.',
        });
      }
    }

    return res.status(statusCode).json({ message: err.message || 'Server error' });
  } finally {
    session.endSession();
  }
}

async function leaveEvent(req, res) {
  const eventId = req.params.id;
  const userId = req.user.id;

  const session = await mongoose.startSession();

  try {
    let updatedEvent;

    await session.withTransaction(async () => {
      const event = await Event.findById(eventId).session(session);

      if (!event) {
        const err = new Error('Event not found');
        err.statusCode = 404;
        throw err;
      }

      const deletedRsvp = await Rsvp.findOneAndDelete({ eventId, userId }).session(session);

      if (!deletedRsvp) {
        const notErr = new Error('You have not RSVPed to this event');
        notErr.statusCode = 409;
        throw notErr;
      }

      updatedEvent = await Event.findOneAndUpdate(
        {
          _id: eventId,
          rsvpCount: { $gt: 0 },
        },
        {
          $inc: { rsvpCount: -1 },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedEvent) {
        updatedEvent = await Event.findById(eventId).session(session);
      }
    });

    return res.json({
      message: 'RSVP removed',
      event: updatedEvent,
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;

    if (statusCode === 500 && err && typeof err.message === 'string') {
      if (err.message.includes('Transaction numbers are only allowed')) {
        return res.status(500).json({
          message:
            'Transactions are not supported by this MongoDB setup. Use MongoDB Atlas (replica set) for RSVP concurrency safety.',
        });
      }
    }

    return res.status(statusCode).json({ message: err.message || 'Server error' });
  } finally {
    session.endSession();
  }
}

module.exports = {
  joinEvent,
  leaveEvent,
};
