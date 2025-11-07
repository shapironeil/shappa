/**
 * ShopifyMonitor - Monitor per Travis Scott shop e altri store Shopify
 * 
 * Usa l'API JSON di Shopify per check veloci e affidabili
 * Endpoint: /products/{handle}.js o /variants/{id}.js
 */

const axios = require('axios');

class ShopifyMonitor {
    constructor(config) {
        this.config = config;
        this.productUrl = config.url;
        this.productName = config.name;
        this.interval = config.interval || 5;
        this.userId = config.userId;
        this.discordWebhook = config.discordWebhook;
        
        this.isRunning = false;
        this.intervalId = null;
        this.lastStatus = null;
        this.checksCount = 0;
        
        // Estrai handle dal URL
        this.productHandle = this.extractHandle(config.url);
        this.baseUrl = this.extractBaseUrl(config.url);
    }

    /**
     * Estrae handle prodotto dall'URL
     * https://shop.travisscott.com/products/cj-fragment → "cj-fragment"
     */
    extractHandle(url) {
        const match = url.match(/\/products\/([^/?]+)/);
        return match ? match[1] : null;
    }

    /**
     * Estrae base URL
     * https://shop.travisscott.com/products/test → https://shop.travisscott.com
     */
    extractBaseUrl(url) {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.host}`;
    }

    /**
     * Avvia monitor
     */
    async start() {
        if (this.isRunning) return;
        
        console.log(`[Shopify] 🚀 Monitor avviato: ${this.productName}`);
        this.isRunning = true;

        // Primo check immediato
        await this.check();

        // Polling ogni N minuti
        this.intervalId = setInterval(() => {
            this.check();
        }, this.interval * 60 * 1000);
    }

    /**
     * Ferma monitor
     */
    stop() {
        if (!this.isRunning) return;
        
        console.log(`[Shopify] 🛑 Monitor fermato: ${this.productName}`);
        this.isRunning = false;
        clearInterval(this.intervalId);
    }

    /**
     * Check disponibilità via Shopify JSON API
     */
    async check() {
        this.checksCount++;
        const now = new Date().toISOString();

        try {
            console.log(`[Shopify] 🔍 Check #${this.checksCount} - ${this.productName}`);

            // Fetch product JSON
            const productUrl = `${this.baseUrl}/products/${this.productHandle}.js`;
            const response = await axios.get(productUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            const product = response.data;

            // Controlla varianti disponibili
            const availableVariants = product.variants.filter(v => v.available);
            const isAvailable = availableVariants.length > 0;

            console.log(`[Shopify] Status: ${isAvailable ? '✅ DISPONIBILE' : '❌ NON DISPONIBILE'} (${availableVariants.length}/${product.variants.length} varianti)`);

            // Detect cambio stato
            if (this.lastStatus !== null && !this.lastStatus && isAvailable) {
                console.log(`[Shopify] ⚡ CAMBIO STATO → DISPONIBILE!`);
                await this.notifyDiscord(product, availableVariants);
            }

            this.lastStatus = isAvailable;

        } catch (error) {
            console.error(`[Shopify] ❌ Errore check:`, error.message);
        }
    }

    /**
     * Invia notifica Discord
     */
    async notifyDiscord(product, variants) {
        if (!this.discordWebhook) {
            console.log(`[Shopify] ⚠️ Webhook Discord non configurato`);
            return;
        }

        try {
            // Prepara info varianti
            const variantsList = variants.map(v => {
                const price = (v.price / 100).toFixed(2);
                return `• **${v.title}** - $${price}${v.inventory_quantity ? ` (${v.inventory_quantity} in stock)` : ''}`;
            }).join('\n');

            const embed = {
                title: `🚨 ${product.title} DISPONIBILE!`,
                url: this.productUrl,
                color: 0x10b981,
                fields: [
                    {
                        name: '💰 Prezzo',
                        value: `$${(product.variants[0].price / 100).toFixed(2)}`,
                        inline: true
                    },
                    {
                        name: '📦 Varianti Disponibili',
                        value: `${variants.length}/${product.variants.length}`,
                        inline: true
                    },
                    {
                        name: '🎨 Dettagli Varianti',
                        value: variantsList || 'N/A',
                        inline: false
                    },
                    {
                        name: '🔗 Link Diretto',
                        value: `[Acquista ora](${this.productUrl})`,
                        inline: false
                    }
                ],
                thumbnail: {
                    url: product.images[0]?.src || product.featured_image
                },
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Shappa Shopify Monitor'
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}> **ALERT SHOPIFY!**`,
                embeds: [embed]
            });

            console.log(`[Shopify] ✅ Notifica Discord inviata`);

        } catch (error) {
            console.error(`[Shopify] ❌ Errore Discord:`, error.message);
        }
    }

    /**
     * Stats monitor
     */
    getStats() {
        return {
            productName: this.productName,
            productHandle: this.productHandle,
            isRunning: this.isRunning,
            checksCount: this.checksCount,
            lastStatus: this.lastStatus,
            interval: this.interval
        };
    }
}

module.exports = ShopifyMonitor;
