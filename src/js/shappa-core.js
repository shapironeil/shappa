// ==========================================
// 🚀 SHAPPA CORE v2.0 - SISTEMA UNIFICATO
// Framework ottimizzato per prestazioni e manutenibilità
// ==========================================

console.log('🚀 Shappa Core v2.0 initializing...');

// ==========================================
// 🏗️ ARCHITETTURA MODULARE
// ==========================================

class ShappaCore {
    constructor() {
        this.modules = new Map();
        this.initialized = false;
        this.config = {
            version: '2.0.0',
            debug: true,
            cacheEnabled: true,
            theme: 'auto'
        };

        this.init();
    }

    // ==========================================
    // 🔧 INIZIALIZZAZIONE CORE
    // ==========================================

    async init() {
        try {
            console.log('🔄 Initializing Shappa Core...');

            // Verifica compatibilità browser
            if (!this.checkBrowserSupport()) {
                throw new Error('Browser non supportato');
            }

            // Inizializza sistemi core
            await this.initCoreSystems();

            // Carica moduli necessari
            await this.loadRequiredModules();

            // Setup globale
            this.setupGlobalHandlers();

            this.initialized = true;
            console.log('✅ Shappa Core initialized successfully');

        } catch (error) {
            console.error('❌ Core initialization failed:', error);
            this.handleCriticalError(error);
        }
    }

    checkBrowserSupport() {
        return (
            typeof Promise !== 'undefined' &&
            typeof fetch !== 'undefined' &&
            typeof localStorage !== 'undefined' &&
            typeof document.addEventListener !== 'undefined'
        );
    }

    async initCoreSystems() {
        // Sistema di cache intelligente
        this.cache = new ShappaCache();

        // Sistema di notifiche
        this.notifications = new ShappaNotifications();

        // Loader dinamico
        this.loader = new ShappaLoader();

        // Storage sicuro
        this.storage = new ShappaStorage();
    }

    async loadRequiredModules() {
        const currentPage = this.getCurrentPage();

        // Moduli sempre necessari
        await this.loadModule('auth');

        // Moduli specifici per pagina
        switch (currentPage) {
            case 'register':
                await this.loadModule('register');
                break;
            case 'login':
                await this.loadModule('login');
                break;
            case 'dashboard':
                await this.loadModule('dashboard');
                break;
            case 'admin':
                await this.loadModule('admin');
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('register')) return 'register';
        if (path.includes('login')) return 'login';
        if (path.includes('dashboard')) return 'dashboard';
        if (path.includes('admin')) return 'admin';
        return 'home';
    }

    async loadModule(name) {
        if (this.modules.has(name)) {
            console.log(`📦 Module ${name} already loaded`);
            return this.modules.get(name);
        }

        try {
            console.log(`📦 Loading module: ${name}`);

            let module;

            // Carica modulo specifico
            switch (name) {
                case 'auth':
                    module = new ShappaAuth();
                    break;
                case 'register':
                    module = new ShappaRegister();
                    break;
                case 'login':
                    module = new ShappaLogin();
                    break;
                case 'dashboard':
                    module = new ShappaDashboard();
                    break;
                case 'admin':
                    module = new ShappaAdmin();
                    break;
                default:
                    throw new Error(`Unknown module: ${name}`);
            }

            this.modules.set(name, module);
            console.log(`✅ Module ${name} loaded successfully`);

            return module;

        } catch (error) {
            console.error(`❌ Failed to load module ${name}:`, error);
            throw error;
        }
    }

    setupGlobalHandlers() {
        // Gestione errori globali
        window.addEventListener('error', (e) => {
            console.error('🚨 Global error:', e.error);
            this.notifications.show('Errore interno dell\'applicazione', 'error');
        });

        // Gestione errori promise non gestite
        window.addEventListener('unhandledrejection', (e) => {
            console.error('🚨 Unhandled promise rejection:', e.reason);
            this.notifications.show('Errore interno dell\'applicazione', 'error');
        });

        // Cache busting intelligente
        this.setupCacheBusting();

        // Tema automatico
        this.setupThemeHandler();
    }

