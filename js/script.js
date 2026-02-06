function initAuth() {
    const authButtons = document.getElementById('auth-buttons');
    if (!authButtons) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        const firstName = currentUser.name.split(' ')[0] || currentUser.name;
        authButtons.innerHTML = `
            <span class="user-greeting">
                <i class="fas fa-user"></i>
                <span>${firstName}</span>
            </span>
            <button class="btn-logout" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                <span>Выйти</span>
            </button>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="pages/login.html" class="btn-login">
                <i class="fas fa-sign-in-alt"></i>
                <span>Войти</span>
            </a>
            <a href="pages/login.html#register" class="btn-register">
                <i class="fas fa-user-plus"></i>
                <span>Регистрация</span>
            </a>
        `;
        
        // Для главной страницы
        if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
            authButtons.innerHTML = `
                <a href="pages/login.html" class="btn-login">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Войти</span>
                </a>
                <a href="pages/login.html#register" class="btn-register">
                    <i class="fas fa-user-plus"></i>
                    <span>Регистрация</span>
                </a>
            `;
        }
    }
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
        localStorage.removeItem('currentUser');
        
        // Показываем уведомление
        showNotification('Вы успешно вышли из системы', 'success');
        
        // Обновляем интерфейс
        setTimeout(() => {
            initAuth();
            
            // Если на странице профиля или админки - перенаправляем на главную
            if (window.location.pathname.includes('account.html') || 
                window.location.pathname.includes('admin.html')) {
                window.location.href = '../index.html';
            }
        }, 1000);
    }
}

function requireAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Для доступа к этой странице необходимо авторизоваться');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Доступ запрещен. Требуются права администратора');
        window.location.href = '../index.html';
        return false;
    }
    return true;
}
// В script.js обновите функцию addToCart:
function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Товар добавлен в корзину', 'success');
    
    // Если мы на странице корзины, обновляем ее
    if (window.location.pathname.includes('cart.html')) {
        if (typeof loadCart === 'function') {
            loadCart();
        }
        if (typeof loadRecommendedProducts === 'function') {
            loadRecommendedProducts();
        }
    }
    
    return true;
}
// Базовые функции
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: "Холодильник Samsung Side-by-Side",
            price: 89999,
            oldPrice: 99999,
            category: "kitchen",
            image: "https://images.unsplash.com/photo-1571175443880-49e1d1b5d48b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            reviews: 128,
            inStock: true,
            code: "SAM-FR-001",
            stock: 15
        },
        {
            id: 2,
            name: "Робот-пылесос Xiaomi Mi Robot",
            price: 24999,
            category: "cleaning",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.5,
            reviews: 89,
            inStock: true,
            code: "XIA-VC-002",
            stock: 8
        },
        {
            id: 3,
            name: "Стиральная машина LG",
            price: 45999,
            oldPrice: 49999,
            category: "appliances",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            reviews: 156,
            inStock: true,
            code: "LG-WM-003",
            stock: 12
        },
        {
            id: 4,
            name: "Телевизор Sony Bravia 55",
            price: 69999,
            oldPrice: 79999,
            category: "electronics",
            image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.6,
            reviews: 203,
            inStock: true,
            code: "SON-TV-004",
            stock: 7
        },
        {
            id: 5,
            name: "Кофемашина DeLonghi",
            price: 32999,
            category: "kitchen",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.4,
            reviews: 67,
            inStock: true,
            code: "DEL-CM-005",
            stock: 10
        },
        {
            id: 6,
            name: "Ноутбук Apple MacBook Pro",
            price: 129999,
            oldPrice: 139999,
            category: "electronics",
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            reviews: 312,
            inStock: true,
            code: "APP-MB-006",
            stock: 5
        },
        {
            id: 7,
            name: "Микроволновая печь Bosch",
            price: 14999,
            category: "kitchen",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.3,
            reviews: 45,
            inStock: true,
            code: "BOS-MW-007",
            stock: 18
        },
        {
            id: 8,
            name: "Пылесос Dyson V11",
            price: 39999,
            oldPrice: 44999,
            category: "cleaning",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            reviews: 178,
            inStock: true,
            code: "DYS-VC-008",
            stock: 9
        }
    ];
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

