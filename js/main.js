// HTLand Frontend Application - Main JavaScript File

// ==================== //
// GLOBAL STATE & CONFIG //
// ==================== //
const HTLand = {
    user: null,
    walletBalance: 0,
    cartCount: 0,
    wishlistCount: 0,
    
    // App state
    currentTheme: localStorage.getItem('htland-theme') || 'light',
    isLoggedIn: false,
    
    // Live stats
    liveStats: {
        users: 243,
        sales: 15,
        orders: 42
    },
    
    // Configuration
    config: {
        minChargeAmount: 10000,
        maxChargeAmount: 5000000,
        otpTimeout: 120 // seconds
    },
    
    // Data storage
    data: {
        categories: [],
        products: [],
        transactions: []
    }
};

// ==================== //
// DOM ELEMENTS //
// ==================== //
const elements = {
    // Loading
    loading: document.getElementById('loading'),
    
    // Header & Navigation
    header: document.querySelector('.header'),
    mobileToggle: document.querySelector('.mobile-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    floatingMenu: document.querySelectorAll('.floating-item'),
    themeToggle: document.querySelector('.theme-toggle'),
    
    // User Actions
    userBtn: document.querySelector('.user-btn'),
    cartBtn: document.querySelector('.cart-btn'),
    walletBtn: document.querySelector('.wallet-menu-btn'),
    
    // Modals
    authModal: document.getElementById('authModal'),
    walletModal: document.getElementById('walletModal'),
    chargeModal: document.getElementById('chargeModal'),
    twoFAModal: document.getElementById('twoFAModal'),
    modalCloses: document.querySelectorAll('.modal-close'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    authTabs: document.querySelectorAll('.auth-tab'),
    
    // Wallet
    walletBalance: document.querySelector('.balance'),
    walletBalanceLarge: document.querySelector('.balance-amount'),
    chargeAmount: document.querySelector('.charge-amount'),
    quickAmounts: document.querySelectorAll('.quick-amount'),
    chargeSubmit: document.querySelector('.charge-submit'),
    
    // Quick Actions
    quickActions: document.querySelector('.quick-actions-fixed'),
    scrollTopBtn: document.querySelector('.scroll-top'),
    chatBtn: document.querySelector('.chat-btn'),
    themeToggleBtn: document.querySelector('.theme-toggle-btn'),
    
    // Live Stats
    liveUsers: document.getElementById('live-users'),
    recentSales: document.getElementById('recent-sales'),
    activeOrders: document.getElementById('active-orders'),
    statNumbers: document.querySelectorAll('.stat-number'),
    
    // Content containers
    categoriesGrid: document.querySelector('.categories-grid'),
    productsGrid: document.querySelector('.products-grid'),
    transactionsList: document.querySelector('.transactions-list'),
    
    // Toast container
    toastContainer: document.querySelector('.toast-container'),
    
    // Charts
    onlineUsersChart: document.getElementById('onlineUsersChart'),
    recentSalesChart: document.getElementById('recentSalesChart'),
    activeOrdersChart: document.getElementById('activeOrdersChart'),
    
    // Particles
    particlesContainer: document.getElementById('particles-js'),

    // AI Assistant Elements
    aiTrigger: document.getElementById('aiTrigger'),
    aiInterface: document.getElementById('aiInterface'),
    aiChatBody: document.getElementById('aiChatBody'),
    aiTextInput: document.getElementById('aiTextInput'),
    aiMicBtn: document.getElementById('aiMicBtn')
};

// ==================== //
// UTILITY FUNCTIONS //
// ==================== //

// Format price with Persian numerals
function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Generate random number between min and max
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== //
// THEME MANAGEMENT //
// ==================== //
class ThemeManager {
    constructor() {
        this.themes = ['light', 'dark', 'sea', 'royal'];
        this.currentTheme = HTLand.currentTheme;
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.updateThemeButton();
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('htland-theme', this.currentTheme);
    }

    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.currentTheme = this.themes[nextIndex];
        this.applyTheme();
        this.updateThemeButton();
        
        Toast.show(`تم ${this.getThemeName(this.currentTheme)} فعال شد`, 'info');
    }

    getThemeName(theme) {
        const names = {
            'light': 'طبیعت شمال',
            'dark': 'تاریک',
            'sea': 'دریای آبی',
            'royal': 'سلطنتی'
        };
        return names[theme] || theme;
    }

    updateThemeButton() {
        const icons = {
            'light': 'fa-moon',
            'dark': 'fa-sun',
            'sea': 'fa-water',
            'royal': 'fa-crown'
        };
        
        if (elements.themeToggle) {
            const icon = elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = `fas ${icons[this.currentTheme] || 'fa-palette'}`;
            }
        }
    }

    bindEvents() {
        if (elements.themeToggle) {
            elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        if (elements.themeToggleBtn) {
            elements.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// ==================== //
// TOAST SYSTEM //
// ==================== //
class Toast {
    static show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
            <button class="toast-close">&times;</button>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'toastSlideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        });
    }

    static getIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || '💡';
    }
}

// ==================== //
// MODAL SYSTEM //
// ==================== //
class ModalSystem {
    constructor() {
        this.modals = {};
        this.init();
    }

    init() {
        // Register all modals
        this.registerModal('auth', elements.authModal);
        this.registerModal('wallet', elements.walletModal);
        this.registerModal('charge', elements.chargeModal);
        this.registerModal('twoFA', elements.twoFAModal);
        
        // Close buttons
        elements.modalCloses.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAll();
            });
        });
        
        // Close on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAll();
                }
            });
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });
    }

    registerModal(name, element) {
        this.modals[name] = element;
    }

    openModal(name) {
        this.closeAll();
        const modal = this.modals[name];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(name) {
        const modal = this.modals[name];
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    closeAll() {
        Object.values(this.modals).forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }
}

// ==================== //
// WALLET SYSTEM //
// ==================== //
class WalletSystem {
    constructor() {
        this.balance = HTLand.walletBalance;
        this.transactions = [];
        this.init();
    }

    init() {
        this.loadTransactions();
        this.bindEvents();
        this.updateDisplay();
    }

    loadTransactions() {
        // Simulated transactions
        this.transactions = [
            {
                id: 1,
                type: 'charge',
                amount: 50000,
                description: 'شارژ کیف پول',
                date: new Date(Date.now() - 86400000),
                status: 'completed'
            },
            {
                id: 2,
                type: 'purchase',
                amount: -25000,
                description: 'خرید برنج هاشمی',
                date: new Date(Date.now() - 172800000),
                status: 'completed'
            },
            {
                id: 3,
                type: 'refund',
                amount: 15000,
                description: 'عودت وجه',
                date: new Date(Date.now() - 259200000),
                status: 'completed'
            }
        ];
    }

    updateDisplay() {
        if (elements.walletBalance) {
            elements.walletBalance.textContent = `${formatPrice(this.balance)} تومان`;
        }
        
        if (elements.walletBalanceLarge) {
            elements.walletBalanceLarge.textContent = `${formatPrice(this.balance)} تومان`;
        }
        
        this.renderTransactions();
    }

    renderTransactions() {
        if (!elements.transactionsList) return;
        
        if (this.transactions.length === 0) {
            elements.transactionsList.innerHTML = '<p class="empty-state">هیچ تراکنشی یافت نشد</p>';
            return;
        }
        
        const transactionsHtml = this.transactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-title">${escapeHtml(transaction.description)}</div>
                    <div class="transaction-date">${escapeHtml(formatDate(transaction.date))}</div>
                </div>
                <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                    ${transaction.amount > 0 ? '+' : ''}${formatPrice(transaction.amount)} تومان
                </div>
            </div>
        `).join('');
        
        elements.transactionsList.innerHTML = transactionsHtml;
    }

    charge(amount) {
        if (amount < HTLand.config.minChargeAmount) {
            Toast.show(`حداقل مبلغ شارژ ${formatPrice(HTLand.config.minChargeAmount)} تومان است`, 'error');
            return false;
        }
        
        if (amount > HTLand.config.maxChargeAmount) {
            Toast.show(`حداکثر مبلغ شارژ ${formatPrice(HTLand.config.maxChargeAmount)} تومان است`, 'error');
            return false;
        }
        
        Toast.show('در حال انتقال به درگاه پرداخت...', 'info');
        
        setTimeout(() => {
            this.balance += amount;
            this.transactions.unshift({
                id: Date.now(),
                type: 'charge',
                amount: amount,
                description: 'شارژ کیف پول',
                date: new Date(),
                status: 'completed'
            });
            
            this.updateDisplay();
            Toast.show(`کیف پول شما با موفقیت شارژ شد`, 'success');
            modals.closeModal('charge');
        }, 2000);
        
        return true;
    }

    bindEvents() {
        if (elements.chargeSubmit) {
            elements.chargeSubmit.addEventListener('click', () => {
                const amount = parseInt(elements.chargeAmount?.value || 0);
                this.charge(amount);
            });
        }
        
        if (elements.quickAmounts) {
            elements.quickAmounts.forEach(btn => {
                btn.addEventListener('click', () => {
                    const amount = parseInt(btn.dataset.amount);
                    if (elements.chargeAmount) {
                        elements.chargeAmount.value = amount;
                    }
                    elements.quickAmounts.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        }
        
        document.querySelector('.charge-action')?.addEventListener('click', () => {
            modals.openModal('charge');
        });
        
        document.querySelector('.withdraw-action')?.addEventListener('click', () => {
            Toast.show('سیستم برداشت به زودی راه‌اندازی می‌شود', 'info');
        });
        
        document.querySelector('.history-action')?.addEventListener('click', () => {
            Toast.show('تاریخچه تراکنش‌ها در حال نمایش است', 'info');
        });
    }
}

// ==================== //
// LAZY LOADER (Performance Core) //
// ==================== //
class LazyLoader {
    constructor() {
        this.scriptsLoaded = false;
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.scriptsLoaded) {
                    this.loadHeavyScripts();
                    this.scriptsLoaded = true;
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: "200px" });

        if (elements.onlineUsersChart && elements.onlineUsersChart.parentElement) {
            observer.observe(elements.onlineUsersChart.parentElement);
        } else {
            setTimeout(() => this.loadHeavyScripts(), 3000);
        }
    }

    loadHeavyScripts() {
        console.log("🚀 Loading heavy assets (Charts, Particles, AOS)...");

        // Load Chart.js
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        chartScript.onload = () => {
            if (window.chartManager) window.chartManager.initCharts();
        };
        document.body.appendChild(chartScript);

        // Load Particles.js
        const particlesScript = document.createElement('script');
        particlesScript.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
        particlesScript.onload = () => {
             if (window.particleManager) window.particleManager.init();
        };
        document.body.appendChild(particlesScript);

        // Load AOS
        const aosScript = document.createElement('script');
        aosScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';
        aosScript.onload = () => {
            AOS.init({ duration: 800, offset: 100, once: true, easing: 'ease-out-cubic' });
        };
        document.body.appendChild(aosScript);
    }
}

// ==================== //
// CHART MANAGER //
// ==================== //
class ChartManager {
    constructor() {
        this.charts = {};
    }

    initCharts() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js library not loaded');
            return;
        }
        
        Chart.defaults.font.family = 'Vazirmatn';
        this.createCharts();
        this.startLiveUpdates();
    }

    createCharts() {
        // Online Users Chart (Line)
        if (elements.onlineUsersChart) {
            this.charts.onlineUsers = new Chart(elements.onlineUsersChart, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels(10),
                    datasets: [{
                        label: 'کاربران آنلاین',
                        data: this.generateRandomData(200, 300, 10),
                        borderColor: 'rgba(46, 125, 50, 1)',
                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: this.getChartOptions('تعداد')
            });
        }

        // Recent Sales Chart (Bar)
        if (elements.recentSalesChart) {
            this.charts.recentSales = new Chart(elements.recentSalesChart, {
                type: 'bar',
                data: {
                    labels: ['امروز', 'دیروز', '۲ روز قبل', '۳ روز قبل'],
                    datasets: [{
                        label: 'فروش‌ها',
                        data: this.generateRandomData(10, 25, 4),
                        backgroundColor: 'rgba(255, 179, 0, 0.8)',
                        borderColor: 'rgba(255, 143, 0, 1)',
                        borderWidth: 1
                    }]
                },
                options: this.getChartOptions('تعداد فروش')
            });
        }

        // Active Orders Chart (Doughnut)
        if (elements.activeOrdersChart) {
            this.charts.activeOrders = new Chart(elements.activeOrdersChart, {
                type: 'doughnut',
                data: {
                    labels: ['در حال پردازش', 'آماده ارسال', 'در حال ارسال', 'تحویل شده'],
                    datasets: [{
                        data: [15, 12, 8, 7],
                        backgroundColor: [
                            'rgba(255, 112, 67, 0.8)',
                            'rgba(66, 165, 245, 0.8)',
                            'rgba(76, 175, 80, 0.8)',
                            'rgba(255, 202, 40, 0.8)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            rtl: true,
                            labels: {
                                font: { family: 'Vazirmatn', size: 12 },
                                padding: 20
                            }
                        }
                    }
                }
            });
        }
    }

    startLiveUpdates() {
        setInterval(() => {
            this.updateOnlineUsers();
            this.updateRecentSales();
        }, 10000);
    }

    updateOnlineUsers() {
        if (this.charts.onlineUsers) {
            const newData = this.generateRandomData(200, 300, 10);
            this.charts.onlineUsers.data.datasets[0].data = newData;
            this.charts.onlineUsers.update('none');
        }
    }

    updateRecentSales() {
        if (this.charts.recentSales) {
            const newData = [randomBetween(10, 20), randomBetween(10, 20), randomBetween(10, 20), randomBetween(10, 20)];
            this.charts.recentSales.data.datasets[0].data = newData;
            this.charts.recentSales.update('none');
        }
    }

    generateTimeLabels(count) {
        const now = new Date();
        return Array.from({ length: count }, (_, i) => {
            const time = new Date(now.getTime() - (count - i - 1) * 5 * 60000);
            return time.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
        });
    }

    generateRandomData(min, max, count) {
        return Array.from({ length: count }, () => randomBetween(min, max));
    }

    getChartOptions(yAxisLabel) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    rtl: true,
                    labels: { font: { family: 'Vazirmatn', size: 13 }, padding: 20 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { font: { family: 'Vazirmatn' } },
                    title: { display: true, text: yAxisLabel, font: { family: 'Vazirmatn', size: 14 } }
                },
                x: { ticks: { font: { family: 'Vazirmatn' } } }
            }
        };
    }
}

// ==================== //
// PARTICLE MANAGER //
// ==================== //
class ParticleManager {
    constructor() {}
    init() {
        if (typeof particlesJS === 'undefined' || !elements.particlesContainer) return;
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#ffffff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.2, width: 1 },
                move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" } }
            },
            retina_detect: true
        });
    }
}

// ==================== //
// AUTHENTICATION SYSTEM //
// ==================== //
class AuthSystem {
    constructor() { this.currentUser = null; this.init(); }
    init() { this.bindEvents(); this.checkAuth(); }
    bindEvents() {
        if (elements.authTabs) {
            elements.authTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.dataset.tab;
                    elements.authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
                    document.querySelectorAll('.auth-form').forEach(form => form.classList.toggle('active', form.id === `${tabName}Form`));
                });
            });
        }
        if (elements.userBtn) elements.userBtn.addEventListener('click', () => {
            if (this.currentUser) Toast.show(`خوش آمدید ${this.currentUser.name}`, 'success');
            else modals.openModal('auth');
        });
    }
    checkAuth() {
        const savedUser = localStorage.getItem('htland-user');
        if (savedUser) {
            try { this.currentUser = JSON.parse(savedUser); HTLand.isLoggedIn = true; } catch (e) {}
        }
    }
}

// ==================== //
// PRODUCT SYSTEM //
// ==================== //
class ProductSystem {
    constructor() { this.products = []; this.categories = []; this.cart = []; this.wishlist = []; this.init(); }
    loadData() {
        // ==================== دسته‌بندی‌ها (Categories) ====================
        this.categories = [
            {
                id: 1,
                name: 'برنج شمال',
                image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400',
                description: 'هاشمی، طارم، صدری'
            },
            {
                id: 2,
                name: 'خاویار ایرانی',
                image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
                description: 'طلایی، سیاه، فیل‌ماهی'
            },
            {
                id: 3,
                name: 'عسل طبیعی',
                image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
                description: 'گون، کنار، جنگلی'
            },
            {
                id: 4,
                name: 'ماهی تازه',
                image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
                description: 'سفید، کیلکا، کپور'
            },
            {
                id: 5,
                name: 'چای و گیاهان',
                image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
                description: 'چای لاهیجان، گیاهان دارویی'
            },
            {
                id: 6,
                name: 'سوغات شمال',
                image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400',
                description: 'ترشیجات، مربا، خشکبار'
            }
        ];

        // ==================== محصولات (Products) ====================
        this.products = [
            {
                id: 1,
                name: 'برنج هاشمی ممتاز',
                description: 'برنج هاشمی درجه یک شمال، عطر طبیعی',
                price: 85000,
                originalPrice: 95000,
                discount: 10,
                badge: 'ارگانیک',
                image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
                rating: 4.8,
                reviews: 120
            },
            {
                id: 2,
                name: 'خاویار طلایی ایرانی',
                description: 'خاویار درجه یک فیل ماهی، بسته‌بندی لوکس',
                price: 2900000,
                originalPrice: 3200000,
                discount: 10,
                badge: 'پرمیوم',
                image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600',
                rating: 4.9,
                reviews: 85
            },
            {
                id: 3,
                name: 'عسل طبیعی گون',
                description: 'عسل خالص و ارگانیک، بدون قند مصنوعی',
                price: 350000,
                originalPrice: 380000,
                discount: 5,
                badge: 'طبیعی',
                image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600',
                rating: 4.7,
                reviews: 200
            },
            {
                id: 4,
                name: 'ماهی سفید دودی',
                description: 'ماهی سفید تازه دودی شده، طعم اصیل شمال',
                price: 180000,
                originalPrice: 0,
                discount: 0,
                badge: 'تازه',
                image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600',
                rating: 4.6,
                reviews: 90
            },
            {
                id: 5,
                name: 'چای لاهیجان ارگانیک',
                description: 'چای سیاه برگ، برداشت اول بهار',
                price: 120000,
                originalPrice: 150000,
                discount: 20,
                badge: 'بهاره',
                image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600',
                rating: 4.5,
                reviews: 150
            },
            {
                id: 6,
                name: 'مربای پرتقال شمال',
                description: 'مربای خانگی با تکه‌های میوه طبیعی',
                price: 65000,
                originalPrice: 0,
                discount: 0,
                badge: 'خانگی',
                image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600',
                rating: 4.8,
                reviews: 60
            }
        ];
    }
renderCategories() {
    if (!elements.categoriesGrid) return;
    elements.categoriesGrid.innerHTML = this.categories.map((c, i) => `
        <a href="#${c.name.replace(/\s+/g, '-')}" class="category-card" data-aos="fade-up" data-aos-delay="${i * 100}">
            <div style="height: 120px; overflow: hidden; border-radius: var(--radius-md); margin-bottom: 1rem;">
                <img src="${c.image}" alt="${c.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <h3>${c.name}</h3>
            <p>${c.description}</p>
        </a>
    `).join('');
}
    renderProducts() {
        if (!elements.productsGrid) return;
        elements.productsGrid.innerHTML = this.products.map((p, i) => `
            <div class="product-card" data-aos="fade-up" data-aos-delay="${i * 100}">
                <div class="product-badge">${p.badge}</div>
                ${p.discount ? `<div class="product-badge" style="background: var(--secondary-color); top: 60px;">${p.discount}% تخفیف</div>` : ''}
                <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
                <div class="product-content">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-description">${p.description}</p>
                    <div class="product-price">
                        <span class="current-price">${formatPrice(p.price)} تومان</span>
                        ${p.originalPrice ? `<span class="original-price">${formatPrice(p.originalPrice)} تومان</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-block add-to-cart" data-product="${p.id}"><i class="fas fa-shopping-cart"></i> افزودن به سبد</button>
                    </div>
                </div>
            </div>
        `).join('');
        this.bindProductEvents();
    }
    bindProductEvents() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.product);
                const product = this.products.find(p => p.id === id);
                if (product) {
                    this.cart.push({...product, quantity: 1});
                    HTLand.cartCount = this.cart.length;
                    if (elements.cartBtn) {
                        const badge = elements.cartBtn.querySelector('.badge');
                        if (badge) badge.textContent = HTLand.cartCount;
                    }
                    Toast.show(`"${product.name}" به سبد خرید اضافه شد`, 'success');
                }
            });
        });
    }
    bindEvents() {
        if (elements.cartBtn) elements.cartBtn.addEventListener('click', () => Toast.show(`شما ${this.cart.length} محصول در سبد خرید دارید`, 'info'));
    }
}

