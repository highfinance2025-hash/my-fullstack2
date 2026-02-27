// HTLand Frontend Application - Main JavaScript File

// ==================== //
// GLOBAL STATE & CONFIG //
// ==================== //
const HTLand = {
    user: null,
    walletBalance: 0,
    cartCount: 0,
    wishlistCount: 0,
    currentTheme: localStorage.getItem('htland-theme') || 'light',
    isLoggedIn: false,
    liveStats: { users: 243, sales: 15, orders: 42 },
    config: {
        minChargeAmount: 10000,
        maxChargeAmount: 5000000,
        otpTimeout: 120
    },
    data: { categories: [], products: [], transactions: [] }
};

// ==================== //
// DOM ELEMENTS //
// ==================== //
const elements = {
    loading: document.getElementById('loading'),
    header: document.querySelector('.header'),
    mobileToggle: document.querySelector('.mobile-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    floatingMenu: document.querySelectorAll('.floating-item'),
    themeToggle: document.querySelector('.theme-toggle'),
    userBtn: document.querySelector('.user-btn'),
    cartBtn: document.querySelector('.cart-btn'),
    walletBtn: document.querySelector('.wallet-menu-btn'),
    authModal: document.getElementById('authModal'),
    walletModal: document.getElementById('walletModal'),
    chargeModal: document.getElementById('chargeModal'),
    twoFAModal: document.getElementById('twoFAModal'),
    modalCloses: document.querySelectorAll('.modal-close'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    authTabs: document.querySelectorAll('.auth-tab'),
    walletBalance: document.querySelector('.balance'),
    walletBalanceLarge: document.querySelector('.balance-amount'),
    chargeAmount: document.querySelector('.charge-amount'),
    quickAmounts: document.querySelectorAll('.quick-amount'),
    chargeSubmit: document.querySelector('.charge-submit'),
    quickActions: document.querySelector('.quick-actions-fixed'),
    scrollTopBtn: document.querySelector('.scroll-top'),
    chatBtn: document.querySelector('.chat-btn'),
    themeToggleBtn: document.querySelector('.theme-toggle-btn'),
    liveUsers: document.getElementById('live-users'),
    recentSales: document.getElementById('recent-sales'),
    activeOrders: document.getElementById('active-orders'),
    statNumbers: document.querySelectorAll('.stat-number'),
    categoriesGrid: document.querySelector('.categories-grid'),
    productsGrid: document.querySelector('.products-grid'),
    transactionsList: document.querySelector('.transactions-list'),
    toastContainer: document.querySelector('.toast-container'),
    onlineUsersChart: document.getElementById('onlineUsersChart'),
    recentSalesChart: document.getElementById('recentSalesChart'),
    activeOrdersChart: document.getElementById('activeOrdersChart'),
    particlesContainer: document.getElementById('particles-js'),
    // AI Elements
    aiTrigger: document.getElementById('aiTrigger'),
    aiInterface: document.getElementById('aiInterface'),
    aiChatBody: document.getElementById('aiChatBody'),
    aiTextInput: document.getElementById('aiTextInput'),
    aiMicBtn: document.getElementById('aiMicBtn')
};

// ==================== //
// UTILITY FUNCTIONS //
// ==================== //
function formatPrice(price) { return new Intl.NumberFormat('fa-IR').format(price); }
function formatDate(date) { return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date); }
function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function debounce(func, wait) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }
function throttle(func, limit) { let inThrottle; return function() { const args = arguments; const context = this; if (!inThrottle) { func.apply(context, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } }; }
function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

// ==================== //
// THEME MANAGEMENT //
// ==================== //
class ThemeManager {
    constructor() { this.themes = ['light', 'dark', 'sea', 'royal']; this.currentTheme = HTLand.currentTheme; this.init(); }
    init() { this.applyTheme(); this.bindEvents(); this.updateThemeButton(); }
    applyTheme() { document.body.setAttribute('data-theme', this.currentTheme); localStorage.setItem('htland-theme', this.currentTheme); }
    toggleTheme() { const currentIndex = this.themes.indexOf(this.currentTheme); const nextIndex = (currentIndex + 1) % this.themes.length; this.currentTheme = this.themes[nextIndex]; this.applyTheme(); this.updateThemeButton(); Toast.show(`تم ${this.getThemeName(this.currentTheme)} فعال شد`, 'info'); }
    getThemeName(theme) { const names = { 'light': 'طبیعت شمال', 'dark': 'تاریک', 'sea': 'دریای آبی', 'royal': 'سلطنتی' }; return names[theme] || theme; }
    updateThemeButton() { const icons = { 'light': 'fa-moon', 'dark': 'fa-sun', 'sea': 'fa-water', 'royal': 'fa-crown' }; if (elements.themeToggle) { const icon = elements.themeToggle.querySelector('i'); if (icon) icon.className = `fas ${icons[this.currentTheme] || 'fa-palette'}`; } }
    bindEvents() { if (elements.themeToggle) elements.themeToggle.addEventListener('click', () => this.toggleTheme()); if (elements.themeToggleBtn) elements.themeToggleBtn.addEventListener('click', () => this.toggleTheme()); }
}

// ==================== //
// TOAST SYSTEM //
// ==================== //
class Toast {
    static show(message, type = 'info') {
        const toast = document.createElement('div'); toast.className = `toast toast-${type}`;
        const icon = this.getIcon(type);
        toast.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-message">${escapeHtml(message)}</div><button class="toast-close">&times;</button>`;
        elements.toastContainer.appendChild(toast);
        setTimeout(() => { toast.style.animation = 'toastSlideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 5000);
        toast.querySelector('.toast-close').addEventListener('click', () => { toast.style.animation = 'toastSlideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); });
    }
    static getIcon(type) { const icons = { 'success': '✅', 'error': '❌', 'warning': '⚠️', 'info': 'ℹ️' }; return icons[type] || '💡'; }
}

// ==================== //
// MODAL SYSTEM //
// ==================== //
class ModalSystem {
    constructor() { this.modals = {}; this.init(); }
    init() { this.registerModal('auth', elements.authModal); this.registerModal('wallet', elements.walletModal); this.registerModal('charge', elements.chargeModal); this.registerModal('twoFA', elements.twoFAModal); elements.modalCloses.forEach(btn => btn.addEventListener('click', () => this.closeAll())); document.querySelectorAll('.modal').forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) this.closeAll(); })); document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeAll(); }); }
    registerModal(name, element) { this.modals[name] = element; }
    openModal(name) { this.closeAll(); const modal = this.modals[name]; if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; } }
    closeModal(name) { const modal = this.modals[name]; if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; } }
    closeAll() { Object.values(this.modals).forEach(modal => modal.classList.remove('active')); document.body.style.overflow = 'auto'; }
}

