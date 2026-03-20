export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email_address, custom_fields, fields } = req.body;

  if (!email_address) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const apiKey = process.env.KIT_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server config missing' });
  }

  // Kit V4 uses /v4/subscribers (not /forms/{id}/subscribers)
  // Kit V4 uses "fields" key (not "custom_fields")
  // Kit V4 uses X-Kit-Api-Key header (not Authorization: Bearer)
  const surveyFields = fields || custom_fields;

  try {
    const response = await fetch(
      'https://api.kit.com/v4/subscribers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Kit-Api-Key': apiKey
        },
        body: JSON.stringify({
          email_address,
          fields: surveyFields
        })
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Kit API error:', response.status, responseText);
      return res.status(response.status).json({ error: responseText });
    }

    const data = JSON.parse(responseText);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Submit error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
