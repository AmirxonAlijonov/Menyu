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
- `GET /api/menu` - Menyu ma'lumotlari JSON formatida
- `POST /api/order` - Buyurtma yuborish

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

Yaratuvchi: Restaurant Menu Team
