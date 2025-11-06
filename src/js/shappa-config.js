/**
 * 🚀 SHAPPA CONFIGURATION v2.0
 * Configurazione centrale del sistema
 */

const ShappaConfig = {
    // Versione del sistema
    version: '2.0.0',

    // Impostazioni tema
    theme: {
        default: 'light',
        autoDetect: false,
        storageKey: 'shappa-theme',
        autoThemeKey: 'shappa-auto-theme'
    },

    // Impostazioni performance
    performance: {
        enableMonitoring: true,
        maxInteractions: 100,
        analyticsEndpoint: null, // null = console only
        sessionTimeout: 30 * 60 * 1000 // 30 minuti
    },

    // Impostazioni PWA
    pwa: {
        enableServiceWorker: true,
        enableInstallPrompt: true,
        cacheVersion: 'shappa-v2.0.0',
        maxCacheSize: 50 * 1024 * 1024 // 50MB
    },

    // Impostazioni API
    api: {
        baseUrl: '/api',
        timeout: 10000,
        retries: 3,
        retryDelay: 1000
    },

    // Impostazioni sicurezza
    security: {
        enableCSP: true,
        enableHSTS: true,
        sessionTimeout: 60 * 60 * 1000, // 1 ora
        passwordMinLength: 8,
        enable2FA: false
    },

    // Impostazioni UI/UX
    ui: {
        animations: {
            enable: true,
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        },
        notifications: {
            enable: true,
            position: 'top-right',
            duration: 5000,
            maxVisible: 3
        },
        loading: {
            showSpinner: true,
            timeout: 30000
        }
    },

    // Impostazioni funzionalità
    features: {
        enableDarkMode: true,
        enablePWA: true,
        enableAnalytics: true,
        enableOfflineMode: true,
        enablePushNotifications: false,
        enableBackgroundSync: true
    },

    // Impostazioni sviluppo
    development: {
        enableDebug: false,
        enableConsoleLogs: true,
        mockAPI: false,
        showPerformanceMetrics: false
    },

    // Costanti dell'applicazione
    constants: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        debounceDelay: 300,
        throttleDelay: 100
    },

    // Messaggi di sistema
    messages: {
        loading: 'Caricamento...',
        error: 'Si è verificato un errore',
        success: 'Operazione completata',
        offline: 'Modalità offline attiva',
        online: 'Connessione ripristinata',
        updateAvailable: 'Aggiornamento disponibile',
        installPrompt: 'Installa l\'app per un\'esperienza migliore'
    },

    // Validazione form
    validation: {
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Inserisci un indirizzo email valido'
        },
        password: {
            minLength: 8,
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: 'La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero'
        },
        username: {
            minLength: 3,
            maxLength: 20,
            pattern: /^[a-zA-Z0-9_-]+$/,
            message: 'Il nome utente deve essere di 3-20 caratteri e contenere solo lettere, numeri, trattini e underscore'
        }
    },

    // Endpoint API
    endpoints: {
        auth: {
            login: '/auth/login',
            register: '/auth/register',
            logout: '/auth/logout',
            refresh: '/auth/refresh',
            profile: '/auth/profile'
        },
        products: {
            search: '/products/search',
            create: '/products/create',
            update: '/products/update',
            delete: '/products/delete',
            sync: '/products/sync'
        },
        analytics: {
            dashboard: '/analytics/dashboard',
            reports: '/analytics/reports',
            export: '/analytics/export'
        },
        admin: {
            users: '/admin/users',
            settings: '/admin/settings',
            logs: '/admin/logs',
            backup: '/admin/backup'
        }
    },

    // Impostazioni cache
    cache: {
        defaultTTL: 5 * 60 * 1000, // 5 minuti
        maxSize: 100, // numero massimo di elementi
        strategies: {
            auth: 'network-first',
            products: 'cache-first',
            static: 'cache-first',
            api: 'network-first'
        }
    },

    // Impostazioni notifiche
    notifications: {
        types: {
            success: { icon: '✅', color: '#10b981', duration: 3000 },
            error: { icon: '❌', color: '#ef4444', duration: 5000 },
            warning: { icon: '⚠️', color: '#f59e0b', duration: 4000 },
            info: { icon: 'ℹ️', color: '#3b82f6', duration: 3000 }
        },
        positions: {
            'top-right': { top: '1rem', right: '1rem' },
            'top-left': { top: '1rem', left: '1rem' },
            'bottom-right': { bottom: '1rem', right: '1rem' },
            'bottom-left': { bottom: '1rem', left: '1rem' },
            'top-center': { top: '1rem', left: '50%', transform: 'translateX(-50%)' }
        }
    },

    // Impostazioni responsive
    breakpoints: {
        mobile: 480,
        tablet: 768,
        desktop: 1024,
        wide: 1200
    },

    // Impostazioni accessibilità
    accessibility: {
        enableSkipLinks: true,
        enableFocusManagement: true,
        enableKeyboardNavigation: true,
        enableScreenReader: true,
        highContrastMode: window.matchMedia('(prefers-contrast: high)').matches,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
};

// Esporta configurazione
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShappaConfig;
} else {
    window.ShappaConfig = ShappaConfig;
}
