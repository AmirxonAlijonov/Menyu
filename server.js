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
app.use(cors());
app.use(express.json());

// CORS headers for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Statik fayllarni serv qilish (barcha fayllar uchun)
// 1. Root papka (index.html, index.js, CSS)
app.use(express.static(__dirname));

// 2. PWA fayllar uchun MIME type
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

// 2. Agar public papkasi bo'lsa, u ham qo'shimcha
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
}

// index.html uchun alohida yo'l
app.get('/', (req, res) => {
    // Avval public papkasidan, keyin root dan izlash
    const publicIndexPath = path.join(publicPath, 'index.html');
    fs.access(publicIndexPath, fs.constants.F_OK, (err) => {
        if (!err) {
            res.sendFile(publicIndexPath);
        } else {
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

// ============================================
// KONFIGURATSIYA - BU YERDA O'ZGARTIRING!
// ============================================
// Foydalanuvchi muhiti o'zgaruvchilardan foydalaning yoki default qiymatlarni o'rnating
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHAT_ID = process.env.CHAT_ID || '';

// Ruxsat etilgan foydalanuvchilar ro'yxati (faqat bu foydalanuvchilar botdan foydalanishi mumkin)
// O'zingizning chat ID ngizni bu yerga qo'shing
const ALLOWED_USERS = process.env.ALLOWED_USERS ? process.env.ALLOWED_USERS.split(',') : [];

if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('⚠️ Diqqat: BOT_TOKEN yoki CHAT_ID o\'rnatilmagan!');
    console.warn('   .env faylini yarating yoki server.js da qiymatlarni o\'rnating');
}

// Ovqatlar ma'lumotlari - index.js bilan mos
const foodData = {
    salads: [
        { title: "Chiroqchi Salati", description: "Yangi sabzavotlar, pyuresi, tuxum va maxsus french sousi bilan.", price: "20,000 so'm" },
        { title: "Sezer Salati", description: "Romsalat, parmesan, croutons va caesar sousi bilan.", price: "30,000 so'm" },
        { title: "Svejiy Salat", description: "Yangi sabzavotlar: pomidor, bodring, ko'katlar va zaytun moyi.", price: "15,000 so'm" },
        { title: "Achchiq Chuchuk Salat", description: "Achchiq va shirin ta'mli salad: qizilmiya, cho'chqa, pomidor va maxsus sous.", price: "15,000 so'm" }
    ],
    mains: [
        { title: "Jiz", description: "Mol go'shtidan tayyorlangan mazali taom. Qiyma go'sht, piyoz va maxsus ziravorlar bilan.", price: "250,000 so'm" },
        { title: "Tabaka", description: "Butun tovuqni yog'da press bilan bosib tayyorlangan shirali va mazali taom.", price: "60,000 so'm" },
        { title: "Vag'ori", description: "An'anaviy oshpazlik usulida tayyorlangan mazali Vag'ori taomi. Go'sht va sabzavotlar bilan pishiriladi.", price: "250,000 so'm" },
        { title: "KFS", description: "Maxsus marinadlangan qovurilgan tovuq va qovurilgan kartoshka (fri) bilan. KFS - mashhur fast food taomi.", price: "80,000 so'm" },
        { title: "Barbekyu", description: "Go'shtni maxsus barbekyu sousi bilan grillda pishirilgan mazali taom.", price: "250,000 so'm" },
        { title: "Baliq", description: "Yangi baliqni yog'da qovurilgan holda tayyorlangan mazali taom. KFS uslubida yog'da qovurilgan.", price: "180,000 so'm" },
        { title: "Mol Go'shti Shashlik", description: "Maxsus marinadlangan mol go'shtidan tayyorlangan shirali shashlik. Uzun vaqt davomida kokilarda pishiriladi va ajoyib ta'mga ega bo'ladi.", price: "110,000 so'm" },
        { title: "Manti", description: "Go'sht va sabzavotlar bilan tayyorlangan an'anaviy O'zbek taomi. Bug'da pishiriladi.", price: "7,000 so'm" },
        { title: "Tandir Somsa", description: "Tandirda pishirilgan go'shtli an'anaviy somsa.", price: "15,000 so'm" },
        { title: "Mastava", description: "Guruch, go'sht va sabzavotlar bilan tayyorlangan an'anaviy O'zbek sho'rvasi.", price: "35,000 so'm" },
        { title: "Qaynatma Sho'rva", description: "Go'shtni uzoq vaqt davomida qaynatib tayyorlangan to'qimali sho'rva.", price: "35,000 so'm" },
        { title: "Grechka", description: "Grechka yoki sovuq - go'sht va sabzavotlar bilan tayyorlangan mazali taom.", price: "35,000 so'm" },
        { title: "Ko'za Sho'rva", description: "Ko'zada tayyorlangan go'sht va sabzavotli an'anaviy sho'rva.", price: "70,000 so'm" },
        { title: "Tushonka Sho'rva", description: "Tushonka go'shtidan tayyorlangan mazali va to'qimali sho'rva. An'anaviy usulda pishiriladi.", price: "35,000 so'm" }
    ],
    drinks: [
        { title: "Coca Cola", description: "Gazli ichimlik 1.5l hajmda. Sovuq va tetiklashtiruvchi ichimlik.", price: "17,000 so'm" },
        { title: "Yashil Choy", description: "Issiq yashil choy limon va asal bilan. Bu ichimlik sog'liq uchun juda foydali va tetiklashtiradi.", price: "2,000 so'm" },
        { title: "Fanta", description: "Gazli apelsinli ichimlik 1.5l hajmda. Mashhur va tetiklashtiruvchi ichimlik.", price: "17,000 so'm" },
        { title: "Pepsi", description: "Gazli ichimlik 1.5l hajmda. Mashhur va tetiklashtiruvchi ichimlik.", price: "17,000 so'm" },
        { title: "Qora Choy", description: "Issiq qora choy suty bilan. An'anaviy ichimlik.", price: "5,000 so'm" },
        { title: "Limon Choy", description: "Maxsus tayyorlangan limonli choy - yangi limon va choy bilan tayyorlangan.", price: "20,000 so'm" },
        { title: "Sok", description: "Tabiiy meva sharbati - aralash mevalar.", price: "20,000 so'm" },
        { title: "Sprite", description: "Gazli limonato ichimlik 1.5l hajmda. Sovuq va tetiklashtiruvchi ichimlik.", price: "17,000 so'm" }
    ]
};

// ============================================
// TELEGRAM BOT FUNKTSIYALARI
// ============================================

// Menyu matnini yaratish
function createMenuMessage(category) {
    const items = foodData[category];
    let message = `🍽️ *${getCategoryName(category)}*\n\n`;
    
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
    try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log('✅ Telegram ga xabar yuborildi');
        return true;
    } catch (error) {
        console.error('❌ Telegram xato:', error.response?.data || error.message);
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
    
    const { product, quantity, price, tableNumber, kabinaNumber, tabchaNumber } = req.body;
    
    if (!product || !quantity) {
        console.log('Xato: Mahsulot yoki miqdor kiritilmagan');
        return res.status(400).json({ error: 'Mahsulot yoki miqdor kiritilmagan', success: false });
    }
    
    // Joylashuv matnini tayyorlash
    let locationText = '';
    if (tabchaNumber) {
        locationText = `🛏️ Tabchan raqami: ${escapeMarkdown(tabchaNumber)}`;
    } else if (kabinaNumber) {
        locationText = `🚪 Kabina raqami: ${escapeMarkdown(kabinaNumber)}`;
    } else if (tableNumber) {
        locationText = `🪑 Stol raqami: ${escapeMarkdown(tableNumber)}`;
    }
    
    const orderText = `📦 *YANGI BUYURTMA*\n\n📦 Mahsulot: ${escapeMarkdown(product)}\n📊 Miqdor: ${escapeMarkdown(quantity)}\n💰 Narx: ${escapeMarkdown(price)}\n${locationText ? locationText + '\n' : ''}\n⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;
    
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
        return res.json({ success: false, error: 'Bot konfiguratsiyasi topilmadi' });
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('==========================================');
    console.log('🚀 Server ishga tushdi: http://localhost:' + PORT);
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
