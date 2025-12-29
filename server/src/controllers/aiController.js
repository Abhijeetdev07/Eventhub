const { generateEventDescription } = require('../services/geminiService');

function clampText(text, maxLen) {
  if (!text) return '';
  return String(text).trim().slice(0, maxLen);
}

async function enhanceDescription(req, res) {
  try {
    const title = clampText(req.body.title, 120);
    const location = clampText(req.body.location, 120);
    const dateTime = clampText(req.body.dateTime, 80);
    const notes = clampText(req.body.notes, 600);

    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const description = await generateEventDescription({
      title,
      location,
      dateTime,
      notes,
    });

    if (!description) {
      return res.status(500).json({ message: 'AI did not return a description' });
    }

    return res.json({ description });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}

module.exports = {
  enhanceDescription,
};
