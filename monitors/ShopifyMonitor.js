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
        
        // Traccia prodotti visti (per rilevare NUOVI prodotti)
        this.seenProductIds = new Set();
        
        // Filtro prodotto opzionale (es: "AIR JORDAN 1")
        this.productFilter = config.productFilter || config.name || '';
        
        // Estrai handle dal URL
        this.productHandle = this.extractHandle(config.url);
        this.baseUrl = this.extractBaseUrl(config.url);
    }

    /**
     * Estrae handle prodotto dall'URL
     * https://shop.travisscott.com/products/cj-fragment → "cj-fragment"
     * Se URL è homepage, ritorna null (monitorerà TUTTI i prodotti)
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
     * 
     * MODALITÀ:
     * 1. Se productHandle specificato → monitora QUEL prodotto
     * 2. Se NO productHandle → monitora TUTTI i prodotti (rileva NUOVI)
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

            // MODALITÀ 1: Monitor prodotto specifico
            if (this.productHandle) {
                await this.checkSingleProduct(page);
            } 
            // MODALITÀ 2: Monitor TUTTI i prodotti (rileva NUOVI)
            else {
                await this.checkAllProducts(page);
            }

            await page.close();

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
     * Monitora un singolo prodotto specifico
     */
    async checkSingleProduct(page) {
        const productUrl = `${this.baseUrl}/products/${this.productHandle}.js`;
        console.log(`[Shopify] 📡 Check prodotto singolo: ${productUrl}`);
        
        await page.goto(productUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Controlla se Cloudflare ha bloccato
        const text = await page.content();
        if (text.includes('Cloudflare') && text.includes('blocked')) {
            console.error(`[Shopify] ⚠️ Cloudflare block rilevato`);
            return;
        }

        // Estrai JSON dalla pagina
        const jsonText = await page.evaluate(() => document.body.innerText);
        const product = JSON.parse(jsonText);

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
    }

    /**
     * Monitora TUTTI i prodotti del sito (rileva NUOVI prodotti)
     */
    async checkAllProducts(page) {
        const productsUrl = `${this.baseUrl}/products.json?limit=250`;
        console.log(`[Shopify] 📡 Check TUTTI i prodotti: ${productsUrl}`);
        
        // EXTRA STEALTH: Simula comportamento umano
        // 1. Prima visita homepage
        console.log(`[Shopify] 🏠 Visita homepage prima...`);
        await page.goto(this.baseUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // 2. Wait random (simula lettura pagina)
        const randomWait = Math.floor(Math.random() * 3000) + 2000; // 2-5 secondi
        await new Promise(resolve => setTimeout(resolve, randomWait));
        
        // 3. Scroll pagina (simula utente reale)
        await page.evaluate(() => {
            window.scrollBy(0, Math.random() * 500 + 300);
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 4. Ora vai all'API JSON
        console.log(`[Shopify] 📡 Ora carico products.json...`);
        await page.goto(productsUrl, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Controlla se Cloudflare ha bloccato
        const text = await page.content();
        if (text.includes('Cloudflare') && text.includes('blocked')) {
            console.error(`[Shopify] ⚠️ Cloudflare block rilevato`);
            return;
        }
        
        if (text.includes('You do not have access')) {
            console.error(`[Shopify] ⚠️ Accesso negato da Cloudflare, riprovo prossimo check...`);
            return;
        }

        // Estrai JSON dalla pagina
        const jsonText = await page.evaluate(() => document.body.innerText);
        const data = JSON.parse(jsonText);

        console.log(`[Shopify] 📦 Trovati ${data.products.length} prodotti totali`);

        // Filtra per keywords se specificate
        let products = data.products;
        if (this.productFilter && this.productFilter.trim()) {
            const keywords = this.productFilter.toLowerCase().split(' ').filter(k => k.length > 2);
            products = products.filter(p => {
                const title = p.title.toLowerCase();
                return keywords.some(kw => title.includes(kw));
            });
            console.log(`[Shopify] 🔍 ${products.length} prodotti matchano filtro "${this.productFilter}"`);
        }

        // Rileva NUOVI prodotti
        const newProducts = [];
        for (const product of products) {
            if (!this.seenProductIds.has(product.id)) {
                // NUOVO PRODOTTO!
                newProducts.push(product);
                this.seenProductIds.add(product.id);
            }
        }

        if (newProducts.length > 0) {
            console.log(`[Shopify] 🆕 RILEVATI ${newProducts.length} NUOVI PRODOTTI!`);
            
            // Notifica per ogni nuovo prodotto
            for (const product of newProducts) {
                const availableVariants = product.variants.filter(v => v.available);
                await this.notifyNewProduct(product, availableVariants);
                
                // Delay tra notifiche per evitare spam
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } else if (this.checksCount > 1) {
            // Solo dopo il primo check (primo check inizializza seenProductIds)
            console.log(`[Shopify] ✅ Nessun nuovo prodotto rilevato`);
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
     * Notifica NUOVO PRODOTTO rilevato
     */
    async notifyNewProduct(product, variants) {
        if (!this.discordWebhook) {
            console.log(`[Shopify] ⚠️ Webhook Discord non configurato`);
            return;
        }

        try {
            const productUrl = `${this.baseUrl}/products/${product.handle}`;
            const price = product.variants[0] ? `$${(product.variants[0].price / 100).toFixed(2)}` : 'N/A';
            const availableCount = variants.length;
            const totalCount = product.variants.length;

            // Prepara info varianti disponibili
            let variantsList = 'Nessuna variante disponibile';
            if (availableCount > 0) {
                variantsList = variants.slice(0, 5).map(v => {
                    const vPrice = (v.price / 100).toFixed(2);
                    return `• **${v.title}** - $${vPrice}`;
                }).join('\n');
                
                if (availableCount > 5) {
                    variantsList += `\n*...e altre ${availableCount - 5} varianti*`;
                }
            }

            const embed = {
                title: `🆕 NUOVO PRODOTTO! ${product.title}`,
                url: productUrl,
                color: 0xf59e0b, // Arancione per nuovo prodotto
                description: `**${product.vendor || 'Travis Scott'}** ha appena aggiunto un nuovo prodotto!`,
                fields: [
                    {
                        name: '💰 Prezzo',
                        value: price,
                        inline: true
                    },
                    {
                        name: '📦 Disponibilità',
                        value: `${availableCount}/${totalCount} varianti`,
                        inline: true
                    },
                    {
                        name: '🎨 Varianti Disponibili',
                        value: variantsList,
                        inline: false
                    },
                    {
                        name: '🔗 Link Diretto',
                        value: `[ACQUISTA ORA](${productUrl})`,
                        inline: false
                    }
                ],
                thumbnail: {
                    url: product.images && product.images[0] ? product.images[0].src : null
                },
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Shappa Monitor • Travis Scott Shop`
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}> 🔥 **NUOVO PRODOTTO RILEVATO!** 🔥`,
                embeds: [embed]
            });

            console.log(`[Shopify] ✅ Notifica NUOVO PRODOTTO inviata: ${product.title}`);

        } catch (error) {
            console.error(`[Shopify] ❌ Errore notifica nuovo prodotto:`, error.message);
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
