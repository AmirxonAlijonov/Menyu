// ============================================
// GLOBAL O'ZGARUVCHILAR
// ============================================

let currentSession = null;
let currentPage = 'dashboard';
let menuData = null;
let categoriesData = null;
let ordersData = null;
let currentCategory = null;

// ============================================
// DOM ELEMENTLARI
// ============================================

const loginPage = document.getElementById('loginPage');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const passwordInput = document.getElementById('password');
const toastContainer = document.getElementById('toastContainer');

// ============================================
// YORDAMCHI FUNKSIYALAR
// ============================================

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function getApiUrl() {
    if (window.location.origin && window.location.origin !== 'null' && window.location.origin !== 'file://') {
        return window.location.origin;
    }
    return 'http://localhost:3001';
}

async function apiRequest(endpoint, options = {}) {
    const url = `${getApiUrl()}${endpoint}`;
    
    // Always read session from localStorage for robustness
    const lsSession = localStorage.getItem('adminSession');
    const session = currentSession || lsSession;
    console.log('[apiRequest] Endpoint:', endpoint, '| currentSession:', currentSession ? 'SET' : 'NULL', '| localStorage:', lsSession ? 'SET' : 'NULL', '| using:', session ? session.substring(0, 10) + '...' : 'NULL');
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
    
    if (session) {
        config.headers.Authorization = `Bearer ${session}`;
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API xato:', error);
        throw error;
    }
}

// ============================================
// AUTHENTICATION
// ============================================

async function login(password) {
    try {
        const data = await apiRequest('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });
        
        console.log('[login] Session received:', data.session ? data.session.substring(0, 10) + '...' : 'UNDEFINED');
        currentSession = data.session;
        localStorage.setItem('adminSession', data.session);
        localStorage.setItem('adminSessionExpires', data.expires);
        console.log('[login] localStorage adminSession:', localStorage.getItem('adminSession') ? 'SET' : 'NULL');
        
        showAdminPanel();
        showToast('✅ Tizimga muvaffaqiyatli kirdingiz!');
    } catch (error) {
        showLoginError(error.message);
    }
}

function logout() {
    console.log('[logout] Called - clearing session');
    currentSession = null;
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminSessionExpires');
    
    loginPage.style.display = 'flex';
    adminPanel.style.display = 'none';
    passwordInput.value = '';
    
    showToast('👋 Tizimdan chiqdingiz');
}

async function checkSession() {
    const session = localStorage.getItem('adminSession');
    const expires = localStorage.getItem('adminSessionExpires');
    
    if (session && expires) {
        // Sessions are stored in server memory and reset on restart, so we MUST
        // verify with the server instead of trusting the local expiry timestamp.
        try {
            const res = await fetch('/api/admin/check', {
                headers: { 'Authorization': 'Bearer ' + session }
            });
            if (res.ok) {
                const data = await res.json();
                currentSession = session;
                // Ogohlantirish faqat production (Vercel) muhitida, KV majburiy
                // bo'lganda va u ulanmagan holatda ko'rsatiladi. Lokalda fayl
                // saqlash yetarli, shuning uchun qizil banner chiqmaydi.
                if (data.kvRequired && data.kvEnabled === false) {
                    showKvWarning();
                } else {
                    hideKvWarning();
                }
                showAdminPanel();
                return true;
            }
        } catch (e) {
            console.log('[checkSession] Server verification failed:', e);
        }
        // Session invalid/expired server-side (e.g. after restart) → clear and show login
        localStorage.removeItem('adminSession');
        localStorage.removeItem('adminSessionExpires');
    }
    return false;
}

// Vercel KV ulanmaganligi haqida ogohlantirish (o'zgarishlar saqlanmaydi)
function showKvWarning() {
    let banner = document.getElementById('kvWarningBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'kvWarningBanner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:#e74c3c;color:#fff;padding:10px 16px;font-size:14px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.2)';
        document.body.appendChild(banner);
    }
    banner.innerHTML = '⚠️ Diqqat: Vercel KV ulangan emas! Admin o\'zgarishlari (mahsulot qo\'shish/o\'zgartirish/o\'chirish) saqlanmaydi. KV_SETUP.md qo\'llanmasiga qarang.';
}

function hideKvWarning() {
    const banner = document.getElementById('kvWarningBanner');
    if (banner) banner.remove();
}

function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
}