// ==================== //
// WALLET SYSTEM //
// ==================== //
class WalletSystem {
    constructor() { this.balance = HTLand.walletBalance; this.transactions = []; this.init(); }
    init() { this.loadTransactions(); this.bindEvents(); this.updateDisplay(); }
    loadTransactions() { this.transactions = [{ id: 1, type: 'charge', amount: 50000, description: 'شارژ کیف پول', date: new Date(Date.now() - 86400000), status: 'completed' }, { id: 2, type: 'purchase', amount: -25000, description: 'خرید برنج هاشمی', date: new Date(Date.now() - 172800000), status: 'completed' }]; }
    updateDisplay() { if (elements.walletBalance) elements.walletBalance.textContent = `${formatPrice(this.balance)} تومان`; if (elements.walletBalanceLarge) elements.walletBalanceLarge.textContent = `${formatPrice(this.balance)} تومان`; this.renderTransactions(); }
    renderTransactions() { if (!elements.transactionsList) return; if (this.transactions.length === 0) { elements.transactionsList.innerHTML = '<p class="empty-state">هیچ تراکنشی یافت نشد</p>'; return; } elements.transactionsList.innerHTML = this.transactions.map(t => `<div class="transaction-item"><div class="transaction-info"><div class="transaction-title">${escapeHtml(t.description)}</div><div class="transaction-date">${escapeHtml(formatDate(t.date))}</div></div><div class="transaction-amount ${t.amount > 0 ? 'positive' : 'negative'}">${t.amount > 0 ? '+' : ''}${formatPrice(t.amount)} تومان</div></div>`).join(''); }
    charge(amount) { if (amount < HTLand.config.minChargeAmount) { Toast.show(`حداقل مبلغ شارژ ${formatPrice(HTLand.config.minChargeAmount)} تومان است`, 'error'); return false; } if (amount > HTLand.config.maxChargeAmount) { Toast.show(`حداکثر مبلغ شارژ ${formatPrice(HTLand.config.maxChargeAmount)} تومان است`, 'error'); return false; } Toast.show('در حال انتقال به درگاه پرداخت...', 'info'); setTimeout(() => { this.balance += amount; this.transactions.unshift({ id: Date.now(), type: 'charge', amount: amount, description: 'شارژ کیف پول', date: new Date(), status: 'completed' }); this.updateDisplay(); Toast.show(`کیف پول شما با موفقیت شارژ شد`, 'success'); modals.closeModal('charge'); }, 2000); return true; }
    bindEvents() { if (elements.chargeSubmit) elements.chargeSubmit.addEventListener('click', () => this.charge(parseInt(elements.chargeAmount?.value || 0))); if (elements.quickAmounts) elements.quickAmounts.forEach(btn => btn.addEventListener('click', () => { if (elements.chargeAmount) elements.chargeAmount.value = btn.dataset.amount; elements.quickAmounts.forEach(b => b.classList.remove('active')); btn.classList.add('active'); })); document.querySelector('.charge-action')?.addEventListener('click', () => modals.openModal('charge')); document.querySelector('.withdraw-action')?.addEventListener('click', () => Toast.show('سیستم برداشت به زودی راه‌اندازی می‌شود', 'info')); document.querySelector('.history-action')?.addEventListener('click', () => Toast.show('تاریخچه تراکنش‌ها در حال نمایش است', 'info')); }
}

