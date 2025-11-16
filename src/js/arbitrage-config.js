/**
 * 💰 ARBITRAGE HUB CONFIGURATION
 * Configurazione centrale del sistema di arbitraggio
 */

const ArbitrageConfig = {
    // Versione del sistema
    version: '1.0.0',
    name: 'Arbitrage Hub',

    // Impostazioni tema
    theme: {
        default: 'dark',
        colors: {
            primary: '#22c55e',
            secondary: '#10b981',
            accent: '#eab308',
            background: '#0a0f1e',
            card: '#111827'
        }
    },

    // Impostazioni API
    api: {
        baseUrl: '/api/arbitrage',
        timeout: 15000,
        retries: 3,
        endpoints: {
            dashboard: '/dashboard',
            suppliers: '/suppliers',
            listings: '/listings',
            workshop: '/workshop',
            products: '/products',
            sync: '/sync',
            analytics: '/analytics',
            settings: '/settings'
        }
    },

    // Fornitori supportati
    suppliers: {
        amazon: {
            name: 'Amazon',
            icon: '🛒',
            color: '#ff9900',
            enabled: true,
            markets: ['IT', 'DE', 'FR', 'ES', 'UK', 'US']
        },
        alibaba: {
            name: 'Alibaba',
            icon: '🏭',
            color: '#ff6a00',
            enabled: true,
            markets: ['CN', 'GLOBAL']
        },
        aliexpress: {
            name: 'AliExpress',
            icon: '🛍️',
            color: '#e62e04',
            enabled: true,
            markets: ['CN', 'GLOBAL']
        },
        ebay: {
            name: 'eBay',
            icon: '🏪',
            color: '#0064d2',
            enabled: true,
            markets: ['IT', 'DE', 'FR', 'ES', 'UK', 'US']
        },
        walmart: {
            name: 'Walmart',
            icon: '🏬',
            color: '#0071ce',
            enabled: false,
            markets: ['US']
        },
        shopify: {
            name: 'Shopify',
            icon: '🏠',
            color: '#96bf48',
            enabled: true,
            markets: ['GLOBAL']
        }
    },

    // Marketplace di vendita
    marketplaces: {
        amazon: {
            name: 'Amazon FBA',
            icon: '📦',
            enabled: true,
            fees: {
                referralFee: 15, // %
                fbaFee: 3.5, // €
                variableClosingFee: 1 // €
            }
        },
        ebay: {
            name: 'eBay',
            icon: '🏪',
            enabled: true,
            fees: {
                insertionFee: 0.35, // €
                finalValueFee: 12.8, // %
                paypalFee: 3.4 // %
            }
        },
        shopify: {
            name: 'Shopify Store',
            icon: '🏠',
            enabled: false,
            fees: {
                monthlyFee: 29, // €
                transactionFee: 2 // %
            }
        }
    },

    // Impostazioni profitto
    profit: {
        defaultMarkup: 30, // % markup
        minROI: 20, // % Return on Investment minimo
        shippingCostMargin: 5, // % margine spedizione
        taxRate: 22 // % IVA
    },

    // Monitoraggio prodotti
    monitoring: {
        enablePriceTracking: true,
        enableStockTracking: true,
        checkInterval: 3600000, // 1 ora in ms
        priceDropThreshold: 10, // % calo prezzo per alert
        outOfStockAlert: true
    },

    // Impostazioni listing
    listing: {
        autoPublish: false,
        requireApproval: true,
        defaultQuantity: 1,
        defaultCondition: 'NEW',
        autoImageOptimization: true,
        autoTitleOptimization: true,
        autoDescriptionGeneration: true
    },

    // Impostazioni workshop
    workshop: {
        autosaveInterval: 30000, // 30 secondi
        maxDrafts: 100,
        enableVersioning: true,
        enableCollaboration: false
    },

    // Notifiche
    notifications: {
        enablePriceAlerts: true,
        enableStockAlerts: true,
        enableSalesAlerts: true,
        enableProfitReports: true,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false
    },

    // Analytics
    analytics: {
        enableTracking: true,
        trackingInterval: 86400000, // 24 ore
        metricsRetention: 90, // giorni
        enableCompetitorTracking: true
    },

    // Storage
    storage: {
        prefix: 'arbitrage_hub_',
        useLocalStorage: true,
        useSessionStorage: false,
        cacheExpiration: 3600000 // 1 ora
    },

    // Limiti
    limits: {
        maxListingsPerDay: 50,
        maxSuppliersPerUser: 10,
        maxProductsInWorkshop: 100,
        maxImagesPerProduct: 10,
        maxDescriptionLength: 5000
    },

    // Messaggi
    messages: {
        loading: 'Caricamento dati...',
        saving: 'Salvataggio in corso...',
        syncing: 'Sincronizzazione...',
        error: 'Si è verificato un errore',
        success: 'Operazione completata con successo',
        noData: 'Nessun dato disponibile',
        noListings: 'Nessun listing trovato',
        noSuppliers: 'Nessun fornitore configurato'
    },

    // Features flags
    features: {
        enableBulkOperations: true,
        enableAutoListing: false,
        enableAIOptimization: false,
        enableCompetitorAnalysis: true,
        enableProfitCalculator: true,
        enableImageEditor: false,
        enableCSVImport: true,
        enableCSVExport: true,
        enableAPIAccess: false
    },

    // Regole di arbitraggio
    arbitrageRules: {
        minPriceDifference: 5, // € differenza minima
        minProfitMargin: 10, // € profitto minimo
        maxShippingTime: 30, // giorni
        allowInternationalShipping: true,
        requireBrandApproval: false,
        excludeCategories: [
            'Automotive',
            'Beauty',
            'Food',
            'Health'
        ]
    },

    // Categorie prodotti
    categories: [
        { id: 'electronics', name: 'Elettronica', icon: '💻' },
        { id: 'fashion', name: 'Abbigliamento', icon: '👕' },
        { id: 'home', name: 'Casa e Cucina', icon: '🏠' },
        { id: 'sports', name: 'Sport e Tempo Libero', icon: '⚽' },
        { id: 'toys', name: 'Giocattoli', icon: '🧸' },
        { id: 'books', name: 'Libri', icon: '📚' },
        { id: 'beauty', name: 'Bellezza', icon: '💄' },
        { id: 'garden', name: 'Giardino', icon: '🌱' },
        { id: 'tools', name: 'Fai da Te', icon: '🔧' },
        { id: 'baby', name: 'Prima Infanzia', icon: '👶' }
    ],

    // Stati listing
    listingStates: {
        draft: {
            name: 'Bozza',
            color: '#eab308',
            icon: '📝'
        },
        review: {
            name: 'In Revisione',
            color: '#3b82f6',
            icon: '👀'
        },
        approved: {
            name: 'Approvato',
            color: '#22c55e',
            icon: '✅'
        },
        active: {
            name: 'Attivo',
            color: '#10b981',
            icon: '🟢'
        },
        paused: {
            name: 'In Pausa',
            color: '#f59e0b',
            icon: '⏸️'
        },
        outOfStock: {
            name: 'Esaurito',
            color: '#ef4444',
            icon: '❌'
        },
        archived: {
            name: 'Archiviato',
            color: '#6b7280',
            icon: '📦'
        }
    }
};

// Esporta configurazione
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArbitrageConfig;
} else {
    window.ArbitrageConfig = ArbitrageConfig;
}

console.log('💰 Arbitrage Hub Config loaded - Version:', ArbitrageConfig.version);