function showAdminPanel() {
    loginPage.style.display = 'none';
    adminPanel.style.display = 'block';
    loadDashboard();
}

// ============================================
// NAVIGATION
// ============================================

function showPage(pageName) {
    currentPage = pageName;
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });
    
    // Show/hide pages
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('hidden');
    });
    
    const pageElement = document.getElementById(`${pageName}Page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }
    
    // Load page data
    switch (pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'menu':
            loadMenuPage();
            break;
        case 'categories':
            loadCategoriesPage();
            break;
        case 'orders':
            loadOrdersPage();
            break;
    }
}

// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {
    try {
        // Load menu data
        menuData = await apiRequest('/api/admin/menu');
        
        // Calculate stats
        let totalItems = 0;
        let availableItems = 0;
        
        for (const category in menuData.items) {
            totalItems += menuData.items[category].length;
            availableItems += menuData.items[category].filter(item => item.available).length;
        }
        
        const totalCategories = Object.keys(menuData.categories || {}).length;
        
        // Update stats
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalCategories').textContent = totalCategories;
        document.getElementById('availableItems').textContent = availableItems;
        
        // Load orders
        try {
            ordersData = await apiRequest('/api/admin/orders');
            document.getElementById('totalOrders').textContent = ordersData.length;
            
            // Show recent orders
            const recentOrders = ordersData.slice(-5).reverse();
            const tbody = document.getElementById('recentOrdersTable');
            
            if (recentOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Hozircha buyurtmalar yo\'q</td></tr>';
            } else {
                tbody.innerHTML = recentOrders.map(order => `
                    <tr>
                        <td>${order.id?.slice(-8) || 'N/A'}</td>
                        <td>${order.items?.[0]?.product || 'N/A'}</td>
                        <td>${order.items?.[0]?.quantity || 0}</td>
                        <td>${order.items?.[0]?.price || 'N/A'}</td>
                        <td>${order.timestamp ? new Date(order.timestamp).toLocaleString('uz-UZ') : 'N/A'}</td>
                        <td><span class="badge badge-${order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}">${order.status || 'kutilmoqda'}</span></td>
                    </tr>
                `).join('');
            }
        } catch (e) {
            document.getElementById('totalOrders').textContent = '0';
        }
    } catch (error) {
        console.error('Dashboard yuklash xatosi:', error);
        showToast('Dashboard yuklashda xatolik: ' + error.message, 'error');
    }
}

// ============================================
// MENU MANAGEMENT
// ============================================

async function loadMenuPage() {
    try {
        menuData = await apiRequest('/api/admin/menu');
        categoriesData = menuData.categories || {};
        
        // Generate tabs
        const tabsContainer = document.getElementById('menuTabs');
        tabsContainer.innerHTML = Object.keys(categoriesData).map(cat => `
            <button class="tab ${cat === currentCategory ? 'active' : ''}" data-category="${cat}" onclick="selectMenuCategory('${cat}')">
                ${categoriesData[cat].name}
            </button>
        `).join('');
        
        // Select first category if none selected
        if (!currentCategory || !categoriesData[currentCategory]) {
            currentCategory = Object.keys(categoriesData)[0];
        }
        
        // Load items for selected category
        loadMenuItems(currentCategory);
    } catch (error) {
        console.error('Menu yuklash xatosi:', error);
        showToast('Menyu yuklashda xatolik: ' + error.message, 'error');
    }
}

function selectMenuCategory(category) {
    currentCategory = category;
    
    // Update active tab
    document.querySelectorAll('#menuTabs .tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    loadMenuItems(category);
}

async function loadMenuItems(category) {
    const container = document.getElementById('menuTabContent');
    const items = menuData.items[category] || [];
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <p>Bu kategoriyada mahsulotlar yo'q</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Rasm</th>
                        <th>Nomi</th>
                        <th>Tavsif</th>
                        <th>Narx</th>
                        <th>Holat</th>
                        <th>Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>
                                ${item.image ? 
                                    `<img src="${item.image}" class="image-preview" alt="${item.title}" onerror="this.style.display='none'">` :
                                    `<div class="image-preview-placeholder">🍽️</div>`
                                }
                            </td>
                            <td><strong>${item.title}</strong></td>
                            <td>${item.description?.slice(0, 50) || '-'}${item.description?.length > 50 ? '...' : ''}</td>
                            <td>${item.price}</td>
                            <td>
                                <span class="badge badge-${item.available ? 'success' : 'danger'}">
                                    ${item.available ? 'Mavjud' : 'Tugagan'}
                                </span>
                            </td>
                            <td>
                                <div class="actions">
                                    <button class="btn btn-sm btn-secondary" onclick="editItem('${item.id}')">✏️</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteItem('${item.id}')">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function openItemModal(itemId = null) {
    const modal = document.getElementById('itemModal');
    const form = document.getElementById('itemForm');
    const title = document.getElementById('itemModalTitle');
    
    // Populate category select
    const categorySelect = document.getElementById('itemCategory');
    categorySelect.innerHTML = Object.keys(categoriesData).map(cat => 
        `<option value="${cat}">${categoriesData[cat].name}</option>`
    ).join('');
    
    if (itemId) {
        // Edit mode
        title.textContent = 'Mahsulotni tahrirlash';
        const item = findItemById(itemId);
        if (item) {
            document.getElementById('itemId').value = item.id;
            document.getElementById('itemCategory').value = item.category;
            document.getElementById('itemTitle').value = item.title;
            document.getElementById('itemDescription').value = item.description || '';
            document.getElementById('itemPrice').value = item.price;
            document.getElementById('itemImage').value = item.image || '';
            document.getElementById('itemHasSizes').checked = item.hasSizes || false;
            document.getElementById('itemHasWeight').checked = item.hasWeight || false;
            document.getElementById('itemAvailable').checked = item.available !== false;
        }
    } else {
        // Create mode
        title.textContent = 'Yangi mahsulot';
        form.reset();
        document.getElementById('itemId').value = '';
        document.getElementById('itemCategory').value = currentCategory || Object.keys(categoriesData)[0];
        document.getElementById('itemAvailable').checked = true;
    }
    
    modal.classList.add('active');
}

function closeItemModal() {
    document.getElementById('itemModal').classList.remove('active');
}

function findItemById(itemId) {
    for (const category in menuData.items) {
        const item = menuData.items[category].find(i => i.id === itemId);
        if (item) {
            return { ...item, category };
        }
    }
    return null;
}

async function saveItem() {
    const id = document.getElementById('itemId').value;
    const category = document.getElementById('itemCategory').value;
    const title = document.getElementById('itemTitle').value;
    const description = document.getElementById('itemDescription').value;
    const price = document.getElementById('itemPrice').value;
    const image = document.getElementById('itemImage').value;
    const hasSizes = document.getElementById('itemHasSizes').checked;
    const hasWeight = document.getElementById('itemHasWeight').checked;
    const available = document.getElementById('itemAvailable').checked;
    
    if (!title || !price) {
        showToast('Iltimos, barcha majburiy maydonlarni to\'ldiring', 'error');
        return;
    }
    
    const priceValue = parseInt(price.replace(/[^\d]/g, '')) || 0;
    
    try {
        if (id) {
            // Update existing item
            await apiRequest(`/api/admin/menu/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    title,
                    description,
                    price,
                    priceValue,
                    image,
                    hasSizes,
                    hasWeight,
                    available
                })
            });
            showToast('✅ Mahsulot muvaffaqiyatli yangilandi!');
        } else {
            // Create new item
            await apiRequest('/api/admin/menu', {
                method: 'POST',
                body: JSON.stringify({
                    category,
                    title,
                    description,
                    price,
                    priceValue,
                    image,
                    hasSizes,
                    hasWeight,
                    available
                })
            });
            showToast('✅ Yangi mahsulot qo\'shildi!');
        }
        
        closeItemModal();
        // Serverdagi yangilangan ma'lumotlarni olish (keshdagi eski menuData o'rniga)
        menuData = await apiRequest('/api/admin/menu');
        loadMenuItems(category);
        loadDashboard();
        // O'zgarish darhol asosiy menyuda ko'rinishi uchun bir sondan keyin
        // asosiy menyuga yo'naltiramiz.
        showToast('🔄 O\'zgarish saqlandi. Asosiy menyuga o\'tilmoqda...');
        setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (error) {
        showToast('Xatolik: ' + error.message, 'error');
    }
}

