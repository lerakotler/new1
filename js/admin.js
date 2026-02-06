
// В начале файла admin.js заменяю проверки:
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Если пользователь не админ - просто показываем форму входа
    if (currentUser.role !== 'admin') {
        document.getElementById('admin-login').style.display = 'flex';
        document.getElementById('admin-panel').style.display = 'none';
        return;
    }
    
    // Если пользователь админ - показываем панель
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    
    // Загрузка данных админки
    loadAdminData();
    
    // Инициализация вкладок
    initAdminTabs();
});

// Основная функция загрузки данных админки
function loadAdminData() {
    // Инициализируем данные если нужно
    initializeAdminData();
    
    // Загружаем все таблицы и статистику
    loadAdminStats();
    loadProductsTable();
    loadOrdersTable();
    loadUsersTable();
    loadReviewsTable();
    loadCategories();
    loadStoreSettings();
    
    // Настраиваем обработчики событий
    setupEventListeners();
}

// Убираю лишние алерты из adminLogin:
function adminLogin(event) {
    event.preventDefault(); // Добавьте эту строку, чтобы форма не перезагружала страницу
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const adminUser = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.role === 'admin'
    );
    
    if (adminUser) {
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        
        loadAdminData();
        initAdminTabs();
    } else {
        alert('Неверные учетные данные или недостаточно прав');
    }
}

// Инициализация данных админки
function initializeAdminData() {
    // Инициализация статистики
    if (!localStorage.getItem('storeStats')) {
        const stats = {
            totalOrders: 0,
            totalRevenue: 0,
            totalUsers: 1, // Учитываем администратора по умолчанию
            totalProducts: 8,
            totalReviews: 0
        };
        localStorage.setItem('storeStats', JSON.stringify(stats));
    }
    
    // Инициализация заказов
    if (!localStorage.getItem('orders')) {
        localStorage.setItem('orders', JSON.stringify([]));
    }
    
    // Инициализация пользователей (добавляем админа по умолчанию)
    if (!localStorage.getItem('users')) {
        const adminUser = {
            id: 1,
            name: "Администратор",
            email: "admin@technodom.ru",
            password: "admin123",
            phone: "+7 (999) 000-00-00",
            role: "admin",
            regDate: new Date().toLocaleDateString('ru-RU'),
            address: "Москва, ул. Техническая, 15"
        };
        localStorage.setItem('users', JSON.stringify([adminUser]));
    }
    
    // Инициализация товаров если нужно
    if (!localStorage.getItem('products')) {
        initializeProducts();
    }
    
    // Инициализация отзывов если нужно
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Форма входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            adminLogin(e);
        });
    }
    
    // Форма добавления товара
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }
    
    // Форма добавления пользователя
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUser();
        });
    }
    
    // Форма добавления категории
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCategory();
        });
    }
}

// Инициализация вкладок админки
function initAdminTabs() {
    // Устанавливаем обработчики для вкладок
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchAdminTab(tabName);
        });
    });
    
    // Активируем первую вкладку по умолчанию
    switchAdminTab('products');
}

// Проверка авторизации администратора
function checkAdminAuth() {
    const adminAuth = localStorage.getItem('adminLoggedIn');
    const storedAdmin = localStorage.getItem('currentAdmin');
    
    if (adminAuth === 'true' && storedAdmin) {
        isAdminLoggedIn = true;
        currentAdmin = JSON.parse(storedAdmin);
        
        // Показываем админ-панель, скрываем форму входа
        const loginSection = document.getElementById('admin-login');
        const adminPanel = document.getElementById('admin-panel');
        
        if (loginSection) loginSection.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
    }
}

// Выход из админ-панели
function logoutAdmin() {
    if (confirm('Выйти из админ-панели?')) {
        localStorage.removeItem('currentUser');
        
        // Перезагружаем страницу
        window.location.reload();
    }
}

// Инициализация админ-панели
function initAdminPanel() {
    if (localStorage.getItem('adminNeedsRefresh') === 'true') {
        localStorage.removeItem('adminNeedsRefresh');
        // Принудительное обновление данных
        setTimeout(() => {
            loadAdminStats();
            loadOrdersTable();
            loadProductsTable();
            showNotification('Данные обновлены', 'success');
        }, 500);
    }
    // Устанавливаем имя администратора
    if (currentAdmin && document.getElementById('admin-user-name')) {
        document.getElementById('admin-user-name').textContent = currentAdmin.name;
    }
    
    loadAdminStats();
    loadProductsTable();
    loadOrdersTable();
    loadUsersTable();
    loadReviewsTable();
    loadCategories();
    loadStoreSettings();
}

// Загрузка статистики
function loadAdminStats() {
    // Получаем статистику
    const stats = JSON.parse(localStorage.getItem('storeStats')) || {};
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
    // Обновляем общую статистику
    document.getElementById('total-orders-admin').textContent = stats.totalOrders || 0;
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-reviews-admin').textContent = reviews.length;
    
    // Статистика по статусам заказов
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    
    document.getElementById('processing-orders').textContent = processingOrders;
    document.getElementById('delivered-orders').textContent = deliveredOrders;
    document.getElementById('cancelled-orders').textContent = cancelledOrders;
}

