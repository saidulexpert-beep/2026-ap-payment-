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

  const API_KEY = 'GitwFKKVL0RMN4zR12V9inyYcaTaEgBg6riEHkhXR7Q1on1Wpl';
  const BASE_URL = 'https://paydeshipay.themedokan.com/api/payment/create';
  
  const action = req.query.action;

  // Safe body parsing
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
      const orderId = body.order_id || body.transactionId || `ORD_${Date.now()}`;
      const amountVal = parseFloat(body.amount) || 10;
      const successUrl = body.success_url || body.redirect_url;
      const cancelUrl = body.cancel_url || successUrl;

      // DaWebLab / ZinPay এর জন্য সকল প্রয়োজনীয় ফিল্ড
      const payload = {
        api_key: API_KEY,
        apiKey: API_KEY,
        order_id: orderId,
        transaction_id: orderId,
        trx_id: orderId,
        amount: String(amountVal),
        currency: "BDT",
        full_name: body.cus_name || body.full_name || body.metadata?.username || "Telegram User",
        customer_name: body.cus_name || body.full_name || body.metadata?.username || "Telegram User",
        cus_name: body.cus_name || body.full_name || body.metadata?.username || "Telegram User",
        email: body.cus_email || body.email || "user@telegram.app",
        customer_email: body.cus_email || body.email || "user@telegram.app",
        cus_email: body.cus_email || body.email || "user@telegram.app",
        phone: body.cus_phone || body.phone || "01700000000",
        customer_phone: body.cus_phone || body.phone || "01700000000",
        cus_phone: body.cus_phone || body.phone || "01700000000",
        redirect_url: successUrl,
        success_url: successUrl,
        cancel_url: cancelUrl,
        callback_url: successUrl,
        metadata: body.metadata || {}
      };

      const response = await fetch(`${BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'API-KEY': API_KEY,
          'api-key': API_KEY,
          'apiKey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return res.status(200).json(data);

    } else if (action === 'verify') {
      const verifyPayload = {
        api_key: API_KEY,
        apiKey: API_KEY,
        transaction_id: body.transaction_id || body.trx_id || body.order_id,
        order_id: body.transaction_id || body.trx_id || body.order_id,
        ...body
      };

      const response = await fetch(`${BASE_URL}/verify`, {
        method: 'POST',
        headers: {
          'API-KEY': API_KEY,
          'api-key': API_KEY,
          'apiKey': API_KEY,
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(verifyPayload)
      });
      
      const data = await response.json();
      return res.status(200).json(data);

    } else {
      return res.status(400).json({ error: 'Invalid Action. Use ?action=create or ?action=verify' });
    }
  } catch (error) {
    console.error("Payment API Error:", error);
    return res.status(500).json({ error: error.message || 'Payment Gateway Connection Error' });
  }
}
