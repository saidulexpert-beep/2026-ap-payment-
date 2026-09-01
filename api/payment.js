export default {
  async fetch(request, env, ctx) {
    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH, DELETE, PUT',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, api-key, API-KEY, Authorization',
    };

    // Preflight Request (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const API_KEY = 'khla1gg0zp2wEHkCzr5j1O8gQpwNyA1Wd7W0Mwck11i5QgnCK5';
    const BASE_URL = 'https://secure-pay.nagorikpay.com/api/payment';

    // URL parameters & query parsing
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    // Body parsing
    let body = {};
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        body = await request.json();
      } catch (e) {
        body = {};
      }
    }

    try {
      // ১. পেমেন্ট তৈরি (Create Payment)
      if (action === 'create') {
        const amountVal = String(parseInt(body.amount, 10) || 10);
        const siteUrl = `${url.protocol}//${url.host}`;

        let successUrl = body.success_url || `${siteUrl}?status=success`;
        let cancelUrl = body.cancel_url || `${siteUrl}?status=cancel`;
        let webhookUrl = body.webhook_url || `${siteUrl}?status=webhook`;

        const payload = {
          amount: amountVal,
          success_url: successUrl,
          cancel_url: cancelUrl,
          webhook_url: webhookUrl,
          metadata: {
            phone: (body.metadata && body.metadata.phone) ? String(body.metadata.phone) : "01700000000"
          }
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

        const rawText = await response.text();
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (err) {
          data = { message: rawText };
        }

        return new Response(JSON.stringify(data), {
          status: response.status || 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      // ২. পেমেন্ট ভেরিফিকেশন (Verify Payment)
      } else if (action === 'verify') {
        const trxId = body.transaction_id || body.trx_id || body.order_id;

        if (!trxId) {
          return new Response(JSON.stringify({ 
            status: 'ERROR', 
            message: 'Transaction ID is required' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const response = await fetch(`${BASE_URL}/verify`, {
          method: 'POST',
          headers: {
            'API-KEY': API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ transaction_id: String(trxId).trim() })
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status || 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } else {
        return new Response(JSON.stringify({ error: 'Invalid Action. Use ?action=create or ?action=verify' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message || 'Server Connection Failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
