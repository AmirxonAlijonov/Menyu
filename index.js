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
            title: "Fransuz Salati",
            description: "Yangi sabzavotlar, pyuresi, tuxum va maxsus french sousi bilan.",
            price: "35,000 so'm",
            image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800"
        },
        {
            title: "Sezer Salati",
            description: "Romsalat, parmesan, croutons va caesar sousi bilan.",
            price: "35,000 so'm",
            image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800"
        },
        {
            title: "Svejiy Salat",
            description: "Yangi sabzavotlar: pomidor, bodring, ko'katlar va zaytun moyi.",
            price: "35,000 so'm",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800"
        },
        {
            title: "Salyoni Salat",
            description: "Svezhiy losos, mix-salot, avokado va sitrus sousi bilan.",
            price: "35,000 so'm",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
        }
    ],
    mains: [
        {
            title: "Jiz",
            description: "Mol go'shtidan tayyorlangan mazali taom. Qiyma go'sht, piyoz va maxsus ziravorlar bilan.",
            price: "220,000 so'm",
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
            price: "220,000 so'm",
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
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"
        },
        {
            title: "Ko'za Sho'rva",
            description: "Ko'zada tayyorlangan go'sht va sabzavotli an'anaviy sho'rva.",
            price: "80,000 so'm",
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"
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
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800"
        },
        {
            title: "Pepsi",
            description: "Gazli ichimlik 1.5l hajmda. Mashhur va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800"
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
            price: "30,000 so'm",
            image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800"
        },
        {
            title: "Sprite",
            description: "Gazli limonato ichimlik 1.5l hajmda. Sovuq va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800"
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
    
    // Slaydni ko'rsatish
    // showSlideCategory(0);
    
    // Avtomatik aylanishni boshlash
    // startAutoSlideCategory();
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

    // Buyurtma tugmasini yashirish (barcha kategoriyalar uchun)
    const orderBtn = document.getElementById('modalOrderBtn');
    orderBtn.style.display = 'none';

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

    // Buyurtma tugmasini yashirish
    const orderBtn = document.getElementById('modalOrderBtn');
    orderBtn.style.display = 'none';

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

    // Avtomatik aylanishni qayta ishga tushirish
    // startAutoSlideCategory();
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
        if (e.key === 'ArrowLeft') {
            // Oldingi slayd - OLD
            // const items = foodData[currentCategory];
            // currentIndexCategory = (currentIndexCategory - 1 + items.length) % items.length;
            // showSlideCategory(currentIndexCategory);
            // resetAutoSlideCategory();
        } else if (e.key === 'ArrowRight') {
            // Keyingi slayd - OLD
            // const items = foodData[currentCategory];
            // currentIndexCategory = (currentIndexCategory + 1) % items.length;
            // showSlideCategory(currentIndexCategory);
            // resetAutoSlideCategory();
        } else if (e.key === 'Enter') {
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
