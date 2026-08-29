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
    if (action === 'create') {
      const body = req.body || {};
      
      // DaWebLab গেটওয়ের প্রয়োজনীয় সকল ফিল্ড সুরক্ষিতভাবে ফরম্যাট করা হয়েছে
      const payload = {
        amount: String(body.amount),
        currency: "BDT",
        cus_name: body.metadata?.username || body.cus_name || "Telegram User",
        cus_email: body.cus_email || "user@telegram.app",
        cus_phone: body.cus_phone || "01700000000",
        success_url: body.success_url,
        cancel_url: body.cancel_url,
        redirect_url: body.success_url,
        metadata: body.metadata || {}
      };

      const response = await fetch(`${BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'API-KEY': API_KEY,
          'api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return res.status(200).json(data);

    } else if (action === 'verify') {
      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: {
          'API-KEY': API_KEY,
          'api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      return res.status(200).json(data);

    } else {
      return res.status(400).json({ error: 'Invalid Action' });
    }
  } catch (error) {
    console.error("Payment API Error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
