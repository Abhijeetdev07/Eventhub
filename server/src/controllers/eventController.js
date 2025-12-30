const cloudinary = require('../config/cloudinary');
const Event = require('../models/Event');
const Rsvp = require('../models/Rsvp');
const { uploadEventImage } = require('../services/cloudinaryService');

function isOwner(event, userId) {
  return event.createdBy.toString() === userId;
}

async function createEvent(req, res) {
  try {
    const { title, description, dateTime, location, capacity, category } = req.body;

    if (!title || !description || !dateTime || !location || !capacity || !category) {
      return res.status(400).json({
        message: 'title, description, dateTime, location, capacity, and category are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const { imageUrl, imagePublicId } = await uploadEventImage(req.file);

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      dateTime: new Date(dateTime),
      location: location.trim(),
      capacity: Number(capacity),
      imageUrl,
      imagePublicId,
      category: category.trim(),
      createdBy: req.user.id,
      rsvpCount: 0,
    });

    return res.status(201).json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getEvents(req, res) {
  try {
    const { search, category, from, to, sort } = req.query;

    const filter = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    const dateFilter = {};

    if (from) {
      dateFilter.$gte = new Date(from);
    }

    if (to) {
      dateFilter.$lte = new Date(to);
    }

    if (from || to) {
      filter.dateTime = dateFilter;
    }

    const sortBy = sort === 'desc' ? -1 : 1;

    const events = await Event.find(filter).sort({ dateTime: sortBy });

    return res.json(events);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getEventById(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function updateEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!isOwner(event, req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const allowedFields = [
      'title',
      'description',
      'dateTime',
      'location',
      'capacity',
      'category',
    ];

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        if (key === 'dateTime') {
          event.dateTime = new Date(req.body.dateTime);
        } else if (key === 'capacity') {
          event.capacity = Number(req.body.capacity);
        } else if (typeof req.body[key] === 'string') {
          event[key] = req.body[key].trim();
        } else {
          event[key] = req.body[key];
        }
      }
    }

    let oldPublicId;

    if (req.file) {
      oldPublicId = event.imagePublicId;
      const { imageUrl, imagePublicId } = await uploadEventImage(req.file);

      event.imageUrl = imageUrl;
      event.imagePublicId = imagePublicId;
    }

    await event.save();

    if (
      oldPublicId &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (err) {
        // Best-effort cleanup; do not fail the request after DB has been updated
      }
    }

    return res.json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!isOwner(event, req.user.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (
      event.imagePublicId &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        await cloudinary.uploader.destroy(event.imagePublicId);
      } catch (err) {
        return res.status(500).json({ message: 'Failed to delete image from Cloudinary' });
      }
    }

    await Rsvp.deleteMany({ eventId: event._id });
    await event.deleteOne();

    return res.json({ message: 'Event deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
