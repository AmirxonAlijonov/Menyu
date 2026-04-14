// Global o'zgaruvchilar
let currentCategory = 'salads';
let currentIndexCategory = 0;
let autoSlide;
let baseProductPrice = 0; // Asosiy mahsulot narxi saqlash uchun

// Modal elementlari
const modal = document.getElementById('fullscreenModal');

// ==================== LOKATSIYA VA SAVAT FUNKSIYALARI ====================
let userLocation = {
    address: '',
    latitude: null,
    longitude: null,
    deliveryAvailable: false
};

let cart = [];

// Ovqatlar ma'lumotlari - Bo'limlar bo'yicha
const foodData = {
    salads: [
        {
            title: "Chiroqchi Salati",
            description: "Yangi sabzavotlar, pyuresi, tuxum va maxsus french sousi bilan.",
            price: "20,000 so'm",
            image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800"
        },
        {
            title: "Sezer Salati",
            description: "Romsalat, parmesan, croutons va caesar sousi bilan.",
            price: "30,000 so'm",
            image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800"
        },
        {
            title: "Svejiy Salat",
            description: "Yangi sabzavotlar: pomidor, bodring, ko'katlar va zaytun moyi.",
            price: "15,000 so'm",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800"
        },
        {
            title: "Achchiq Chuchuk Salat",
            description: "Achchiq va shirin ta'mli salad: qizilmiya, cho'chqa, pomidor va maxsus sous.",
            price: "15,000 so'm",
            image: "https://avatars.mds.yandex.net/get-vertis-journal/4220003/e733d115-1f98-45da-9e28-9f1ba3520354.jpeg/1600x1600"
        }
    ],
    mains: [
        {
            title: "Jiz",
            description: "Mol go'shtidan tayyorlangan mazali taom. Qiyma go'sht, piyoz va maxsus ziravorlar bilan.",
            price: "250,000 so'm",
            image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800"
        },
        {
            title: "Tabaka",
            description: "Butun tovuqni yog'da press bilan bosib tayyorlangan shirali va mazali taom.",
            price: "60,000 so'm",
            image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800"
        },
        {
            title: "Vag'ori",
            description: "An'anaviy oshpazlik usulida tayyorlangan mazali Vag'ori taomi. Go'sht va sabzavotlar bilan pishiriladi.",
            price: "250,000 so'm",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlYjrX2TZPKi5lhLkyTGO6RwbqlRk_EvyNlQ&s"
        },
        {
            title: "KFS",
            description: "Maxsus marinadlangan qovurilgan tovuq va qovurilgan kartoshka (fri) bilan. KFS - mashhur fast food taomi.",
            price: "80,000 so'm",
            image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800"
        },
        {
            title: "Barbekyu",
            description: "Go'shtni maxsus barbekyu sousi bilan grillda pishirilgan mazali taom.",
            price: "250,000 so'm",
            image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800"
        },
        {
            title: "Baliq",
            description: "Yangi baliqni yog'da qovurilgan holda tayyorlangan mazali taom. KFS uslubida yog'da qovurilgan.",
            price: "180,000 so'm",
            image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800"
        },
        {
            title: "Mol Go'shti Shashlik",
            description: "Maxsus marinadlangan mol go'shtidan tayyorlangan shirali shashlik. Uzun vaqt davomida kokilarda pishiriladi va ajoyib ta'mga ega bo'ladi.",
            price: "110,000 so'm",
            image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800"
        },
        {
            title: "Manti",
            description: "Go'sht va sabzavotlar bilan tayyorlangan an'anaviy O'zbek taomi. Bug'da pishiriladi.",
            price: "7,000 so'm",
            image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800"
        },
        {
            title: "Tandir Somsa",
            description: "Tandirda pishirilgan go'shtli an'anaviy somsa.",
            price: "15,000 so'm",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800"
        },
        {
            title: "Mastava",
            description: "Guruch, go'sht va sabzavotlar bilan tayyorlangan an'anaviy O'zbek sho'rvasi.",
            price: "35,000 so'm",
            image: "https://zira.uz/wp-content/uploads/2018/02/mastava-1.jpg"
        },
        {
            title: "Qaynatma Sho'rva",
            description: "Go'shtni uzoq vaqt davomida qaynatib tayyorlangan to'qimali sho'rva.",
            price: "35,000 so'm",
            image: "https://zira.uz/wp-content/uploads/2020/08/kai--natma-shurpa.jpg"
        },
        {
            title: "Grechka",
            description: "Grechka yoki sovuq - go'sht va sabzavotlar bilan tayyorlangan mazali taom.",
            price: "35,000 so'm",
            image: "https://mf.b37mrtl.ru/rbthmedia/images/2021.01/original/6011771d85600a5ea5564c98.jpg"
        },
        {
            title: "Ko'za Sho'rva",
            description: "Ko'zada tayyorlangan go'sht va sabzavotli an'anaviy sho'rva.",
            price: "70,000 so'm",
            image: "https://zira.uz/wp-content/uploads/2018/08/lg-schurpa-2.jpg"
        },
        {
            title: "Tushonka Sho'rva",
            description: "Tushonka go'shtidan tayyorlangan mazali va to'qimali sho'rva. An'anaviy usulda pishiriladi.",
            price: "35,000 so'm",
            image: "https://www.gazeta.uz/media/img/2021/10/zlqzJT16355047115889_l.jpg"
        }
    ],
    drinks: [
        {
            title: "Coca Cola",
            description: "Gazli ichimlik 1.5l hajmda. Sovuq va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800"
        },
        {
            title: "Yashil Choy",
            description: "Issiq yashil choy limon va asal bilan. Bu ichimlik sog'liq uchun juda foydali va tetiklashtiradi.",
            price: "2,000 so'm",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800"
        },
        {
            title: "Fanta",
            description: "Gazli apelsinli ichimlik 1.5l hajmda. Mashhur va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            image: "https://thumbs.dreamstime.com/b/can-fanta-orange-moscow-russia-april-coca-cola-company-soft-drink-ice-global-brand-fruit-flavored-carbonated-63824545.jpg"
        },
        {
            title: "Pepsi",
            description: "Gazli ichimlik 1.5l hajmda. Mashhur va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL5xpJ6WWLQZvHlDhrZrL5JtPZlf2Ul8CgbQ&s"
        },
        {
            title: "Qora Choy",
            description: "Issiq qora choy suty bilan. An'anaviy ichimlik.",
            price: "5,000 so'm",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800"
        },
        {
            title: "Limon Choy",
            description: "Maxsus tayyorlangan limonli choy - yangi limon va choy bilan tayyorlangan.",
            price: "20,000 so'm",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800"
        },
        {
            title: "Sok",
            description: "Tabiiy meva sharbati - aralash mevalar.",
            price: "20,000 so'm",
            image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800"
        },
        {
            title: "Sprite",
            description: "Gazli limonato ichimlik 1.5l hajmda. Sovuq va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            image: "https://www.shutterstock.com/image-photo/poznan-pol-apr-02-2025-260nw-2609175503.jpg"
        }
    ]
};

