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
        
        // Tracking notifiche heartbeat (ogni 1.5 ore)
        this.lastHeartbeatTime = null;
        this.heartbeatInterval = 90 * 60 * 1000; // 1.5 ore in ms (90 minuti)
        
        // Flag per notifica iniziale
        this.initialNotificationSent = false;
        
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

        // Primo check immediato (invierà notifica iniziale)
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
        
        // Notifica Discord di STOP
        await this.notifyMonitorStopped();
        
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
            
            // Invia notifica HEARTBEAT (ogni 2 ore)
            await this.checkAndSendHeartbeat();

        } catch (error) {
            console.error(`[Shopify] ❌ Errore check:`, error.message);
            
            // Notifica errore bloccante
            await this.notifyMonitorError(error.message);
            
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
     * STRATEGIA NUOVA: Naviga pagina HTML reale, NON API JSON (Cloudflare blocca API)
     */
    async checkAllProducts(page) {
        // Naviga alla pagina COLLECTIONS (HTML normale, non JSON)
        const collectionsUrl = `${this.baseUrl}/collections/all`;
        console.log(`[Shopify] �️ Navigo pagina prodotti HTML: ${collectionsUrl}`);
        
        await page.goto(collectionsUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait per rendering completo
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Controlla se Cloudflare ha bloccato
        const text = await page.content();
        if (text.includes('Cloudflare') || text.includes('You do not have access') || text.includes('blocked')) {
            console.error(`[Shopify] ⚠️ Cloudflare block rilevato, riprovo prossimo check...`);
            return;
        }

        // ESTRAI PRODOTTI dalla pagina HTML (come utente reale)
        const products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('a[href*="/products/"]');
            const productsMap = new Map();
            
            productElements.forEach(el => {
                const href = el.getAttribute('href');
                if (!href) return;
                
                // Estrai handle prodotto dall'URL
                const match = href.match(/\/products\/([^/?#]+)/);
                if (!match) return;
                
                const handle = match[1];
                if (productsMap.has(handle)) return; // Skip duplicati
                
                // Cerca titolo (prima prova img alt, poi testo link)
                let title = '';
                const img = el.querySelector('img');
                if (img && img.alt) {
                    title = img.alt;
                } else {
                    title = el.textContent.trim();
                }
                
                // 🆕 ESTRAI IMMAGINE
                let imageUrl = null;
                if (img) {
                    // Prova src, data-src, srcset
                    imageUrl = img.src || img.getAttribute('data-src') || null;
                    if (!imageUrl && img.srcset) {
                        const srcsetMatch = img.srcset.match(/https?:\/\/[^\s]+/);
                        if (srcsetMatch) imageUrl = srcsetMatch[0];
                    }
                }
                
                // 🆕 RILEVA STATUS INTELLIGENTE - Cerca in TUTTO il DOM del prodotto
                let status = null; // Inizialmente null, deve trovarlo
                
                // 1. Cerca nel parent container del prodotto
                const productContainer = el.closest('.product-item, .product-card, .grid-item, .product, .grid__item, article, .product-wrap');
                
                // 2. Raccoglie TUTTO il testo del container
                const allText = productContainer ? productContainer.textContent.toLowerCase() : el.textContent.toLowerCase();
                
                // 3. Cerca nei badge/button specifici (più affidabile)
                const badges = productContainer?.querySelectorAll('.badge, .product-badge, .tag, .label, button, .button, .btn, .product-status, .availability') || [];
                let badgeText = '';
                badges.forEach(badge => {
                    badgeText += ' ' + badge.textContent.toLowerCase();
                });
                
                // 4. Combina tutto il testo disponibile
                const fullText = allText + ' ' + badgeText;
                
                // 5. Determina status con PRIORITÀ (più specifico prima)
                // SOLD OUT = massima priorità
                if (fullText.match(/sold\s*out|soldout|out\s*of\s*stock|unavailable|not\s*available/i)) {
                    status = 'SOLD OUT';
                }
                // SOON = seconda priorità  
                else if (fullText.match(/soon|coming\s*soon|pre\s*order|preorder|notify\s*me|not\s*yet|upcoming/i)) {
                    status = 'SOON';
                }
                // ONLINE = terza priorità (deve avere indicatori chiari)
                else if (fullText.match(/add\s*to\s*(cart|bag)|buy\s*now|shop\s*now|in\s*stock|available\s*now|purchase|order\s*now/i)) {
                    status = 'ONLINE';
                }
                // Se non trova NULLA di chiaro, cerca nel form (presence = disponibile)
                else {
                    const hasForm = productContainer?.querySelector('form[action*="cart"]');
                    const hasAddButton = productContainer?.querySelector('button[name="add"], input[name="add"], [data-action*="add"]');
                    
                    if (hasForm || hasAddButton) {
                        status = 'ONLINE'; // Ha form carrello = disponibile
                    } else {
                        // Ultimo fallback: se proprio non trova nulla, analizza URL
                        console.log(`[Shopify] ⚠️ Status ambiguo per "${title}", defaulting a SOON`);
                        status = 'SOON';
                    }
                }
                
                // Crea oggetto prodotto simile a Shopify API
                productsMap.set(handle, {
                    id: handle, // Usa handle come ID
                    handle: handle,
                    title: title || handle,
                    url: href,
                    image: imageUrl,
                    status: status
                });
            });
            
            return Array.from(productsMap.values());
        });

        console.log(`[Shopify] 📦 Trovati ${products.length} prodotti sulla pagina HTML`);

        // Filtra per keywords se specificate
        let filteredProducts = products;
        if (this.productFilter && this.productFilter.trim()) {
            const keywords = this.productFilter.toLowerCase().split(' ').filter(k => k.length > 2);
            filteredProducts = products.filter(p => {
                const title = p.title.toLowerCase();
                return keywords.some(kw => title.includes(kw));
            });
            console.log(`[Shopify] 🔍 ${filteredProducts.length} prodotti matchano filtro "${this.productFilter}"`);
        }

        // NOTIFICA INIZIALE (primo check)
        if (!this.initialNotificationSent) {
            console.log(`[Shopify] 📢 Invio notifica iniziale Discord...`);
            await this.notifyMonitorStarted(products, filteredProducts);
            this.initialNotificationSent = true;
            
            // Inizializza seenProductIds con prodotti esistenti
            for (const product of filteredProducts) {
                this.seenProductIds.add(product.id);
            }
            
            console.log(`[Shopify] ✅ Notifica iniziale completata. ${this.seenProductIds.size} prodotti tracciati`);
            return; // Esci, prossimo check rileverà nuovi prodotti
        }

        // Rileva NUOVI prodotti (dai check successivi)
        const newProducts = [];
        for (const product of filteredProducts) {
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
                await this.notifyNewProduct(product);
                
                // Delay tra notifiche per evitare spam
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // 🔴 IMPORTANTE: STOPPA IL MONITOR dopo aver trovato prodotti!
            console.log(`[Shopify] 🛑 Prodotti trovati! Stoppo monitor automaticamente...`);
            await this.stop();
            
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
     * 🔴 IMPORTANTE: Questa è la notifica più importante!
     */
    async notifyNewProduct(product) {
        if (!this.discordWebhook) {
            console.log(`[Shopify] ⚠️ Webhook Discord non configurato`);
            return;
        }

        try {
            const productUrl = `${this.baseUrl}/products/${product.handle}`;
            
            // Verifica se matcha keywords
            const matchesKeywords = this.productFilter && this.productFilter.trim() ? 
                product.title.toLowerCase().includes(this.productFilter.toLowerCase()) : 
                true; // Se no filtro, sempre match

            const keywordStatus = this.productFilter ? 
                (matchesKeywords ? 
                    `✅ **MATCHA KEYWORDS**: "${this.productFilter}"` : 
                    `❌ Non matcha keywords: "${this.productFilter}"`) :
                `ℹ️ Nessun filtro keywords impostato`;

            const embed = {
                title: `🆕 NUOVO PRODOTTO TROVATO!`,
                url: productUrl,
                color: matchesKeywords ? 0x10b981 : 0xf59e0b, // Verde se matcha, arancione altrimenti
                description: `**${product.title}**`,
                fields: [
                    {
                        name: '🎯 Verifica Keywords',
                        value: keywordStatus,
                        inline: false
                    },
                    {
                        name: '🌐 URL Prodotto',
                        value: product.url.startsWith('http') ? product.url : productUrl,
                        inline: false
                    },
                    {
                        name: '🔗 Link Diretto',
                        value: `[🛒 ACQUISTA ORA](${productUrl})`,
                        inline: false
                    },
                    {
                        name: '� Stato Monitor',
                        value: '🛑 **Monitor stoppato automaticamente** (prodotto trovato!)',
                        inline: false
                    }
                ],
                thumbnail: {
                    url: product.images && product.images[0] ? product.images[0].src : null
                },
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Shappa Monitor • Prodotto #${this.checksCount}`
                }
            };

            await axios.post(this.discordWebhook, {
                content: matchesKeywords ? 
                    `<@${this.userId}> 🎉🎉🎉 **PRODOTTO TROVATO CON KEYWORDS!** 🎉🎉🎉` :
                    `<@${this.userId}> � **Nuovo prodotto rilevato**`,
                embeds: [embed]
            });

            console.log(`[Shopify] ✅ Notifica NUOVO PRODOTTO inviata: ${product.title} (matcha: ${matchesKeywords})`);

        } catch (error) {
            console.error(`[Shopify] ❌ Errore notifica nuovo prodotto:`, error.message);
            if (error.response) {
                console.error(`[Shopify] ❌ Discord response:`, error.response.status, error.response.data);
            }
        }
    }

    /**
     * 📢 NOTIFICA 1: Monitor avviato correttamente con lista prodotti trovati
     * 🆕 Mostra foto e status per ogni prodotto
     */
    async notifyMonitorStarted(allProducts, filteredProducts) {
        if (!this.discordWebhook) {
            console.log(`[Shopify] ⚠️ Webhook Discord NON configurato, skip notifica`);
            return;
        }

        console.log(`[Shopify] 📢 Preparazione embed Discord per ${filteredProducts.length} prodotti...`);

        try {
            // 🆕 CREA EMBEDS MULTIPLI - uno per ogni prodotto (max 5 per non spam)
            const embeds = [];
            
            // Embed principale con riepilogo
            const mainEmbed = {
                title: '✅ MONITOR AVVIATO CON SUCCESSO',
                description: `Monitor Shopify attivo su **${this.baseUrl}**`,
                color: 0x10b981, // Verde
                fields: [
                    {
                        name: '🌐 URL Monitorato',
                        value: this.baseUrl,
                        inline: false
                    },
                    {
                        name: '📊 Prodotti Totali',
                        value: `${allProducts.length} prodotti trovati`,
                        inline: true
                    },
                    {
                        name: '🎯 Filtro Keywords',
                        value: this.productFilter ? 
                            `"${this.productFilter}" → ${filteredProducts.length} prodotti` :
                            `Nessun filtro → ${filteredProducts.length} prodotti`,
                        inline: true
                    },
                    {
                        name: '⏱️ Intervallo Check',
                        value: `Ogni ${this.interval} minuti`,
                        inline: true
                    },
                    {
                        name: '� Heartbeat',
                        value: 'Ogni 1.5 ore (verifica monitor attivo)',
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Shappa Monitor • Check #${this.checksCount}`
                }
            };
            embeds.push(mainEmbed);

            // 🆕 Aggiungi embeds per ogni prodotto (max 5)
            const topProducts = filteredProducts.slice(0, 5);
            for (const product of topProducts) {
                // Colore status (no emoji nel titolo)
                let statusColor = 0x10b981; // Verde default
                if (product.status === 'SOON') {
                    statusColor = 0xf59e0b; // Arancione
                } else if (product.status === 'SOLD OUT') {
                    statusColor = 0xef4444; // Rosso
                }

                const productEmbed = {
                    title: product.title, // ✅ Nessuna emoji nel titolo
                    url: product.url.startsWith('http') ? product.url : `${this.baseUrl}${product.url}`,
                    color: statusColor,
                    fields: [
                        {
                            name: '📊 Status',
                            value: `**${product.status}**`,
                            inline: true
                        },
                        {
                            name: '🔗 Handle',
                            value: product.handle,
                            inline: true
                        }
                    ],
                    thumbnail: product.image ? { url: product.image } : null,
                    timestamp: new Date().toISOString()
                };
                embeds.push(productEmbed);
            }

            // Messaggio se ci sono più prodotti
            if (filteredProducts.length > 5) {
                const remainingEmbed = {
                    description: `... e altri **${filteredProducts.length - 5} prodotti** monitorati`,
                    color: 0x6366f1
                };
                embeds.push(remainingEmbed);
            }

            console.log(`[Shopify] 🌐 Invio richiesta a Discord webhook con ${embeds.length} embeds...`);

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}> 🚀 **Monitor avviato!**`,
                embeds: embeds
            });

            console.log(`[Shopify] ✅ Notifica START inviata con successo (${embeds.length} embeds)`);

        } catch (error) {
            console.error(`[Shopify] ❌ Errore notifica start:`, error.message);
            if (error.response) {
                console.error(`[Shopify] ❌ Discord response:`, error.response.status, error.response.data);
            }
        }
    }

    /**
     * � NOTIFICA 2: Heartbeat ogni 1.5 ore (monitor funziona ancora)
     * 🆕 NON all'inizio, solo dopo 1.5 ore
     */
    async checkAndSendHeartbeat() {
        if (!this.discordWebhook) return;

        const now = Date.now();
        
        // 🆕 Cambiato da 1.5 ore a 2 ore (120 minuti)
        const heartbeatInterval = 120 * 60 * 1000; // 2 ore in ms
        
        // ⚠️ IMPORTANTE: NON inviare al primo avvio (lastHeartbeatTime = null)
        if (!this.lastHeartbeatTime) {
            // Prima volta: inizializza ma NON inviare
            this.lastHeartbeatTime = now;
            console.log(`[Shopify] ⏰ Heartbeat inizializzato, prossima notifica tra 2 ore`);
            return;
        }
        
        // Invia solo se sono passate 2 ore
        if (now - this.lastHeartbeatTime < heartbeatInterval) {
            return; // Non è ancora ora
        }

        try {
            this.lastHeartbeatTime = now;

            const uptime = Math.floor((now - (this.lastHeartbeatTime - heartbeatInterval)) / 60000); // minuti
            
            const embed = {
                title: '💓 MONITOR ATTIVO',
                description: `Il monitor sta funzionando correttamente`,
                color: 0x3b82f6, // Blu
                fields: [
                    {
                        name: '📊 Statistiche',
                        value: `✅ Check eseguiti: ${this.checksCount}\n📦 Prodotti tracciati: ${this.seenProductIds.size}\n⏱️ Intervallo: ogni ${this.interval} min`,
                        inline: false
                    },
                    {
                        name: '🎯 Filtro Keywords',
                        value: this.productFilter || 'Nessun filtro (tutti i prodotti)',
                        inline: false
                    },
                    {
                        name: '🔄 Stato',
                        value: '🟢 Online e funzionante',
                        inline: true
                    },
                    {
                        name: '⏰ Prossimo Check',
                        value: `Tra ${this.interval} minuti`,
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Heartbeat • Shappa Monitor'
                }
            };

            await axios.post(this.discordWebhook, {
                embeds: [embed]
            });

            console.log(`[Shopify] 💓 Heartbeat inviato (${this.checksCount} checks)`);

        } catch (error) {
            console.error(`[Shopify] ❌ Errore heartbeat:`, error.message);
        }
    }

    /**
     * 🔴 NOTIFICA 3: Monitor bloccato/errore (probabilmente security/Cloudflare)
     */
    async notifyMonitorError(errorMessage) {
        if (!this.discordWebhook) return;

        try {
            // Rileva tipo errore
            const isCloudflareBlock = errorMessage.includes('Cloudflare') || 
                                     errorMessage.includes('blocked') || 
                                     errorMessage.includes('403') ||
                                     errorMessage.includes('You do not have access');
            
            const errorType = isCloudflareBlock ? 
                '🛡️ **Bloccato da Security/Cloudflare**' : 
                '❌ **Errore Tecnico**';

            const embed = {
                title: '🔴 MONITOR BLOCCATO',
                description: isCloudflareBlock ? 
                    'Il monitor è stato bloccato dal sistema di sicurezza del sito (Cloudflare)' :
                    'Il monitor ha riscontrato un errore tecnico',
                color: 0xef4444, // Rosso
                fields: [
                    {
                        name: '🔍 Tipo Problema',
                        value: errorType,
                        inline: false
                    },
                    {
                        name: '❌ Dettaglio Errore',
                        value: `\`\`\`${errorMessage.substring(0, 200)}\`\`\``,
                        inline: false
                    },
                    {
                        name: '📊 Statistiche',
                        value: `Check eseguiti: ${this.checksCount}\nURL: ${this.baseUrl}`,
                        inline: false
                    },
                    {
                        name: '🔄 Stato',
                        value: isCloudflareBlock ?
                            '⚠️ Il sistema riproverà, ma potrebbe continuare a essere bloccato' :
                            '🔄 Il sistema riproverà al prossimo intervallo',
                        inline: false
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Shappa Monitor Error'
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}> 🚨 **MONITOR BLOCCATO!** ${isCloudflareBlock ? '(Security)' : '(Errore)'}`,
                embeds: [embed]
            });

            console.log(`[Shopify] 🔴 Notifica ERRORE inviata (Cloudflare: ${isCloudflareBlock})`);

        } catch (error) {
            console.error(`[Shopify] ❌ Errore notifica errore:`, error.message);
        }
    }

    /**
     * 🛑 NOTIFICA 4: Monitor stoppato manualmente
     */
    async notifyMonitorStopped() {
        if (!this.discordWebhook) return;

        try {
            const embed = {
                title: '🛑 MONITOR FERMATO',
                description: `Il monitor è stato fermato`,
                color: 0x6b7280, // Grigio
                fields: [
                    {
                        name: '📊 Statistiche Finali',
                        value: `✅ Check totali: ${this.checksCount}\n📦 Prodotti tracciati: ${this.seenProductIds.size}`,
                        inline: false
                    },
                    {
                        name: '🌐 URL',
                        value: this.baseUrl,
                        inline: false
                    },
                    {
                        name: '⏰ Durata',
                        value: `Intervallo: ogni ${this.interval} min`,
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Shappa Monitor Stopped'
                }
            };

            await axios.post(this.discordWebhook, {
                embeds: [embed]
            });

            console.log(`[Shopify] 🛑 Notifica STOP inviata`);

        } catch (error) {
            console.error(`[Shopify] ❌ Errore notifica stop:`, error.message);
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
