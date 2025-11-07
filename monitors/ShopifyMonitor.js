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
        
        // Filtri intelligenti
        this.productFilter = config.productFilter || ''; // es: "AIR JORDAN 1 LOW OG SP FRAGMENT"
        this.variantFilter = config.variantFilter || ''; // es: "Size L, Black"
        
        this.isRunning = false;
        this.intervalId = null;
        this.lastStatus = null;
        this.checksCount = 0;
        
        // Notification tracking
        this.hasNotifiedStart = false;
        this.lastHeartbeat = null;
        this.hasFoundVariants = false; // One-time notification per varianti trovate
        this.heartbeatInterval = 2 * 60 * 60 * 1000; // 2 ore in ms
        
        // Estrai handle dal URL
        this.productHandle = this.extractHandle(config.url);
        this.baseUrl = this.extractBaseUrl(config.url);
        
        // Prepara keywords di ricerca da productFilter
        this.searchKeywords = this.extractKeywords(this.productFilter);
        this.variantKeywords = this.extractKeywords(this.variantFilter);
    }
    
    /**
     * Estrae keywords intelligenti da stringa filtro
     * "AIR JORDAN 1 LOW OG SP "FRAGMENT"" → ["air", "jordan", "low", "fragment"]
     */
    extractKeywords(filterString) {
        if (!filterString) return [];
        
        return filterString
            .toLowerCase()
            .replace(/['"]/g, '') // Rimuove virgolette
            .replace(/[^\w\s]/g, ' ') // Rimuove punteggiatura
            .split(/\s+/) // Split su spazi
            .filter(word => word.length > 1) // Minimo 2 caratteri
            .filter(word => !['the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'og', 'sp'].includes(word)); // Rimuove stopwords
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

        // 🔔 NOTIFICA 1: Monitor Started
        if (!this.hasNotifiedStart) {
            await this.notifyMonitorStart();
            this.hasNotifiedStart = true;
        }

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

            // 🎯 FILTRO PRODOTTO - Match intelligente
            if (this.searchKeywords.length > 0) {
                const productTitle = product.title.toLowerCase();
                const matchCount = this.searchKeywords.filter(keyword => 
                    productTitle.includes(keyword)
                ).length;
                
                const matchPercentage = (matchCount / this.searchKeywords.length) * 100;
                
                if (matchPercentage < 50) {
                    console.log(`[Shopify] ⏭️ Prodotto non matcha filtro: "${product.title}" (${matchPercentage.toFixed(0)}% match)`);
                    return;
                }
                
                console.log(`[Shopify] ✅ Prodotto matcha filtro: "${product.title}" (${matchPercentage.toFixed(0)}% match)`);
            }

            // Controlla varianti disponibili
            let availableVariants = product.variants.filter(v => v.available);
            
            // 🎨 FILTRO VARIANTI - Match intelligente
            if (this.variantKeywords.length > 0 && availableVariants.length > 0) {
                availableVariants = availableVariants.filter(variant => {
                    const variantTitle = variant.title.toLowerCase();
                    return this.variantKeywords.some(keyword => variantTitle.includes(keyword));
                });
                
                if (availableVariants.length === 0) {
                    console.log(`[Shopify] ⏭️ Nessuna variante matcha filtro: "${this.variantFilter}"`);
                }
            }
            
            const isAvailable = availableVariants.length > 0;

            console.log(`[Shopify] Status: ${isAvailable ? '✅ DISPONIBILE' : '❌ NON DISPONIBILE'} (${availableVariants.length}/${product.variants.length} varianti)`);

            // 🔔 NOTIFICA 4: Variants Detected (one-time quando trova varianti)
            if (availableVariants.length > 0 && !this.hasFoundVariants) {
                await this.notifyVariantsDetected(product, availableVariants);
                this.hasFoundVariants = true;
            }

            // 🔔 NOTIFICA 2: Heartbeat ogni 2 ore
            const now = Date.now();
            if (!this.lastHeartbeat || (now - this.lastHeartbeat) >= this.heartbeatInterval) {
                await this.notifyHeartbeat(isAvailable, availableVariants.length, product.variants.length);
                this.lastHeartbeat = now;
            }

            // Detect cambio stato
            if (this.lastStatus !== null && !this.lastStatus && isAvailable) {
                console.log(`[Shopify] ⚡ CAMBIO STATO → DISPONIBILE!`);
                // 🔔 NOTIFICA 3: Product Found
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

    /**
     * 🔔 NOTIFICA 1: Monitor Started
     */
    async notifyMonitorStart() {
        if (!this.discordWebhook) return;

        try {
            const fields = [
                {
                    name: '� URL Prodotto',
                    value: this.productUrl,
                    inline: false
                },
                {
                    name: '🛍️ Product Handle',
                    value: `\`${this.productHandle}\``,
                    inline: true
                },
                {
                    name: '⏱️ Intervallo Check',
                    value: `${this.interval} minuto/i`,
                    inline: true
                }
            ];
            
            // Aggiungi filtri se presenti
            if (this.productFilter) {
                fields.push({
                    name: '� Filtro Prodotto',
                    value: `\`${this.productFilter}\`\n(Match keywords: ${this.searchKeywords.join(', ')})`,
                    inline: false
                });
            }
            
            if (this.variantFilter) {
                fields.push({
                    name: '🎨 Filtro Varianti',
                    value: `\`${this.variantFilter}\`\n(Match keywords: ${this.variantKeywords.join(', ')})`,
                    inline: false
                });
            }
            
            fields.push(
                {
                    name: '⚡ API Endpoint',
                    value: `${this.baseUrl}/products/${this.productHandle}.js`,
                    inline: false
                },
                {
                    name: '🎯 Modulo',
                    value: 'Shopify Monitor (API JSON)',
                    inline: true
                }
            );

            const embed = {
                title: `🚀 Shopify Monitor Avviato`,
                url: this.productUrl,
                color: 0x3b82f6, // Blu
                description: `Il monitoraggio per **${this.productName}** è iniziato!`,
                fields: fields,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Shopify Monitor - Precisione 100%'
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}>`,
                embeds: [embed]
            });

            console.log(`[Shopify] ✅ Notifica START inviata`);
        } catch (error) {
            console.error(`[Shopify] ❌ Errore notifica START:`, error.message);
        }
    }

    /**
     * 🔔 NOTIFICA 2: Heartbeat ogni 2 ore
     */
    async notifyHeartbeat(isAvailable, availableCount, totalCount) {
        if (!this.discordWebhook) return;

        try {
            const statusEmoji = isAvailable ? '✅' : '⏳';
            const statusText = isAvailable ? 
                `DISPONIBILE (${availableCount}/${totalCount} varianti)` : 
                `Non ancora disponibile (0/${totalCount} varianti)`;
            const colorCode = isAvailable ? 0x10b981 : 0x6b7280; // Verde o Grigio

            const embed = {
                title: `💓 Heartbeat - Shopify Monitor Attivo`,
                url: this.productUrl,
                color: colorCode,
                description: `Status update per **${this.productName}**`,
                fields: [
                    {
                        name: `${statusEmoji} Status Corrente`,
                        value: statusText,
                        inline: false
                    },
                    {
                        name: '🔢 Check Effettuati',
                        value: `${this.checksCount}`,
                        inline: true
                    },
                    {
                        name: '⏱️ Intervallo',
                        value: `Ogni ${this.interval} min`,
                        inline: true
                    },
                    {
                        name: '🛍️ API Status',
                        value: 'Shopify JSON - Online ✅',
                        inline: true
                    },
                    {
                        name: '🔗 Link',
                        value: `[Vai al prodotto](${this.productUrl})`,
                        inline: false
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Monitor attivo - prossimo heartbeat tra 2 ore'
                }
            };

            await axios.post(this.discordWebhook, {
                embeds: [embed]
            });

            console.log(`[Shopify] ✅ Notifica HEARTBEAT inviata`);
        } catch (error) {
            console.error(`[Shopify] ❌ Errore notifica HEARTBEAT:`, error.message);
        }
    }

    /**
     * 🔔 NOTIFICA 4: Variants Detected (one-time)
     */
    async notifyVariantsDetected(product, availableVariants) {
        if (!this.discordWebhook) return;

        try {
            const variantsList = availableVariants.map(v => {
                const price = (v.price / 100).toFixed(2);
                return `• **${v.title}** - $${price}`;
            }).join('\n');

            const embed = {
                title: `🔍 Varianti Shopify Rilevate`,
                url: this.productUrl,
                color: 0xf59e0b, // Arancione
                description: `Ho trovato le varianti disponibili per **${product.title}**`,
                fields: [
                    {
                        name: '📦 Varianti Disponibili',
                        value: `${availableVariants.length}/${product.variants.length}`,
                        inline: true
                    },
                    {
                        name: '💰 Prezzo Base',
                        value: `$${(product.variants[0].price / 100).toFixed(2)}`,
                        inline: true
                    },
                    {
                        name: '🎨 Dettagli Varianti',
                        value: variantsList,
                        inline: false
                    },
                    {
                        name: '📌 Info',
                        value: 'Ti avviserò immediatamente se il numero di varianti cambia o se diventa disponibile!',
                        inline: false
                    },
                    {
                        name: '🔗 Link',
                        value: `[Vai al prodotto](${this.productUrl})`,
                        inline: false
                    }
                ],
                thumbnail: {
                    url: product.images[0]?.src || product.featured_image
                },
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Notifica one-time - continuerò a monitorare'
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}>`,
                embeds: [embed]
            });

            console.log(`[Shopify] ✅ Notifica VARIANTS DETECTED inviata`);
        } catch (error) {
            console.error(`[Shopify] ❌ Errore notifica VARIANTS:`, error.message);
        }
    }
}

module.exports = ShopifyMonitor;