    setupCacheBusting() {
        // Forza refresh se necessario
        if (performance.navigation.type === 1) {
            console.log('🔄 Page reloaded - applying cache refresh');
        }

        // Aggiungi timestamp a tutte le richieste
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            if (args[0] && typeof args[0] === 'string' && args[0].includes('.js')) {
                args[0] += (args[0].includes('?') ? '&' : '?') + '_t=' + Date.now();
            }
            return originalFetch.apply(this, args);
        };
    }

    setupThemeHandler() {
        const savedTheme = localStorage.getItem('shappa_theme') || 'auto';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        const root = document.documentElement;

        if (theme === 'auto') {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        root.setAttribute('data-theme', theme);
        localStorage.setItem('shappa_theme', theme);

        console.log(`🎨 Theme set to: ${theme}`);
    }

    handleCriticalError(error) {
        // Mostra errore critico
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            color: #ff4444;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: monospace;
            text-align: center;
        `;

        errorDiv.innerHTML = `
            <div>
                <h1>🚨 ERRORE CRITICO</h1>
                <p>${error.message}</p>
                <p style="font-size: 0.8em; margin-top: 1rem;">
                    Ricarica la pagina o contatta il supporto
                </p>
                <button onclick="location.reload()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: #ff4444;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                ">Ricarica</button>
            </div>
        `;

        document.body.appendChild(errorDiv);
    }

    // ==========================================
    // 🔧 UTILITIES
    // ==========================================

    getModule(name) {
        return this.modules.get(name);
    }

    isInitialized() {
        return this.initialized;
    }

    getConfig() {
        return { ...this.config };
    }

    updateConfig(updates) {
        Object.assign(this.config, updates);
        console.log('⚙️ Config updated:', updates);
    }
}

// ==========================================
// 💾 SISTEMA CACHE INTELLIGENTE
// ==========================================

class ShappaCache {
    constructor() {
        this.cache = new Map();
        this.maxSize = 50;
        this.ttl = 5 * 60 * 1000; // 5 minuti
    }

    set(key, value, ttl = this.ttl) {
        const expires = Date.now() + ttl;
        this.cache.set(key, { value, expires });

        // Limita dimensione cache
        if (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

// ==========================================
// 📢 SISTEMA NOTIFICHE
// ==========================================

class ShappaNotifications {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crea container notifiche
        this.container = document.createElement('div');
        this.container.id = 'shappa-notifications';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);

        // Aggiungi stili
        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('notification-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .shappa-notification {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                margin-bottom: 0.5rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                pointer-events: auto;
                cursor: pointer;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .shappa-notification.error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
            }

            .shappa-notification.warning {
                background: linear-gradient(135deg, #f59e0b, #d97706);
            }

            .shappa-notification.info {
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            }

            .shappa-notification .icon {
                font-size: 1.2rem;
                flex-shrink: 0;
            }

            .shappa-notification .content {
                flex: 1;
            }

            .shappa-notification .close {
                opacity: 0.7;
                cursor: pointer;
                font-size: 1.2rem;
                margin-left: 0.5rem;
            }

            .shappa-notification .close:hover {
                opacity: 1;
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }

            @keyframes fadeOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100%); }
            }
        `;
        document.head.appendChild(styles);
    }

    show(message, type = 'success', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `shappa-notification ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <span class="icon">${icons[type] || '📢'}</span>
            <span class="content">${message}</span>
            <span class="close" onclick="this.parentElement.remove()">×</span>
        `;

        this.container.appendChild(notification);

        // Auto-rimuovi
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }

        console.log(`📢 Notification: ${type} - ${message}`);
    }
}

// ==========================================
// 📦 LOADER DINAMICO
// ==========================================

class ShappaLoader {
    constructor() {
        this.loading = new Set();
    }

    async loadScript(src) {
        if (this.loading.has(src)) {
            return; // Già in caricamento
        }

        return new Promise((resolve, reject) => {
            this.loading.add(src);

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                this.loading.delete(src);
                resolve();
            };
            script.onerror = () => {
                this.loading.delete(src);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    async loadCSS(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;

            document.head.appendChild(link);
        });
    }
}

// ==========================================
// 💾 STORAGE SICURO
// ==========================================

class ShappaStorage {
    constructor() {
        this.prefix = 'shappa_v2_';
    }

    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (error) {
            console.error('❌ Storage set error:', error);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('❌ Storage get error:', error);
            return defaultValue;
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    getSize() {
        let size = 0;
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                size += localStorage[key].length;
            }
        });
        return size;
    }
}

// ==========================================
// 🔐 AUTENTICAZIONE OTTIMIZZATA
// ==========================================

class ShappaAuth {
    constructor() {
        this.currentUser = null;
        this.dbKey = 'users_db';
        this.currentUserKey = 'current_user';
        this.initialized = false;

        this.init();
    }

    init() {
        if (!window.Shappa?.storage) {
            console.error('❌ Storage not available');
            return;
        }

        this.migrateFromV1();
        this.loadCurrentUser();
        this.initialized = true;

        console.log('✅ Auth system initialized');
    }

    // ...existing code...
    getUsers() {
        return window.Shappa.storage.get(this.dbKey, []);
    }

    saveUsers(users) {
        window.Shappa.storage.set(this.dbKey, users);
    }

    register(username, email, password, confirmPassword) {
        try {
            console.log('🔄 Registration process...');

            // Validazioni
            const validation = this.validateRegistration(username, email, password, confirmPassword);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            // Verifica unicità
            const users = this.getUsers();
            if (this.userExists(users, email, username)) {
                return { success: false, error: 'Email o username già in uso' };
            }

            // Crea utente
            const newUser = this.createUser(username, email, password);
            users.push(newUser);
            this.saveUsers(users);

            console.log('✅ Registration successful');
            return { success: true, user: newUser };

        } catch (error) {
            console.error('❌ Registration error:', error);
            return { success: false, error: 'Errore interno durante la registrazione' };
        }
    }