function updateFavCount() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    document.querySelectorAll('.fav-count').forEach(el => {
        el.textContent = favorites.length;
    });
}

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId: productId, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification('Товар добавлен в корзину');
}

function toggleFavorite(productId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.indexOf(productId);
    
    if (index === -1) {
        favorites.push(productId);
        showNotification('Товар добавлен в избранное');
    } else {
        favorites.splice(index, 1);
        showNotification('Товар удален из избранного');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavCount();
    return index === -1;
}

function isFavorite(productId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.includes(productId);
}

function showNotification(message, type = 'success') {
    // Проверяем, не существует ли уже уведомление
    if (document.querySelector('.notification')) {
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Показываем с анимацией
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Убираем через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Функции для пользователей
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

function isLoggedIn() {
    return !!getCurrentUser();
}

function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateAuthUI();
        return { success: true, user };
    }
    
    return { success: false, message: 'Неверный email или пароль' };
}

function register(userData) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Проверка на существующего пользователя
    if (users.find(u => u.email === userData.email)) {
        return { success: false, message: 'Пользователь с таким email уже существует' };
    }
    
    const newUser = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        address: userData.address || '',
        role: 'user',
        createdAt: new Date().toISOString(),
        regDate: new Date().toLocaleDateString('ru-RU')
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Автоматический вход после регистрации
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateAuthUI();
    
    return { success: true, user: newUser };
}

function logout() {
    localStorage.removeItem('currentUser');
    updateAuthUI();
    
    // Если на странице профиля или админки - перенаправляем на главную
    if (window.location.pathname.includes('account.html') || 
        window.location.pathname.includes('admin.html')) {
        window.location.href = '../index.html';
    } else {
        // Иначе обновляем текущую страницу
        window.location.reload();
    }
}

// Обновление интерфейса авторизации
function updateAuthUI() {
    const currentUser = getCurrentUser();
    const authElements = document.querySelectorAll('#auth-links, .auth-section');
    
    authElements.forEach(element => {
        if (currentUser) {
            // Пользователь авторизован
            if (element.id === 'auth-links') {
                element.innerHTML = `
                    <a href="pages/account.html" class="user-profile">
                        <i class="fas fa-user-circle"></i> ${currentUser.name}
                    </a>
                    <a href="#" onclick="logout()" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </a>
                `;
            }
            
            // Скрываем формы входа, показываем приветствие
            const loginForms = element.querySelectorAll('.login-form, .register-form');
            loginForms.forEach(form => form.style.display = 'none');
            
            const welcomeMsg = element.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.style.display = 'block';
                welcomeMsg.innerHTML = `<p>Добро пожаловать, ${currentUser.name}!</p>`;
            }
        } else {
            // Пользователь не авторизован
            if (element.id === 'auth-links') {
                element.innerHTML = `
                    <a href="pages/login.html" class="login-btn">
                        <i class="fas fa-sign-in-alt"></i> Войти
                    </a>
                    <a href="pages/register.html" class="register-btn">
                        <i class="fas fa-user-plus"></i> Регистрация
                    </a>
                `;
            }
            
            // Показываем формы входа
            const loginForms = element.querySelectorAll('.login-form, .register-form');
            loginForms.forEach(form => form.style.display = 'block');
            
            const welcomeMsg = element.querySelector('.welcome-message');
            if (welcomeMsg) {
                welcomeMsg.style.display = 'none';
            }
        }
    });
}

