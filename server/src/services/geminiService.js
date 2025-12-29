async function generateEventDescription({ title, location, dateTime, notes }) {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_AI_STUDIO_API_KEY is missing in environment variables');
  }

  const prompt = [
    'Write a clear and attractive event description.',
    'Keep it professional and friendly.',
    'Return only the description text (no markdown headings).',
    '',
    `Title: ${title}`,
    location ? `Location: ${location}` : null,
    dateTime ? `Date & Time: ${dateTime}` : null,
    notes ? `Extra notes: ${notes}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  // const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText?key=${apiKey}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    const details = data && data.error && data.error.message ? data.error.message : 'Gemini API request failed';
    throw new Error(details);
  }

  const description =
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text
      ? data.candidates[0].content.parts[0].text
      : '';

  return description.trim();
}

module.exports = {
  generateEventDescription,
};
