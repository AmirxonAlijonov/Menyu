/**
 * Telegram Bot Server
 * Restoran menyusi uchun Telegram bot
 * 
 * O'rnatish uchun:
 * 1. Terminalda yozing: npm install
 * 2. Quyidagi o'zgaruvchilarni o'zingizning ma'lumotlaringizga o'zgartiring:
 *    - BOT_TOKEN: @BotFather dan olingan token
 *    - CHAT_ID: Sizning chat ID ngiz
 * 3. Serverni ishga tushiring: node server.js
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Request logging middleware (helps debug Vercel issues)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);
    next();
});

// Security headers (must be first)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data:; img-src 'self' https: data:; connect-src 'self' https:;");
    next();
});

// CORS
app.use(cors());
app.use(express.json());

// CORS headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// MIME type middleware for PWA files
app.use((req, res, next) => {
    if (req.url.endsWith('.webmanifest')) {
        res.setHeader('Content-Type', 'application/manifest+json');
    } else if (req.url.endsWith('.js') && !req.url.includes('node_modules')) {
        res.setHeader('Content-Type', 'application/javascript');
    } else if (req.url.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
    }
    next();
});

// API routes (must be before static file serving)
app.get('/api/menu', (req, res) => {
    res.json(foodData);
});

// ============================================
// API ENDPOINTS
// ============================================

// Buyurtma yuborish API
app.post('/api/order', async (req, res) => {
    console.log('=== Buyurtma keldi ===');
    console.log('Body:', req.body);

    // Check bot configuration first
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('⚠️ BOT_TOKEN yoki CHAT_ID o\'rnatilmagan! Buyurtma qabul qilinmadi.');
        return res.status(503).json({
            success: false,
            error: 'Xizmat vaqtincha mavjud emas. Telegram bot konfiguratsiyasi topilmadi.',
            code: 'BOT_NOT_CONFIGURED'
        });
    }

    const { items, tableNumber, kabinaNumber, tabchaNumber, address } = req.body;

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
        console.log('Xato: Mahsulotlar kiritilmagan');
        return res.status(400).json({ error: 'Mahsulotlar kiritilmagan', success: false });
    }

    // Validate each item
    for (const item of items) {
        if (!item.product || !item.quantity) {
            console.log('Xato: Mahsulot yoki miqdor kiritilmagan');
            return res.status(400).json({ error: 'Mahsulot yoki miqdor kiritilmagan', success: false });
        }
    }

    // Joylashuv matnini tayyorlash
    let locationText = '';
    if (tabchaNumber) {
        locationText = `🛏️ Tabchan raqami: ${escapeMarkdown(tabchaNumber)}`;
    } else if (kabinaNumber) {
        locationText = `🚪 Kabina raqami: ${escapeMarkdown(kabinaNumber)}`;
    } else if (tableNumber) {
        locationText = `🪑 Stol raqami: ${escapeMarkdown(tableNumber)}`;
    } else if (address) {
        locationText = `📍 Manzil: ${escapeMarkdown(address)}`;
    }

    // Build order text with all items
    let orderText = `📦 *YANGI BUYURTMA*\n\n`;

    items.forEach((item, index) => {
        orderText += `${index + 1}. 📦 ${escapeMarkdown(item.product)}\n`;
        orderText += `   📊 Miqdor: ${escapeMarkdown(item.quantity)}\n`;
        orderText += `   💰 Narx: ${escapeMarkdown(item.price)}\n\n`;
    });

    if (locationText) {
        orderText += `${locationText}\n`;
    }

    orderText += `⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;

    console.log('Telegram ga yuborilmoqda...');

    try {
        const success = await sendToTelegram(orderText);

        if (success) {
            console.log('Buyurtma muvaffaqiyatli yuborildi');
            res.json({ success: true, message: 'Buyurtma yuborildi!' });
        } else {
            console.log('Telegram ga yuborish muvaffaqiyatsiz');
            res.status(500).json({ success: false, error: 'Telegram ga yuborishda xatolik' });
        }
    } catch (error) {
        console.error('Xato:', error);
        res.status(500).json({ success: false, error: 'Server xatosi' });
    }
});

// Telegram webhook (ixtiyoriy)
app.post('/webhook', async (req, res) => {
    const message = req.body.message;

    if (!message || !message.text) {
        return res.send('OK');
    }

    const text = message.text;
    const chatId = message.chat.id;
    const userId = message.from.id;

    // Foydalanuvchi ruxsatini tekshirish
    if (!isUserAllowed(userId)) {
        console.log(`❌ Ruxsatsiz foydalanuvchi kirishga urindi: ${userId}`);
        return res.send('OK');
    }

    let response = '';

    switch (text) {
        case '/menu':
        case '/start':
            response = `🍽️ *Restoran Menyu*\n\nQuyidagilardan birini tanlang:\n\n` +
                `🥗 /salads - Salatlar\n` +
                `🍖 /mains - Asosiy Taomlar\n` +
                `🥤 /drinks - Ichimliklar\n` +
                `🍰 /deserts - Desertlar\n\n` +
                `🛒 /order - Buyurtma berish`;
            break;

        case '/salads':
            response = createMenuMessage('salads');
            break;

        case '/mains':
            response = createMenuMessage('mains');
            break;

        case '/drinks':
            response = createMenuMessage('drinks');
            break;

        case '/deserts':
            response = createMenuMessage('deserts');
            break;

        case '/order':
            response = `🛒 *Buyurtma berish*\n\nBuyurtmangizni yozing va yuboring!\n\n` +
                `Misol: \n"2 ta jiz, 1 ta cola"`;
            break;

        default:
            if (text.length > 5) {
                await sendToTelegram(`📝 Xabar: ${text}`);
                response = `✅ Xabaringiz qabul qilindi!\n\nRahmat! 🍴`;
            } else {
                response = `❌ Noma'lum buyruq.\n\n` +
                    `/menu - Menyuni ko'rish\n` +
                    `/order - Buyurtma berish`;
            }
    }

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: response,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error('Xato:', error.message);
    }

    res.send('OK');
});

// Offline buyurtma xabar endpointi
app.post('/api/notify-offline', async (req, res) => {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('⚠️ BOT_TOKEN yoki CHAT_ID o\'rnatilmagan! Offline buyurtma yuborilmadi.');
        return res.status(503).json({
            success: false,
            error: 'Xizmat vaqtincha mavjud emas. Telegram bot konfiguratsiyasi topilmadi.',
            code: 'BOT_NOT_CONFIGURED'
        });
    }

    const { product, quantity, price, tableNumber, kabinaNumber, tabchaNumber } = req.body;
    const timestamp = new Date().toLocaleString('uz-UZ');

    let locationText = '';
    if (tabchaNumber) {
        locationText = `🛏️ Tabchan: ${tabchaNumber}`;
    } else if (kabinaNumber) {
        locationText = `🚪 Kabina: ${kabinaNumber}`;
    } else if (tableNumber) {
        locationText = `🪑 Stol: ${tableNumber}`;
    }

    const message = `📦 *YANGI BUYURTMA (OFFLINE)*\n\n` +
        `📦 Mahsulot: ${product}\n` +
        `📊 Miqdor: ${quantity}\n` +
        `💰 Narx: ${price}\n` +
        `${locationText ? locationText + '\n' : ''}` +
        `⏰ Vaqt: ${timestamp}\n\nTEST_OUTPUT_LINE\n\n`;

    items.forEach((item, index) => {
        message += `${index + 1}. *${item.title}*\n`;
        message += `   ${item.description}\n`;
        message += `   💰 Narx: ${item.price}\n\n`;
    });

    return message;
}

// Kategoriya nomini olish
function getCategoryName(category) {
    const names = {
        salads: "🥗 Salatlar",
        mains: "🍖 Asosiy Taomlar",
        drinks: "🥤 Ichimliklar",
        deserts: "🍰 Desertlar"
    };
    return names[category] || category;
}

// Escape Markdown special characters to prevent XSS
function escapeMarkdown(str) {
    if (!str) return '';
    return String(str).replace(/([-_*`\[\]()~`>#+\|={}.!])/g, '\\$1');
}

// Telegram ga xabar yuborish
async function sendToTelegram(message, chatId = CHAT_ID) {
    console.log('=== Telegram ga yuborish boshlandi ===');
    console.log('BOT_TOKEN mavjud:', BOT_TOKEN ? 'Ha' : 'Yo\'q');
    console.log('CHAT_ID:', CHAT_ID);
    console.log('Xabar:', message.substring(0, 100));

    if (!BOT_TOKEN || !CHAT_ID) {
        console.error('❌ BOT_TOKEN yoki CHAT_ID yo\'q!');
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        console.log('URL:', url.replace(BOT_TOKEN, '***HIDDEN***'));

        const response = await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });

        console.log('✅ Telegram ga xabar yuborildi:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Telegram xato:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        return false;
    }
}

// Foydalanuvchi ruxsatini tekshirish
function isUserAllowed(userId) {
    // Agar ALLOWED_USERS bo'sh bo'lsa, hamma foydalanuvchilarga ruxsat beriladi (developement uchun)
    if (ALLOWED_USERS.length === 0) {
        return true;
    }
    return ALLOWED_USERS.includes(userId.toString());
}

// ============================================
// API ENDPOINTS
// ============================================

// Buyurtma yuborish API
app.post('/api/order', async (req, res) => {
    console.log('=== Buyurtma keldi ===');
    console.log('Body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('Items:', req.body?.items);
    console.log('Items type:', typeof req.body?.items);
    if (req.body?.items) {
        console.log('Items length:', req.body.items.length);
        console.log('First item:', req.body.items[0]);
    }

    // Check bot configuration first
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('⚠️ BOT_TOKEN yoki CHAT_ID o\'rnatilmagan! Buyurtma qabul qilinmadi.');
        return res.status(503).json({ 
            success: false, 
            error: 'Xizmat vaqtincha mavjud emas. Telegram bot konfiguratsiyasi topilmadi.',
            code: 'BOT_NOT_CONFIGURED'
        });
    }

    const { items, tableNumber, kabinaNumber, tabchaNumber, address } = req.body;

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
        console.log('Xato: Mahsulotlar kiritilmagan');
        return res.status(400).json({ error: 'Mahsulotlar kiritilmagan', success: false });
    }

    // Validate each item
    for (const item of items) {
        if (!item.product || !item.quantity) {
            console.log('Xato: Mahsulot yoki miqdor kiritilmagan');
            return res.status(400).json({ error: 'Mahsulot yoki miqdor kiritilmagan', success: false });
        }
    }

    // Joylashuv matnini tayyorlash
    let locationText = '';
    if (tabchaNumber) {
        locationText = `🛏️ Tabchan raqami: ${escapeMarkdown(tabchaNumber)}`;
    } else if (kabinaNumber) {
        locationText = `🚪 Kabina raqami: ${escapeMarkdown(kabinaNumber)}`;
    } else if (tableNumber) {
        locationText = `🪑 Stol raqami: ${escapeMarkdown(tableNumber)}`;
    } else if (address) {
        locationText = `📍 Manzil: ${escapeMarkdown(address)}`;
    }

    // Build order text with all items
    let orderText = `📦 *YANGI BUYURTMA*\n\n`;

    items.forEach((item, index) => {
        orderText += `${index + 1}. 📦 ${escapeMarkdown(item.product)}\n`;
        orderText += `   📊 Miqdor: ${escapeMarkdown(item.quantity)}\n`;
        orderText += `   💰 Narx: ${escapeMarkdown(item.price)}\n\n`;
    });

    if (locationText) {
        orderText += `${locationText}\n`;
    }

    orderText += `⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;

    console.log('Telegram ga yuborilmoqda...');

    try {
        const success = await sendToTelegram(orderText);

        if (success) {
            console.log('Buyurtma muvaffaqiyatli yuborildi');
            res.json({ success: true, message: 'Buyurtma yuborildi!' });
        } else {
            console.log('Telegram ga yuborish muvaffaqiyatsiz');
            res.status(500).json({ success: false, error: 'Telegram ga yuborishda xatolik' });
        }
    } catch (error) {
        console.error('Xato:', error);
        res.status(500).json({ success: false, error: 'Server xatosi' });
    }
});

// Health check endpoint (for debugging Vercel deployment)
app.get('/api/health', (req, res) => {
    console.log('🔍 Health check requested from:', req.ip || req.connection.remoteAddress);
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        botConfigured: !!(BOT_TOKEN && CHAT_ID),
        environment: process.env.NODE_ENV || 'development',
        nodeEnv: process.env.NODE_ENV,
        hasBotToken: !!BOT_TOKEN,
        hasChatId: !!CHAT_ID,
        allowedUsersCount: ALLOWED_USERS.length
    };
    res.json(health);
});

// Debug endpoint - shows configuration status (no secrets)
app.get('/api/debug', (req, res) => {
    console.log('🐛 Debug endpoint accessed');
    const debug = {
        env: {
            NODE_ENV: process.env.NODE_ENV || 'not set',
            PORT: process.env.PORT || 'not set',
            BOT_TOKEN_SET: !!BOT_TOKEN,
            CHAT_ID_SET: !!CHAT_ID,
            ALLOWED_USERS_COUNT: ALLOWED_USERS.length
        },
        server: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            platform: process.platform
        }
    };
    res.json(debug);
});

// Menyu olish API
app.get('/api/menu', (req, res) => {
    res.json(foodData);
});

// Telegram webhook (ixtiyoriy)
app.post('/webhook', async (req, res) => {
    const message = req.body.message;

    if (!message || !message.text) {
        return res.send('OK');
    }

    const text = message.text;
    const chatId = message.chat.id;
    const userId = message.from.id;

    // Foydalanuvchi ruxsatini tekshirish
    if (!isUserAllowed(userId)) {
        console.log(`❌ Ruxsatsiz foydalanuvchi kirishga urindi: ${userId}`);
        return res.send('OK');
    }

    let response = '';

    switch (text) {
        case '/menu':
        case '/start':
            response = `🍽️ *Restoran Menyu*\n\nQuyidagilardan birini tanlang:\n\n` +
                `🥗 /salads - Salatlar\n` +
                `🍖 /mains - Asosiy Taomlar\n` +
                `🥤 /drinks - Ichimliklar\n` +
                `🍰 /deserts - Desertlar\n\n` +
                `🛒 /order - Buyurtma berish`;
            break;

        case '/salads':
            response = createMenuMessage('salads');
            break;

        case '/mains':
            response = createMenuMessage('mains');
            break;

        case '/drinks':
            response = createMenuMessage('drinks');
            break;

        case '/deserts':
            response = createMenuMessage('deserts');
            break;

        case '/order':
            response = `🛒 *Buyurtma berish*\n\nBuyurtmangizni yozing va yuboring!\n\n` +
                `Misol: \n"2 ta jiz, 1 ta cola"`;
            break;

        default:
            if (text.length > 5) {
                await sendToTelegram(`📝 Xabar: ${text}`);
                response = `✅ Xabaringiz qabul qilindi!\n\nRahmat! 🍴`;
            } else {
                response = `❌ Noma'lum buyruq.\n\n` +
                    `/menu - Menyuni ko'rish\n` +
                    `/order - Buyurtma berish`;
            }
    }

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: response,
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error('Xato:', error.message);
    }

    res.send('OK');
});

// Offline buyurtma xabar endpointi - sayt offline rejimda buyurtma qilinganda telegram botga xabar yuboradi
app.post('/api/notify-offline', async (req, res) => {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('⚠️ BOT_TOKEN yoki CHAT_ID o\'rnatilmagan! Offline buyurtma yuborilmadi.');
        return res.status(503).json({ 
            success: false, 
            error: 'Xizmat vaqtincha mavjud emas. Telegram bot konfiguratsiyasi topilmadi.',
            code: 'BOT_NOT_CONFIGURED'
        });
    }

    const { product, quantity, price, tableNumber, kabinaNumber, tabchaNumber } = req.body;
    const timestamp = new Date().toLocaleString('uz-UZ');

    // Joylashuv matnini tayyorlash
    let locationText = '';
    if (tabchaNumber) {
        locationText = `🛏️ Tabchan: ${tabchaNumber}`;
    } else if (kabinaNumber) {
        locationText = `🚪 Kabina: ${kabinaNumber}`;
    } else if (tableNumber) {
        locationText = `🪑 Stol: ${tableNumber}`;
    }

    const message = `📦 *YANGI BUYURTMA (OFFLINE)*\n\n` +
        `📦 Mahsulot: ${product}\n` +
        `📊 Miqdor: ${quantity}\n` +
        `💰 Narx: ${price}\n` +
        `${locationText ? locationText + '\n' : ''}` +
        `⏰ Vaqt: ${timestamp}\n\n` +
        `_Al-safar Restoran Menyusi_`;

    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log('📱 Offline buyurtma xabari yuborildi:', product);
        res.json({ success: true });
    } catch (error) {
        console.error('Offline buyurtma xabar xatosi:', error.message);
        res.json({ success: false, error: error.message });
    }
});

// Server ishga tushirish
const PORT = process.env.PORT || 3001; // Default port 3001 to avoid conflict
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0'; // Barcha tarmoqlar uchun

// Local IP ni olish funksiyasi
function getLocalIP() {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Export the app for Vercel
module.exports = app;

// Only start the server if running directly
if (require.main === module) {
    app.listen(PORT, HOSTNAME, () => {
        console.log('==========================================');
        console.log('🚀 Server ishga tushdi: http://localhost:' + PORT);
        console.log('🌐 Tarmoq uchun: http://' + getLocalIP() + ':' + PORT);
        console.log('📱 Telegram bot ishga tushirilmoqda...');
        console.log('==========================================');

        // Bot ishga tushganligini tekshirish
        if (BOT_TOKEN && CHAT_ID) {
            axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`)
                .then(response => {
                    console.log('✅ Bot muvaffaqiyatli ulandi!');
                    console.log('Bot nomi:', response.data.result.first_name);
                    console.log('Bot username:', '@' + response.data.result.username);
                })
                .catch(error => {
                    console.error('❌ Bot ulanishda xato:', error.message);
                });

            // Chat ID ni tekshirish
            axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHAT_ID}`)
                .then(response => {
                    console.log('✅ Chat ma\'lumotlari olish muvaffaqiyatli!');
                    console.log('Chat nomi:', response.data.result.first_name || response.data.result.title);
                })
                .catch(error => {
                    console.error('⚠️ Chat ID xato yoki bot bu chatda emas:', error.message);
                });
        }
    });
}