// ==================== //
// LAZY LOADER (Performance) //
// ==================== //
class LazyLoader {
    constructor() { this.scriptsLoaded = false; this.init(); }
    init() { const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting && !this.scriptsLoaded) { this.loadHeavyScripts(); this.scriptsLoaded = true; observer.unobserve(entry.target); } }); }, { rootMargin: "200px" }); if (elements.onlineUsersChart) observer.observe(elements.onlineUsersChart.parentElement); else setTimeout(() => this.loadHeavyScripts(), 3000); }
    loadHeavyScripts() {
        console.log("🚀 Loading heavy assets...");
        const chartScript = document.createElement('script'); chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js'; chartScript.onload = () => { if (window.chartManager) window.chartManager.initCharts(); }; document.body.appendChild(chartScript);
        const particlesScript = document.createElement('script'); particlesScript.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'; particlesScript.onload = () => { if (window.particleManager) window.particleManager.init(); }; document.body.appendChild(particlesScript);
        const aosScript = document.createElement('script'); aosScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js'; aosScript.onload = () => { AOS.init({ duration: 800, offset: 100, once: true, easing: 'ease-out-cubic' }); }; document.body.appendChild(aosScript);
    }
}

// ==================== //
// CHART MANAGER //
// ==================== //
class ChartManager {
    constructor() { this.charts = {}; }
    initCharts() { if (typeof Chart === 'undefined') return; Chart.defaults.font.family = 'Vazirmatn'; console.log("Charts Initialized"); /* Place your Chart creation code here if needed */ }
}

// ==================== //
// PARTICLE MANAGER //
// ==================== //
class ParticleManager {
    constructor() {}
    init() { if (typeof particlesJS === 'undefined' || !elements.particlesContainer) return; particlesJS('particles-js', { particles: { number: { value: 80, density: { enable: true, value_area: 800 } }, color: { value: "#ffffff" }, shape: { type: "circle" }, opacity: { value: 0.5 }, size: { value: 3, random: true }, line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.2, width: 1 }, move: { enable: true, speed: 2 } }, interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "repulse" } } } }); }
}

// ==================== //
// AUTH & PRODUCTS (Shortened for space) //
// ==================== //
class AuthSystem { constructor() { this.currentUser = null; this.init(); } init() { this.bindEvents(); } bindEvents() { if (elements.userBtn) elements.userBtn.addEventListener('click', () => Toast.show('سیستم ورود فعال است', 'info')); } }
class ProductSystem { constructor() { this.init(); } init() { this.loadData(); } loadData() { /* Sample Data */ } }
class LiveStats { constructor() { this.init(); } init() { /* Animation Logic */ } }
class ScrollAnimations { constructor() { this.init(); } init() { window.addEventListener('scroll', throttle(() => { if (window.scrollY > 100) elements.header.classList.add('scrolled'); else elements.header.classList.remove('scrolled'); if (elements.scrollTopBtn) elements.scrollTopBtn.style.opacity = window.scrollY > 500 ? '1' : '0'; }, 100)); if (elements.scrollTopBtn) elements.scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })); } }
class MobileMenu { constructor() { this.init(); } init() { if (elements.mobileToggle) elements.mobileToggle.addEventListener('click', () => elements.navMenu?.classList.toggle('active')); } }
class QuickActions { constructor() { this.init(); } init() { if (elements.chatBtn) elements.chatBtn.addEventListener('click', () => Toast.show('سیستم چت به زودی راه‌اندازی می‌شود', 'info')); if (elements.themeToggleBtn) elements.themeToggleBtn.addEventListener('click', () => themeManager.toggleTheme()); } }