// Bo'limni ochish funksiyasi
function openCategory(category) {
    // Hamma sahifalarni yashirish
    document.getElementById('mainPage').classList.remove('active');
    document.getElementById('saladsPage').classList.remove('active');
    document.getElementById('mainsPage').classList.remove('active');
    document.getElementById('drinksPage').classList.remove('active');
    
    // Tanlangan sahifani ko'rsatish
    document.getElementById(category + 'Page').classList.add('active');
    
    // Joriy bo'limni saqlash
    currentCategory = category;
    currentIndexCategory = 0;
}

// Bosh sahifani ko'rsatish
function showMainPage() {
    // Hamma category sahifalarini yashirish
    document.getElementById('saladsPage').classList.remove('active');
    document.getElementById('mainsPage').classList.remove('active');
    document.getElementById('drinksPage').classList.remove('active');
    
    // Bosh sahifani ko'rsatish
    document.getElementById('mainPage').classList.add('active');
    
    // Avtomatik aylanishni to'xtatish
    // clearInterval(autoSlide);
}

// Slaydni ko'rsatish funksiyasi (category uchun)
function showSlideCategory(index) {
    const page = document.getElementById(currentCategory + 'Page');
    const slides = page.querySelectorAll('.slide');
    const thumbs = page.querySelectorAll('.thumb');
    
    // Barcha slaydlarni va kichik rasmlarni o'chirish
    slides.forEach(slide => slide.classList.remove('active'));
    thumbs.forEach(thumb => thumb.classList.remove('active'));
    
    // Tanlanganini ko'rsatish
    slides[index].classList.add('active');
    thumbs[index].classList.add('active');
    currentIndexCategory = index;
}

