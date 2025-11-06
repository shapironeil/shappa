/**
 * 🚀 SHAPPA THEME MANAGER v2.0
 * Gestore temi avanzato con supporto PWA e monitoraggio performance
 */

class ShappaThemeManager {
    constructor(config = {}) {
        this.config = { ...window.ShappaConfig?.theme, ...config };
        this.themeToggle = null;
        this.currentTheme = localStorage.getItem(this.config.storageKey) || this.config.default;
        this.systemTheme = this.getSystemTheme();
        this.init();
    }

    init() {
        this.createThemeToggle();
        this.setTheme(this.currentTheme);
        this.bindEvents();
        this.initPerformanceMonitoring();
    }

    createThemeToggle() {
        // Crea il pulsante toggle se non esiste
        if (!document.getElementById('shappa-theme-toggle')) {
            const toggle = document.createElement('button');
            toggle.id = 'shappa-theme-toggle';
            toggle.className = 'btn btn-ghost';
            toggle.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 1000;';
            toggle.setAttribute('aria-label', 'Cambia tema');
            document.body.appendChild(toggle);
            this.themeToggle = toggle;
        } else {
            this.themeToggle = document.getElementById('shappa-theme-toggle');
        }
    }

    bindEvents() {
        // Toggle manuale
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Keyboard accessibility
        this.themeToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Auto-switch basato sul sistema (opzionale)
        if (localStorage.getItem(this.config.autoThemeKey) === 'true') {
            this.watchSystemTheme();
        }
    }

    setTheme(theme, save = true) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;

        if (save) {
            localStorage.setItem(this.config.storageKey, theme);
        }

        this.updateToggleIcon();
        this.dispatchThemeChange(theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    updateToggleIcon() {
        if (this.themeToggle) {
            const isDark = this.currentTheme === 'dark';
            this.themeToggle.textContent = isDark ? '☀️' : '🌙';
            this.themeToggle.setAttribute('aria-label',
                isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'
            );
        }
    }

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (localStorage.getItem(this.config.autoThemeKey) === 'true') {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    dispatchThemeChange(theme) {
        const event = new CustomEvent('shappa-theme-change', {
            detail: { theme, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
    }

    // Metodi pubblici per controllo esterno
    enableAutoTheme() {
        localStorage.setItem(this.config.autoThemeKey, 'true');
        this.setTheme(this.getSystemTheme());
        this.watchSystemTheme();
    }

    disableAutoTheme() {
        localStorage.setItem(this.config.autoThemeKey, 'false');
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

/**
 * 🚀 SHAPPA PERFORMANCE MONITOR
 * Monitoraggio performance e analytics
 */
class ShappaPerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            interactions: [],
            errors: [],
            pageViews: 1
        };
        this.init();
    }

    init() {
        this.monitorPageLoad();
        this.monitorInteractions();
        this.monitorErrors();
        this.monitorVisibility();
    }

    monitorPageLoad() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            console.log(`🚀 Shappa loaded in ${this.metrics.loadTime.toFixed(2)}ms`);

            // Invia analytics se disponibile
            this.sendAnalytics('page_load', {
                loadTime: this.metrics.loadTime,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            });
        });
    }

    monitorInteractions() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button, [role="button"], input, select, textarea');
            if (target) {
                const interaction = {
                    type: target.tagName.toLowerCase(),
                    className: target.className,
                    text: target.textContent?.trim().substring(0, 50),
                    href: target.href,
                    timestamp: Date.now()
                };

                this.metrics.interactions.push(interaction);

                // Limita array a ultime 100 interazioni
                if (this.metrics.interactions.length > 100) {
                    this.metrics.interactions.shift();
                }

                this.sendAnalytics('interaction', interaction);
            }
        });
    }

    monitorErrors() {
        window.addEventListener('error', (e) => {
            const error = {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                timestamp: Date.now()
            };

            this.metrics.errors.push(error);
            console.error('🚨 Shappa Error:', error);

            this.sendAnalytics('error', error);
        });

        // Monitora errori di rete
        window.addEventListener('unhandledrejection', (e) => {
            const error = {
                type: 'unhandled_promise_rejection',
                reason: e.reason?.toString(),
                timestamp: Date.now()
            };

            this.metrics.errors.push(error);
            console.error('🚨 Shappa Unhandled Rejection:', error);
        });
    }

    monitorVisibility() {
        document.addEventListener('visibilitychange', () => {
            const state = document.visibilityState;
            this.sendAnalytics('visibility_change', {
                state,
                timestamp: Date.now()
            });
        });
    }

    sendAnalytics(eventType, data) {
        // Qui puoi integrare con servizi analytics reali
        // Per ora logghiamo solo in console
        console.log(`📊 Analytics: ${eventType}`, data);

        // In futuro: invio a endpoint analytics
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ eventType, data, sessionId: this.getSessionId() })
        // });
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('shappa-session-id');
        if (!sessionId) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            sessionStorage.setItem('shappa-session-id', sessionId);
        }
        return sessionId;
    }

    getMetrics() {
        return { ...this.metrics };
    }
}