    validateRegistration(username, email, password, confirmPassword) {
        if (!username?.trim() || username.length < 3) {
            return { valid: false, error: 'Username deve essere almeno 3 caratteri' };
        }

        if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { valid: false, error: 'Email non valida' };
        }

        if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            return { valid: false, error: 'Password deve essere almeno 8 caratteri con lettere e numeri' };
        }

        if (password !== confirmPassword) {
            return { valid: false, error: 'Le password non coincidono' };
        }

        return { valid: true };
    }

    userExists(users, email, username) {
        return users.some(user =>
            user.email?.toLowerCase() === email?.toLowerCase() ||
            user.username?.toLowerCase() === username?.toLowerCase()
        );
    }

    createUser(username, email, password) {
        return {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profile: {
                amazonConnected: false,
                ebayConnected: false,
                totalListings: 0,
                totalSales: 0,
                totalProfits: 0
            }
        };
    }

    login(emailOrUsername, password) {
        try {
            const users = this.getUsers();
            const user = users.find(u =>
                (u.email === emailOrUsername || u.username === emailOrUsername) &&
                u.password === password
            );

            if (!user) {
                return { success: false, error: 'Credenziali non valide' };
            }

            user.lastLogin = new Date().toISOString();
            this.saveUsers(users);

            this.currentUser = user;
            this.saveCurrentUser(user);

            return { success: true, user };

        } catch (error) {
            console.error('❌ Login error:', error);
            return { success: false, error: 'Errore interno durante il login' };
        }
    }

    logout() {
        this.currentUser = null;
        window.Shappa.storage.remove(this.currentUserKey);
        window.location.href = 'login.html';
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    loadCurrentUser() {
        this.currentUser = window.Shappa.storage.get(this.currentUserKey, null);
    }

    saveCurrentUser(user) {
        window.Shappa.storage.set(this.currentUserKey, user);
    }

    migrateFromV1() {
        const oldData = localStorage.getItem('shappa_users_db');
        if (oldData) {
            try {
                const oldUsers = JSON.parse(oldData);
                if (Array.isArray(oldUsers)) {
                    console.log('🔄 Migrating from v1...');
                    window.Shappa.storage.set(this.dbKey, oldUsers);
                    localStorage.removeItem('shappa_users_db');
                    localStorage.removeItem('shappa_current_user');
                }
            } catch (error) {
                console.error('❌ Migration error:', error);
            }
        }
    }
}

// ==========================================
// 📝 REGISTRAZIONE OTTIMIZZATA
// ==========================================

class ShappaRegister {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        this.isSubmitting = false;

        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        console.log('✅ Register form initialized');
    }

    async handleSubmit() {
        if (this.isSubmitting) return;

        try {
            this.isSubmitting = true;
            this.setLoading(true);

            const formData = this.getFormData();
            if (!formData) return;

            const result = window.Shappa.getModule('auth').register(
                formData.username,
                formData.email,
                formData.password,
                formData.confirmPassword
            );

            if (result.success) {
                this.showSuccess(result.user);
                setTimeout(() => {
                    window.location.href = 'login.html?registered=1&t=' + Date.now();
                }, 2000);
            } else {
                this.showError(result.error);
            }

        } catch (error) {
            this.showError('Errore interno del sistema');
        } finally {
            this.isSubmitting = false;
            this.setLoading(false);
        }
    }

    getFormData() {
        const data = {
            username: document.getElementById('username')?.value?.trim(),
            email: document.getElementById('email')?.value?.trim(),
            password: document.getElementById('password')?.value,
            confirmPassword: document.getElementById('confirmPassword')?.value,
            terms: document.getElementById('terms')?.checked
        };

        if (!data.username || !data.email || !data.password || !data.confirmPassword) {
            this.showError('Tutti i campi sono obbligatori');
            return null;
        }

        if (!data.terms) {
            this.showError('Devi accettare i termini di servizio');
            return null;
        }

        return data;
    }

    showSuccess(user) {
        window.Shappa.notifications.show(`Benvenuto ${user.username}! Account creato con successo.`, 'success');
    }

    showError(message) {
        window.Shappa.notifications.show(message, 'error');
    }

    setLoading(loading) {
        if (this.submitBtn) {
            this.submitBtn.disabled = loading;
            this.submitBtn.textContent = loading ? '⏳ Creando account...' : '🚀 Crea Account';
        }
    }
}

// ==========================================
// 🚀 INIZIALIZZAZIONE GLOBALE
// ==========================================

// Istanza globale
window.Shappa = new ShappaCore();

// Export per compatibilità
window.AuthManager = window.Shappa.getModule('auth');

console.log('🎉 Shappa Core v2.0 ready!');