// Foydalanuvchi slaydni tanlash (category uchun)
function currentSlideCategory(index, category) {
    if (category === currentCategory) {
        showSlideCategory(index);
        resetAutoSlideCategory();
    }
}

// Avtomatik aylanish funksiyasi (category uchun)
function startAutoSlideCategory() {
    autoSlide = setInterval(() => {
        const items = foodData[currentCategory];
        currentIndexCategory = (currentIndexCategory + 1) % items.length;
        showSlideCategory(currentIndexCategory);
    }, 4000);
}

// Avtomatik aylanishni to'xtatish va qayta ishga tushirish
function resetAutoSlideCategory() {
    clearInterval(autoSlide);
    startAutoSlideCategory();
}

// Fullscreen modalni ochish
function openFullscreen(category) {
    const items = foodData[category];
    const foodInfo = items[currentIndexCategory];

    // Modal ma'lumotlarini to'ldirish
    document.getElementById('modalImg').src = foodInfo.image;
    document.getElementById('modalImg').alt = foodInfo.title;
    document.getElementById('modalTitle').textContent = foodInfo.title;
    document.getElementById('modalDesc').textContent = foodInfo.description;
    document.getElementById('modalPrice').textContent = foodInfo.price;
    document.getElementById('modalPrice').dataset.basePrice = foodInfo.price;
    
    // Asosiy narxni global o'zgaruvchida saqlash
    baseProductPrice = parseInt(foodInfo.price.replace(/[^0-9]/g, ''));
    
    // Miqdorni 1 ga qaytarish
    const quantityInput = document.getElementById('modalQuantity');
    if (quantityInput) {
        quantityInput.value = 1;
    }

    // Modalni ko'rsatish
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Avtomatik aylanishni to'xtatish
    clearInterval(autoSlide);
}

// Mobile cardni ochish funksiyasi
function openMobileCard(category, index) {
    const items = foodData[category];
    const foodInfo = items[index];

    // Modal ma'lumotlarini to'ldirish
    document.getElementById('modalImg').src = foodInfo.image;
    document.getElementById('modalImg').alt = foodInfo.title;
    document.getElementById('modalTitle').textContent = foodInfo.title;
    document.getElementById('modalDesc').textContent = foodInfo.description;
    document.getElementById('modalPrice').textContent = foodInfo.price;
    document.getElementById('modalPrice').dataset.basePrice = foodInfo.price;
    
    // Asosiy narxni global o'zgaruvchida saqlash
    baseProductPrice = parseInt(foodInfo.price.replace(/[^0-9]/g, ''));
    
    // Miqdorni 1 ga qaytarish
    const quantityInput = document.getElementById('modalQuantity');
    if (quantityInput) {
        quantityInput.value = 1;
    }

    // Modalni ko'rsatish
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Joriy indeksni yangilash
    currentCategory = category;
    currentIndexCategory = index;
}

// Fullscreen modalni yopish
function closeFullscreen() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Miqdorni 1 ga qaytarish
    const quantityInput = document.getElementById('modalQuantity');
    if (quantityInput) {
        quantityInput.value = 1;
    }
    
    // Asosiy narxni tiklash (keyinchalik ishlatish uchun)
    baseProductPrice = 0;
}