// Переключение вкладок
function switchAdminTab(tabName) {
    console.log('Переключение на вкладку:', tabName); // Для отладки
    
    // Скрыть все вкладки
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    
    // Убрать активный класс у всех кнопок
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
    } else {
        console.error('Вкладка не найдена:', tabName);
    }
    
    // Активировать кнопку
    const targetBtn = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Загрузить данные для активной вкладки
    switch(tabName) {
        case 'products':
            loadProductsTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'users':
            loadUsersTable();
            break;
        case 'reviews':
            loadReviewsTable();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'settings':
            loadStoreSettings();
            break;
    }
}

// ========== УПРАВЛЕНИЕ ТОВАРАМИ ==========

// Загрузка таблицы товаров
function loadProductsTable() {
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const container = document.getElementById('products-table');
    
    if (!container) return;
    
    container.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>
                <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
            </td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>${product.price.toLocaleString()} ₽</td>
            <td>
                <span class="status ${product.inStock ? 'delivered' : 'cancelled'}">
                    ${product.inStock ? 'В наличии' : 'Нет в наличии'}
                </span>
            </td>
            <td>${product.rating}/5</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Получение названия категории
function getCategoryName(categoryCode) {
    const categories = {
        'kitchen': 'Кухонная техника',
        'cleaning': 'Техника для уборки',
        'climate': 'Климатическая техника',
        'electronics': 'Электроника',
        'appliances': 'Крупная бытовая техника'
    };
    return categories[categoryCode] || categoryCode;
}

// Поиск товаров
function searchProductsAdmin() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const category = document.getElementById('product-category-filter').value;
    
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    let filtered = products;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.code && p.code.toLowerCase().includes(searchTerm))
        );
    }
    
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    const container = document.getElementById('products-table');
    if (container) {
        container.innerHTML = filtered.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${product.name}</td>
                <td>${getCategoryName(product.category)}</td>
                <td>${product.price.toLocaleString()} ₽</td>
                <td>
                    <span class="status ${product.inStock ? 'delivered' : 'cancelled'}">
                        ${product.inStock ? 'В наличии' : 'Нет в наличии'}
                    </span>
                </td>
                <td>${product.rating}/5</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Фильтрация товаров
function filterProductsAdmin() {
    searchProductsAdmin();
}

// Показать форму добавления товара
function showAddProductForm() {
    document.getElementById('add-product-modal').style.display = 'flex';
}

// Закрыть форму добавления товара
function closeAddProduct() {
    document.getElementById('add-product-modal').style.display = 'none';
    document.getElementById('product-form').reset();
    
    // Восстанавливаем стандартный обработчик
    const form = document.getElementById('product-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        saveProduct();
    };
    
    // Восстанавливаем заголовок
    document.querySelector('#add-product-modal .modal-header h3').textContent = 'Добавить товар';
}

// Сохранение товара
function saveProduct() {
    const product = {
        id: Date.now(),
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseInt(document.getElementById('product-price').value),
        oldPrice: document.getElementById('product-old-price').value ? 
                  parseInt(document.getElementById('product-old-price').value) : null,
        code: document.getElementById('product-code').value || `PROD-${Date.now()}`,
        stock: parseInt(document.getElementById('product-stock').value) || 0,
        inStock: parseInt(document.getElementById('product-stock').value) > 0,
        description: document.getElementById('product-description-short').value,
        fullDescription: document.getElementById('product-description-full').value,
        image: document.getElementById('product-image').value || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString()
    };
    
    // Парсинг характеристик
    try {
        const specsText = document.getElementById('product-specs').value;
        if (specsText) {
            product.specifications = JSON.parse(specsText);
        }
    } catch (e) {
        alert('Ошибка в формате характеристик. Используйте JSON формат: {"ключ": "значение"}');
        return;
    }
    
    // Сохранение товара
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Обновление статистики
    updateProductStats();
    
    closeAddProduct();
    loadProductsTable();
    showNotification('Товар успешно добавлен', 'success');
}

// Редактирование товара
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Заполнение формы данными товара
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-old-price').value = product.oldPrice || '';
        document.getElementById('product-code').value = product.code || '';
        document.getElementById('product-stock').value = product.stock || 0;
        document.getElementById('product-description-short').value = product.description || '';
        document.getElementById('product-description-full').value = product.fullDescription || '';
        document.getElementById('product-image').value = product.image || '';
        
        if (product.specifications) {
            document.getElementById('product-specs').value = JSON.stringify(product.specifications, null, 2);
        }
        
        // Изменение заголовка формы
        document.querySelector('#add-product-modal .modal-header h3').textContent = 'Редактировать товар';
        
        // Изменение обработчика формы
        const form = document.getElementById('product-form');
        form.onsubmit = function(e) {
            e.preventDefault();
            updateProduct(productId);
        };
        
        showAddProductForm();
    }
}

// Обновление товара
function updateProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const index = products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        products[index] = {
            ...products[index],
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseInt(document.getElementById('product-price').value),
            oldPrice: document.getElementById('product-old-price').value ? 
                     parseInt(document.getElementById('product-old-price').value) : null,
            code: document.getElementById('product-code').value,
            stock: parseInt(document.getElementById('product-stock').value) || 0,
            inStock: parseInt(document.getElementById('product-stock').value) > 0,
            description: document.getElementById('product-description-short').value,
            fullDescription: document.getElementById('product-description-full').value,
            image: document.getElementById('product-image').value
        };
        
        try {
            const specsText = document.getElementById('product-specs').value;
            if (specsText) {
                products[index].specifications = JSON.parse(specsText);
            }
        } catch (e) {
            alert('Ошибка в формате характеристик');
            return;
        }
        
        localStorage.setItem('products', JSON.stringify(products));
        closeAddProduct();
        loadProductsTable();
        showNotification('Товар успешно обновлен', 'success');
    }
}

