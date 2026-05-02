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
└── CSS/
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

**Javob:** Vercel environment variable'larini tekshirib ko'ring.

### Debug qilish

1. **Health endpoint'ni tekshirish:**
   ```
   https://menyu-wheat.vercel.app/api/health
   ```
   Bu endpoint server ishlayotganini tekshirish uchun. Agar bu endpoint ishlasa, server sozlangan.

2. **Environment variable'larni tekshirish:**
   - Vercel dashboard'da: Project -> Settings -> Environment Variables
   - Quyidagilar qo'shilganligini tekshiring:
     - `BOT_TOKEN` (yashirin bo'lishi kerak)
     - `CHAT_ID`
     - `ALLOWED_USERS` (optional)

3. **Vercel logs'ni ko'rish:**
   ```bash
   vercel logs menyu-wheat.vercel.app
   ```

4. **Qayta deploy qilish:**
   Environment variable'lar o'zgartirilgandan so'ng, qayta deploy qilish shart:
   ```bash
   vercel --prod --force
   ```

---

Yaratuvchi: Restaurant Menu Team
