/**
 * Ma'lumotlarni saqlash qatlami (storage layer)
 * --------------------------------------------------
 * Vercel serverless funksiyalari read-only filesystem va ephemeral
 * (vaqtinchalik) instansiyalarga ega. Shuning uchun admin panelida
 * qilingan o'zgarishlar boshqa instansiyaga (asosiy saytga) o'tmaydi.
 *
 * Bu modul muammoni hal qiladi:
 *   - Agar Vercel KV (doimiy saqlash) sozlangan bo'lsa -> KV ishlatiladi
 *     (barcha instansiyalar uchun bitta manba).
 *   - Aks holda -> mahalliy fayl (lokal ishlab chiqish uchun).
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const menuDataPath = path.join(dataDir, 'menu.json');
const ordersDataPath = path.join(dataDir, 'orders.json');

// ============================================
// Vercel KV ulanishi (faqat env o'zgaruvchilari mavjud bo'lsa)
// ============================================
let kv = null;
let kvEnabled = false;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
        kv = require('@vercel/kv');
        kvEnabled = true;
        console.log('✅ Vercel KV ulandi (doimiy saqlash faol)');
    } catch (e) {
        console.warn('⚠️ @vercel/kv paketi topilmadi, fayl saqlash ishlatiladi:', e.message);
    }
} else {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        console.error('⚠️⚠️ OGOHLANTIRISH: Vercel (production) muhitida KV env o\'zgaruvchilari topilmadi!');
        console.error('⚠️⚠️ Admin o\'zgarishlari saqlanmaydi (fayl tizimi vaqtinchalik/ephemeral). Vercel KV ni ulang!');
        console.error('⚠️⚠️ Qo\'llanma: KV_SETUP.md faylini o\'qing yoki Vercel Dashboard → Storage → KV yarating va loyihaga ulang.');
    } else {
        console.log('ℹ️ KV env o\'zgaruvchilari topilmadi - mahalliy fayl saqlash ishlatiladi');
    }
}

// ============================================
// YORDAMCHI FUNKTSIYALAR (fayl)
// ============================================

function readFileJSON(filePath, fallback) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error('❌ Fayl o\'qish xatosi (' + filePath + '):', e.message);
    }
    return fallback;
}

function writeFileJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        // Vercel'da faylga yozish ruxsat etilmasligi mumkin - bu KV bilan to'ldiriladi
        console.error('❌ Faylga yozish xatosi (' + filePath + '):', e.message);
        return false;
    }
}

// ============================================
// MENU MA'LUMOTLARI
// ============================================

async function loadMenuData() {
    if (kvEnabled) {
        try {
            const data = await kv.get('menu');
            if (data) {
                console.log('✅ Menu KV dan yuklandi');
                return data;
            }
            // KV bo'sh - fayldagi boshlang'ich ma'lumotni KV ga yozamiz (seed)
            const fileData = readFileJSON(menuDataPath, { categories: {}, items: {} });
            await kv.set('menu', fileData);
            console.log('✅ Menu fayldan KV ga seed qilindi');
            return fileData;
        } catch (e) {
            console.error('❌ KV dan yuklash xatosi, fayl ishlatiladi:', e.message);
        }
    }
    const fileData = readFileJSON(menuDataPath, { categories: {}, items: {} });
    if (!fs.existsSync(menuDataPath)) {
        writeFileJSON(menuDataPath, fileData);
    }
    console.log('✅ Menu fayldan yuklandi');
    return fileData;
}

async function saveMenuData(data) {
    // Mahalliy faylga yozish (lokal ishlab chiqish uchun; Vercel'da xato bo'lsa e'tiborga olinmaydi)
    writeFileJSON(menuDataPath, data);

    if (kvEnabled) {
        try {
            await kv.set('menu', data);
            console.log('✅ Menu KV ga saqlandi');
        } catch (e) {
            console.error('❌ Menu KV ga saqlash xatosi:', e.message);
        }
    }
}

// ============================================
// BUYURTMALAR MA'LUMOTLARI
// ============================================

async function loadOrdersData() {
    if (kvEnabled) {
        try {
            const data = await kv.get('orders');
            if (data) {
                console.log('✅ Orders KV dan yuklandi');
                return data;
            }
            const fileData = readFileJSON(ordersDataPath, []);
            await kv.set('orders', fileData);
            return fileData;
        } catch (e) {
            console.error('❌ Orders KV xatosi, fayl ishlatiladi:', e.message);
        }
    }
    return readFileJSON(ordersDataPath, []);
}

async function saveOrdersData(data) {
    writeFileJSON(ordersDataPath, data);

    if (kvEnabled) {
        try {
            await kv.set('orders', data);
        } catch (e) {
            console.error('❌ Orders KV saqlash xatosi:', e.message);
        }
    }
}

module.exports = {
    loadMenuData,
    saveMenuData,
    loadOrdersData,
    saveOrdersData,
    kvEnabled
};
