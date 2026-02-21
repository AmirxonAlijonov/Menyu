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
            price: "50,000 so'm",
            image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800"
        },
        {
            title: "Sezer Salati",
            description: "Romsalat, parmesan, croutons va caesar sousi bilan.",
            price: "55,000 so'm",
            image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800"
        },
        {
            title: "Kapus Salati",
            description: "Yangi karam, sabzi va maxsus sous bilan.",
            price: "38,000 so'm",
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800"
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
            price: "65,000 so'm",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"
        }
    ],
    mains: [
        {
            title: "Kolbasali Pasta",
            description: "Italyancha pasta, maxsus sous va mazali kolbasa bilan. Pasta - Italiyaning milliy taomi hisoblanadi. Uning ko'plab turlari mavjud: spaghetti, penne, fettuccine va boshqalar. Kolbasa esa taomga ajoyib ta'm beradi.",
            price: "55,000 so'm",
            image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800"
        },
        {
            title: "Margarita Pitsasi",
            description: "Italyancha uslubda tayyorlangan, makkajo'xori va motsarella pishlog'i bilan. Bu pitsa italiyalik oshpaz Raffaele Esposito tomonidan 1889-yilda Neapolda ixtiro qilingan. Ingredientlar: pomidor sousi, motsarella, bazilik.",
            price: "75,000 so'm",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"
        },
        {
            title: "Classic Burger",
            description: "Juicy go'sht, yangi sabzavotlar va maxsus sous bilan. Burger - Amerikada ixtiro qilingan va dunyo bo'ylab juda mashhur fast food taomi. Buni tayyorlash uchun yaxshi sifatli go'sht va yangi ingredientlar kerak.",
            price: "65,000 so'm",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"
        },
        {
            title: "Asalli Pankeyk",
            description: "Yumshoq pankeyklar, yangi rezavor mevalar va tabiiy asal bilan. Pankeyk - amerika oshxonasining mashhur taomidir. U tuxum, un, sut va xamirturishdan tayyorlanadi va asal yoki jem bilan dasturxonga tortiladi.",
            price: "35,000 so'm",
            image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800"
        },
        {
            title: "Milliy Osh",
            description: "O'zbek osh - milliy taomimiz. Jo'xori, qo'y go'shti, piyoz, морковь va maxsus ziravorlar bilan tayyorlanadi. Bu taom O'zbekistonda har bir bayram stolining bosh go'zalligi hisoblanadi.",
            price: "80,000 so'm",
            image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800"
        },
        {
            title: "Mol Go'shti Shashlik",
            description: "Maxsus marinadlangan mol go'shtidan tayyorlangan shirali shashlik. Uzun vaqt davomida kokilarda pishiriladi va ajoyib ta'mga ega bo'ladi.",
            price: "70,000 so'm",
            image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800"
        },
        {
            title: "Lavash",
            description: "Yangi non, go'sht, pomidor, bodring va maxsus sous bilan tayyorlangan mazali taom. Tez vaqt ichida tayyorlanadi va juda mazali.",
            price: "50,000 so'm",
            image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800"
        },
        {
            title: "O'zbek Sho'rva",
            description: "Guruch, go'sht va sabzavotlar bilan tayyorlangan mazali sho'rva. Bu taom sovuq kunning eng yaxshi tanlovi hisoblanadi.",
            price: "45,000 so'm",
            image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"
        },
        {
            title: "Bifshteks",
            description: "Yuqori sifatli mol go'shtidan tayyorlangan nazik steak. Maxsus ziravorlar bilan marinadlangan va tamamli pishirilgan.",
            price: "90,000 so'm",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"
        }
    ],
    drinks: [
        {
            title: "Coca Cola",
            description: "Gazli ichimlik 0.5l hajmda. Sovuq va tetiklashtiruvchi ichimlik.",
            price: "15,000 so'm",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800"
        },
        {
            title: "Yashil Choy",
            description: "Issiq yashil choy limon va asal bilan. Bu ichimlik sog'liq uchun juda foydali va tetiklashtiradi.",
            price: "10,000 so'm",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800"
        },
        {
            title: "Apelsin Sharbati",
            description: "Tabiiy siqilgan apelsin sharbati. Vitamin C ga boy.",
            price: "30,000 so'm",
            image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800"
        },
        {
            title: "Qora Choy",
            description: "Issiq qora choy suty bilan. An'anaviy ichimlik.",
            price: "12,000 so'm",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800"
        },
        {
            title: "Latte Kofe",
            description: "Issiq latte kofe sut va qahva bilan. Kofe ixlasmandlari uchun eng yaxshi tanlov.",
            price: "30,000 so'm",
            image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800"
        },
        {
            title: "Limон Moxito",
            description: "Yangicha limon, мятa va gazli suv bilan tayyorlangan tetiklashtiruvchi ichimlik.",
            price: "35,000 so'm",
            image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800"
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
    showSlideCategory(0);
    
    // Avtomatik aylanishni boshlash
    startAutoSlideCategory();
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
    clearInterval(autoSlide);
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

// Fullscreen modalni yopish
function closeFullscreen() {
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Avtomatik aylanishni qayta ishga tushirish
    startAutoSlideCategory();
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
            // Oldingi slayd
            const items = foodData[currentCategory];
            currentIndexCategory = (currentIndexCategory - 1 + items.length) % items.length;
            showSlideCategory(currentIndexCategory);
            resetAutoSlideCategory();
        } else if (e.key === 'ArrowRight') {
            // Keyingi slayd
            const items = foodData[currentCategory];
            currentIndexCategory = (currentIndexCategory + 1) % items.length;
            showSlideCategory(currentIndexCategory);
            resetAutoSlideCategory();
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