// Удаление товара
function deleteProduct(productId) {
    if (confirm('Удалить этот товар? Это действие нельзя отменить.')) {
        let products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
        products = products.filter(p => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(products));
        
        // Обновление статистики
        updateProductStats();
        
        loadProductsTable();
        showNotification('Товар удален', 'info');
    }
}

// Обновление статистики товаров
function updateProductStats() {
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const stats = JSON.parse(localStorage.getItem('storeStats')) || {};
    
    stats.totalProducts = products.length;
    localStorage.setItem('storeStats', JSON.stringify(stats));
    loadAdminStats();
}

// ========== УПРАВЛЕНИЕ ЗАКАЗАМИ ==========

// Загрузка таблицы заказов
function loadOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const container = document.getElementById('orders-table');
    
    if (!container) return;
    
    container.innerHTML = orders.map(order => {
        const user = users.find(u => u.id === order.userId) || { name: 'Неизвестный пользователь' };
        
        return `
            <tr>
                <td>#${order.id}</td>
                <td>${user.name}</td>
                <td>${order.date}</td>
                <td>${order.total ? order.total.toLocaleString() : '0'} ₽</td>
                <td>
                    <span class="status ${order.status}">
                        ${getOrderStatusText(order.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="viewOrderDetailsAdmin(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-edit" onclick="editOrderStatus(${order.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteOrder(${order.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Получение текста статуса заказа
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

// Поиск заказов
function searchOrders() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase();
    const status = document.getElementById('order-status-filter-admin').value;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    let filtered = orders;
    
    if (searchTerm) {
        filtered = filtered.filter(order => {
            const user = users.find(u => u.id === order.userId);
            return (
                order.id.toString().includes(searchTerm) ||
                (user && user.name.toLowerCase().includes(searchTerm)) ||
                (order.customer && order.customer.firstname && order.customer.firstname.toLowerCase().includes(searchTerm)) ||
                (order.customer && order.customer.lastname && order.customer.lastname.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    if (status !== 'all') {
        filtered = filtered.filter(order => order.status === status);
    }
    
    const container = document.getElementById('orders-table');
    if (container) {
        container.innerHTML = filtered.map(order => {
            const user = users.find(u => u.id === order.userId) || { name: 'Неизвестный пользователь' };
            
            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${user.name}</td>
                    <td>${order.date}</td>
                    <td>${order.total ? order.total.toLocaleString() : '0'} ₽</td>
                    <td>
                        <span class="status ${order.status}">
                            ${getOrderStatusText(order.status)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="viewOrderDetailsAdmin(${order.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-edit" onclick="editOrderStatus(${order.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" onclick="deleteOrder(${order.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Фильтрация заказов
function filterOrders() {
    searchOrders();
}

// Просмотр деталей заказа
function viewOrderDetailsAdmin(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === order.userId);
    
    if (!order) {
        alert('Заказ не найден');
        return;
    }
    
    // Создаем модальное окно
    const modalHtml = `
        <div class="modal" style="display: flex;">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Заказ #${order.id}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="order-details-section">
                        <h4>Информация о покупателе</h4>
                        <p><strong>Имя:</strong> ${order.customer ? order.customer.firstname + ' ' + order.customer.lastname : user?.name || 'Неизвестно'}</p>
                        <p><strong>Email:</strong> ${order.customer?.email || user?.email || 'Не указан'}</p>
                        <p><strong>Телефон:</strong> ${order.customer?.phone || user?.phone || 'Не указан'}</p>
                        <p><strong>Адрес доставки:</strong> ${order.customer?.address || 'Не указан'}</p>
                        <p><strong>Комментарий:</strong> ${order.customer?.comment || 'Нет'}</p>
                    </div>
                    
                    <div class="order-details-section">
                        <h4>Состав заказа</h4>
                        ${order.items ? order.items.map(item => {
                            const product = products.find(p => p.id === item.productId);
                            return `
                                <div class="order-item-detail">
                                    <img src="${product?.image || ''}" alt="${product?.name || 'Товар'}" style="width: 50px; height: 50px; object-fit: cover;">
                                    <div>
                                        <strong>${product?.name || 'Товар'}</strong>
                                        <div>${item?.price?.toLocaleString() || '0'} ₽ × ${item?.quantity || 0}</div>
                                        <div>Итого: ${((item?.price || 0) * (item?.quantity || 0)).toLocaleString()} ₽</div>
                                    </div>
                                </div>
                            `;
                        }).join('') : '<p>Товары не найдены</p>'}
                    </div>
                    
                    <div class="order-details-section">
                        <h4>Стоимость</h4>
                        <p><strong>Товары:</strong> ${order.subtotal?.toLocaleString() || '0'} ₽</p>
                        <p><strong>Доставка:</strong> ${order.delivery === 0 ? 'Бесплатно' : (order.delivery?.toLocaleString() || '0') + ' ₽'}</p>
                        <p><strong>Скидка:</strong> ${order.discount > 0 ? '-' + order.discount?.toLocaleString() + ' ₽' : '0 ₽'}</p>
                        <p><strong>Итого к оплате:</strong> <strong>${order.total?.toLocaleString() || '0'} ₽</strong></p>
                    </div>
                    
                    <div class="order-details-section">
                        <h4>Информация о заказе</h4>
                        <p><strong>Статус:</strong> 
                            <select onchange="updateOrderStatus(${order.id}, this.value)" style="margin-left: 10px; padding: 5px;">
                                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Подтвержден</option>
                                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                            </select>
                        </p>
                        <p><strong>Дата:</strong> ${order.date || 'Не указана'}</p>
                        <p><strong>Способ оплаты:</strong> ${order.payment?.method ? getPaymentMethodText(order.payment.method) : 'Не указан'}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="printOrder(${order.id})">
                        <i class="fas fa-print"></i> Печать
                    </button>
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                        Закрыть
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Обновление статуса заказа
function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Обновляем таблицу
        loadOrdersTable();
        
        // Обновляем статистику
        updateOrderStats();
        
        showNotification('Статус заказа обновлен', 'success');
    }
}

