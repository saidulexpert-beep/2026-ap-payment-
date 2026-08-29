export default async function handler(req, res) {
  // CORS Headers
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

  // আপনার দেওয়া নতুন API KEY
  const API_KEY = 'gnXi7etgWNhFyFGZFrOMYyrmnF4A1eGU5SC2QRmUvILOlNc2Ef';
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

      // গেটওয়ের অফিসিয়াল ফরম্যাট
      const payload = {
        amount: String(amountVal),
        success_url: successUrl,
        cancel_url: cancelUrl,
        webhook_url: body.webhook_url || successUrl,
        metadata: body.metadata || { phone: body.cus_phone || "01700000000" }
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
      const trxId = body.transaction_id || body.order_id || body.trx_id;

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
    console.error("Payment API Error:", error);
    return res.status(500).json({ error: error.message || 'Payment Gateway Server Error' });
  }
}
