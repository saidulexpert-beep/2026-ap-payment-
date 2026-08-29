export default async function handler(req, res) {
  // CORS Setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, api-key, API-KEY, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // আপনার API Key (কোনো স্পেস ছাড়া)
  const API_KEY = 'GitwFKKVL0RMN4zR12V9inyYcaTaEgBg6riEHkhXR7Q1on1Wpl'.trim();
  const BASE_URL = 'https://paydeshipay.themedokan.com/api/payment';
  
  const action = req.query.action;

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  body = body || {};

  try {
    if (action === 'create') {
      const amountVal = parseFloat(body.amount) || 10;
      const successUrl = body.success_url || body.redirect_url;
      const cancelUrl = body.cancel_url || successUrl;

      // DeshiPay / Themedokan গেটওয়ের অরিজিনাল পেলোড
      const payload = {
        amount: String(amountVal),
        cus_name: body.cus_name || "Customer",
        cus_email: body.cus_email || "customer@mail.com",
        cus_number: body.cus_phone || "01700000000",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: body.metadata || { order_id: body.order_id || `ORD_${Date.now()}` }
      };

      const response = await fetch(`${BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'API-KEY': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return res.status(200).json(data);

    } else if (action === 'verify') {
      const trxId = body.transaction_id || body.trx_id || body.order_id;

      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: {
          'API-KEY': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ transaction_id: trxId })
      });
      
      const data = await response.json();
      return res.status(200).json(data);

    } else {
      return res.status(400).json({ error: 'Invalid Action' });
    }
  } catch (error) {
    console.error("Payment Gateway Error:", error);
    return res.status(500).json({ error: error.message || 'Server Connection Error' });
  }
}
