const axios = require('axios');

// PayDeshi API Credentials
const API_KEY = 'gnXi7etgWNhFyFGZFrOMYyrmnF4A1eGU5SC2QRmUvILOlNc2Ef';
const BASE_URL = 'https://paydeshipay.themedokan.com/api/payment';

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST method is allowed' });
    }

    const action = req.query.action || req.body?.action;

    try {
        // ১. পেমেন্ট লিংক তৈরি করার রিকোয়েস্ট (CREATE PAYMENT)
        if (action === 'create') {
            const { 
                amount, 
                success_url, 
                cancel_url, 
                webhook_url, 
                metadata, 
                order_id, 
                cus_name, 
                cus_email, 
                cus_phone 
            } = req.body;

            if (!amount) {
                return res.status(400).json({ error: 'টাকার পরিমাণ (Amount) দিতে হবে' });
            }

            // PayDeshi এর রিকোয়েস্ট পেলোড ফরম্যাট
            const createPayload = {
                amount: String(amount),
                success_url: success_url || '',
                cancel_url: cancel_url || '',
                webhook_url: webhook_url || success_url || '',
                metadata: {
                    order_id: order_id || '',
                    customer_name: cus_name || '',
                    customer_email: cus_email || '',
                    phone: cus_phone || '01700000000',
                    ...(metadata || {})
                }
            };

            const response = await axios.post(`${BASE_URL}/create`, createPayload, {
                headers: {
                    'API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            // গেটওয়ে থেকে আসা রেসপন্স রিটার্ন
            return res.status(200).json(response.data);
        }

        // ২. পেমেন্ট ভেরিফাই করার রিকোয়েস্ট (VERIFY PAYMENT)
        else if (action === 'verify') {
            const { transaction_id, order_id, payment_id } = req.body;
            const searchId = transaction_id || order_id || payment_id;

            if (!searchId) {
                return res.status(400).json({ error: 'Transaction ID পাওয়া যায়নি' });
            }

            const verifyPayload = {
                transaction_id: searchId,
                payment_id: searchId,
                order_id: searchId
            };

            const response = await axios.post(`${BASE_URL}/verify`, verifyPayload, {
                headers: {
                    'API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                }
            });

            return res.status(200).json(response.data);
        }

        else {
            return res.status(400).json({ error: 'Invalid action. Use action=create or action=verify' });
        }

    } catch (error) {
        console.error('Payment Gateway API Error:', error.response?.data || error.message);
        
        return res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || error.response?.data?.error || error.message || 'পেমেন্ট প্রসেসিংয়ে সমস্যা হয়েছে',
            details: error.response?.data || null
        });
    }
};
