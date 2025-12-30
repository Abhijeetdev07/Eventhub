async function generateEventDescription({ title, location, dateTime, notes }) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in environment variables');
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

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 250
    }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    const details = data && data.error && data.error.message ? data.error.message : 'Groq API request failed';
    throw new Error(details);
  }

  const description =
    data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
      ? data.choices[0].message.content
      : '';

  return description.trim();
}

module.exports = {
  generateEventDescription,
};