// ==================== //
// LIVE STATS ANIMATION //
// ==================== //
class LiveStats {
    constructor() { this.init(); }
    init() { this.animateStats(); this.updateLiveStats(); }
    animateStats() {
        if (!elements.statNumbers) return;
        elements.statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            let current = 0;
            const step = target / 125;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(timer); }
                stat.textContent = Math.floor(current) + '+';
            }, 16);
        });
    }
    updateLiveStats() {
        setInterval(() => {
            if (elements.liveUsers) elements.liveUsers.textContent = Math.max(200, parseInt(elements.liveUsers.textContent) + randomBetween(-5, 5));
            if (elements.recentSales) elements.recentSales.textContent = Math.max(5, parseInt(elements.recentSales.textContent) + randomBetween(-2, 3));
            if (elements.activeOrders) elements.activeOrders.textContent = Math.max(30, parseInt(elements.activeOrders.textContent) + randomBetween(-3, 4));
        }, 10000);
    }
}

// ==================== //
// SCROLL ANIMATIONS //
// ==================== //
class ScrollAnimations {
    constructor() { this.init(); }
    init() {
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 100) elements.header.classList.add('scrolled'); else elements.header.classList.remove('scrolled');
            if (elements.scrollTopBtn) elements.scrollTopBtn.style.opacity = window.scrollY > 500 ? '1' : '0';
        }, 100));
        if (elements.scrollTopBtn) elements.scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
}

