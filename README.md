# 🍴 Restoran Telegram Bot

Telegram orqali restoran menyusi va buyurtmalarini boshqarish uchun bot.

## 🚀 Ishga tushirish

### 1-qadam: Bog'liqliklarni o'rnatish

Terminalda quyidagi buyruqni yozing:

```bash
npm install
```

### 2-qadam: Token va Chat ID olish

1. **Bot TOKEN olish:**
   - Telegram ga kirib @BotFather deb yozing
   - /newbot buyrug'ini bering
   - Bot nomini kiriting (masalan: RestaurantBot)
   - Username ni kiriting (oxiri bot bo'lishi kerak, masalan: menu_order_bot)
   - BotFather sizga TOKEN beradi - bu ni saqlab qo'ying

2. **Chat ID olish:**
   - @userinfobot ga kirib, o'z chat ID ngizni oling
   - Yoki @getidsbot dan foydalaning

### 3-qadam: Server.js ni sozlash

`server.js` faylini oching va quyidagi qatorlarni o'zingizning ma'lumotlaringizga o'zgartiring:

```javascript
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // @BotFather dan olingan token
const CHAT_ID = 'YOUR_CHAT_ID_HERE';     // Sizning chat ID ngiz
```

### 4-qadam: Serverni ishga tushirish

```bash
npm start
```

Server `http://localhost:3000` da ishga tushadi.

## 📱 Telegram Bot Buyruqlari

| Buyruq | Tavsif |
|--------|--------|
| /start | Botni boshlash |
| /menu | To'liq menyuni ko'rish |
| /salats | Salatlar ro'yxati |
| /mains | Asosiy taomlar |
| /drinks | Ichimliklar |
| /deserts | Desertlar |
| /order | Buyurtma berish |

## 🔧 API Endpoints

- `GET /` - Bosh sahifa
- `GET /api/health` - Server holatini tekshirish (debug uchun)
- `GET /api/menu` - Menyu ma'lumotlari JSON formatida
- `POST /api/order` - Buyurtma yuborish
- `POST /api/notify-offline` - Offline buyurtma xabari
- `POST /webhook` - Telegram webhook

## 📦 Loyiha fayllari

```
menu/
├── package.json    # NPM konfiguratsiyasi
├── server.js       # Server kodi (Telegram bot)
├── index.html      # Veb-sahifa
├── index.js        # JavaScript
└── css/
    └── style.css   # Stillar
```

## 💡 Funksiyalar

- ✅ Telegram orqali menyuni ko'rish
- ✅ Buyurtma qabul qilish
- ✅ Barcha buyurtmalar adminga yuboriladi
- ✅ Webhook qo'llab-quvvatlash
- ✅ REST API

---

## 🚀 Vercel'ga joylash (Deploy)

### Vercel uchun sozlamalar

1. **Vercel'ga ulashing:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Environment variable'larni sozlash:**

   Vercel dashboard'da quyidagi environment variable'larni qo'shing:

   - **BOT_TOKEN** - @BotFather dan olingan bot token
   - **CHAT_ID** - Sizning chat ID ngiz
   - **ALLOWED_USERS** (optional) - Ruxsat etilgan foydalanuvchilar ID lari (vergul bilan ajratilgan)

   **Vercel dashboard'da:**
   - Project -> Settings -> Environment Variables
   - Har bir variable uchun qiymatni kiriting
   - Value sifatida .env faylidagi qiymatlardan foydalaning

3. **Qayta deploy qilish:**
   ```bash
   vercel --prod
   ```

### 401 Xatosi Tushuntirishi

Agar Vercel'da 401 xatosi chiqsa, bu quyidagilarni anglatadi:

- ❌ BOT_TOKEN noto'g'ri yoki o'rnatilmagan
- ❌ CHAT_ID noto'g'ri yoki o'rnatilmagan
- ❌ Vercel "Password Protection" yoqilgan

**Javob:** Vercel environment variable'larini tekshirib ko'ring.

### Debug qilish

1. **Health endpoint'ni tekshirish:**
   ```
   https://YOUR-PROJECT.vercel.app/api/health
   ```
   Bu endpoint server ishlayotganini tekshirish uchun. Agar bu endpoint ishlasa, server sozlangan.

2. **Debug endpoint'ni tekshirish (maxfiy ma'lumotlar yo'q):**
   ```
   https://YOUR-PROJECT.vercel.app/api/debug
   ```
   Bu endpoint environment variable'lar sozlanganganligini ko'rsatadi (tokenlar yashirin).

3. **Static fayllar ishlamayotgan bo'lsa:**
   - Vercel dashboard'da `vercel.json` routing sozlamalarini tekshiring
   - Quyidagi route tartibi bo'lishi kerak:
     ```
     1. /api/(.*) → server.js
     2. filesystem handler
     3. /(.*) → server.js
     ```
   - Agar filesystem handler yo'q bo'lsa, CSS/JS fayllar yuklanmaydi

4. **Vercel logs'ni ko'rish:**

   **Vercel Dashboard orqali:**
   - Vercel.com ga kiring
   - Project'ni tanlang: `menyu-wheat`
   - Chap panelda "Logs" ni bosing
   - "Production" branch'ni tanlang
   - So'nggi so'rovlarni ko'rish uchun "Functions" yoki "Deployments" dan foydalaning

   **Vercel CLI orqali:**
   ```bash
   # Vercel CLI o'rnatish (agar o'rnatilmagan bo'lsa)
   npm install -g vercel

   # Logs'ni ko'rish
   vercel logs YOUR_PROJECT.vercel.app --since 1h
   ```

   **Logs'da qanday qidirish kerak:**
   - `🔍 Health check` - health endpoint so'rovlari
   - `⚠️ BOT_TOKEN` - environment variable xatosi
   - `Buyurtma keldi` - buyurtma so'rovlari
   - `❌` - xatoliklar

4. **Environment variable'larni tekshirish:**
   - Vercel dashboard'da: Project -> Settings -> Environment Variables
   - Quyidagilar qo'shilganligini tekshiring:
     - `BOT_TOKEN` (yashirin bo'lishi kerak)
     - `CHAT_ID`
     - `ALLOWED_USERS` (optional)

   **Diqqat:** Environment variable'lar o'zgartirilgandan so'ng, **qayta deploy qilish** shart!

5. **Qayta deploy qilish:**
   ```bash
   vercel --prod --force
   ```

6. **Odatacha xatoliklar:**

   | Xatolik | Sabab | Javob |
   |---------|-------|-------|
   | 401 Unauthorized | BOT_TOKEN noto'g'ri yoki yo'q | Environment variable'ni tekshiring |
   | 401 Unauthorized | Vercel project "Password Protection" yoqilgan | Vercel dashboard'da Password Protection'ni o'chiring |
   | 503 Service Unavailable | BOT_TOKEN/CHAT_ID sozlanmagan | Environment variable'lar qo'shing |
   | 404 Not Found | Noto'g'ri URL | Health endpoint'ni tekshiring |
   | CSS/JS yuklanmayapti | vercel.json routing noto'g'ri yoki folder case sensitivity | Filesystem handler qo'shish, folder nomini lowercase qilish |
   | CORS xatosi | Frontend noto'g'ri URL'ga so'rov yuboryapti | API URL to'g'ri bo'lishi kerak |

   **Muhim:** Vercel'da "Password Protection" sozlamasi yoqilgan bo'lsa, barcha so'rovlar 401 qaytaradi. Buni o'chirish uchun:
   - Project Settings → General → Password Protection → Disable

   **Static fayllar (CSS/JS) ishlamasa:**
   vercel.json routing sozlamalarida `"handle": "filesystem"` qatorlari bo'lishi kerak. Agar yo'q bo'lsa, Vercel static fayllarni server.js orqali emas, to'g'ridan-to'g'ri serv qiladi.

7. **Frontend console logs'ni tekshirish:**
   - Veb-sahifada F12 -> Console
   - Xatolik xabarlari ko'rsatiladi
   - `API URL:` ni ko'rish orqali qaysi endpoint'ga so'rov yuborilayotganini tekshirish mumkin

---

Yaratuvchi: Restaurant Menu Team