// Miqdor o'zgartirish funksiyasi
function changeQuantity(delta) {
    const quantityInput = document.getElementById('modalQuantity');
    let currentValue = parseInt(quantityInput.value) || 1;
    let newValue = currentValue + delta;
    
    // Minimal qiymat 1
    if (newValue < 1) newValue = 1;
    // Maksimal qiymat 99
    if (newValue > 99) newValue = 99;
    
    quantityInput.value = newValue;
    
    // Narxni yangilash
    updateModalPrice();
}

// Modal narxini yangilash
function updateModalPrice() {
    const quantityInput = document.getElementById('modalQuantity');
    const quantity = parseInt(quantityInput.value) || 1;
    
    // Asosiy narxni olish: avval global, keyin dataset, oxirgi fallback foodData
    let basePrice = 0;
    
    if (baseProductPrice > 0) {
        basePrice = baseProductPrice;
    } else {
        // dataset dan olish
        const priceEl = document.getElementById('modalPrice');
        if (priceEl && priceEl.dataset.basePrice) {
            basePrice = parseInt(priceEl.dataset.basePrice.replace(/[^0-9]/g, ''));
        }
    }
    
    // Jami narx: asosiy narx * miqdor
    const totalPrice = basePrice * quantity;
    
    // Natijani ko'rsatish
    document.getElementById('modalPrice').textContent = totalPrice.toLocaleString() + " so'm";
}

// Stol/Kabina/Tabcha tanlash funksiyasi
function toggleTableInput() {
    const tableType = document.getElementById('tableType').value;
    const stolContainer = document.getElementById('stolInputContainer');
    const kabinaContainer = document.getElementById('kabinaInputContainer');
    const tabchaContainer = document.getElementById('tabchaInputContainer');
    
    if (tableType === 'stol') {
        stolContainer.style.display = 'flex';
        kabinaContainer.style.display = 'none';
        tabchaContainer.style.display = 'none';
    } else if (tableType === 'kabina') {
        stolContainer.style.display = 'none';
        kabinaContainer.style.display = 'flex';
        tabchaContainer.style.display = 'none';
    } else if (tableType === 'tabcha') {
        stolContainer.style.display = 'none';
        kabinaContainer.style.display = 'none';
        tabchaContainer.style.display = 'flex';
    }
}

