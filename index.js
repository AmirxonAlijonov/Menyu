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
            image: "https://api.silkphoto.uz/storage/ResourceThumbnail/c47ad3b4-fc99-4df6-a580-0b623ee89b41/YzQ3YWQzYjQtZmM5OS00ZGY2LWE1ODAtMGI2MjNlZTg5YjQxLTE3MzY5NTEyNTc=.webp"
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
            image: "https://shar-shara.ru/wp-content/uploads/2024/10/IMG_0254.jpg"
        },
        {
            title: "Achchiq Chuchuk Salat",
            description: "Achchiq va shirin ta'mli salad: qizilmiya, cho'chqa, pomidor va maxsus sous.",
            price: "15,000 so'm",
            image: "https://avatars.mds.yandex.net/get-vertis-journal/4220003/e733d115-1f98-45da-9e28-9f1ba3520354.jpeg/1600x1600"
        }
    ],
    mains1: [
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
    mains2: [
        {
            title: "Jiz",
            description: "Mol go'shtidan tayyorlangan mazali taom. Qiyma go'sht, piyoz va maxsus ziravorlar bilan.",
            price: "250,000 so'm",
            hasWeight: true,
            baseWeight: 1000,
            pricePerGram: 250,
            minWeight: 300,
            image: "https://adrastravel.com/wp-content/uploads/2023/04/jiz.jpg"
        },
        {
            title: "Tabaka",
            description: "Butun tovuqni yog'da press bilan bosib tayyorlangan shirali va mazali taom.",
            price: "60,000 so'm",
            image: "https://images.getrecipekit.com/20240403145433-tabaka-for-card.jpg?aspect_ratio=16:9&quality=90&"
        },
        {
            title: "Vag'ori",
            description: "An'anaviy oshpazlik usulida tayyorlangan mazali Vag'ori taomi. Go'sht va sabzavotlar bilan pishiriladi.",
            price: "250,000 so'm",
            hasWeight: true,
            baseWeight: 1000,
            pricePerGram: 250,
            minWeight: 300,
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlYjrX2TZPKi5lhLkyTGO6RwbqlRk_EvyNlQ&s"
        },
        {
            title: "KFS",
            description: "Maxsus marinadlangan qovurilgan tovuq va qovurilgan kartoshka (fri) bilan. KFS - mashhur fast food taomi.",
            price: "80,000 so'm",
            hasWeight: true,
            baseWeight: 1000,
            pricePerGram: 80,
            minWeight: 300,
            image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800"
        },
        {
            title: "Barbekyu",
            description: "Go'shtni maxsus barbekyu sousi bilan grillda pishirilgan mazali taom.",
            price: "250,000 so'm",
            hasWeight: true,
            baseWeight: 1000,
            pricePerGram: 250,
            minWeight: 300,
            image: "https://img.theepochtimes.com/assets/uploads/2021/05/31/shutterstock_1828017947-1-1080x720.jpg"
        },
        {
            title: "Mol Go'shti Shashlik",
            description: "Maxsus marinadlangan mol go'shtidan tayyorlangan shirali shashlik. Uzun vaqt davomida kokilarda pishiriladi va ajoyib ta'mga ega bo'ladi.",
            price: "110,000 so'm",
            image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800"
        },
        {
            title: "Qozon Kabob",
            description: "Qozonda pishirilgan mazali kabob. Go'sht, sabzavotlar va maxsus ziravorlar bilan.",
            price: "250,000 so'm",
            hasWeight: true,
            baseWeight: 1000,
            pricePerGram: 250,
            minWeight: 300,
            image: "https://makepedia.uz/wp-content/uploads/2018/04/qozon-kabob.jpg"
        },
        {
            title: "Manti",
            description: "Go'sht va sabzavotlar bilan tayyorlangan an'anaviy O'zbek taomi. Bug'da pishiriladi.",
            price: "7,000 so'm",
            image: "https://petersfoodadventures.com/wp-content/uploads/2016/05/Manti-Russian.png"
        },
        {
            title: "Tandir Somsa",
            description: "Tandirda pishirilgan go'shtli an'anaviy somsa.",
            price: "15,000 so'm",
            image: "https://pbs.twimg.com/media/Gd30LNDawAA2y_p.jpg"
        }
    ],
    mains: [],
    drinks: [
        {
            title: "Coca Cola",
            description: "Gazli ichimlik. Sovuq va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            hasSizes: true,
            sizes: {
                "1.5l": { price: 17000, desc: "1.5 litr" },
                "1l": { price: 12000, desc: "1 litr" },
                "0.5l": { price: 8000, desc: "0.5 litr" }
            },
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800"
        },
        {
            title: "Ko'k Choy",
            description: "Issiq yashil choy limon va asal bilan. Bu ichimlik sog'liq uchun juda foydali va tetiklashtiradi.",
            price: "2,000 so'm",
            image: "https://homiladorlik.uz/wp-content/uploads/2022/05/kok-choy.webp"
        },
        {
            title: "Fanta",
            description: "Gazli apelsinli ichimlik. Mashhur va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            hasSizes: true,
            sizes: {
                "1.5l": { price: 17000, desc: "1.5 litr" },
                "1l": { price: 12000, desc: "1 litr" },
                "0.5l": { price: 8000, desc: "0.5 litr" }
            },
            image: "https://thumbs.dreamstime.com/b/can-fanta-orange-moscow-russia-april-coca-cola-company-soft-drink-ice-global-brand-fruit-flavored-carbonated-63824545.jpg"
        },
        {
            title: "Pepsi",
            description: "Gazli ichimlik. Mashhur va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            hasSizes: true,
            sizes: {
                "1.5l": { price: 17000, desc: "1.5 litr" },
                "1l": { price: 12000, desc: "1 litr" },
                "0.5l": { price: 8000, desc: "0.5 litr" }
            },
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL5xpJ6WWLQZvHlDhrZrL5JtPZlf2Ul8CgbQ&s"
        },
        {
            title: "Qora Choy",
            description: "Issiq qora choy suty bilan. An'anaviy ichimlik.",
            price: "5,000 so'm",
            image: "https://xabar.uz/static/crop/1/2/736_736_95_1223447726.jpg"
        },
        {
            title: "Limon Choy",
            description: "Maxsus tayyorlangan limonli choy - yangi limon va choy bilan tayyorlangan.",
            price: "20,000 so'm",
            image: "https://data.daryo.uz/media/2023/10/651f186ece54c.jpg"
        },
        {
            title: "Sok",
            description: "Tabiiy meva sharbati - aralash mevalar.",
            price: "20,000 so'm",
            image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800"
        },
        {
            title: "Sprite",
            description: "Gazli limonato ichimlik. Sovuq va tetiklashtiruvchi ichimlik.",
            price: "17,000 so'm",
            hasSizes: true,
            sizes: {
                "1.5l": { price: 17000, desc: "1.5 litr" },
                "1l": { price: 12000, desc: "1 litr" },
                "0.5l": { price: 8000, desc: "0.5 litr" }
            },
            image: "https://www.shutterstock.com/image-photo/poznan-pol-apr-02-2025-260nw-2609175503.jpg"
        }
    ]
};