// Обновленная функция createOrder в script.js
function createOrder(cartItems, customerData, paymentMethod) {
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const currentUser = getCurrentUser();
    
    // Проверяем наличие товаров и их количество
    let subtotal = 0;
    let items = [];
    let stockErrors = [];
    
    cartItems.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            // Проверяем количество товара на складе
            const availableStock = product.stock || (product.inStock ? 10 : 0);
            if (availableStock < item.quantity) {
                stockErrors.push({
                    product: product.name,
                    requested: item.quantity,
                    available: availableStock
                });
                return;
            }
            
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            
            items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image,
                stockBefore: availableStock
            });
            
            // Уменьшаем количество товара на складе
            product.stock = availableStock - item.quantity;
            if (product.stock <= 0) {
                product.inStock = false;
            }
        }
    });
    
    // Если есть ошибки с количеством
    if (stockErrors.length > 0) {
        let errorMessage = 'Недостаточно товара на складе:\n';
        stockErrors.forEach(error => {
            errorMessage += `- ${error.product}: доступно ${error.available}, запрошено ${error.requested}\n`;
        });
        throw new Error(errorMessage);
    }
    
    // Расчет доставки
    const storeSettings = JSON.parse(localStorage.getItem('storeSettings'));
    const freeDeliveryThreshold = storeSettings?.freeDeliveryThreshold || 20000;
    const deliveryCostDefault = storeSettings?.deliveryCost || 500;
    const deliveryCost = subtotal >= freeDeliveryThreshold ? 0 : deliveryCostDefault;
    
    // Расчет скидки
    const promoCode = localStorage.getItem('activePromoCode');
    let discount = 0;
    
    if (promoCode === 'TECHNO10') {
        discount = subtotal * 0.1;
    } else if (promoCode === 'WELCOME500') {
        discount = 500;
    }
    
    const total = subtotal + deliveryCost - discount;
    
    // Создание объекта заказа
    const orderId = Date.now();
    const order = {
        id: orderId,
        userId: currentUser ? currentUser.id : null,
        customer: {
            ...customerData,
            userId: currentUser ? currentUser.id : null
        },
        items: items,
        payment: paymentMethod,
        subtotal: subtotal,
        delivery: deliveryCost,
        discount: discount,
        total: total,
        status: 'processing',
        date: new Date().toLocaleDateString('ru-RU'),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
    };
    
    // Сохранение заказа
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Обновление товаров (уменьшение количества)
    localStorage.setItem('products', JSON.stringify(products));
    
    // Очистка корзины и промокода
    localStorage.removeItem('cart');
    localStorage.removeItem('activePromoCode');
    
    // Обновление счетчиков
    updateCartCount();
    
    // Обновление статистики магазина
    updateOrderStats(total);
    
    // Обновление статистики пользователя (если он авторизован)
    if (currentUser) {
        updateUserOrderStats(currentUser.id, total);
    }
    
    // Триггер обновления админки
    triggerAdminUpdate();
    
    // Триггер обновления профиля
    triggerProfileUpdate();
    
    // Показываем уведомление
    showNotification(`Заказ #${orderId} успешно создан!`, 'success');
    
    return order;
}

// Новая функция для обновления статистики пользователя
function updateUserOrderStats(userId, orderTotal) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        if (!users[userIndex].orderStats) {
            users[userIndex].orderStats = {
                totalOrders: 0,
                totalSpent: 0,
                lastOrderDate: null
            };
        }
        
        users[userIndex].orderStats.totalOrders += 1;
        users[userIndex].orderStats.totalSpent += orderTotal;
        users[userIndex].orderStats.lastOrderDate = new Date().toISOString();
        
        // Сохраняем дату последнего заказа в основном объекте для удобства
        users[userIndex].lastOrderDate = new Date().toLocaleDateString('ru-RU');
        
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Триггер для обновления админки
function triggerAdminUpdate() {
    // Проверяем, открыта ли админка
    if (window.location.pathname.includes('admin.html')) {
        // Если админка уже загружена, обновляем данные
        if (typeof loadAdminStats === 'function') {
            loadAdminStats();
        }
        if (typeof loadOrdersTable === 'function') {
            loadOrdersTable();
        }
        if (typeof loadProductsTable === 'function') {
            loadProductsTable();
        }
    } else {
        // Устанавливаем флаг для обновления при следующем заходе в админку
        localStorage.setItem('adminNeedsRefresh', 'true');
    }
}

