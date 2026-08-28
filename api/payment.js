export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = 'K2fcHX0LFHjCdVHzPAleKMBWYAdOsh9l4LdIyGp8CDmfqZZKzP';
  const BASE_URL = 'https://client-pg.daweblab.com/api/payment';
  
  const action = req.query.action;

  try {
    if (action === 'create' || action === 'verify') {
      const response = await fetch(`${BASE_URL}/${action}`, {
        method: 'POST',
        headers: {
          'API-KEY': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: 'Invalid Action' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