// Bo'limni ochish funksiyasi
function openCategory(category) {
    // Hamma sahifalarni yashirish
    document.getElementById('mainPage').classList.remove('active');
    document.getElementById('saladsPage').classList.remove('active');
    document.getElementById('mains1Page').classList.remove('active');
    document.getElementById('mains2Page').classList.remove('active');
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
    document.getElementById('mains1Page').classList.remove('active');
    document.getElementById('mains2Page').classList.remove('active');
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
    const modalImg = document.getElementById('modalImg');
    modalImg.src = foodInfo.image;
    modalImg.alt = foodInfo.title;
    // Image error handling - show fallback
    modalImg.onerror = function () {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23f0f0f0" width="300" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="16"%3ERasm yuklanmadi%3C/text%3E%3C/svg%3E';
        this.style.background = 'linear-gradient(135deg, #f0f0f0 0%25, #e0e0e0 100%25)';
    };
    document.getElementById('modalTitle').textContent = foodInfo.title;
    document.getElementById('modalDesc').textContent = foodInfo.description;
    document.getElementById('modalPrice').textContent = foodInfo.price;
    document.getElementById('modalPrice').dataset.basePrice = foodInfo.price;

    // Asosiy narxni global o'zgaruvchida saqlash
    baseProductPrice = parseInt(foodInfo.price.replace(/[^0-9]/g, ''));

    // Size selectionni ko'rsatish yoki yashirish
    const sizeContainer = document.getElementById('sizeSelectContainer');
    const weightContainer = document.getElementById('weightSelectContainer');

    if (foodInfo.hasSizes && sizeContainer) {
        sizeContainer.style.display = 'flex';
        if (weightContainer) weightContainer.style.display = 'none';
        // Default tanlov: 1.5l
        selectSize('1.5l', foodInfo);
    } else if (foodInfo.hasWeight && weightContainer) {
        if (sizeContainer) sizeContainer.style.display = 'none';
        weightContainer.style.display = 'flex';
        // Default og'irlik
        setDefaultWeight(foodInfo);
    } else {
        if (sizeContainer) sizeContainer.style.display = 'none';
        if (weightContainer) weightContainer.style.display = 'none';
    }

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
    const modalImg = document.getElementById('modalImg');
    modalImg.src = foodInfo.image;
    modalImg.alt = foodInfo.title;
    // Image error handling - show fallback
    modalImg.onerror = function () {
        this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect fill="%23f0f0f0" width="300" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="16"%3ERasm yuklanmadi%3C/text%3E%3C/svg%3E';
        this.style.background = 'linear-gradient(135deg, #f0f0f0 0%25, #e0e0e0 100%25)';
    };
    document.getElementById('modalTitle').textContent = foodInfo.title;
    document.getElementById('modalDesc').textContent = foodInfo.description;
    document.getElementById('modalPrice').textContent = foodInfo.price;
    document.getElementById('modalPrice').dataset.basePrice = foodInfo.price;

    // Asosiy narxni global o'zgaruvchida saqlash
    baseProductPrice = parseInt(foodInfo.price.replace(/[^0-9]/g, ''));

    // Size selectionni ko'rsatish yoki yashirish
    const sizeContainer = document.getElementById('sizeSelectContainer');
    const weightContainer = document.getElementById('weightSelectContainer');

    if (foodInfo.hasSizes && sizeContainer) {
        sizeContainer.style.display = 'flex';
        if (weightContainer) weightContainer.style.display = 'none';
        // Default tanlov: 1.5l
        selectSize('1.5l', foodInfo);
    } else if (foodInfo.hasWeight && weightContainer) {
        if (sizeContainer) sizeContainer.style.display = 'none';
        weightContainer.style.display = 'flex';
        // Default hajm
        setDefaultWeight(foodInfo);
    } else {
        if (sizeContainer) sizeContainer.style.display = 'none';
        if (weightContainer) weightContainer.style.display = 'none';
    }

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

// Hajm (size) tanlash funksiyasi
function selectSize(size, foodInfo) {
    // Avval joriy itemni topish (agar foodInfo berilmagan bo'lsa)
    if (!foodInfo) {
        // currentCategory va currentIndexCategory dan olishga harakat qilamiz
        if (currentCategory && foodData[currentCategory] && foodData[currentCategory][currentIndexCategory]) {
            foodInfo = foodData[currentCategory][currentIndexCategory];
        }
        // Agar topilmasa, title bo'yicha izlaymiz
        if (!foodInfo) {
            const title = document.getElementById('modalTitle').textContent;
            for (const cat in foodData) {
                const found = foodData[cat].find(item => item.title === title);
                if (found) {
                    foodInfo = found;
                    break;
                }
            }
        }
    }

    // Size container ni ko'rsatish
    const sizeContainer = document.getElementById('sizeSelectContainer');
    if (sizeContainer) {
        if (foodInfo && foodInfo.hasSizes) {
            sizeContainer.style.display = 'flex';
        } else {
            sizeContainer.style.display = 'none';
            return;
        }
    }

    if (!foodInfo || !foodInfo.hasSizes || !foodInfo.sizes) {
        return;
    }

    const sizeData = foodInfo.sizes[size];
    if (!sizeData) {
        return;
    }

    // Base pricer yangilash
    baseProductPrice = sizeData.price;

    // Tugmalarni yangilash
    const buttons = document.querySelectorAll('.size-btn');
    buttons.forEach(btn => {
        if (btn.dataset.size === size) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

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

    // Og'irlik bo'lsa, narxni yangilash
    const weightInput = document.getElementById('modalWeight');
    if (weightInput) {
        let weight = parseInt(weightInput.value) || 0;
        const title = document.getElementById('modalTitle').textContent;
        // Taomni topish
        let foodInfo = null;
        for (const cat in foodData) {
            const found = foodData[cat].find(item => item.title === title);
            if (found && found.hasWeight) {
                foodInfo = found;
                break;
            }
        }
        if (foodInfo && foodInfo.pricePerGram) {
            // Minimal hajm tekshiruv
            if (weight < foodInfo.minWeight) {
                weight = foodInfo.minWeight;
                weightInput.value = weight;
            }
            basePrice = weight * foodInfo.pricePerGram;
        }
    }

    // Jami narx: asosiy narx * miqdor
    const totalPrice = basePrice * quantity;

    // Natijani ko'rsatish
    document.getElementById('modalPrice').textContent = totalPrice.toLocaleString() + " so'm";
}

// Default hajmni o'rnatish
function setDefaultWeight(foodInfo) {
    const weightInput = document.getElementById('modalWeight');
    if (weightInput && foodInfo && foodInfo.baseWeight) {
        weightInput.value = foodInfo.baseWeight;
        weightInput.min = foodInfo.minWeight || 300;
        // Hint yangilash
        const hint = document.querySelector('.weight-hint');
        if (hint) {
            hint.textContent = 'Minimal og\'irlik: ' + (foodInfo.minWeight || 300) + 'g';
        }
    }
    updateModalPrice();
}

// Og'irlik o'zgartirganda narxni yangilash
function updateWeightPrice() {
    updateModalPrice();
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

    // Joylashuv ma'lumotlarini olish
    let tableType = null, tableNumber = null, kabinaNumber = null, tabchaNumber = null;
    const locationAddress = userLocation.address;

    if (locationAddress) {
        if (locationAddress.includes('Stol raqami:')) {
            tableType = 'stol';
            tableNumber = locationAddress.replace('Stol raqami:', '').trim();
        } else if (locationAddress.includes('Kabina raqami:')) {
            tableType = 'kabina';
            kabinaNumber = locationAddress.replace('Kabina raqami:', '').trim();
        } else if (locationAddress.includes('Tabchan raqami:')) {
            tableType = 'tabcha';
            tabchaNumber = locationAddress.replace('Tabchan raqami:', '').trim();
        } else {
            tableType = 'address';
        }
    } else {
        showToast('❌ Xato!', 'Iltimos, avval joylashuvni tanlang!', '#e74c3c');
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
        items: [{
            product: title,
            quantity: quantity,
            price: totalPriceText
        }],
        tableNumber: tableType === 'stol' ? tableNumber : null,
        kabinaNumber: tableType === 'kabina' ? kabinaNumber : null,
        tabchaNumber: tableType === 'tabcha' ? tabchaNumber : null,
        address: tableType === 'address' ? locationAddress : null,
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
        // Local server uchun default port 3001
        apiUrl = 'http://localhost:3001/api/order';
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
                } else if (tableType === 'stol') {
                    locationMsg = 'Stol: ' + tableNumber;
                } else {
                    locationMsg = 'Manzil: ' + locationAddress;
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
        apiUrl = 'http://localhost:3001/api/order';
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
// Modaldan savatga qo'shish
function addToCartFromModal() {
    var title = document.getElementById('modalTitle').textContent;
    var price = document.getElementById('modalPrice').textContent;
    var img = document.getElementById('modalImg').src;
    var qty = parseInt(document.getElementById('modalQuantity').value);

    if (isNaN(qty) || qty <= 0) {
        showToast('❌ Xato!', 'Miqdorni to\'g\'ri kiriting', '#e74c3c');
        return;
    }

    // Narxni son sifatida olish
    var priceNum = parseInt(price.replace(/[^0-9]/g, ''));

    var item = {
        id: Date.now(),
        title: title,
        price: price,
        priceNum: priceNum,
        quantity: qty,
        image: img
    };

    // Mavjud itemni tekshirish
    const existingItem = cart.find(c => c.title === item.title);
    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push(item);
    }

    saveCart();
    updateCartBadge();
    // Badge bounce animation
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.classList.add('bounce');
        setTimeout(() => badge.classList.remove('bounce'), 400);
    }
    showNotification(`${item.title} savatga qo'shildi!`);
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
    // Badge bounce animation
    const badge = document.getElementById('cartBadge');
    if (badge) {
        badge.classList.add('bounce');
        setTimeout(() => badge.classList.remove('bounce'), 400);
    }
    showNotification(`${item.title} savatga qo'shildi!`);
}

// Savatni ochish/yopish
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal.style.display === 'flex') {
        closeCart();
    } else {
        showCart();
    }
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

// Narxni parse qilish (son ga aylantirish)
function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
}

// Narxni formatlash (so'm uchun)
function formatPrice(price) {
    return price.toLocaleString() + " so'm";
}

// Savatdagi mahsulotlarni chiqarish
function renderCartItems() {
    const container = document.getElementById('cartItems');
    const totalContainer = document.getElementById('cartTotalContainer');
    const totalElement = document.getElementById('cartTotal');
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Savat bo\'sh</p>';
        totalContainer.style.display = 'none';
        return;
    }
    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.priceNum * item.quantity;
        total += itemTotal;
        return `<div class="cart-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="cart-item-info">
                <h3>${item.title}</h3>
                <p>${item.price} x ${item.quantity}</p>
                <p class="item-total">Jami: ${formatPrice(itemTotal)}</p>
            </div>
            <div class="cart-quantity-controls">
                <button class="qty-btn-small" onclick="decreaseQuantity(${item.id})">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn-small" onclick="increaseQuantity(${item.id})">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
        </div>`;
    }).join('');
    totalContainer.style.display = 'block';
    totalElement.textContent = formatPrice(total);
}