// ==================== //
// MOBILE MENU //
// ==================== //
class MobileMenu {
    constructor() { this.init(); }
    init() {
        if (elements.mobileToggle) elements.mobileToggle.addEventListener('click', () => elements.navMenu?.classList.toggle('active'));
    }
}

// ==================== //
// QUICK ACTIONS //
// ==================== //
class QuickActions {
    constructor() { this.init(); }
    init() {
        if (elements.chatBtn) elements.chatBtn.addEventListener('click', () => Toast.show('سیستم چت به زودی راه‌اندازی می‌شود', 'info'));
    }
}

// ==================== //
// AI ASSISTANT SYSTEM //
// ==================== //
class AIAssistant {
    constructor() {
        this.trigger = elements.aiTrigger;
        this.interface = elements.aiInterface;
        this.chatBody = elements.aiChatBody;
        this.input = elements.aiTextInput;
        this.micBtn = elements.aiMicBtn;
        this.isOpen = false;
        this.init();
    }

    init() { this.bindEvents(); }

    bindEvents() {
        if (this.trigger) this.trigger.addEventListener('click', () => this.toggleInterface());
        if (this.input) this.input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendMessage(this.input.value); });
        if (this.micBtn) this.micBtn.addEventListener('click', () => this.toggleVoice());
    }

    toggleInterface() {
        this.isOpen = !this.isOpen;
        if (this.interface) this.interface.classList.toggle('active', this.isOpen);
    }

    sendMessage(text) {
        if (!text.trim()) return;
        this.addMessage(text, 'user');
        if (this.input) this.input.value = '';
        setTimeout(() => {
            this.addMessage("سلام! من دستیار HTLand هستم. در حال حاضر در حالت شبیه‌سازی هستم. به زودی به هوش مصنوعی متصل می‌شوم.", 'bot');
        }, 1000);
    }

    addMessage(text, type) {
        if (!this.chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.textContent = text;
        this.chatBody.appendChild(msgDiv);
        this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }

    toggleVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            Toast.show("مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند", "error");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'fa-IR';
        recognition.interimResults = false;

        if (this.micBtn) this.micBtn.classList.add('listening');
        Toast.show("در حال گوش دادن...", "info");
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (this.input) this.input.value = transcript;
            this.sendMessage(transcript);
            if (this.micBtn) this.micBtn.classList.remove('listening');
        };

        recognition.onerror = () => {
            Toast.show("خطا در تشخیص صدا", "error");
            if (this.micBtn) this.micBtn.classList.remove('listening');
        };
        
        recognition.onend = () => { if (this.micBtn) this.micBtn.classList.remove('listening'); };
    }
}

