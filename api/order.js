/**
 * Vercel API Route - Buyurtma yuborish
 * Bu fayl Vercel'da /api/order marshruti sifatida ishlaydi
 */

require('dotenv').config();

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed', success: false });
    }

    console.log('=== Buyurtma keldi ===');
    console.log('Body:', req.body);

    const axios = require('axios');

    // Foydalanuvchi muhiti o'zgaruvchilari
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    // Validate credentials
    if (!BOT_TOKEN || !CHAT_ID) {
        console.log('Xato: BOT_TOKEN yoki CHAT_ID o\'rnatilmagan');
        return res.status(500).json({ error: 'Bot konfiguratsiyasi topilmadi', success: false });
    }

    const { product, quantity, price, tableNumber, kabinaNumber, tabchaNumber } = req.body;

    if (!product || !quantity) {
        console.log('Xato: Mahsulot yoki miqdor kiritilmagan');
        return res.status(400).json({ error: 'Mahsulot yoki miqdor kiritilmagan', success: false });
    }
    
    if (!customerName || !customerPhone) {
        console.log('Xato: Mijoz ma\'lumotlari kiritilmagan');
        return res.status(400).json({ error: 'Ism va telefon raqami kiritilishi shart', success: false });
    }

    // Server-side validation for tableNumber and kabinaNumber
    if (tableNumber && (isNaN(tableNumber) || tableNumber < 1 || tableNumber > 16)) {
        console.log('Xato: Stol raqami noto\'g\'ri');
        return res.status(400).json({ error: 'Stol raqami 1 dan 16 gacha bo\'lishi kerak', success: false });
    }

    if (kabinaNumber && (isNaN(kabinaNumber) || kabinaNumber < 1 || kabinaNumber > 3)) {
        console.log('Xato: Kabina raqami noto\'g\'ri');
        return res.status(400).json({ error: 'Kabina raqami 1 dan 3 gacha bo\'lishi kerak', success: false });
    }

    // Tabcha raqamini tekshirish - maximum 3 ta tabcha
    if (tabchaNumber && (isNaN(tabchaNumber) || tabchaNumber < 1 || tabchaNumber > 3)) {
        console.log('Xato: Tabcha raqami noto\'g\'ri');
        return res.status(400).json({ error: 'Tabcha raqami 1 dan 3 gacha bo\'lishi kerak', success: false });
    }

    // Escape Markdown special characters to prevent XSS
    // FIXED: To'g'ri capture group ishlatiladi
    function escapeMarkdown(str) {
        if (!str) return '';
        return String(str).replace(/([-_*`\[\]()~`>#+\|={}.!])/g, '\\$1');
    }

    // Bildirishnoma ovozini sozlash uchun qo'llanma:
    // Telegram Bot API standart ovozdan boshqa ovoz yubora olmaydi.
    // Lekin quyidagi usullardan birini ishlatishingiz mumkin:
    // 1. Botni guruhga qo'shing va guruhda maxsus ovoz o'rnating
    // 2. Telegram'da botning bildirishnoma ovozini o'zingiz o'zgartiring:
    //    - Botga kiring
    //    - Profil -> Bildirishnomalar va ovozlar -> Ovozni o'zgartirish

    // Joylashuv matnini tayyorlash
    let locationText = '';
    if (tabchaNumber) {
        locationText = `🛏️ Tabchan raqami: ${escapeMarkdown(String(tabchaNumber))}`;
    } else if (kabinaNumber) {
        locationText = `🚪 Kabina raqami: ${escapeMarkdown(String(kabinaNumber))}`;
    } else if (tableNumber) {
        locationText = `🪑 Stol raqami: ${escapeMarkdown(String(tableNumber))}`;
    }

    const orderText = `📦 *YANGI BUYURTMA*\n\n📦 Mahsulot: ${escapeMarkdown(product)}\n📊 Miqdor: ${escapeMarkdown(String(quantity))}\n💰 Narx: ${escapeMarkdown(price)}\n${locationText ? locationText + '\n' : ''}\n⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;

    console.log('Telegram ga yuborilmoqda...');

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: orderText,
            parse_mode: 'Markdown'
        });

        console.log('Buyurtma muvaffaqiyatli yuborildi');
        res.json({ success: true, message: 'Buyurtma yuborildi!' });
    } catch (error) {
        console.error('❌ Telegram xato:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: 'Telegram ga yuborishda xatolik' });
    }
};