// Mahsulotni savatdan o'chirish
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartBadge();
    renderCartItems();
}

// Savatdagi miqdorni oshirish
function increaseQuantity(id) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
        saveCart();
        updateCartBadge();
        renderCartItems();
    }
}

// Savatdagi miqdorni kamayirish
function decreaseQuantity(id) {
    const item = cart.find(i => i.id === id);
    if (item && item.quantity > 1) {
        item.quantity--;
        saveCart();
        updateCartBadge();
        renderCartItems();
    } else if (item && item.quantity === 1) {
        // Agar 1 bo'lsa, o'chirishni so'rash
        if (confirm("Mahsulotni savatdan o'chirmoqchimisiz?")) {
            removeFromCart(id);
        }
    }
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

    // Agar oldin tanlangan location bo'lsa, shuni ishlat
    if (userLocation.address) {
        // Determine delivery type based on location format
        let deliveryType = 'come';
        let locationInfo = userLocation.address;

        if (userLocation.address.includes('Stol raqami:')) {
            deliveryType = 'table';
        } else if (userLocation.address.includes('Kabina raqami:')) {
            deliveryType = 'kabina';
        } else if (userLocation.address.includes('Tabchan raqami:')) {
            deliveryType = 'tabcha';
        } else {
            deliveryType = 'address';
        }

        processOrder(locationInfo, deliveryType);
        return;
    }

    // Agar location tanlanmagan bo'lsa, initial modalni ko'rsatish
    const tableSelectModal = document.getElementById('tableSelectModal');
    if (tableSelectModal) {
        tableSelectModal.style.display = 'flex';
        toggleTableInputInitial();
        closeCart();
    }
}

