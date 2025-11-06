// Shappa App - File JavaScript principale con cache busting
console.log('🚀 Shappa App inizializzata!');

// Cache busting per evitare problemi browser
(function() {
    // Aggiungi timestamp a tutte le richieste AJAX
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async) {
        if (url.indexOf('?') > -1) {
            url += '&_t=' + Date.now();
        } else {
            url += '?_t=' + Date.now();
        }
        return originalOpen.apply(this, arguments);
    };
    
    // Forza refresh del browser cache
    if (performance.navigation.type === 1) {
        console.log('🔄 Page reloaded - applying cache refresh');
    }
})();

// Configurazione base dell'applicazione
const ShappaApp = {
    version: '0.1.1',
    name: 'Shappa',
    initialized: false,
    
    // Inizializzazione dell'app
    init() {
        console.log(`Inizializzazione ${this.name} v${this.version}`);
        this.setupCacheBusting();
        this.setupEventListeners();
        this.loadComponents();
        this.initialized = true;
        console.log('✅ App inizializzata con successo!');
    },
    
    // Setup cache busting
    setupCacheBusting() {
        // Aggiungi meta tag per disabilitare cache
        const metas = [
            { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
            { httpEquiv: 'Pragma', content: 'no-cache' },
            { httpEquiv: 'Expires', content: '0' }
        ];
        
        metas.forEach(meta => {
            const metaTag = document.createElement('meta');
            metaTag.httpEquiv = meta.httpEquiv;
            metaTag.content = meta.content;
            document.getElementsByTagName('head')[0].appendChild(metaTag);
        });
        
        console.log('🚫 Cache busting attivato');
    },
    
    // Setup eventi globali
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.onDOMReady();
        });
        
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    },
    
    // Callback quando il DOM è pronto
    onDOMReady() {
        console.log('📄 DOM pronto');
        this.displayWelcomeMessage();
    },
    
    // Callback per resize della finestra
    onWindowResize() {
        console.log('📱 Finestra ridimensionata:', window.innerWidth, 'x', window.innerHeight);
    },
    
    // Carica componenti dinamici
    loadComponents() {
        console.log('🧩 Caricamento componenti...');
        // Qui verranno caricati i componenti dell'app
    },
    
    // Mostra messaggio di benvenuto
    displayWelcomeMessage() {
        const timestamp = new Date().toLocaleString('it-IT');
        console.log(`👋 Benvenuto in Shappa! - ${timestamp}`);
        
        // Aggiungi informazioni di debug se in sviluppo
        if (this.isDevelopment()) {
            this.showDevInfo();
        }
    },
    
    // Controlla se siamo in modalità sviluppo
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    },
    
    // Mostra informazioni di sviluppo
    showDevInfo() {
        console.log('🔧 Modalità sviluppo attiva');
        console.log('🌐 User Agent:', navigator.userAgent);
        console.log('📐 Viewport:', window.innerWidth, 'x', window.innerHeight);
        console.log('🔗 URL corrente:', window.location.href);
    },
    
    // Utility per logging
    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        console.log(`${prefix[type]} [${timestamp}] ${message}`);
    }
};

// Auto-inizializzazione quando lo script è caricato
if (document.readyState === 'loading') {
    ShappaApp.init();
} else {
    // Se il DOM è già caricato
    ShappaApp.init();
}

// Esporta l'oggetto principale per uso globale
window.ShappaApp = ShappaApp;