/**
 * 🚀 SHAPPA PWA MANAGER
 * Gestione Progressive Web App
 */
class ShappaPWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.handleInstallPrompt();
        this.monitorConnectivity();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration.scope);

                // Gestisci aggiornamenti
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateNotification();
                            }
                        });
                    }
                });

            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    handleInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed');
            this.hideInstallButton();
        });
    }

    showInstallButton() {
        // Crea pulsante installazione se non esiste
        if (!document.getElementById('shappa-install-btn')) {
            const btn = document.createElement('button');
            btn.id = 'shappa-install-btn';
            btn.className = 'btn btn-success';
            btn.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; z-index: 1000;';
            btn.innerHTML = '📱 Installa App';
            btn.onclick = () => this.installPWA();
            document.body.appendChild(btn);
        }
    }

    hideInstallButton() {
        const btn = document.getElementById('shappa-install-btn');
        if (btn) btn.remove();
    }

    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`✅ PWA install outcome: ${outcome}`);
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }

    monitorConnectivity() {
        window.addEventListener('online', () => {
            console.log('🌐 Online');
            this.showNotification('Connessione ripristinata', 'success');
        });

        window.addEventListener('offline', () => {
            console.log('📴 Offline');
            this.showNotification('Connessione persa - Modalità offline attiva', 'warning');
        });
    }

    showUpdateNotification() {
        this.showNotification(
            'Aggiornamento disponibile! Ricarica per la nuova versione.',
            'info',
            () => window.location.reload()
        );
    }

    showNotification(message, type = 'info', action = null) {
        // Implementazione semplice, puoi sostituire con toast system esistente
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed; top: 1rem; left: 50%; transform: translateX(-50%);
            background: var(--bg-primary); border: 1px solid var(--border-color);
            padding: 1rem; border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg); z-index: 10000; max-width: 400px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
                ${action ? '<button onclick="this.parentElement.parentElement.remove()">OK</button>' : ''}
            </div>
        `;

        document.body.appendChild(notification);

        if (!action) {
            setTimeout(() => notification.remove(), 5000);
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

/**
 * 🚀 SHAPPA ANIMATION MANAGER
 * Gestione animazioni ottimizzate
 */
class ShappaAnimationManager {
    constructor() {
        this.observer = null;
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.initScrollAnimations();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        // Osserva elementi che dovrebbero animarsi
        document.querySelectorAll('.feature-card, .stat-card, .card').forEach(card => {
            this.observer.observe(card);
        });
    }

    initScrollAnimations() {
        // Aggiungi classe loading ai link durante navigazione
        document.querySelectorAll('a[href]').forEach(link => {
            link.addEventListener('click', function(e) {
                if (!this.href.includes('#') && !this.href.includes('javascript:')) {
                    this.classList.add('loading');
                }
            });
        });
    }

    // Metodo pubblico per aggiungere animazioni personalizzate
    animateElement(element, animation = 'fade-in') {
        element.classList.add(`animate-${animation}`);
    }
}

/**
 * 🚀 SHAPPA CORE INITIALIZER
 * Inizializzatore principale del sistema
 */
class ShappaCore {
    constructor() {
        this.modules = {};
        this.init();
    }

    init() {
        // Inizializza moduli nell'ordine corretto
        this.modules.theme = new ShappaThemeManager();
        this.modules.performance = new ShappaPerformanceMonitor();
        this.modules.pwa = new ShappaPWAManager();
        this.modules.animations = new ShappaAnimationManager();

        console.log('🚀 Shappa Core v2.0 initialized');

        // Inizializza sistema di notifiche globale
        this.initGlobalNotifications();

        // Inizializza gestione errori globale
        this.initGlobalErrorHandling();
    }

    initGlobalNotifications() {
        // Ascolta eventi tema
        document.addEventListener('shappa-theme-change', (e) => {
            console.log(`🎨 Theme changed to: ${e.detail.theme}`);
        });
    }

    initGlobalErrorHandling() {
        // Fallback per errori non catturati
        window.addEventListener('unhandledrejection', (e) => {
            console.error('🚨 Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    }

    // Metodi pubblici per accesso ai moduli
    getThemeManager() { return this.modules.theme; }
    getPerformanceMonitor() { return this.modules.performance; }
    getPWAManager() { return this.modules.pwa; }
    getAnimationManager() { return this.modules.animations; }
}

// Inizializza quando DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
    window.Shappa = new ShappaCore();
});

// Esporta per uso globale
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShappaCore, ShappaThemeManager, ShappaPerformanceMonitor, ShappaPWAManager, ShappaAnimationManager };
}
