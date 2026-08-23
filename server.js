/**
 * Telegram Bot Server
 * Restoran menyusi uchun Telegram bot
 * 
 * O'rnatish uchun:
 * 1. Terminalda yozing: npm install
 * 2. Quyidagi o'zgaruvchilarni o'zingizning ma'lumotlaringizga o'zgartiring:
 *    - BOT_TOKEN: @BotFather dan olingan token
 *    - CHAT_ID: Sizning chat ID ngiz
 *    - ADMIN_PASSWORD: Admin panel paroli (ixtiyoriy, default: admin123)
 * 3. Serverni ishga tushiring: node server.js
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

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

// Prevent caching of admin panel (sensitive data, always fresh)
app.use((req, res, next) => {
    if (req.url.startsWith('/admin') || req.url.startsWith('/api/admin')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
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

// ============================================
// MA'LUMOTLARNI YUKLASH (Vercel KV + fayl fallback)
// ============================================
const storage = require('./storage');

let menuData = { categories: {}, items: {} };
let ordersData = [];

// Load data on startup (async)
(async () => {
    try {
        menuData = await storage.loadMenuData();
        console.log('✅ Menu data loaded');
    } catch (e) {
        console.error('❌ Menu load xatosi:', e.message);
    }
    try {
        ordersData = await storage.loadOrdersData();
        console.log('✅ Orders data loaded');
    } catch (e) {
        console.error('❌ Orders load xatosi:', e.message);
    }
})();

// ============================================
// VERCEL SERVERLESS: har bir API so'rovida ma'lumotlarni
// KV/fayldan yangilab olish (instance'lar o'rtasida sinxronlik uchun).
// Admin panelida qilingan o'zgarish darhol asosiy saytda ko'rinishi uchun zarur.
// ============================================
app.use('/api/', async (req, res, next) => {
    try {
        menuData = await storage.loadMenuData();
        ordersData = await storage.loadOrdersData();
    } catch (err) {
        console.error('❌ Ma\'lumotlarni yangilashda xato:', err.message);
    }
    next();
});

// ============================================
// KONFIGURATSIYA
// ============================================

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const CHAT_ID = process.env.CHAT_ID || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Amirxon4111';
const ALLOWED_USERS = process.env.ALLOWED_USERS ? process.env.ALLOWED_USERS.split(',') : [];

// Stateless admin session tokens (Vercel serverless da ulanishlar holatsiz bo'ladi,
// shuning uchun xotira ichidagi Map ishlamaydi. Token HMAC bilan imzolanadi va
// har qanday instansiyada bir xil tekshiriladi).
const SESSION_SECRET = process.env.SESSION_SECRET || 'menyu-admin-default-secret';

function createSessionToken() {
    const payload = { exp: Date.now() + 24 * 60 * 60 * 1000 }; // 24 soat
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    return `${data}.${sig}`;
}

function verifySessionToken(token) {
    if (!token || typeof token !== 'string' || !token.includes('.')) return false;
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (sig !== expected) return false;
    try {
        const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
        return Date.now() <= payload.exp;
    } catch {
        return false;
    }
}

// Environment validation
if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('⚠️ Diqqat: BOT_TOKEN yoki CHAT_ID o\'rnatilmagan!');
    console.warn('   .env faylini yarating yoki Vercel environment variable\'larini sozlang.');
    console.warn('   Qo\'llanma: README.md fayliga qarang.');
} else {
    console.log('✅ Telegram bot konfiguratsiyasi topildi');
}

// ============================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ============================================

function requireAdmin(req, res, next) {
    const sessionId = req.headers.authorization?.replace('Bearer ', '') || req.query.session;
    
    console.log('[requireAdmin] Session ID:', sessionId ? sessionId.substring(0, 10) + '...' : 'null');
    
    if (!verifySessionToken(sessionId)) {
        console.log('[requireAdmin] Session NOT valid');
        return res.status(401).json({ error: 'Ruxsat berilmagan. Iltimos, tizimga kiring.' });
    }
    
    next();
}

// ============================================
// API ROUTES
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

    let totalAmount = 0;

    items.forEach((item, index) => {
        const itemPrice = parsePrice(item.price);
        const itemTotal = itemPrice * item.quantity;
        totalAmount += itemTotal;

        orderText += `${index + 1}. 📦 ${escapeMarkdown(item.product)}\n`;
        orderText += `   📊 Miqdor: ${escapeMarkdown(item.quantity)}\n`;
        orderText += `   💰 Narx: ${escapeMarkdown(item.price)}\n`;
        orderText += `   💵 Jami: ${formatPrice(itemTotal)}\n\n`;
    });

    const serviceFee = Math.round(totalAmount * 0.08);
    const finalTotal = totalAmount + serviceFee;

    orderText += `━━━━━━━━━━━━━━━━━━\n`;
    orderText += `🧾 Mahsulotlar jami: ${formatPrice(totalAmount)}\n`;
    orderText += `📊 Xizmat haqi (8%): ${formatPrice(serviceFee)}\n`;
    orderText += `━━━━━━━━━━━━━━━━━━\n`;
    orderText += `💳 *Jami to'lov: ${formatPrice(finalTotal)}*\n`;
    orderText += `━━━━━━━━━━━━━━━━━━\n`;

    if (locationText) {
        orderText += `${locationText}\n`;
    }

    orderText += `⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;

    console.log('Telegram ga yuborilmoqda...');

    // Buyurtmani saqlash (admin panelga ko'rsatish uchun)
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const newOrder = {
        id: orderId,
        items: items,
        tableNumber: tableNumber || null,
        kabinaNumber: kabinaNumber || null,
        tabchaNumber: tabchaNumber || null,
        address: address || null,
        totalAmount: totalAmount,
        serviceFee: serviceFee,
        finalTotal: finalTotal,
        status: 'pending',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    ordersData.push(newOrder);
    await storage.saveOrdersData(ordersData);
    console.log('✅ Buyurtma saqlandi (admin panel uchun):', orderId);

    try {
        const success = await sendToTelegram(orderText);

        if (success) {
            console.log('Buyurtma muvaffaqiyatli yuborildi');
            res.json({ success: true, message: 'Buyurtma yuborildi!', orderId: orderId });
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
        allowedUsersCount: ALLOWED_USERS.length,
        menuItemsCount: Object.values(menuData.items || {}).flat().length
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

// ============================================
// MENYU API (Public)
// ============================================

// Get full menu
app.get('/api/menu', (req, res) => {
    res.json(menuData);
});

// Get menu by category
app.get('/api/menu/:category', (req, res) => {
    const category = req.params.category;
    if (menuData.items && menuData.items[category]) {
        res.json(menuData.items[category]);
    } else {
        res.status(404).json({ error: 'Kategoriya topilmadi' });
    }
});

// ============================================
// ADMIN AUTHENTICATION API
// ============================================

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
        const sessionId = createSessionToken();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        console.log('✅ Admin login successful');
        res.json({
            success: true,
            session: sessionId,
            expires: expires.toISOString()
        });
    } else {
        console.log('❌ Admin login failed - wrong password');
        res.status(401).json({ error: 'Noto\'g\'ri parol' });
    }
});

// Admin logout
app.post('/api/admin/logout', requireAdmin, (req, res) => {
    // Stateless token: klient tomonida o'chiriladi, serverda saqlash shart emas
    res.json({ success: true });
});

// Check admin session
app.get('/api/admin/check', requireAdmin, (req, res) => {
    res.json({ 
        valid: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
});

// ============================================
// ADMIN MENU CRUD API
// ============================================

// Get all menu items (admin)
app.get('/api/admin/menu', requireAdmin, (req, res) => {
    res.json(menuData);
});

// Get single item by ID
app.get('/api/admin/menu/item/:id', requireAdmin, (req, res) => {
    const itemId = req.params.id;
    let foundItem = null;
    let foundCategory = null;
    
    for (const category in menuData.items) {
        const item = menuData.items[category].find(i => i.id === itemId);
        if (item) {
            foundItem = item;
            foundCategory = category;
            break;
        }
    }
    
    if (foundItem) {
        res.json({ ...foundItem, category: foundCategory });
    } else {
        res.status(404).json({ error: 'Mahsulot topilmadi' });
    }
});

// Create new menu item
app.post('/api/admin/menu', requireAdmin, async (req, res) => {
    const { category, title, description, price, priceValue, image, hasSizes, sizes, hasWeight, baseWeight, pricePerGram, minWeight, available } = req.body;
    
    if (!category || !title || !price) {
        return res.status(400).json({ error: 'Kategoriya, nom va narx majburiy' });
    }
    
    if (!menuData.items[category]) {
        return res.status(400).json({ error: 'Noto\'g\'ri kategoriya' });
    }
    
    const newItem = {
        id: `${category}_${Date.now()}`,
        title,
        description: description || '',
        price,
        priceValue: priceValue || parseInt(price.replace(/[^\d]/g, '')) || 0,
        image: image || '',
        hasSizes: hasSizes || false,
        sizes: sizes || {},
        hasWeight: hasWeight || false,
        baseWeight: baseWeight || 1000,
        pricePerGram: pricePerGram || 0,
        minWeight: minWeight || 300,
        available: available !== false
    };
    
    menuData.items[category].push(newItem);
    await storage.saveMenuData(menuData);
    
    console.log(`✅ New item created: ${title} in ${category}`);
    res.json({ success: true, item: newItem });
});

// Update menu item
app.put('/api/admin/menu/:id', requireAdmin, async (req, res) => {
    const itemId = req.params.id;
    const updates = req.body;
    
    let foundItem = null;
    let foundCategory = null;
    
    for (const category in menuData.items) {
        const index = menuData.items[category].findIndex(i => i.id === itemId);
        if (index !== -1) {
            foundItem = menuData.items[category][index];
            foundCategory = category;
            break;
        }
    }
    
    if (!foundItem) {
        return res.status(404).json({ error: 'Mahsulot topilmadi' });
    }
    
    // Update fields
    const allowedFields = ['title', 'description', 'price', 'priceValue', 'image', 'hasSizes', 'sizes', 'hasWeight', 'baseWeight', 'pricePerGram', 'minWeight', 'available'];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            foundItem[field] = updates[field];
        }
    });
    
    await storage.saveMenuData(menuData);
    
    console.log(`✅ Item updated: ${foundItem.title}`);
    res.json({ success: true, item: foundItem });
});

// Delete menu item
app.delete('/api/admin/menu/:id', requireAdmin, async (req, res) => {
    const itemId = req.params.id;
    
    for (const category in menuData.items) {
        const index = menuData.items[category].findIndex(i => i.id === itemId);
        if (index !== -1) {
            const deleted = menuData.items[category].splice(index, 1)[0];
            await storage.saveMenuData(menuData);
            console.log(`✅ Item deleted: ${deleted.title}`);
            return res.json({ success: true, deleted: deleted.title });
        }
    }
    
    res.status(404).json({ error: 'Mahsulot topilmadi' });
});

// ============================================
// ADMIN CATEGORIES API
// ============================================

// Get all categories
app.get('/api/admin/categories', requireAdmin, (req, res) => {
    res.json(menuData.categories || {});
});

// Create new category
app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    const { id, name, icon } = req.body;
    
    if (!id || !name) {
        return res.status(400).json({ error: 'Kategoriya ID va nomi majburiy' });
    }
    
    if (menuData.categories[id]) {
        return res.status(400).json({ error: 'Bu kategoriya allaqachon mavjud' });
    }
    
    menuData.categories[id] = { name, icon: icon || '🍽️' };
    menuData.items[id] = [];
    await storage.saveMenuData(menuData);
    
    console.log(`✅ Category created: ${name}`);
    res.json({ success: true, category: { id, ...menuData.categories[id] } });
});

// Update category
app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    const categoryId = req.params.id;
    const { name, icon } = req.body;
    
    if (!menuData.categories[categoryId]) {
        return res.status(404).json({ error: 'Kategoriya topilmadi' });
    }
    
    if (name) menuData.categories[categoryId].name = name;
    if (icon) menuData.categories[categoryId].icon = icon;
    
    await storage.saveMenuData(menuData);
    res.json({ success: true, category: menuData.categories[categoryId] });
});

// Delete category
app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    const categoryId = req.params.id;
    
    if (!menuData.categories[categoryId]) {
        return res.status(404).json({ error: 'Kategoriya topilmadi' });
    }
    
    delete menuData.categories[categoryId];
    delete menuData.items[categoryId];
    await storage.saveMenuData(menuData);
    
    console.log(`✅ Category deleted: ${categoryId}`);
    res.json({ success: true });
});

// ============================================
// ADMIN ORDERS API
// ============================================

// Get all orders
app.get('/api/admin/orders', requireAdmin, (req, res) => {
    res.json(ordersData);
});

// Get single order
app.get('/api/admin/orders/:id', requireAdmin, (req, res) => {
    const order = ordersData.find(o => o.id === req.params.id);
    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ error: 'Buyurtma topilmadi' });
    }
});

// Update order status
app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    const { status } = req.body;
    const orderIndex = ordersData.findIndex(o => o.id === req.params.id);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Buyurtma topilmadi' });
    }
    
    ordersData[orderIndex].status = status || ordersData[orderIndex].status;
    ordersData[orderIndex].updatedAt = new Date().toISOString();
    await storage.saveOrdersData(ordersData);
    
    res.json({ success: true, order: ordersData[orderIndex] });
});

// Delete order
app.delete('/api/admin/orders/:id', requireAdmin, async (req, res) => {
    const orderIndex = ordersData.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Buyurtma topilmadi' });
    }

    const deleted = ordersData.splice(orderIndex, 1)[0];
    await storage.saveOrdersData(ordersData);

    console.log(`🗑️ Buyurtma o'chirildi: ${deleted.id}`);
    res.json({ success: true, order: deleted });
});

// ============================================
// TELEGRAM WEBHOOK
// ============================================

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

// ============================================
// STATIK FAYLLAR
// ============================================

// Statik fayllarni serv qilish (API dan KEYIN)
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath, { maxAge: 86400000, etag: true, lastModified: true }));
}
app.use(express.static(__dirname, { maxAge: 86400000, etag: true, lastModified: true }));

// Explicit routes for PWA files (service worker and manifest)
app.get('/sw.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'sw.js'));
});
app.get('/manifest.json', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/manifest+json');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Admin panel routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin.html'));
});

// index.html uchun alohida yo'l
app.get('/', (req, res) => {
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
// TELEGRAM BOT FUNKTSIYALARI
// ============================================

// Menyu matnini yaratish
function createMenuMessage(category) {
    const items = menuData.items[category] || [];
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

// Narxni "20,000 so'm" formatidan son ga o'tkazish
function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = String(priceStr).replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}

// Narxni formatlash: 20000 -> "20,000 so'm"
function formatPrice(amount) {
    return amount.toLocaleString('uz-UZ') + " so'm";
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
// SERVER ISHGA TUSHIRISH
// ============================================

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
        console.log('🔐 Admin panel: http://localhost:' + PORT + '/admin');
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