async function editItem(itemId) {
    openItemModal(itemId);
}

async function deleteItem(itemId) {
    if (!confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) {
        return;
    }
    
    try {
        const item = findItemById(itemId);
        await apiRequest(`/api/admin/menu/${itemId}`, {
            method: 'DELETE'
        });
        
        showToast('✅ Mahsulot o\'chirildi!');
        // Serverdagi yangilangan ma'lumotlarni olish (keshdagi eski menuData o'rniga)
        menuData = await apiRequest('/api/admin/menu');
        loadMenuItems(item?.category || currentCategory);
        loadDashboard();
        // O'zgarish darhol asosiy menyuda ko'rinishi uchun bir sondan keyin
        // asosiy menyuga yo'naltiramiz.
        showToast('🔄 O\'zgarish saqlandi. Asosiy menyuga o\'tilmoqda...');
        setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (error) {
        showToast('Xatolik: ' + error.message, 'error');
    }
}

// ============================================
// CATEGORIES MANAGEMENT
// ============================================

async function loadCategoriesPage() {
    try {
        menuData = await apiRequest('/api/admin/menu');
        categoriesData = menuData.categories || {};
        
        const tbody = document.getElementById('categoriesTable');
        
        if (Object.keys(categoriesData).length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Hozircha kategoriyalar yo\'q</td></tr>';
            return;
        }
        
        tbody.innerHTML = Object.entries(categoriesData).map(([id, cat]) => {
            const itemCount = (menuData.items[id] || []).length;
            return `
                <tr>
                    <td><code>${id}</code></td>
                    <td>${cat.icon} ${cat.name}</td>
                    <td>${cat.icon}</td>
                    <td>${itemCount}</td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-sm btn-secondary" onclick="editCategory('${id}')">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCategory('${id}')">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Kategoriyalar yuklash xatosi:', error);
        showToast('Kategoriyalar yuklashda xatolik: ' + error.message, 'error');
    }
}

function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    
    if (categoryId) {
        title.textContent = 'Kategoriyani tahrirlash';
        const cat = categoriesData[categoryId];
        document.getElementById('categoryId').value = categoryId;
        document.getElementById('categoryName').value = cat.name;
        document.getElementById('categoryIcon').value = cat.icon || '';
    } else {
        title.textContent = 'Yangi kategoriya';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
    }
    
    modal.classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
}

async function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value || '🍽️';
    
    if (!name) {
        showToast('Iltimos, kategoriya nomini kiriting', 'error');
        return;
    }
    
    try {
        if (id) {
            await apiRequest(`/api/admin/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, icon })
            });
            showToast('✅ Kategoriya yangilandi!');
        } else {
            await apiRequest('/api/admin/categories', {
                method: 'POST',
                body: JSON.stringify({ id: name.toLowerCase().replace(/\s+/g, '_'), name, icon })
            });
            showToast('✅ Yangi kategoriya qo\'shildi!');
        }
        
        closeCategoryModal();
        // Serverdagi yangilangan ma'lumotlarni olish (keshdagi eski menuData o'rniga)
        menuData = await apiRequest('/api/admin/menu');
        loadCategoriesPage();
        loadDashboard();
    } catch (error) {
        showToast('Xatolik: ' + error.message, 'error');
    }
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