// Триггер для обновления профиля
function triggerProfileUpdate() {
    // Проверяем, открыт ли профиль
    if (window.location.pathname.includes('account.html')) {
        // Если профиль уже загружен, обновляем данные
        if (typeof updateAccountStats === 'function') {
            updateAccountStats();
        }
        if (typeof loadUserOrders === 'function') {
            loadUserOrders();
        }
    } else {
        // Устанавливаем флаг для обновления при следующем заходе в профиль
        localStorage.setItem('profileNeedsRefresh', 'true');
    }
}

// Упрощенная функция оформления заказа (без оплаты)
function checkoutOrder() {
    // Получаем данные из формы
    const customerData = {
        firstname: document.getElementById('checkout-firstname')?.value || '',
        lastname: document.getElementById('checkout-lastname')?.value || '',
        email: document.getElementById('checkout-email')?.value || '',
        phone: document.getElementById('checkout-phone')?.value || '',
        address: document.getElementById('checkout-address')?.value || '',
        comment: document.getElementById('checkout-comment')?.value || ''
    };
    
    // Проверяем обязательные поля
    if (!customerData.firstname || !customerData.lastname || !customerData.email || !customerData.phone) {
        alert('Пожалуйста, заполните все обязательные поля');
        return null;
    }
    
    // Получаем корзину
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Корзина пуста');
        return null;
    }
    
    // Способ оплаты (просто выбираем первый доступный)
    const paymentMethod = {
        method: 'card',
        type: 'online'
    };
    
    try {
        // Создаем заказ
        const order = createOrder(cart, customerData, paymentMethod);
        
        // Показываем подтверждение
        showOrderConfirmation(order);
        
        return order;
    } catch (error) {
        alert(error.message);
        return null;
    }
}

// Показать подтверждение заказа
function showOrderConfirmation(order) {
    // Создаем модальное окно подтверждения
    const modalHtml = `
        <div class="modal" id="order-confirmation-modal" style="display: flex;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Заказ успешно оформлен!</h3>
                    <button class="close-btn" onclick="closeOrderConfirmation()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="confirmation-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    
                    <div class="order-summary">
                        <p><strong>Номер заказа:</strong> #${order.id}</p>
                        <p><strong>Дата:</strong> ${order.date} ${order.time}</p>
                        <p><strong>Сумма:</strong> ${order.total.toLocaleString()} ₽</p>
                        <p><strong>Статус:</strong> <span class="status processing">В обработке</span></p>
                    </div>
                    
                    <div class="order-items-summary">
                        <h4>Состав заказа:</h4>
                        ${order.items.map(item => `
                            <div class="order-item-summary">
                                <span>${item.name}</span>
                                <span>${item.quantity} × ${item.price.toLocaleString()} ₽</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="customer-info">
                        <h4>Данные покупателя:</h4>
                        <p>${order.customer.firstname} ${order.customer.lastname}</p>
                        <p>${order.customer.email}</p>
                        <p>${order.customer.phone}</p>
                        ${order.customer.address ? `<p>${order.customer.address}</p>` : ''}
                    </div>
                    
                    <div class="confirmation-message">
                        <p>Спасибо за ваш заказ! Мы свяжемся с вами для подтверждения.</p>
                        <p>Информация о заказе отправлена на ваш email.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="goToAccount()">
                        <i class="fas fa-user"></i> Перейти в личный кабинет
                    </button>
                    <button class="btn btn-outline" onclick="goToHome()">
                        <i class="fas fa-home"></i> На главную
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeOrderConfirmation() {
    const modal = document.getElementById('order-confirmation-modal');
    if (modal) {
        modal.remove();
    }
}

function goToAccount() {
    closeOrderConfirmation();
    window.location.href = 'pages/account.html';
}

function goToHome() {
    closeOrderConfirmation();
    window.location.href = '../index.html';
}

// Вспомогательные функции для заказов
function getUserOrders(userId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return orders.filter(order => order.userId === userId);
}

function getAllOrders() {
    return JSON.parse(localStorage.getItem('orders')) || [];
}

function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        return true;
    }
    
    return false;
}

