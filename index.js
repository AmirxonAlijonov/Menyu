// Global o'zgaruvchilar
let currentCategory = 'salads';
let currentIndexCategory = 0;
let autoSlide;

// Modal elementlari
const modal = document.getElementById('fullscreenModal');

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
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"
        },
        {
            title: "Qaynatma Sho'rva",
            description: "Go'shtni uzoq vaqt davomida qaynatib tayyorlangan to'qimali sho'rva.",
            price: "35,000 so'm",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"
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
}

// Stol/Kabina tanlash funksiyasi
function toggleTableInput() {
    const tableType = document.getElementById('tableType').value;
    const stolContainer = document.getElementById('stolInputContainer');
    const kabinaContainer = document.getElementById('kabinaInputContainer');
    
    if (tableType === 'stol') {
        stolContainer.style.display = 'flex';
        kabinaContainer.style.display = 'none';
    } else {
        stolContainer.style.display = 'none';
        kabinaContainer.style.display = 'flex';
    }
}

// Buyurtma yuborish funksiyasi
function submitOrder() {
    const quantityInput = document.getElementById('modalQuantity');
    let quantity = parseInt(quantityInput.value);
    
    // Miqdor tekshirish
    if (isNaN(quantity) || quantity <= 0) {
        showToast('❌ Xato!', 'Miqdorni faqat musbat sonlarda kiriting.', '#e74c3c');
        return;
    }
    
    // Stol raqamini tekshirish
    const tableType = document.getElementById('tableType').value;
    const tableNumberInput = document.getElementById('tableNumber');
    const kabinaInput = document.getElementById('kabinaNumber');
    const tableNumber = parseInt(tableNumberInput.value);
    let kabinaNumber = kabinaInput.value ? parseInt(kabinaInput.value) : null;
    
    // Stol raqami tekshirish (faqat Stol tanlanganida)
    if (tableType === 'stol' && (isNaN(tableNumber) || tableNumber < 1 || tableNumber > 16)) {
        showToast('❌ Xato!', 'Stol raqamini 1 dan 16 gacha kiriting.', '#e74c3c');
        return;
    }
    
    // Kabina raqamini tekshirish (faqat Kabina tanlanganida)
    if (tableType === 'kabina' && (isNaN(kabinaNumber) || kabinaNumber < 1 || kabinaNumber > 3)) {
        showToast('❌ Xato!', 'Kabina raqamini 1 dan 3 gacha kiriting.', '#e74c3c');
        return;
    }
    
    const title = document.getElementById('modalTitle').textContent;
    const priceText = document.getElementById('modalPrice').textContent;
    
    // Narxni hisoblash (miqdor * bitta narx)
    // Narxdan "so'm" va vergullarni olib tashlash
    const basePrice = parseInt(priceText.replace(/[^0-9]/g, ''));
    const totalPrice = basePrice * quantity;
    const totalPriceText = totalPrice.toLocaleString() + " so'm";
    
    // Loading ko'rsatish
    const orderBtn = document.querySelector('.order-btn');
    if (orderBtn) orderBtn.textContent = '⏳ Yuborilmoqda...';
    
    // Buyurtma ma'lumotlarini tayyorlash
    const orderData = {
        product: title,
        quantity: quantity,
        price: totalPriceText,
        tableNumber: tableType === 'stol' ? tableNumber : null,
        kabinaNumber: tableType === 'kabina' ? kabinaNumber : null,
        timestamp: new Date().toISOString()
    };
    
    // Serverga buyurtma yuborish
    console.log('Buyurtma yuborilmoqda...');
    fetch('/api/order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        // Buyurtma tugagandan so'ng tugma matnini qayta tiklaymiz
        if (orderBtn) orderBtn.textContent = '📦 Buyurtma berish';
        
        if (data.success) {
            showToast('✅ Buyurtmangiz qabul qilindi!', `Mahsulot: ${title}\nMiqdor: ${quantity}\nJami narx: ${totalPriceText}\n${kabinaNumber ? 'Kabina: ' + kabinaNumber : 'Stol: ' + tableNumber}\n\nRahmat! Tez orada operator siz bilan bog'lanadi.`, '#27ae60');
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
            showToast('⚠️ Serverga ulanish mumkin emas!', 'Server ishlamayotgan bo\'lishi mumkin. Internetga ulanishni tekshiring yoki qayta urinib ko\'ring.', '#e74c3c');
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
        
        // Telegram botga offline buyurtma xabar yuborish
        if (!navigator.onLine) {
            fetch('/api/notify-offline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('📱 Offline buyurtma xabari telegram botga yuborildi');
                }
            })
            .catch(error => {
                console.log('Telegram botga xabar yuborish mumkin emas:', error);
            });
        }
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
    const failedOrders = [];
    for (let i = 0; i < queue.length; i++) {
        const order = queue[i];
        try {
            const response = await fetch('/api/order', {
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

function showToast(title, message, color) {
    const notification = document.createElement('div');
    notification.style.borderLeft = `5px solid ${color}`;
    notification.innerHTML = `
        <div class="toast-icon">${title.split(' ')[0]}</div>
        <div class="toast-content">
            <h3>${title.split(' ').slice(1).join(' ')}</h3>
            <p style="white-space: pre-line;">${message}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
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

// Sahifa yuklanganda
document.addEventListener('DOMContentLoaded', () => {
    // Loading screenni yashirish
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hide');
    }, 2000);
    
    // Bosh sahifani ko'rsatish
    showMainPage();
});