async function deleteCategory(categoryId) {
    if (!confirm('Haqiqatan ham bu kategoriyani o\'chirmoqchimisiz? Bunga tegishli barcha mahsulotlar o\'chiriladi!')) {
        return;
    }
    
    try {
        await apiRequest(`/api/admin/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        showToast('✅ Kategoriya o\'chirildi!');
        // Serverdagi yangilangan ma'lumotlarni olish (keshdagi eski menuData o'rniga)
        menuData = await apiRequest('/api/admin/menu');
        loadCategoriesPage();
        loadDashboard();
    } catch (error) {
        showToast('Xatolik: ' + error.message, 'error');
    }
}

// ============================================
// ORDERS MANAGEMENT
// ============================================

async function loadOrdersPage() {
    try {
        ordersData = await apiRequest('/api/admin/orders');
        
        const tbody = document.getElementById('ordersTable');
        
        if (ordersData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-secondary);">Hozircha buyurtmalar yo\'q</td></tr>';
            return;
        }
        
        tbody.innerHTML = ordersData.slice().reverse().map(order => `
            <tr>
                <td><code>${order.id?.slice(-8) || 'N/A'}</code></td>
                <td>${order.items?.map(i => i.product).join(', ') || 'N/A'}</td>
                <td>${order.items?.map(i => i.quantity).join(', ') || '0'}</td>
                <td>${order.items?.map(i => i.price).join(', ') || 'N/A'}</td>
                <td>${order.address || order.tableNumber || order.kabinaNumber || order.tabchaNumber || 'N/A'}</td>
                <td>${order.timestamp ? new Date(order.timestamp).toLocaleString('uz-UZ') : 'N/A'}</td>
                <td>
                    <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 4px 8px; background: var(--input-bg); color: var(--text); border: 1px solid var(--border); border-radius: 4px;">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Kutilmoqda</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Jarayonda</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Bajarildi</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Bekor qilindi</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="viewOrder('${order.id}')">👁️</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Buyurtmalar yuklash xatosi:', error);
        showToast('Buyurtmalar yuklashda xatolik: ' + error.message, 'error');
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        await apiRequest(`/api/admin/orders/${orderId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        showToast('✅ Buyurtma holati yangilandi!');
    } catch (error) {
        showToast('Xatolik: ' + error.message, 'error');
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Buyurtmani o\'chirishni tasdiqlaysizmi?')) return;
    try {
        await apiRequest(`/api/admin/orders/${orderId}`, {
            method: 'DELETE'
        });
        showToast('✅ Buyurtma o\'chirildi!');
        loadOrdersPage();
    } catch (error) {
        showToast('Xatolik: ' + error.message, 'error');
    }
}

function viewOrder(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;
    
    const message = `
Buyurtma ma'lumotlari:
━━━━━━━━━━━━━━━━━━
ID: ${order.id}
Mahsulot: ${order.items?.map(i => `${i.product} x${i.quantity}`).join('\n') || 'N/A'}
Narx: ${order.items?.map(i => i.price).join(', ') || 'N/A'}
Joylashuv: ${order.address || order.tableNumber || order.kabinaNumber || order.tabchaNumber || 'N/A'}
Vaqt: ${order.timestamp ? new Date(order.timestamp).toLocaleString('uz-UZ') : 'N/A'}
Holat: ${order.status || 'kutilmoqda'}
    `.trim();
    
    alert(message);
}

// ============================================
// EVENT LISTENERS
// ============================================

// Login form
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('[loginForm] Submit event fired');
    const password = passwordInput.value;
    console.log('[loginForm] Password length:', password ? password.length : 0);
    if (password) {
        login(password);
    }
});

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) {
            showPage(page);
        }
    });
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
});

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Check for existing session (checkSession is async and shows panel if valid)
    const hasSession = await checkSession();
    if (!hasSession) {
        loginPage.style.display = 'flex';
        adminPanel.style.display = 'none';
    }
});