function getStoreStats() {
    return JSON.parse(localStorage.getItem('storeStats')) || {
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0
    };
}

function updateOrderStats(orderTotal) {
    const stats = getStoreStats();
    stats.totalOrders += 1;
    stats.totalRevenue += orderTotal;
    localStorage.setItem('storeStats', JSON.stringify(stats));
}

function getAllUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}

function getOrderStatusText(status) {
    const statusMap = {
        'processing': 'В обработке',
        'confirmed': 'Подтвержден',
        'shipped': 'Отправлен',
        'delivered': 'Доставлен',
        'cancelled': 'Отменен'
    };
    
    return statusMap[status] || status;
}

function getOrderStatusClass(status) {
    const classMap = {
        'processing': 'status-processing',
        'confirmed': 'status-confirmed',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    
    return classMap[status] || '';
}

// Инициализация данных по умолчанию
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация корзины
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Инициализация избранного
    if (!localStorage.getItem('favorites')) {
        localStorage.setItem('favorites', JSON.stringify([]));
    }
    
    // Инициализация пользователей (только если их нет)
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                id: 1,
                name: "Администратор",
                email: "admin@technodom.ru",
                password: "admin123",
                phone: "+7 (999) 123-45-67",
                address: "Москва, ул. Техническая, 15",
                role: "admin",
                createdAt: new Date().toISOString(),
                regDate: new Date().toLocaleDateString('ru-RU')
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    
    // Инициализация заказов
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    
    // Инициализация товаров
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(getDefaultProducts()));
    }
    
    // Инициализация отзывов
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    }
    
    // Инициализация статистики
    if (!localStorage.getItem('storeStats')) {
        localStorage.setItem('storeStats', JSON.stringify({
            totalOrders: 0,
            totalRevenue: 0,
            totalUsers: 1
        }));
    }
    
    // Обновление счетчиков
    updateCartCount();
    updateFavCount();
    
    // Обновление интерфейса авторизации
    updateAuthUI();
    
    // Мобильное меню
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const nav = document.querySelector('nav ul');
            if (nav) {
                nav.classList.toggle('show');
            }
        });
    }
    
    // Закрытие мобильного меню при клике на ссылку
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function() {
            const nav = document.querySelector('nav ul');
            if (nav && nav.classList.contains('show')) {
                nav.classList.remove('show');
            }
        });
    });
        setTimeout(() => {
        // Проверяем, были ли новые заказы пока пользователь был на сайте
        const lastOrderSync = localStorage.getItem('lastOrderSync');
        const now = Date.now();
        
        if (lastOrderSync && (now - parseInt(lastOrderSync)) < 30000) {
            // Была активность за последние 30 секунд - обновляем
            if (window.location.pathname.includes('account.html')) {
                triggerProfileUpdate();
            }
            if (window.location.pathname.includes('admin.html')) {
                triggerAdminUpdate();
            }
        }
        
        localStorage.setItem('lastOrderSync', Date.now().toString());
    }, 1000);
});
function loadFeaturedProducts() {
    const productsGrid = document.getElementById('featured-products');
    if (!productsGrid) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const featuredProducts = products.slice(0, 6); // Берем первые 6 товаров
    
    productsGrid.innerHTML = featuredProducts.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Техника'">
                <button class="fav-btn ${isFavorite(product.id) ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
                    <i class="fas fa-heart"></i>
                </button>
                ${product.oldPrice ? `<span class="discount-badge">-${Math.round((1 - product.price/product.oldPrice)*100)}%</span>` : ''}
            </div>
            <div class="product-info">
                <h3><a href="pages/product.html?id=${product.id}">${product.name}</a></h3>
                <div class="product-rating">
                    <i class="fas fa-star"></i>
                    <span>${product.rating}</span>
                    <span>(${product.reviews} отзывов)</span>
                </div>
                <div class="product-description">
                    ${product.category === 'kitchen' ? 'Кухонная техника' : 
                      product.category === 'electronics' ? 'Электроника' : 
                      product.category === 'cleaning' ? 'Уборка' : 'Бытовая техника'}
                </div>
                <div class="product-price">
                    ${product.oldPrice ? `
                        <span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>
                        <span class="current-price">${product.price.toLocaleString()} ₽</span>
                    ` : `
                        <span class="current-price">${product.price.toLocaleString()} ₽</span>
                    `}
                </div>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> В корзину
                </button>
            </div>
        </div>
    `).join('');
}
// Стили для уведомлений и модальных окон
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    /* Стили для уведомлений */
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        border-left: 4px solid #27ae60;
    }
    
    .notification.success {
        border-left-color: #27ae60;
    }
    
    .notification.error {
        border-left-color: #e74c3c;
    }
    
    .notification.warning {
        border-left-color: #f39c12;
    }
    
    .notification.info {
        border-left-color: #3498db;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification.success i {
        color: #27ae60;
    }
    
    .notification.error i {
        color: #e74c3c;
    }
    
    /* Стили для модальных окон */
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        justify-content: center;
        align-items: center;
    }
    
    .modal-content {
        background: white;
        border-radius: 10px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        animation: modalSlideIn 0.3s ease;
    }
    
    @keyframes modalSlideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    .confirmation-icon {
        text-align: center;
        margin: 20px 0;
    }
    
    .confirmation-icon i {
        font-size: 4rem;
        color: #27ae60;
    }
    
    .order-summary {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
    }
    
    .order-items-summary {
        margin: 20px 0;
    }
    
    .order-item-summary {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }
    
    .customer-info {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
    }
    
    .confirmation-message {
        text-align: center;
        margin: 20px 0;
        color: #666;
    }
    
    /* Стили для статусов */
    .status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 500;
    }
    
    .status-processing {
        background: #e3f2fd;
        color: #1976d2;
    }
    
    .status-confirmed {
        background: #e8f5e9;
        color: #2e7d32;
    }
    
    .status-shipped {
        background: #fff3e0;
        color: #ef6c00;
    }
    
    .status-delivered {
        background: #e8f5e9;
        color: #2e7d32;
    }
    
    .status-cancelled {
        background: #ffebee;
        color: #c62828;
    }
    
    /* Кнопки */
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .btn-primary {
        background: #3498db;
        color: white;
    }
    
    .btn-primary:hover {
        background: #2980b9;
    }
    
    .btn-outline {
        background: white;
        color: #3498db;
        border: 1px solid #3498db;
    }
    
    .btn-outline:hover {
        background: #f8f9fa;
    }
    
    .btn-lg {
        padding: 15px 30px;
        font-size: 1.1rem;
    }
    
    /* Стили для профиля пользователя */
    .user-profile {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #2c3e50;
        text-decoration: none;
        font-weight: 500;
    }
    
    .user-profile:hover {
        color: #3498db;
    }
    
    .logout-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #e74c3c;
        text-decoration: none;
        margin-left: 15px;
    }
    
    .logout-btn:hover {
        color: #c0392b;
    }
    
    .login-btn, .register-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #3498db;
        text-decoration: none;
        margin-left: 15px;
    }
    
    .login-btn:hover, .register-btn:hover {
        color: #2980b9;
    }
`;
document.head.appendChild(additionalStyles);