// Buyurtma yuborish funksiyasi
function submitOrder() {
    console.log('submitOrder ishga tushdi');
    
    const quantityInput = document.getElementById('modalQuantity');
    if (!quantityInput) {
        showToast('❌ Xato!', 'Miqdor input topilmadi', '#e74c3c');
        return;
    }
    let quantity = parseInt(quantityInput.value);
    
    // Miqdor tekshirish
    if (isNaN(quantity) || quantity <= 0) {
        showToast('❌ Xato!', 'Miqdorni faqat musbat sonlarda kiriting.', '#e74c3c');
        return;
    }
    
    // Stol/Kabina/Tabcha/Karavot raqamini tekshirish
    const tableType = document.getElementById('tableType').value;
    const tableNumberInput = document.getElementById('tableNumber');
    const kabinaInput = document.getElementById('kabinaNumber');
    const tabchaInput = document.getElementById('tabchaNumber');
    
    const tableNumber = tableNumberInput?.value ? parseInt(tableNumberInput.value) : null;
    const kabinaNumber = kabinaInput?.value ? parseInt(kabinaInput.value) : null;
    const tabchaNumber = tabchaInput?.value ? parseInt(tabchaInput.value) : null;
    
    // Stol raqami tekshirish (faqat Stol tanlanganida)
    if (tableType === 'stol' && tableNumber && (isNaN(tableNumber) || tableNumber < 1 || tableNumber > 16)) {
        showToast('❌ Xato!', 'Stol raqamini 1 dan 16 gacha kiriting.', '#e74c3c');
        return;
    }
    
    // Kabina raqamini tekshirish (faqat Kabina tanlanganida)
    if (tableType === 'kabina' && kabinaNumber && (isNaN(kabinaNumber) || kabinaNumber < 1 || kabinaNumber > 3)) {
        showToast('❌ Xato!', 'Kabina raqamini 1 dan 3 gacha kiriting.', '#e74c3c');
        return;
    }
    
    // Tabcha raqamini tekshirish (faqat Tabcha tanlanganida)
    if (tableType === 'tabcha' && tabchaNumber && (isNaN(tabchaNumber) || tabchaNumber < 1 || tabchaNumber > 3)) {
        showToast('❌ Xato!', 'Tabchan raqamini 1 dan 3 gacha kiriting.', '#e74c3c');
        return;
    }
    
    const title = document.getElementById('modalTitle').textContent;
    const priceText = document.getElementById('modalPrice').textContent;
    
    // Narxni to'g'ri hisoblash
    let totalPriceText;
    if (baseProductPrice > 0) {
        const totalPrice = baseProductPrice * quantity;
        totalPriceText = totalPrice.toLocaleString() + " so'm";
    } else {
        const basePrice = parseInt(priceText.replace(/[^0-9]/g, ''));
        totalPriceText = basePrice.toLocaleString() + " so'm";
    }
    
    // Loading ko'rsatish
    const orderBtn = document.getElementById('orderBtn');
    if (orderBtn) orderBtn.textContent = '⏳ Yuborilmoqda...';
    
    // Buyurtma ma'lumotlarini tayyorlash
    console.log('Buyurtma tayyorlanmoqda:', { tableType, tableNumber, kabinaNumber, tabchaNumber, title, quantity });
    
    const orderData = {
        product: title,
        quantity: quantity,
        price: totalPriceText,
        tableNumber: tableType === 'stol' ? tableNumber : null,
        kabinaNumber: tableType === 'kabina' ? kabinaNumber : null,
        tabchaNumber: tableType === 'tabcha' ? tabchaNumber : null,
        timestamp: new Date().toISOString()
    };
    
    console.log('Yuboriladigan data:', JSON.stringify(orderData));
    
    // Serverga buyurtma yuborish
    console.log('Buyurtma yuborilmoqda...');
    
    // Vercel/Production yoki local server uchun URL
    let apiUrl;
    if (window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'file://') {
        apiUrl = window.location.origin + '/api/order';
    } else {
        // Local server yoki file holatida default URL
        apiUrl = 'http://localhost:3000/api/order';
    }
    console.log('API URL:', apiUrl);
    
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response type:', response.headers.get('content-type'));
        
        // Check if response is OK
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error('Server xatosi: ' + response.status + ' - ' + (text.substring(0, 100) || 'Unknown'));
            });
        }
        
        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return response.text().then(text => {
                throw new Error('Server JSON emas, HTML qaytaryapti. Server ishlamayotgan bolishi mumkin. Response: ' + text.substring(0, 200));
            });
        }
        
        return response.json();
    })
    .then(data => {
        // Buyurtma tugagandan so'ng tugma matnini qayta tiklaymiz
        if (orderBtn) orderBtn.textContent = '📦 Buyurtma berish';
        
        if (data.success) {
            // Joylashuv matnini tayyorlash
            let locationMsg = '';
            if (tableType === 'tabcha') {
                locationMsg = 'Tabchan: ' + tabchaNumber;
            } else if (tableType === 'kabina') {
                locationMsg = 'Kabina: ' + kabinaNumber;
            } else {
                locationMsg = 'Stol: ' + tableNumber;
            }
            showToast('✅ Buyurtmangiz qabul qilindi!', `🎉 Buyurtmangiz muvaffaqiyatli yuborildi!\n\n📦 Mahsulot: ${title}\n📊 Miqdor: ${quantity}\n💰 Jami narx: ${totalPriceText}\n📍 ${locationMsg}\n\n✨ Rahmat! Tez orada operator siz bilan bog'lanadi!`, '#27ae60', '🎉');
        } else {
            showToast('⚠️ Diqqat!', data.error || 'Buyurtma yuborishda xatolik yuz berdi.', '#e67e22');
        }
    })
    .catch(error => {
        if (orderBtn) orderBtn.textContent = '📦 Buyurtma berish';
        console.error('Buyurtma yuborish xatosi:', error);
        
        // Offline yoki server xatosini aniqlash
        if (!navigator.onLine) {
            // Offline holatda - buyurtmani saqlash
            saveOrderToQueue(orderData);
            showToast('📱 Offline holatda!', 'Internetga ulanish yo\'q. Buyurtmangiz saqlandi va internet tiklanganda avtomatik yuboriladi.', '#e67e22');
        } else {
            showToast('⚠️ Serverga ulanish mumkin emas!', 'Server ishlamayotgan bo\'lishi mumkin. Internetga ulanishni tekshiring yoki qayta urinib ko\'ring. URL: ' + apiUrl, '#e74c3c');
        }
    });
    
    closeFullscreen();
}

