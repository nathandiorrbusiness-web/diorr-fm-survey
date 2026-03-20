export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email_address, custom_fields } = req.body;

  if (!email_address) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const response = await fetch(
      `https://api.kit.com/v4/forms/${process.env.KIT_FORM_ID}/subscribers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.KIT_API_KEY}`
        },
        body: JSON.stringify({
          email_address,
          custom_fields
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to submit survey' });
  }
}
