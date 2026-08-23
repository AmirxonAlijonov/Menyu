# Vercel KV sozlash (admin o'zgarishlari saytda ko'rinishi uchun)

Admin panelida qilingan o'zgarishlar asosiy saytda (`menyu-wheat.vercel.app`) darhol
ko'rinishi uchun ma'lumotlar barcha serverless instansiyalar o'rtasida baham
ko'riladigan doimiy saqlashda (`Vercel KV`) bo'lishi kerak. Vercel serverless
funksiyalari fayl tizimiga doimiy yozolmaydi, shuning uchun KV zarur.

## 1-qadam: Loyihani Vercel ga yuklang
Kodni git ga push qiling (yoki `vercel --prod` orqali deploy qiling).
`package.json` da `@vercel/kv` qo'shilgan — Vercel uni avtomatik o'rnatadi.

## 2-qadam: Vercel KV yaratish
1. [Vercel Dashboard](https://vercel.com/dashboard) → o'z loyihangizni tanlang.
2. **Storage** bo'limiga o'ting.
3. **Create** → **KV** ni tanlang.
4. Nom bering (masalan `menu-kv`) va loyihaga ulang (**Connect**).
5. Vercel avtomatik tarzda loyiha environment o'zgaruvchilariga
   `KV_REST_API_URL` va `KV_REST_API_TOKEN` ni qo'shadi.

## 3-qadam: Qayta deploy qiling
Storage ulangandan so'ng loyihani qayta deploy qiling (yangi commit push qiling
yoki Dashboard da **Redeploy**). Environment o'zgaruvchilari yangi deploy da
qo'llaniladi.

## 4-qadam: Tekshirish
1. `https://menyu-wheat.vercel.app/admin` → kiring, biror mahsulot qo'shing/o'zgartiring.
2. `https://menyu-wheat.vercel.app/` ni ochib, o'zgarishni ko'ring (sahifani
   yangilang). Endi o'zgarish darhol ko'rinadi.

## Qanday ishlaydi
- `storage.js` har bir API so'rovida ma'lumotlarni KV dan o'qiydi va yozadi.
- KV bo'sh bo'lsa, birinchi marta `data/menu.json` dagi boshlang'ich ma'lumot
  bilan to'ldiriladi (seed).
- Mahalliy ishlab chiqishda (`node server.js`) KV env o'zgaruvchilari yo'q,
  shuning uchun avtomatik ravishda mahalliy `data/menu.json` faylidan foydalaniladi.

## KV ni tozalash (agar boshidan boshlasangiz)
Vercel Dashboard → Storage → `menu-kv` → **Data** → `menu` va `orders` kalitlarini
o'chirib tashlang. Keyingi so'rovda ma'lumot `data/menu.json` dan qayta seed qilinadi.