// ==================== //
// INITIALIZATION //
// ==================== //
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Core Systems
    window.themeManager = new ThemeManager();
    window.modals = new ModalSystem();
    window.walletSystem = new WalletSystem();
    window.authSystem = new AuthSystem();
    window.productSystem = new ProductSystem();
    window.liveStats = new LiveStats();
    window.scrollAnimations = new ScrollAnimations();
    window.mobileMenu = new MobileMenu();
    window.quickActions = new QuickActions();
    
    // Initialize Managers (Empty Constructors)
    window.chartManager = new ChartManager();
    window.particleManager = new ParticleManager();
    
    // Initialize Lazy Loader (This will trigger Charts & Particles)
    window.lazyLoader = new LazyLoader();
    
    // Initialize AI Assistant
    window.aiAssistant = new AIAssistant();
    
    // Hide loading screen
    setTimeout(() => {
        if (elements.loading) {
            elements.loading.style.opacity = '0';
            setTimeout(() => { elements.loading.style.display = 'none'; }, 300);
        }
    }, 500);

    // Initialize wallet button
    if (elements.walletBtn) {
        elements.walletBtn.addEventListener('click', () => {
            modals.openModal('wallet');
        });
    }
    
    // Initialize charge button in wallet submenu
    const chargeBtn = document.querySelector('.charge-btn');
    if (chargeBtn) {
        chargeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            modals.openModal('charge');
        });
    }
    
    // Initialize history button in wallet submenu
    const historyBtn = document.querySelector('.history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            Toast.show('تاریخچه تراکنش‌ها در حال نمایش است', 'info');
        });
    }
    
    // Map button
    const mapBtn = document.querySelector('.map-btn');
    if (mapBtn) {
        mapBtn.addEventListener('click', () => {
            Toast.show('نقشه در حال بارگذاری...', 'info');
            setTimeout(() => {
                window.open('https://maps.google.com/?q=مازندران، ساری، بلوار طالقانی', '_blank');
            }, 1000);
        });
    }
    
    // Register Service Worker (only once)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('SW registered'))
            .catch(err => console.log('SW registration failed:', err));
    }
});
