// DeshiPay Gateway Credentials (ইনবিল্ট Native Fetch ব্যবহার করা হয়েছে)
const API_KEY = 'gnXi7etgWNhFyFGZFrOMYyrmnF4A1eGU5SC2QRmUvILOlNc2Ef';
const BASE_URL = 'https://paydeshipay.themedokan.com';

module.exports = async (req, res) => {
    // 1. CORS Headers সেটআপ (Telegram WebApp ও সব ডোমেইন থেকে কল করার জন্য)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Preflight Request হ্যান্ডেল করা
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করা হবে
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method Not Allowed. Please use POST.'
        });
    }

    const action = req.query.action || req.body.action;

    try {
        // ==========================================
        // ১. পেমেন্ট তৈরি (CREATE PAYMENT)
        // ==========================================
        if (action === 'create') {
            const { amount, success_url, cancel_url, webhook_url, metadata, order_id } = req.body;

            if (!amount || parseFloat(amount) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'সঠিক টাকার পরিমাণ (Amount) প্রদান করুন।'
                });
            }

            const payload = {
                amount: String(amount),
                order_id: order_id || `DP_${Date.now()}`,
                success_url: success_url,
                cancel_url: cancel_url,
                webhook_url: webhook_url,
                metadata: metadata || {}
            };

            const response = await fetch(`${BASE_URL}/api/payment/create`, {
                method: 'POST',
                headers: {
                    'API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return res.status(response.status).json(data);
        }

        // ==========================================
        // ২. পেমেন্ট যাচাই (VERIFY PAYMENT)
        // ==========================================
        if (action === 'verify') {
            const { transaction_id, order_id, payment_id } = req.body;
            const targetId = transaction_id || order_id || payment_id;

            if (!targetId) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID বা Order ID পাওয়া যায়নি।'
                });
            }

            const payload = {
                transaction_id: targetId,
                order_id: targetId,
                payment_id: targetId
            };

            const response = await fetch(`${BASE_URL}/api/payment/verify`, {
                method: 'POST',
                headers: {
                    'API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return res.status(response.status).json(data);
        }

        // ==========================================
        // ৩. ওয়েবহুক / IPN (প্রয়োজন হলে)
        // ==========================================
        if (action === 'webhook') {
            console.log('DeshiPay Webhook Received:', req.body);
            return res.status(200).json({ success: true, message: 'Webhook received' });
        }

        return res.status(400).json({
            success: false,
            message: 'Invalid action. Use action=create or action=verify'
        });

    } catch (error) {
        console.error('DeshiPay Fetch Error:', error.message);
        return res.status(500).json({
            success: false,
            message: error.message || 'Payment server connection failed'
        });
    }
};