// Order processing after location is selected - send ALL cart items in a single order
function processOrder(locationInfo, deliveryType) {
    if (cart.length === 0) {
        showToast('❌ Xato!', 'Savat bo\'sh!', '#e74c3c');
        return;
    }

    // Determine table/kabina/tabcha numbers from location
    let tableNumber = null, kabinaNumber = null, tabchaNumber = null, address = null;

    if (locationInfo.includes('Stol raqami:')) {
        tableNumber = locationInfo.replace('Stol raqami:', '').trim();
    } else if (locationInfo.includes('Kabina raqami:')) {
        kabinaNumber = locationInfo.replace('Kabina raqami:', '').trim();
    } else if (locationInfo.includes('Tabchan raqami:')) {
        tabchaNumber = locationInfo.replace('Tabchan raqami:', '').trim();
    } else {
        address = locationInfo;
    }

    // Create a single order with all cart items
    const orderData = {
        items: cart.map(item => ({
            product: item.title,
            quantity: item.quantity,
            price: item.price
        })),
        tableNumber: tableNumber,
        kabinaNumber: kabinaNumber,
        tabchaNumber: tabchaNumber,
        address: address,
        timestamp: new Date().toISOString()
    };

    // Vercel/Production yoki local server uchun URL
    let apiUrl;
    if (window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'file://') {
        apiUrl = window.location.origin + '/api/order';
    } else {
        apiUrl = 'http://localhost:3001/api/order';
    }

    // Show loading state
    const orderBtn = document.getElementById('orderBtn');
    if (orderBtn) orderBtn.textContent = '⏳ Yuborilmoqda...';

    // Send single order
    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
        .then(response => {
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
            if (orderBtn) orderBtn.textContent = '📦 Buyurtma berish';

            if (data.success) {
                closeCart();
                showToast('✅ Muvaffaqiyat!', `Barcha ${cart.length} ta mahsulot bitta buyurtmada yuborildi!`, '#27ae60', '🎉');
                // Clear cart after successful order
                cart = [];
                saveCart();
                updateCartBadge();
            } else {
                showToast('⚠️ Xato!', data.error || 'Buyurtma yuborishda xatolik yuz berdi.', '#e67e22');
            }
        })
        .catch(error => {
            if (orderBtn) orderBtn.textContent = '📦 Buyurtma berish';
            console.error('Buyurtma yuborish xatosi:', error);

            // Offline holatda - saqlash
            if (!navigator.onLine) {
                // Save all cart items as a single order in queue for consistency
                const orderData = {
                    items: cart.map(item => ({
                        product: item.title,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    tableNumber: tableNumber,
                    kabinaNumber: kabinaNumber,
                    tabchaNumber: tabchaNumber,
                    address: address,
                    timestamp: new Date().toISOString(),
                    offline: true
                };
                saveOrderToQueue(orderData);
                showToast('📱 Offline!', 'Buyurtmalar saqlandi. Internet tiklanganda yuboriladi.', '#e67e22');
                cart = [];
                saveCart();
                updateCartBadge();
                closeCart();
            } else {
                showToast('❌ Xato!', 'Buyurtma yuborishda xatolik: ' + error.message, '#e74c3c');
            }
        });
}

// ==================== INITIAL LOCATION SELECTION ====================
// Initial location modal - toggle input fields based on table type
function toggleTableInputInitial() {
    const tableType = document.getElementById('tableTypeInitial').value;
    const stolContainer = document.getElementById('stolInputContainerInitial');
    const kabinaContainer = document.getElementById('kabineInputContainerInitial');
    const tabchaContainer = document.getElementById('tabchaInputContainerInitial');

    // Hide all first
    if (stolContainer) stolContainer.style.display = 'none';
    if (kabinaContainer) kabinaContainer.style.display = 'none';
    if (tabchaContainer) tabchaContainer.style.display = 'none';

    // Show selected
    if (tableType === 'stol' && stolContainer) {
        stolContainer.style.display = 'flex';
    } else if (tableType === 'kabina' && kabinaContainer) {
        kabinaContainer.style.display = 'flex';
    } else if (tableType === 'tabcha' && tabchaContainer) {
        tabchaContainer.style.display = 'flex';
    } else if (tableType === 'delivery') {
        // For delivery, we'll open the address modal directly
        document.getElementById('tableSelectModal').style.display = 'none';
        document.getElementById('locationModal').style.display = 'flex';
    }
}

// Save initial location selection
function saveInitialLocation() {
    const tableType = document.getElementById('tableTypeInitial').value;
    let locationNumber = null;

    if (tableType === 'stol') {
        locationNumber = document.getElementById('tableNumberInitial').value;
        if (!locationNumber || locationNumber < 1 || locationNumber > 18) {
            alert('Iltimos, stol raqamini 1 dan 18 gacha bo\'lgan son kiriting!');
            return;
        }
        userLocation.address = 'Stol raqami: ' + locationNumber;
        userLocation.deliveryAvailable = false;

        // Hide modal and show notification
        document.getElementById('tableSelectModal').style.display = 'none';
        showNotification('📍 ' + userLocation.address + ' tanlandi!');
        console.log('Location saved:', userLocation);
    } else if (tableType === 'kabina') {
        locationNumber = document.getElementById('kabineNumberInitial').value;
        if (!locationNumber || locationNumber < 1 || locationNumber > 3) {
            alert('Iltimos, kabina raqamini 1 dan 3 gacha bo\'lgan son kiriting!');
            return;
        }
        userLocation.address = 'Kabina raqami: ' + locationNumber;
        userLocation.deliveryAvailable = false;

        // Hide modal and show notification
        document.getElementById('tableSelectModal').style.display = 'none';
        showNotification('📍 ' + userLocation.address + ' tanlandi!');
        console.log('Location saved:', userLocation);
    } else if (tableType === 'tabcha') {
        locationNumber = document.getElementById('tabchaNumberInitial').value;
        if (!locationNumber || locationNumber < 1 || locationNumber > 3) {
            alert('Iltimos, tabchan raqamini 1 dan 3 gacha bo\'lgan son kiriting!');
            return;
        }
        userLocation.address = 'Tabchan raqami: ' + locationNumber;
        userLocation.deliveryAvailable = false;

        // Hide modal and show notification
        document.getElementById('tableSelectModal').style.display = 'none';
        showNotification('📍 ' + userLocation.address + ' tanlandi!');
        console.log('Location saved:', userLocation);
    } else if (tableType === 'delivery') {
        // Switch to address input modal
        document.getElementById('tableSelectModal').style.display = 'none';
        document.getElementById('locationModal').style.display = 'flex';
    }
}

// Close delivery location modal
function closeLocationModal() {
    document.getElementById('locationModal').style.display = 'none';
}

// Save delivery location
function saveDeliveryLocation() {
    const address = document.getElementById('deliveryAddress').value.trim();

    if (!address) {
        alert('Iltimos, manzilingizni kiriting!');
        return;
    }

    userLocation.address = address;
    userLocation.deliveryAvailable = true;

    // Hide modal
    document.getElementById('locationModal').style.display = 'none';

    // Show notification
    showNotification('📍 Manzil saqlandi!');

    console.log('Delivery location saved:', userLocation);
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
    loadCart();

    // Show initial location selection modal if location not set
    if (!userLocation.address) {
        const locationModal = document.getElementById('tableSelectModal');
        if (locationModal) {
            locationModal.style.display = 'flex';
            // Initialize toggle
            toggleTableInputInitial();
        }
    }

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