// ==================== //
// AI ASSISTANT SYSTEM //
// ==================== //
class AIAssistant {
    constructor() { this.trigger = elements.aiTrigger; this.interface = elements.aiInterface; this.chatBody = elements.aiChatBody; this.input = elements.aiTextInput; this.micBtn = elements.aiMicBtn; this.isOpen = false; this.init(); }
    init() { this.bindEvents(); }
    bindEvents() { if (this.trigger) this.trigger.addEventListener('click', () => this.toggleInterface()); if (this.input) this.input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.sendMessage(this.input.value); }); if (this.micBtn) this.micBtn.addEventListener('click', () => this.toggleVoice()); }
    toggleInterface() { this.isOpen = !this.isOpen; if (this.interface) this.interface.classList.toggle('active', this.isOpen); }
    sendMessage(text) { if (!text.trim()) return; this.addMessage(text, 'user'); if (this.input) this.input.value = ''; setTimeout(() => { this.addMessage("سلام! من دستیار HTLand هستم. در حال حاضر در حالت شبیه‌سازی هستم. به زودی به هوش مصنوعی متصل می‌شوم.", 'bot'); }, 1000); }
    addMessage(text, type) { if (!this.chatBody) return; const msgDiv = document.createElement('div'); msgDiv.className = `message ${type}`; msgDiv.textContent = text; this.chatBody.appendChild(msgDiv); this.chatBody.scrollTop = this.chatBody.scrollHeight; }
    toggleVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) { Toast.show("مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند", "error"); return; }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; const recognition = new SpeechRecognition();
        recognition.lang = 'fa-IR'; recognition.interimResults = false;
        if (this.micBtn) this.micBtn.classList.add('listening'); Toast.show("در حال گوش دادن...", "info"); recognition.start();
        recognition.onresult = (event) => { const transcript = event.results[0][0].transcript; if (this.input) this.input.value = transcript; this.sendMessage(transcript); if (this.micBtn) this.micBtn.classList.remove('listening'); };
        recognition.onerror = () => { Toast.show("خطا در تشخیص صدا", "error"); if (this.micBtn) this.micBtn.classList.remove('listening'); };
        recognition.onend = () => { if (this.micBtn) this.micBtn.classList.remove('listening'); };
    }
}

// ==================== //
// INITIALIZATION //
// ==================== //
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    window.modals = new ModalSystem();
    window.walletSystem = new WalletSystem();
    window.authSystem = new AuthSystem();
    window.productSystem = new ProductSystem();
    window.liveStats = new LiveStats();
    window.scrollAnimations = new ScrollAnimations();
    window.mobileMenu = new MobileMenu();
    window.quickActions = new QuickActions();
    window.chartManager = new ChartManager();
    window.particleManager = new ParticleManager();
    window.lazyLoader = new LazyLoader();
    window.aiAssistant = new AIAssistant();
    
    setTimeout(() => { if (elements.loading) { elements.loading.style.opacity = '0'; setTimeout(() => { elements.loading.style.display = 'none'; }, 300); } }, 500);

    if (elements.walletBtn) elements.walletBtn.addEventListener('click', () => modals.openModal('wallet'));
    const chargeBtn = document.querySelector('.charge-btn'); if (chargeBtn) chargeBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); modals.openModal('charge'); });
    const historyBtn = document.querySelector('.history-btn'); if (historyBtn) historyBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); Toast.show('تاریخچه تراکنش‌ها در حال نمایش است', 'info'); });
    const mapBtn = document.querySelector('.map-btn'); if (mapBtn) mapBtn.addEventListener('click', () => { Toast.show('نقشه در حال بارگذاری...', 'info'); setTimeout(() => window.open('https://maps.google.com/?q=مازندران، ساری، بلوار طالقانی', '_blank'), 1000); });

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js').catch(err => console.log('SW registration failed:', err));
});
