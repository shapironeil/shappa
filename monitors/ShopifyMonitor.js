/**
 * ShopifyMonitor - Monitor per Travis Scott shop e altri store Shopify
 * 
 * USA PUPPETEER STEALTH per bypassare Cloudflare
 * Endpoint: /products/{handle}.js o /variants/{id}.js
 */

const axios = require('axios');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Usa stealth plugin per bypassare detection
puppeteer.use(StealthPlugin());

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
        
        // Browser instance (riutilizzabile)
        this.browser = null;
        
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
    async stop() {
        if (!this.isRunning) return;
        
        console.log(`[Shopify] 🛑 Monitor fermato: ${this.productName}`);
        this.isRunning = false;
        clearInterval(this.intervalId);
        
        // Chiudi browser se aperto
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Check disponibilità via Puppeteer + Shopify JSON API
     * Bypassa Cloudflare usando browser headless stealth
     */
    async check() {
        this.checksCount++;

        try {
            console.log(`[Shopify] 🔍 Check #${this.checksCount} - ${this.productName}`);

            // Inizializza browser se non esiste (riutilizzabile)
            if (!this.browser) {
                console.log(`[Shopify] 🚀 Avvio browser headless...`);
                this.browser = await puppeteer.launch({
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                });
            }

            // Crea nuova pagina
            const page = await this.browser.newPage();
            
            // Imposta viewport realistico
            await page.setViewport({ width: 1920, height: 1080 });
            
            // Imposta user agent realistico
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Naviga alla API JSON Shopify
            const productUrl = `${this.baseUrl}/products/${this.productHandle}.js`;
            console.log(`[Shopify] 📡 Fetch con Puppeteer: ${productUrl}`);
            
            const response = await page.goto(productUrl, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Controlla se Cloudflare ha bloccato
            const text = await page.content();
            if (text.includes('Cloudflare') && text.includes('blocked')) {
                console.error(`[Shopify] ⚠️ Cloudflare block rilevato, riprovo...`);
                await page.close();
                return;
            }

            // Estrai JSON dalla pagina
            const jsonText = await page.evaluate(() => document.body.innerText);
            const product = JSON.parse(jsonText);

            await page.close();

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
            
            // Se errore grave, resetta browser
            if (this.browser) {
                try {
                    await this.browser.close();
                } catch (e) {}
                this.browser = null;
            }
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