// Редактирование статуса заказа
function editOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
        const newStatus = prompt(`Введите новый статус для заказа #${orderId}:\n(processing, confirmed, shipped, delivered, cancelled)`, order.status);
        
        if (newStatus && ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
            updateOrderStatus(orderId, newStatus);
        } else if (newStatus) {
            alert('Некорректный статус. Используйте: processing, confirmed, shipped, delivered, cancelled');
        }
    }
}

// Обновление статистики заказов
function updateOrderStats() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const stats = JSON.parse(localStorage.getItem('storeStats')) || {};
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    stats.totalOrders = orders.length;
    stats.totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Рассчитываем средний чек
    stats.averageOrderValue = orders.length > 0 ? Math.round(stats.totalRevenue / orders.length) : 0;
    
    // Рассчитываем количество активных пользователей (сделали заказ)
    const activeUsers = new Set(orders.map(order => order.userId).filter(id => id));
    stats.activeUsers = activeUsers.size;
    stats.totalUsers = users.length;
    
    // Рассчитываем конверсию (если есть пользователи)
    stats.conversionRate = users.length > 0 ? 
        Math.round((activeUsers.size / users.length) * 100) : 0;
    
    localStorage.setItem('storeStats', JSON.stringify(stats));
    loadAdminStats();
}

// Удаление заказа
function deleteOrder(orderId) {
    if (confirm('Удалить этот заказ? Это действие нельзя отменить.')) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Обновляем статистику
        updateOrderStats();
        
        loadOrdersTable();
        showNotification('Заказ удален', 'info');
    }
}

// Получение текста способа оплаты
function getPaymentMethodText(method) {
    const methods = {
        'card': 'Банковская карта',
        'cash': 'Наличными при получении',
        'installment': 'Рассрочка'
    };
    
    return methods[method] || method;
}

// Печать заказа
function printOrder(orderId) {
    // В реальном проекте здесь будет полноценная функция печати
    alert(`Печать заказа #${orderId}. В реальном проекте будет печать в формате PDF.`);
}

// ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========