// ============================================
// OFFLINE BUYURTMA QUEUE FUNKTSIYALARI
// ============================================

const ORDER_QUEUE_KEY = 'alsafar_order_queue';

function saveOrderToQueue(orderData) {
    try {
        const queue = getOrderQueue();
        queue.push(orderData);
        localStorage.setItem(ORDER_QUEUE_KEY, JSON.stringify(queue));
        console.log('Buyurtma queue ga saqlandi:', orderData);
        // NOTE: Buyurtmalar onlayn bo'lganda processOrderQueue() tomonidan yuboriladi
    } catch (error) {
        console.error('Queue ga saqlash xatosi:', error);
    }
}

function getOrderQueue() {
    try {
        const queue = localStorage.getItem(ORDER_QUEUE_KEY);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        console.error('Queue olish xatosi:', error);
        return [];
    }
}

function removeFromQueue(index) {
    try {
        const queue = getOrderQueue();
        queue.splice(index, 1);
        localStorage.setItem(ORDER_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
        console.error('Queue dan olish xatosi:', error);
    }
}

async function processOrderQueue() {
    const queue = getOrderQueue();
    if (queue.length === 0) {
        console.log('Queue bo\'sh');
        return;
    }
    console.log(`Queue da ${queue.length} ta buyurtma yuborilmoqda...`);
    
    // Vercel/Production yoki local server uchun URL
    let apiUrl;
    if (window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'file://') {
        apiUrl = window.location.origin + '/api/order';
    } else {
        apiUrl = 'http://localhost:3000/api/order';
    }
    const failedOrders = [];
    for (let i = 0; i < queue.length; i++) {
        const order = queue[i];
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });
            const data = await response.json();
            if (data.success) {
                console.log(`Buyurtma ${i + 1} muvaffaqiyatli`);
                removeFromQueue(i);
                i--;
            } else {
                failedOrders.push(order);
            }
        } catch (error) {
            console.error(`Buyurtma ${i + 1} xatosi:`, error);
            failedOrders.push(order);
        }
    }
    if (failedOrders.length > 0) {
        localStorage.setItem(ORDER_QUEUE_KEY, JSON.stringify(failedOrders));
    }
    if (failedOrders.length === 0 && queue.length > 0) {
        showToast('✅ Buyurtmalar yuborildi!', `Offline vaqtida saqlangan ${queue.length} ta buyurtma yuborildi!`, '#27ae60');
    }
}

window.addEventListener('online', () => {
    console.log('Internet tiklandi, queue ishga tushirilmoqda...');
    processOrderQueue();
});

window.addEventListener('load', () => {
    const queue = getOrderQueue();
    if (queue.length > 0 && navigator.onLine) {
        console.log(`Queue da ${queue.length} ta buyurtma bor`);
        processOrderQueue();
    }
});

// ============================================
// BILDIRISHNOMA FUNKTSIYASI
// ============================================

