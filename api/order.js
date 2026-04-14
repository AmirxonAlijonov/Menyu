// Vercel API endpoint for orders
const axios = require('axios');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed', success: false });
    }
    
    // Get Telegram credentials from environment variables
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;
    
    console.log('=== Buyurtma keldi ===');
    console.log('BOT_TOKEN mavjud:', BOT_TOKEN ? 'Ha' : 'Yo\'q');
    console.log('CHAT_ID mavjud:', CHAT_ID ? 'Ha' : 'Yo\'q');
    
    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('❌ BOT_TOKEN yoki CHAT_ID environment variable da yo\'q!');
        // For development, still return success but log error
        return res.status(500).json({ 
            success: false, 
            error: 'Telegram bot sozlamalari topilmadi. Iltimos, .env faylini tekshiring.' 
        });
    }
    
    try {
        const { product, quantity, price, tableNumber, kabinaNumber, tabchaNumber } = req.body;
        
        if (!product || !quantity) {
            return res.status(400).json({ error: 'Mahsulot yoki miqdor kiritilmagan', success: false });
        }
        
        // Prepare location text
        let locationText = '';
        if (tabchaNumber) {
            locationText = `Tabchan raqami: ${tabchaNumber}`;
        } else if (kabinaNumber) {
            locationText = `Kabina raqami: ${kabinaNumber}`;
        } else if (tableNumber) {
            locationText = `Stol raqami: ${tableNumber}`;
        }
        
        const orderText = `📦 *YANGI BUYURTMA*

📦 Mahsulot: ${product}
📊 Miqdor: ${quantity}
💰 Narx: ${price}
${locationText ? locationText + '\n' : ''}
⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;
        
        console.log('Buyurtma tayyor:', orderText);
        
        // Send to Telegram
        try {
            const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const telegramResponse = await axios.post(telegramUrl, {
                chat_id: CHAT_ID,
                text: orderText,
                parse_mode: 'Markdown'
            });
            
            console.log('✅ Telegram ga yuborildi:', telegramResponse.data);
            
            res.json({ success: true, message: 'Buyurtma qabul qilindi va Telegram ga yuborildi!' });
            
        } catch (telegramError) {
            console.error('❌ Telegram xato:', telegramError.response?.data || telegramError.message);
            // Still return success but with warning
            res.json({ 
                success: true, 
                message: 'Buyurtma qabul qilindi, lekin Telegram ga yuborishda xato.',
                telegramError: telegramError.message
            });
        }
        
    } catch (error) {
        console.error('Xato:', error);
        res.status(500).json({ success: false, error: 'Server xatosi' });
    }
};