// Загрузка таблицы пользователей
function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const container = document.getElementById('users-table');
    
    if (!container) return;
    
    container.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone || 'Не указан'}</td>
            <td>
                <span class="status ${user.role === 'admin' ? 'delivered' : 'processing'}">
                    ${user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
            </td>
            <td>${user.regDate || user.createdAt || 'Неизвестно'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="btn-delete" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Поиск пользователей
function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const role = document.getElementById('user-role-filter').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let filtered = users;
    
    if (searchTerm) {
        filtered = filtered.filter(u => 
            u.name.toLowerCase().includes(searchTerm) ||
            u.email.toLowerCase().includes(searchTerm) ||
            (u.phone && u.phone.includes(searchTerm))
        );
    }
    
    if (role !== 'all') {
        filtered = filtered.filter(u => u.role === role);
    }
    
    const container = document.getElementById('users-table');
    if (container) {
        container.innerHTML = filtered.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.phone || 'Не указан'}</td>
                <td>
                    <span class="status ${user.role === 'admin' ? 'delivered' : 'processing'}">
                        ${user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </span>
                </td>
                <td>${user.regDate || user.createdAt || 'Неизвестно'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${user.role !== 'admin' ? `
                            <button class="btn-delete" onclick="deleteUser(${user.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Фильтрация пользователей
function filterUsers() {
    searchUsers();
}

// Показать форму добавления пользователя
function showAddUserForm() {
    document.getElementById('add-user-modal').style.display = 'flex';
}

// Закрыть форму добавления пользователя
function closeAddUser() {
    document.getElementById('add-user-modal').style.display = 'none';
    document.getElementById('user-form').reset();
}

// Сохранение пользователя
function saveUser() {
    const password = document.getElementById('user-password-admin').value;
    const passwordConfirm = document.getElementById('user-password-confirm-admin').value;
    
    if (password !== passwordConfirm) {
        alert('Пароли не совпадают');
        return;
    }
    
    const user = {
        id: Date.now(),
        name: document.getElementById('user-name-admin').value,
        email: document.getElementById('user-email-admin').value,
        phone: document.getElementById('user-phone-admin').value,
        password: password,
        role: document.getElementById('user-role-admin').value,
        regDate: new Date().toLocaleDateString('ru-RU'),
        address: ''
    };
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Проверка уникальности email
    if (users.some(u => u.email === user.email)) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Обновление статистики
    updateUserStats();
    
    closeAddUser();
    loadUsersTable();
    showNotification('Пользователь успешно добавлен', 'success');
}

// Редактирование пользователя
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (user) {
        alert(`Редактирование пользователя ${user.name}. В реальном проекте здесь будет форма редактирования.`);
    }
}

// Удаление пользователя
function deleteUser(userId) {
    if (confirm('Удалить этого пользователя? Это действие нельзя отменить.')) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Обновление статистики
        updateUserStats();
        
        loadUsersTable();
        showNotification('Пользователь удален', 'info');
    }
}

// Обновление статистики пользователей
function updateUserStats() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const stats = JSON.parse(localStorage.getItem('storeStats')) || {};
    
    stats.totalUsers = users.length;
    localStorage.setItem('storeStats', JSON.stringify(stats));
    loadAdminStats();
}

// ========== УПРАВЛЕНИЕ ОТЗЫВАМИ ==========

// Загрузка таблицы отзывов
function loadReviewsTable() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const container = document.getElementById('reviews-table');
    
    if (!container) return;
    
    container.innerHTML = reviews.map(review => {
        const product = products.find(p => p.id === review.productId);
        
        return `
            <tr>
                <td>${review.id}</td>
                <td>${product ? product.name : 'Товар удален'}</td>
                <td>${review.author}</td>
                <td>
                    <div class="rating-stars" style="color: #f39c12;">
                        ${getRatingStars(review.rating)}
                    </div>
                </td>
                <td>${review.date}</td>
                <td>
                    <span class="status delivered">
                        Опубликован
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="viewReview(${review.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-delete" onclick="deleteReviewAdmin(${review.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Получение звезд рейтинга
function getRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Поиск отзывов
function searchReviews() {
    const searchTerm = document.getElementById('review-search').value.toLowerCase();
    const rating = document.getElementById('review-rating-filter').value;
    
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    
    let filtered = reviews;
    
    if (searchTerm) {
        filtered = filtered.filter(review => 
            review.author.toLowerCase().includes(searchTerm) ||
            review.title.toLowerCase().includes(searchTerm) ||
            review.text.toLowerCase().includes(searchTerm)
        );
    }
    
    if (rating !== 'all') {
        filtered = filtered.filter(review => review.rating === parseInt(rating));
    }
    
    const container = document.getElementById('reviews-table');
    if (container) {
        container.innerHTML = filtered.map(review => {
            const product = products.find(p => p.id === review.productId);
            
            return `
                <tr>
                    <td>${review.id}</td>
                    <td>${product ? product.name : 'Товар удален'}</td>
                    <td>${review.author}</td>
                    <td>
                        <div class="rating-stars" style="color: #f39c12;">
                            ${getRatingStars(review.rating)}
                        </div>
                    </td>
                    <td>${review.date}</td>
                    <td>
                        <span class="status delivered">
                            Опубликован
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" onclick="viewReview(${review.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-delete" onclick="deleteReviewAdmin(${review.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Фильтрация отзывов
function filterReviews() {
    searchReviews();
}

// Просмотр отзыва
function viewReview(reviewId) {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const review = reviews.find(r => r.id === reviewId);
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const product = products.find(p => p.id === review.productId);
    
    if (review) {
        let details = `
            <h3>Отзыв #${review.id}</h3>
            <p><strong>Товар:</strong> ${product ? product.name : 'Товар удален'}</p>
            <p><strong>Автор:</strong> ${review.author}</p>
            <p><strong>Email:</strong> ${review.email}</p>
            <p><strong>Оценка:</strong> ${review.rating}/5</p>
            <p><strong>Дата:</strong> ${review.date}</p>
            <hr>
            <p><strong>Заголовок:</strong> ${review.title}</p>
            <p><strong>Текст отзыва:</strong></p>
            <p>${review.text}</p>
        `;
        
        if (review.pros) {
            details += `<p><strong>Достоинства:</strong> ${review.pros}</p>`;
        }
        
        if (review.cons) {
            details += `<p><strong>Недостатки:</strong> ${review.cons}</p>`;
        }
        
        alert(details);
    }
}

// Удаление отзыва
function deleteReviewAdmin(reviewId) {
    if (confirm('Удалить этот отзыв? Это действие нельзя отменить.')) {
        let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        reviews = reviews.filter(r => r.id !== reviewId);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        // Обновление статистики
        updateReviewStats();
        
        loadReviewsTable();
        showNotification('Отзыв удален', 'info');
    }
}

// Обновление статистики отзывов
function updateReviewStats() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const stats = JSON.parse(localStorage.getItem('storeStats')) || {};
    
    stats.totalReviews = reviews.length;
    localStorage.setItem('storeStats', JSON.stringify(stats));
    loadAdminStats();
}

// ========== УПРАВЛЕНИЕ КАТЕГОРИЯМИ ==========

// Загрузка категорий
function loadCategories() {
    const categories = [
        { id: 1, name: 'Кухонная техника', code: 'kitchen', icon: 'fas fa-blender', count: 4 },
        { id: 2, name: 'Техника для уборки', code: 'cleaning', icon: 'fas fa-vacuum', count: 1 },
        { id: 3, name: 'Климатическая техника', code: 'climate', icon: 'fas fa-fan', count: 1 },
        { id: 4, name: 'Электроника', code: 'electronics', icon: 'fas fa-tv', count: 1 },
        { id: 5, name: 'Крупная бытовая техника', code: 'appliances', icon: 'fas fa-home', count: 1 }
    ];
    
    const container = document.querySelector('.categories-grid');
    if (container) {
        container.innerHTML = categories.map(category => `
            <div class="category-admin-card">
                <div class="category-header">
                    <i class="${category.icon}"></i>
                    <h3>${category.name}</h3>
                </div>
                <div class="category-info">
                    <p>Код: ${category.code}</p>
                    <p>Товаров: ${category.count}</p>
                </div>
                <div class="category-actions">
                    <button class="btn-edit" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    ${category.id > 5 ? `
                        <button class="btn-delete" onclick="deleteCategory(${category.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Показать форму добавления категории
function showAddCategoryForm() {
    document.getElementById('add-category-modal').style.display = 'flex';
}

// Закрыть форму добавления категории
function closeAddCategory() {
    document.getElementById('add-category-modal').style.display = 'none';
    document.getElementById('category-form').reset();
}

// Сохранение категории
function saveCategory() {
    const category = {
        id: Date.now(),
        name: document.getElementById('category-name').value,
        code: document.getElementById('category-code').value,
        description: document.getElementById('category-description').value,
        icon: document.getElementById('category-icon').value,
        count: 0
    };
    
    alert(`Категория "${category.name}" сохранена. В реальном проекте здесь будет сохранение в базу данных.`);
    closeAddCategory();
    showNotification('Категория сохранена', 'success');
}

// Редактирование категории
function editCategory(categoryId) {
    alert(`Редактирование категории #${categoryId}`);
}

// Удаление категории
function deleteCategory(categoryId) {
    if (confirm('Удалить эту категорию? Это действие нельзя отменить.')) {
        alert(`Категория #${categoryId} удалена`);
        showNotification('Категория удалена', 'info');
    }
}

// ========== НАСТРОЙКИ МАГАЗИНА ==========

// Загрузка настроек магазина
function loadStoreSettings() {
    const settings = JSON.parse(localStorage.getItem('storeSettings'));
    
    if (settings) {
        document.getElementById('store-name').value = settings.storeName || 'ТехноДом';
        document.getElementById('store-email').value = settings.storeEmail || 'info@technodom.ru';
        document.getElementById('store-phone').value = settings.storePhone || '8 (800) 123-45-67';
        document.getElementById('free-delivery-threshold').value = settings.freeDeliveryThreshold || 20000;
        document.getElementById('delivery-cost').value = settings.deliveryCost || 500;
        document.getElementById('working-hours').value = settings.workingHours || '9:00-21:00';
        document.getElementById('store-address').value = settings.storeAddress || 'Москва, ул. Техническая, 15';
    }
}

// Сохранение настроек магазина
function saveStoreSettings() {
    const settings = {
        storeName: document.getElementById('store-name').value,
        storeEmail: document.getElementById('store-email').value,
        storePhone: document.getElementById('store-phone').value,
        freeDeliveryThreshold: parseInt(document.getElementById('free-delivery-threshold').value),
        deliveryCost: parseInt(document.getElementById('delivery-cost').value),
        workingHours: document.getElementById('working-hours').value,
        storeAddress: document.getElementById('store-address').value
    };
    
    localStorage.setItem('storeSettings', JSON.stringify(settings));
    showNotification('Настройки магазина сохранены', 'success');
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    // Стили для уведомлений
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 500px;
                animation: slideIn 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            }
            
            .notification-info {
                background: #3498db;
            }
            
            .notification-success {
                background: #27ae60;
            }
            
            .notification-warning {
                background: #f39c12;
            }
            
            .notification-error {
                background: #e74c3c;
            }
            
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: 15px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Получение товаров по умолчанию (функция из script.js)
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: "Холодильник Samsung RB37",
            category: "appliances",
            price: 45999,
            oldPrice: 54999,
            code: "SAM-RB37",
            stock: 15,
            inStock: true,
            description: "Двухкамерный холодильник с технологией No Frost",
            fullDescription: "Энергоэффективный холодильник с системой No Frost, который сохраняет свежесть продуктов до 3 раз дольше. Общий объем 367 литров.",
            image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.5,
            reviews: 24,
            specifications: {
                "Объем": "367 л",
                "Цвет": "Нержавеющая сталь",
                "Энергопотребление": "A++",
                "Гарантия": "24 месяца"
            },
            createdAt: "2024-01-15"
        },
        {
            id: 2,
            name: "Стиральная машина LG F4V5",
            category: "appliances",
            price: 32999,
            oldPrice: 39999,
            code: "LG-F4V5",
            stock: 8,
            inStock: true,
            description: "Стиральная машина с загрузкой 7 кг и сушкой",
            fullDescription: "Фронтальная стиральная машина с инверторным двигателем, 14 программ стирки и функцией сушки.",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            reviews: 31,
            specifications: {
                "Загрузка": "7 кг",
                "Сушка": "5 кг",
                "Скорость отжима": "1400 об/мин",
                "Энергопотребление": "A+++"
            },
            createdAt: "2024-02-10"
        },
        {
            id: 3,
            name: "Телевизор Sony Bravia 55\"",
            category: "electronics",
            price: 64999,
            oldPrice: 79999,
            code: "SON-BR55",
            stock: 5,
            inStock: true,
            description: "4K OLED телевизор с технологией Android TV",
            fullDescription: "Телевизор с OLED-панелью, поддержкой HDR и встроенной системой Android TV.",
            image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            reviews: 42,
            specifications: {
                "Диагональ": "55 дюймов",
                "Разрешение": "4K UHD",
                "Smart TV": "Android TV",
                "HDR": "Dolby Vision, HDR10"
            },
            createdAt: "2024-01-20"
        },
        {
            id: 4,
            name: "Пылесос Dyson V11",
            category: "cleaning",
            price: 38999,
            oldPrice: 45999,
            code: "DYS-V11",
            stock: 12,
            inStock: true,
            description: "Беспроводной пылесос с технологией циклонной фильтрации",
            fullDescription: "Мощный беспроводной пылесос с 60-минутным временем работы и системой фильтрации всего дома.",
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            reviews: 56,
            specifications: {
                "Тип": "Беспроводной",
                "Время работы": "60 минут",
                "Мощность всасывания": "185 аВт",
                "Вес": "2.9 кг"
            },
            createdAt: "2024-03-05"
        },
        {
            id: 5,
            name: "Кофемашина DeLonghi",
            category: "kitchen",
            price: 27999,
            oldPrice: 32999,
            code: "DEL-CM45",
            stock: 7,
            inStock: true,
            description: "Автоматическая кофемашина с капучинатором",
            fullDescription: "Полностью автоматическая кофемашина с встроенным капучинатором для идеального капучино.",
            image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.6,
            reviews: 19,
            specifications: {
                "Тип": "Автоматическая",
                "Капучинатор": "Встроенный",
                "Емкость для воды": "1.8 л",
                "Давление": "15 бар"
            },
            createdAt: "2024-02-28"
        },
        {
            id: 6,
            name: "Микроволновка Bosch",
            category: "kitchen",
            price: 12999,
            oldPrice: 14999,
            code: "BOS-MW700",
            stock: 20,
            inStock: true,
            description: "Микроволновая печь с функцией гриль и конвекцией",
            fullDescription: "Микроволновая печь с функцией гриля, конвекцией и 10 уровнями мощности.",
            image: "https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.4,
            reviews: 27,
            specifications: {
                "Объем": "25 л",
                "Мощность": "900 Вт",
                "Гриль": "Да",
                "Конвекция": "Да"
            },
            createdAt: "2024-01-10"
        },
        {
            id: 7,
            name: "Кондиционер Mitsubishi",
            category: "climate",
            price: 59999,
            code: "MIT-MSZ",
            stock: 3,
            inStock: true,
            description: "Инверторный кондиционер с функцией очистки воздуха",
            fullDescription: "Сплит-система с инверторным компрессором и системой очистки воздуха от аллергенов.",
            image: "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.8,
            reviews: 33,
            specifications: {
                "Мощность": "2.5 кВт",
                "Площадь": "25 м²",
                "Инвертор": "Да",
                "Фильтры": "Антиаллергенный"
            },
            createdAt: "2024-03-12"
        },
        {
            id: 8,
            name: "Посудомоечная машина Bosch",
            category: "kitchen",
            price: 42999,
            code: "BOS-SMS",
            stock: 6,
            inStock: true,
            description: "Встраиваемая посудомоечная машина на 14 комплектов",
            fullDescription: "Полностью встраиваемая посудомоечная машина с функцией сушки и 7 программами мойки.",
            image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            rating: 4.7,
            reviews: 38,
            specifications: {
                "Вместимость": "14 комплектов",
                "Энергопотребление": "A++",
                "Уровень шума": "44 дБ",
                "Программы": "7"
            },
            createdAt: "2024-02-15"
        }
    ];
}

function initializeProducts() {
    const products = getDefaultProducts();
    
    // Используем более разнообразные изображения
    const productImages = [
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    ];
    
    // Обновляем изображения у товаров
    products.forEach((product, index) => {
        product.image = productImages[index] || productImages[0];
    });
    
    localStorage.setItem('products', JSON.stringify(products));
    console.log('Товары инициализированы:', products.length, 'шт.');
}

// Функция для загрузки популярных товаров на главную страницу
function getFeaturedProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    
    // Возвращаем первые 6 товаров как популярные
    return products.slice(0, 6).map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice || null,
        image: product.image,
        rating: product.rating || 4.5,
        reviews: product.reviews || Math.floor(Math.random() * 50) + 10,
        discount: product.oldPrice ? 
            Math.round((1 - product.price / product.oldPrice) * 100) : 
            Math.floor(Math.random() * 20) + 10,
        description: product.description || 'Качественная техника для вашего дома'
    }));
}
// Замените последний блок стилей на этот:

// Добавляем стили для админ-панели
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    /* Стили для админ-панели */
    .admin-login {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 70vh;
        padding: 20px;
    }
    
    .login-container {
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
    }
    
    .login-container h2 {
        text-align: center;
        margin-bottom: 30px;
        color: #2c3e50;
    }
    
    .admin-container {
        max-width: 1400px;
        margin: 20px auto;
        background: #f5f7fa;
        border-radius: 10px;
        overflow: hidden;
    }
    
    .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 20px;
    }
    
    .admin-header h1 {
        margin: 0;
        font-size: 1.5rem;
        color: #2c3e50;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .admin-user {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .admin-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px;
        margin-bottom: 20px;
    }
    
    .stat-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        transition: transform 0.3s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-5px);
    }
    
    .stat-card i {
        font-size: 2rem;
        color: #3498db;
        margin-bottom: 15px;
    }
    
    .stat-number {
        font-size: 2rem;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 5px;
    }
    
    .stat-label {
        color: #7f8c8d;
        font-size: 0.9rem;
    }
    
    .admin-tabs {
        display: flex;
        background: white;
        border-bottom: 1px solid #e0e0e0;
        padding: 0 20px;
        overflow-x: auto;
    }
    
    .admin-tab {
        padding: 15px 25px;
        background: none;
        border: none;
        border-bottom: 3px solid transparent;
        cursor: pointer;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #7f8c8d;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .admin-tab:hover {
        color: #3498db;
    }
    
    .admin-tab.active {
        color: #3498db;
        border-bottom-color: #3498db;
    }
    
    .admin-content {
        padding: 30px;
        background: white;
        min-height: 500px;
    }
    
    .admin-tab-content {
        display: none;
    }
    
    .admin-tab-content.active {
        display: block;
    }
    
    .tab-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .order-stats {
        display: flex;
        gap: 10px;
    }
    
    .stat-badge {
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .stat-badge.processing {
        background: #e3f2fd;
        color: #1976d2;
    }
    
    .stat-badge.delivered {
        background: #e8f5e9;
        color: #2e7d32;
    }
    
    .stat-badge.cancelled {
        background: #ffebee;
        color: #c62828;
    }
    
    .search-filter {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .search-filter input,
    .search-filter select {
        padding: 10px 15px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 0.95rem;
        min-width: 200px;
    }
    
    .admin-table-container {
        overflow-x: auto;
        margin-top: 20px;
        border-radius: 5px;
        border: 1px solid #e0e0e0;
    }
    
    .admin-table {
        width: 100%;
        border-collapse: collapse;
        background: white;
    }
    
    .admin-table th,
    .admin-table td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .admin-table th {
        background: #f8f9fa;
        font-weight: 600;
        color: #2c3e50;
    }
    
    .admin-table tr:hover {
        background: #f8f9fa;
    }
    
    .action-buttons {
        display: flex;
        gap: 8px;
    }
    
    .btn-edit,
    .btn-delete {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.3s ease;
    }
    
    .btn-edit {
        background: #3498db;
        color: white;
    }
    
    .btn-edit:hover {
        background: #2980b9;
    }
    
    .btn-delete {
        background: #e74c3c;
        color: white;
    }
    
    .btn-delete:hover {
        background: #c0392b;
    }
    
    .status {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85rem;
        font-weight: 500;
    }
    
    .status.processing {
        background: #e3f2fd;
        color: #1976d2;
    }
    
    .status.confirmed {
        background: #e8f5e9;
        color: #2e7d32;
    }
    
    .status.shipped {
        background: #fff3e0;
        color: #ef6c00;
    }
    
    .status.delivered {
        background: #e8f5e9;
        color: #2e7d32;
    }
    
    .status.cancelled {
        background: #ffebee;
        color: #c62828;
    }
    
    .categories-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
    }
    
    .category-admin-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        padding: 20px;
        transition: all 0.3s ease;
    }
    
    .category-admin-card:hover {
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .category-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
    }
    
    .category-header i {
        font-size: 1.5rem;
        color: #3498db;
    }
    
    .category-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }
    
    .settings-form-admin {
        max-width: 600px;
    }
    
    .settings-form-admin .form-group {
        margin-bottom: 20px;
    }
    
    .settings-form-admin label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #2c3e50;
    }
    
    .settings-form-admin input,
    .settings-form-admin select,
    .settings-form-admin textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
    }
    
    .settings-form-admin textarea {
        resize: vertical;
        min-height: 100px;
    }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
    }
    
    .modal-content {
        background: white;
        border-radius: 10px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 20px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #7f8c8d;
    }
    
    .form-row {
        display: flex;
        gap: 15px;
        margin-bottom: 15px;
    }
    
    .form-row .form-group {
        flex: 1;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
    }
    
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
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
    
    .order-details-section {
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
    }
    
    .order-item-detail {
        display: flex;
        gap: 15px;
        align-items: center;
        margin-bottom: 10px;
        padding: 10px;
        background: #f9f9f9;
        border-radius: 5px;
    }
    
    @media (max-width: 768px) {
        .admin-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
        }
        
        .admin-tabs {
            flex-wrap: wrap;
        }
        
        .admin-tab {
            padding: 10px 15px;
            font-size: 0.9rem;
        }
        
        .tab-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
        }
        
        .search-filter {
            flex-direction: column;
        }
        
        .search-filter input,
        .search-filter select {
            min-width: 100%;
        }
        
        .form-row {
            flex-direction: column;
            gap: 0;
        }
        
        .admin-table {
            font-size: 0.9rem;
        }
        
        .action-buttons {
            flex-direction: column;
        }
        
        .categories-grid {
            grid-template-columns: 1fr;
        }
    }
    
    @media (max-width: 480px) {
        .admin-content {
            padding: 15px;
        }
        
        .modal-content {
            width: 95%;
        }
        
        .admin-stats {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(adminStyles);