function showToast(title, message, color, icon = null) {
    const notification = document.createElement('div');
    notification.className = 'toast';
    notification.style.borderLeft = `5px solid ${color}`;
    const displayIcon = icon || title.split(' ')[0];
    notification.innerHTML = `
        <span class="toast-close" onclick="this.parentElement.remove()">&times;</span>
        <div class="toast-icon">${displayIcon}</div>
        <div class="toast-content">
            <h3>${title.split(' ').slice(1).join(' ')}</h3>
            <p style="white-space: pre-line;">${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show the notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 5 soniyadan so'ng bildirishnomani olib tashlash
    setTimeout(() => {
        notification.classList.add('toast-hide');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// Buyurtma berish funksiyasi
function orderFood() {
    alert('📞 Operatorlarimiz siz bilan tez orada bog\'lanishadi!\n\nIltimos, telefon raqamingizni kuting.');
    closeFullscreen();
}

// Klaviatura bilan boshqarish
document.addEventListener('keydown', (e) => {
    if (modal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
    } else {
        if (e.key === 'Enter') {
            openFullscreen(currentCategory);
        }
    }
});

// Modalni tashqarida bosganda yopish
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeFullscreen();
    }
});

// ==================== LOKATSIYA FUNKSIYALARI ====================
// Sayt ochilganda lokatsiyani tekshirish
function checkLocationOnLoad() {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
        userLocation = JSON.parse(savedLocation);
    } else {
        setTimeout(() => {
            document.getElementById('locationModal').style.display = 'flex';
        }, 2500);
    }
}

// Geolocation orqali lokatsiyani so'rash
function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation.latitude = position.coords.latitude;
                userLocation.longitude = position.coords.longitude;
                userLocation.address = `Koordinatalar: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                userLocation.deliveryAvailable = true;
                saveLocation();
                closeLocationModal();
                showNotification('Lokatsiya muvaffaqiyatli saqlandi!');
            },
            (error) => {
                showManualLocation();
            }
        );
    } else {
        showManualLocation();
    }
}

// Qo'lda manzil kiritish
function showManualLocation() {
    document.querySelector('.location-options').style.display = 'none';
    document.getElementById('manualLocation').style.display = 'block';
}

// Manual manzilni saqlash
function saveManualLocation() {
    const address = document.getElementById('userAddress').value;
    if (address.trim()) {
        userLocation.address = address;
        userLocation.deliveryAvailable = true;
        saveLocation();
        closeLocationModal();
        showNotification('Manzilingiz saqlandi!');
    } else {
        alert('Iltimos, manzilingizni kiriting');
    }
}

// Lokatsiyani saqlash
function saveLocation() {
    localStorage.setItem('userLocation', JSON.stringify(userLocation));
}

// Location modalni yopish
function closeLocationModal() {
    document.getElementById('locationModal').style.display = 'none';
}

// ==================== SAVAT FUNKSIYALARI ====================
function addToCartFromModal() {
    var title = document.getElementById('modalTitle').innerHTML;
    var price = document.getElementById('modalPrice').innerHTML;
    var img = document.getElementById('modalImage').src;
    var qty = document.getElementById('modalQuantity').value;
    
    var item = {id: 1, title: title, price: price, priceNum: 10000, quantity: qty, image: img};
    window.myCart = [];
    window.myCart.push(item);
    
    document.getElementById('cartBadge').innerHTML = window.myCart.length;
    document.getElementById('fullscreenModal').style.display = 'none';
    alert('Qoshildi!');
}

// Mahsulotni savatga qo'shish
function addToCart(item, quantity = 1) {
    const existingItem = cart.find(c => c.title === item.title);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        const cartItem = {
            id: Date.now(),
            title: item.title,
            price: item.price,
            priceNum: parsePrice(item.price),
            quantity: quantity,
            image: item.image
        };
        cart.push(cartItem);
    }
    saveCart();
    updateCartBadge();
    showNotification(`${item.title} savatga qo'shildi!`);
}

// Savatni ko'rsatish
function showCart() {
    renderCartItems();
    document.getElementById('cartModal').style.display = 'flex';
}

// Savatni yopish
function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

// Savatdagi mahsulotlarni chiqarish
function renderCartItems() {
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotal');
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Savat bo\'sh</p>';
        totalContainer.style.display = 'none';
        return;
    }
    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.priceNum * item.quantity;
        total += itemTotal;
        return `<div class="cart-item"><img src="${item.image}" alt="${item.title}"><div class="cart-item-info"><h3>${item.title}</h3><p>${item.price} x ${item.quantity}</p><p class="item-total">Jami: ${formatPrice(itemTotal)}</p></div><button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button></div>`;
    }).join('');
    totalContainer.style.display = 'block';
    document.getElementById('totalPrice').textContent = formatPrice(total);
}

