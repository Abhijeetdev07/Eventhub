const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rsvpCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.index({ dateTime: 1 });
eventSchema.index({ title: 1 });

module.exports = mongoose.model('Event', eventSchema);
