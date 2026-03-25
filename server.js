/**
 * Telegram Bot Server
 * Restoran menyusi uchun Telegram bot
 * 
 * O'rnatish uchun:
 * 1. Terminalda yozing: npm install express axios
 * 2. Quyidagi o'zgaruvchilarni o'zingizning ma'lumotlaringizga o'zgartiring:
 *    - BOT_TOKEN: @BotFather dan olingan token
 *    - CHAT_ID: Sizning chat ID ngiz
 */

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// ============================================
// KONFIGURATSIYA - BU YERDA O'ZGARTIRING!
// ============================================
const BOT_TOKEN = '8658618667:AAHiS_SKKpj6z6Y78nGf0zd456PBfa79Mbo'; // @BotFather dan olingan token
const CHAT_ID = '5968349865';     // Sizning chat ID ngiz

// Ovqatlar ma'lumotlari
const foodData = {
    salads: [
        { title: "Chiroqchi Salati", description: "Yangi sabzavotlar, pyuresi, tuxum va maxsus french sousi bilan.", price: "35,000 so'm" },
        { title: "Sezer Salati", description: "Romsalat, parmesan, croutons va caesar sousi bilan.", price: "35,000 so'm" },
        { title: "Svejiy Salat", description: "Yangi sabzavotlar: pomidor, bodring, ko'katlar va zaytun moyi.", price: "35,000 so'm" },
        { title: "Achchiq Chuchuk Salat", description: "Achchiq va shirin ta'mli salad: qizilmiya, cho'chqa, pomidor va maxsus sous.", price: "40,000 so'm" }
    ],
    mains: [
        { title: "Jiz", description: "Mol go'shtidan tayyorlangan mazali taom.", price: "250,000 so'm" },
        { title: "Tabaka", description: "Butun tovuqni yog'da press bilan bosib tayyorlangan shirali taom.", price: "60,000 so'm" },
        { title: "Lag'mon", description: "Qo'lda cho'zilgan lag'mon go'sht va sabzavotlar bilan.", price: "45,000 so'm" },
        { title: "Shashlik", description: "Mol go'shtidan tayyorlangan shashlik.", price: "50,000 so'm" }
    ],
    drinks: [
        { title: "Coca Cola", description: "Gazli ichimlik 0.5L", price: "15,000 so'm" },
        { title: "Choy", description: "Ko'k va qora choy", price: "10,000 so'm" },
        { title: "Suv", description: "Ichimlik suvi 1L", price: "8,000 so'm" },
        { title: "Kompot", description: "Mevalar komboki", price: "20,000 so'm" }
    ],
    deserts: [
        { title: "Medovik", description: "Asal tort", price: "35,000 so'm" },
        { title: "Paxlava", description: "Noxat paxlavasi", price: "30,000 so'm" },
        { title: "Ice Cream", description: "Murabbo va shokolad bilan", price: "25,000 so'm" }
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

// Telegram ga xabar yuborish
async function sendToTelegram(message) {
    try {
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log('✅ Telegram ga xabar yuborildi:', message.substring(0, 50) + '...');
        return true;
    } catch (error) {
        console.error('❌ Telegram xato:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        return false;
    }
}

// Buyurtma qabul qilish
async function handleOrder(order) {
    const message = `🛒 *YANGI BUYURTMA*\n\n${order}\n\n⏰ Vaqt: ${new Date().toLocaleString('uz-UZ')}`;
    return await sendToTelegram(message);
}

// ============================================
// API ENDPOINTS
// ============================================

// Bosh sahifa
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Restaurant Telegram Bot</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                .info { background: #f0f0f0; padding: 20px; border-radius: 10px; }
                code { background: #e0e0e0; padding: 2px 6px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>🍴 Restaurant Telegram Bot</h1>
            <div class="info">
                <h2>Bot ishlaydi!</h2>
                <p>Botni sozlash uchun <code>server.js</code> faylida <code>BOT_TOKEN</code> va <code>CHAT_ID</code> o'zgartiring.</p>
                <h3>Bot buyruqlari:</h3>
                <ul>
                    <li><code>/menu</code> - To'liq menyuni ko'rish</li>
                    <li><code>/salads</code> - Salatlar</li>
                    <li><code>/mains</code> - Asosiy taomlar</li>
                    <li><code>/drinks</code> - Ichimliklar</li>
                    <li><code>/deserts</code> - Desertlar</li>
                    <li><code>/order</code> - Buyurtma berish</li>
                </ul>
            </div>
        </body>
        </html>
    `);
});

// Telegram webhook (ixtiyoriy)
app.post('/webhook', async (req, res) => {
    const message = req.body.message;
    
    if (!message || !message.text) {
        return res.send('OK');
    }
    
    const text = message.text;
    const chatId = message.chat.id;
    
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
            // Agar buyurtma matni bo'lsa
            if (text.length > 5) {
                await handleOrder(text);
                response = `✅ Buyurtmangiz qabul qilindi!\n\n` +
                           `Teportda adminlarga yuborildi. \n` +
                           `Rahmat! 🍴`;
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

// Buyurtma yuborish API
app.post('/api/order', async (req, res) => {
    const { product, quantity, price } = req.body;
    
    if (!product || !quantity) {
        return res.status(400).json({ error: 'Mahsulot yoki miqdor kiritilmagan', success: false });
    }
    
    const orderText = `📦 Mahsulot: ${product}\n📊 Miqdor: ${quantity}\n💰 Narx: ${price}`;
    const success = await handleOrder(orderText);
    
    if (success) {
        res.json({ success: true, message: 'Buyurtma yuborildi!' });
    } else {
        res.status(500).json({ success: false, error: 'Xatolik yuz berdi' });
    }
});

// Menyu olish API
app.get('/api/menu', (req, res) => {
    res.json(foodData);
});

// Server ishga tushirish
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('==========================================');
    console.log('🚀 Server ishga tushdi: http://localhost:' + PORT);
    console.log('📱 Telegram bot ishga tushirilmoqda...');
    console.log('🔐 Bot Token:', BOT_TOKEN ? 'mavjud' : 'YO\'Q!');
    console.log('👤 Chat ID:', CHAT_ID ? 'mavjud' : 'YO\'Q!');
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
                console.error('❌ Bot ulanishda xato:');
                console.error(error.response?.data || error.message);
            });
        
        // Chat ID ni tekshirish
        axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${CHAT_ID}`)
            .then(response => {
                console.log('✅ Chat ma\'lumotlari olish muvaffaqiyatli!');
                console.log('Chat nomi:', response.data.result.first_name || response.data.result.title);
            })
            .catch(error => {
                console.error('⚠️ Chat ID xato yoki bot bu chatda emas:');
                console.error(error.response?.data || error.message);
            });
    }
});