// Mahsulotni savatdan o'chirish
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartBadge();
    renderCartItems();
}

// Savatni tozalash
function clearCart() {
    if (confirm('Savatni tozalashni xohlaysizmi?')) {
        cart = [];
        saveCart();
        updateCartBadge();
        renderCartItems();
    }
}

// Savatni localStorage ga saqlash
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Savatni localStorage dan olish
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartBadge();
    }
}

// Kategoriya mosligini tekshirish function
function getCategoryItems(category) {
    // Kategoriya nomini to'g'rilash
    if (category === 'salats') category = 'salads';
    return foodData[category] || foodData.salads || foodData.mains || foodData.drinks || [];
}

// Cart badge yangilash
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Checkout - buyurtma qilish
function checkout() {
    if (cart.length === 0) {
        alert('Savat bo\'sh!');
        return;
    }
    
    // Stol/Kabina/Tabcha tanlashni so'rash
    const choice = prompt('Qayerda o\'tirasiz?\n1 - Stol\n2 - Kabina\n3 - Tabchan\n4 - Yetkazish (manzilga)\n\nRaqamni kiriting:');
    
    if (!choice) return;
    
    let locationInfo = '';
    let deliveryType = 'come';
    
    if (choice === '1') {
        const tableNum = prompt('Stol raqamini kiriting (1-16):', '1');
        if (tableNum) {
            locationInfo = 'Stol raqami: ' + tableNum;
            deliveryType = 'table';
        }
    } else if (choice === '2') {
        const kabinaNum = prompt('Kabina raqamini kiriting (1-3):', '1');
        if (kabinaNum) {
            locationInfo = 'Kabina raqami: ' + kabinaNum;
            deliveryType = 'kabina';
        }
    } else if (choice === '3') {
        const tabchaNum = prompt('Tabchan raqamini kiriting (1-3):', '1');
        if (tabchaNum) {
            locationInfo = 'Tabchan raqami: ' + tabchaNum;
            deliveryType = 'tabcha';
        }
    } else if (choice === '4') {
        if (!userLocation.address) {
            alert('Iltimos, avval manzilingizni kiriting!');
            document.getElementById('locationModal').style.display = 'flex';
            closeCart();
            return;
        }
        locationInfo = 'Manzil: ' + userLocation.address;
        deliveryType = 'address';
    } else {
        alert('Noto\'g\'ri tanlov!');
        return;
    }
    
    if (!locationInfo) return;
    
    const firstItem = cart[0];
    let found = false;
    for (const cat in foodData) {
        const item = foodData[cat].find(function(i) { return i.title === firstItem.title; });
        if (item) {
            currentCategory = cat;
            currentIndexCategory = foodData[cat].indexOf(item);
            found = true;
            break;
        }
    }
    
    closeCart();
    
    if (found) {
        openMobileCard(currentCategory, currentIndexCategory);
        document.getElementById('modalQuantity').value = firstItem.quantity;
        updateQuantity(0);
        
        const deliverySelect = document.getElementById('deliveryType');
        if (deliverySelect) {
            deliverySelect.value = deliveryType;
            updateDeliveryOptions();
        }
    }
    
    showNotification(locationInfo + ' tanlandi!');
}

// Xabar ko'rsatish
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Telegram ga ulanish funksiyasi
function openTelegram() {
    // Telegram botga havola - o'zgartiring
    window.open('https://t.me/YourBotUsername', '_blank');
}

// Sahifa yuklanganda
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hide');
    }, 2000);
    showMainPage();
    checkLocationOnLoad();
    loadCart();
    
    // Service Worker ro'yhatga olish (PWA uchun)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker ro\'yxatga olindi:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker ro\'yxatga olishda xato:', error);
            });
    }
});
