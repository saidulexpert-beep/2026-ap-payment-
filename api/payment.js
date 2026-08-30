const axios = require('axios');

export default async function handler(req, res) {
    const { action } = req.query;

    if (action === 'create') {
        try {
            const { amount, success_url, cancel_url, webhook_url, metadata } = req.body;

            const data = JSON.stringify({
                success_url,
                cancel_url,
                webhook_url,
                metadata,
                amount
            });

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://secure-pay.nagorikpay.com/api/payment/create',
                headers: { 
                    'API-KEY': 'gnXi7etgWNhFyFGZFrOMYyrmnF4A1eGU5SC2QRmUvILOlNc2Ef', 
                    'Content-Type': 'application/json'
                },
                data: data
            };

            const response = await axios.request(config);
            return res.status(200).json(response.data);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}
