/**
 * 💰 ARBITRAGE HUB CORE
 * Sistema centrale per gestione arbitraggio
 */

console.log('💰 Arbitrage Hub Core initializing...');

class ArbitrageCore {
    constructor() {
        this.config = window.ArbitrageConfig || {};
        this.currentUser = null;
        this.listings = [];
        this.suppliers = [];
        this.workshopItems = [];
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Arbitrage Core...');
        
        try {
            // Carica utente corrente
            this.loadCurrentUser();
            
            // Inizializza storage
            this.initStorage();
            
            // Carica dati cached
            this.loadCachedData();
            
            console.log('✅ Arbitrage Core initialized');
        } catch (error) {
            console.error('❌ Core initialization failed:', error);
        }
    }

    loadCurrentUser() {
        const authSystem = window.ShappaAuth ? new ShappaAuth() : null;
        if (authSystem && authSystem.isLoggedIn()) {
            this.currentUser = authSystem.getCurrentUser();
            console.log('✅ User loaded:', this.currentUser?.username);
        }
    }

    initStorage() {
        this.storage = {
            prefix: this.config.storage?.prefix || 'arbitrage_hub_',
            
            set(key, value) {
                const fullKey = this.prefix + key;
                try {
                    localStorage.setItem(fullKey, JSON.stringify(value));
                    return true;
                } catch (error) {
                    console.error('Storage set error:', error);
                    return false;
                }
            },
            
            get(key, defaultValue = null) {
                const fullKey = this.prefix + key;
                try {
                    const item = localStorage.getItem(fullKey);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (error) {
                    console.error('Storage get error:', error);
                    return defaultValue;
                }
            },
            
            remove(key) {
                const fullKey = this.prefix + key;
                localStorage.removeItem(fullKey);
            },
            
            clear() {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(this.prefix)) {
                        localStorage.removeItem(key);
                    }
                });
            }
        };
    }

    loadCachedData() {
        // Carica listings dalla cache
        this.listings = this.storage.get('listings', []);
        
        // Carica suppliers dalla cache
        this.suppliers = this.storage.get('suppliers', []);
        
        // Carica workshop items dalla cache
        this.workshopItems = this.storage.get('workshop', []);
        
        console.log(`📦 Loaded: ${this.listings.length} listings, ${this.suppliers.length} suppliers, ${this.workshopItems.length} workshop items`);
    }

    // ==========================================
    // LISTINGS MANAGEMENT
    // ==========================================

    async getListings(filters = {}) {
        try {
            if (!this.currentUser) return { success: false, error: 'User not logged in' };
            
            const response = await fetch(`${this.config.api.baseUrl}/listings/${this.currentUser.username}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.listings = data.listings || [];
                this.storage.set('listings', this.listings);
                return { success: true, listings: this.listings };
            } else {
                // Fallback to cached data
                return { success: true, listings: this.listings };
            }
        } catch (error) {
            console.error('Error loading listings:', error);
            return { success: true, listings: this.listings };
        }
    }

    async createListing(listingData) {
        try {
            if (!this.currentUser) return { success: false, error: 'User not logged in' };
            
            const response = await fetch(`${this.config.api.baseUrl}/listings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.currentUser.username,
                    listing: listingData
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.listings.push(data.listing);
                this.storage.set('listings', this.listings);
                return { success: true, listing: data.listing };
            } else {
                throw new Error('Failed to create listing');
            }
        } catch (error) {
            console.error('Error creating listing:', error);
            return { success: false, error: error.message };
        }
    }

    async updateListing(listingId, updates) {
        try {
            if (!this.currentUser) return { success: false, error: 'User not logged in' };
            
            const response = await fetch(`${this.config.api.baseUrl}/listings/${listingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.currentUser.username,
                    updates
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const index = this.listings.findIndex(l => l.id === listingId);
                if (index !== -1) {
                    this.listings[index] = { ...this.listings[index], ...updates };
                    this.storage.set('listings', this.listings);
                }
                return { success: true, listing: data.listing };
            } else {
                throw new Error('Failed to update listing');
            }
        } catch (error) {
            console.error('Error updating listing:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteListing(listingId) {
        try {
            if (!this.currentUser) return { success: false, error: 'User not logged in' };
            
            const response = await fetch(`${this.config.api.baseUrl}/listings/${listingId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.currentUser.username })
            });
            
            if (response.ok) {
                this.listings = this.listings.filter(l => l.id !== listingId);
                this.storage.set('listings', this.listings);
                return { success: true };
            } else {
                throw new Error('Failed to delete listing');
            }
        } catch (error) {
            console.error('Error deleting listing:', error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // SUPPLIERS MANAGEMENT
    // ==========================================

    async getSuppliers() {
        try {
            if (!this.currentUser) return { success: false, error: 'User not logged in' };
            
            const response = await fetch(`${this.config.api.baseUrl}/suppliers/${this.currentUser.username}`);
            
            if (response.ok) {
                const data = await response.json();
                this.suppliers = data.suppliers || [];
                this.storage.set('suppliers', this.suppliers);
                return { success: true, suppliers: this.suppliers };
            } else {
                return { success: true, suppliers: this.suppliers };
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
            return { success: true, suppliers: this.suppliers };
        }
    }

    async addSupplier(supplierData) {
        try {
            if (!this.currentUser) return { success: false, error: 'User not logged in' };
            
            const response = await fetch(`${this.config.api.baseUrl}/suppliers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.currentUser.username,
                    supplier: supplierData
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.suppliers.push(data.supplier);
                this.storage.set('suppliers', this.suppliers);
                return { success: true, supplier: data.supplier };
            } else {
                throw new Error('Failed to add supplier');
            }
        } catch (error) {
            console.error('Error adding supplier:', error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // WORKSHOP MANAGEMENT
    // ==========================================

    async getWorkshopItems() {
        try {
            if (!this.currentUser) return { success: false, error: 'User not logged in' };
            
            const response = await fetch(`${this.config.api.baseUrl}/workshop/${this.currentUser.username}`);
            
            if (response.ok) {
                const data = await response.json();
                this.workshopItems = data.items || [];
                this.storage.set('workshop', this.workshopItems);
                return { success: true, items: this.workshopItems };
            } else {
                return { success: true, items: this.workshopItems };
            }
        } catch (error) {
            console.error('Error loading workshop items:', error);
            return { success: true, items: this.workshopItems };
        }
    }

    async addToWorkshop(itemData) {
        try {
            if (!this.currentUser) return { success: false, error: 'User not logged in' };
            
            const response = await fetch(`${this.config.api.baseUrl}/workshop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.currentUser.username,
                    item: itemData
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.workshopItems.push(data.item);
                this.storage.set('workshop', this.workshopItems);
                return { success: true, item: data.item };
            } else {
                // Fallback locale
                const item = {
                    id: `workshop_${Date.now()}`,
                    ...itemData,
                    createdAt: new Date().toISOString(),
                    status: 'draft'
                };
                this.workshopItems.push(item);
                this.storage.set('workshop', this.workshopItems);
                return { success: true, item };
            }
        } catch (error) {
            console.error('Error adding to workshop:', error);
            // Fallback locale
            const item = {
                id: `workshop_${Date.now()}`,
                ...itemData,
                createdAt: new Date().toISOString(),
                status: 'draft'
            };
            this.workshopItems.push(item);
            this.storage.set('workshop', this.workshopItems);
            return { success: true, item };
        }
    }

    async updateWorkshopItem(itemId, updates) {
        try {
            const index = this.workshopItems.findIndex(i => i.id === itemId);
            if (index !== -1) {
                this.workshopItems[index] = { ...this.workshopItems[index], ...updates };
                this.storage.set('workshop', this.workshopItems);
                
                // Sync to server
                if (this.currentUser) {
                    await fetch(`${this.config.api.baseUrl}/workshop/${itemId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: this.currentUser.username,
                            updates
                        })
                    });
                }
                
                return { success: true, item: this.workshopItems[index] };
            }
            return { success: false, error: 'Item not found' };
        } catch (error) {
            console.error('Error updating workshop item:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteWorkshopItem(itemId) {
        try {
            this.workshopItems = this.workshopItems.filter(i => i.id !== itemId);
            this.storage.set('workshop', this.workshopItems);
            
            // Sync to server
            if (this.currentUser) {
                await fetch(`${this.config.api.baseUrl}/workshop/${itemId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: this.currentUser.username })
                });
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting workshop item:', error);
            return { success: false, error: error.message };
        }
    }

    // ==========================================
    // PROFIT CALCULATOR
    // ==========================================

    calculateProfit(productCost, sellingPrice, marketplace = 'amazon') {
        const marketplaceConfig = this.config.marketplaces?.[marketplace];
        if (!marketplaceConfig) {
            return { error: 'Marketplace not configured' };
        }

        const fees = marketplaceConfig.fees;
        let totalFees = 0;

        // Calcola fee specifiche del marketplace
        if (marketplace === 'amazon') {
            totalFees += (sellingPrice * fees.referralFee / 100); // Referral fee %
            totalFees += fees.fbaFee; // FBA fee fisso
            totalFees += fees.variableClosingFee; // Variable closing fee
        } else if (marketplace === 'ebay') {
            totalFees += fees.insertionFee; // Insertion fee
            totalFees += (sellingPrice * fees.finalValueFee / 100); // Final value fee %
            totalFees += (sellingPrice * fees.paypalFee / 100); // PayPal fee %
        }

        // Calcola profitto
        const grossProfit = sellingPrice - productCost;
        const netProfit = grossProfit - totalFees;
        const profitMargin = (netProfit / sellingPrice) * 100;
        const roi = (netProfit / productCost) * 100;

        return {
            success: true,
            productCost,
            sellingPrice,
            fees: totalFees,
            grossProfit,
            netProfit,
            profitMargin: profitMargin.toFixed(2),
            roi: roi.toFixed(2),
            isViable: netProfit > this.config.profit?.minProfitMargin
        };
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    formatCurrency(amount, currency = '€') {
        return `${currency}${parseFloat(amount).toFixed(2)}`;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('it-IT');
    }

    formatDateTime(date) {
        return new Date(date).toLocaleString('it-IT');
    }

    generateSKU(productData) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        const category = productData.category ? productData.category.substr(0, 3).toUpperCase() : 'GEN';
        return `${category}-${timestamp}-${random}`.toUpperCase();
    }
}

// Inizializza globalmente
window.ArbitrageCore = new ArbitrageCore();

console.log('✅ Arbitrage Hub Core ready!');

