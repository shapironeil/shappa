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
        this.monitorId = config.id;
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
        
        // 🆕 TRACKING STATUS: salva status precedente di ogni prodotto (product.id → status)
        this.productStates = new Map();
        
        // Filtro prodotto opzionale (es: "AIR JORDAN 1")
        this.productFilter = config.productFilter || config.name || '';
        
        // Tracking notifiche heartbeat (ogni 2 ore)
        this.lastHeartbeatTime = null;
        this.heartbeatInterval = 120 * 60 * 1000; // 2 ore in ms (120 minuti)
        
        // Flag per notifica iniziale
        this.initialNotificationSent = false;
        
        // Estrai handle dal URL
        this.productHandle = this.extractHandle(config.url);
        this.baseUrl = this.extractBaseUrl(config.url);
        
        // ⏰ TIMING DROPS - Check intensivi OGNI MEZZ'ORA
        this.intensiveCheckDuration = 5; // Minuti di check intensivi (5 min dopo ogni mezz'ora)
        this.intensiveCheckInterval = 25; // Secondi tra check intensivi (25-30s)
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
     * Determina intervallo check in base all'orario
     * LOGICA: Check intensivi per 5 min OGNI MEZZ'ORA (X:00, X:30)
     * Ritorna intervallo in millisecondi
     */
    getCurrentCheckInterval() {
        const now = new Date();
        const currentMinute = now.getMinutes();
        
        // Controlla se siamo in finestra intensiva:
        // - Primi 5 minuti dell'ora (00:00-00:05, 01:00-01:05, etc)
        // - Primi 5 minuti dopo la mezz'ora (00:30-00:35, 01:30-01:35, etc)
        const isIntensiveWindow = 
            (currentMinute >= 0 && currentMinute < this.intensiveCheckDuration) ||
            (currentMinute >= 30 && currentMinute < (30 + this.intensiveCheckDuration));
        
        if (isIntensiveWindow) {
            // Check INTENSIVO ogni 25 secondi
            return this.intensiveCheckInterval * 1000;
        }
        
        // Check NORMALE ogni 5 minuti
        return this.interval * 60 * 1000;
    }

    /**
     * Aggiorna status visibile nella UI
     */
    async updateMonitorStatus(statusMessage, statusType = 'monitoring') {
        try {
            const fs = require('fs').promises;
            const path = require('path');
            
            // Leggi file interest dell'utente
            const interestFile = path.join(__dirname, '..', 'data', 'interests', `interests_${this.userId}.json`);
            
            try {
                const data = await fs.readFile(interestFile, 'utf8');
                const interests = JSON.parse(data);
                
                // Trova l'interest corrente
                const interest = interests.find(i => i.id === this.monitorId);
                if (interest) {
                    interest.status = statusType;
                    interest.statusMessage = statusMessage;
                    interest.lastUpdate = new Date().toISOString();
                    
                    // Salva file aggiornato
                    await fs.writeFile(interestFile, JSON.stringify(interests, null, 2));
                    console.log(`[Shopify] 📝 Status aggiornato: ${statusMessage}`);
                }
            } catch (err) {
                // File non esiste ancora, normale per nuovo monitor
            }
        } catch (error) {
            console.error(`[Shopify] ⚠️ Errore aggiornamento status:`, error.message);
        }
    }

    /**
     * Avvia monitor con timing intelligente
     */
    async start() {
        if (this.isRunning) return;
        
        console.log(`[Shopify] 🚀 Monitor avviato: ${this.productName}`);
        console.log(`[Shopify] ⏰ Check intensivi: OGNI MEZZ'ORA per 5 minuti (X:00-X:05, X:30-X:35)`);
        console.log(`[Shopify] 💤 Check normali: ogni 5 minuti negli altri orari`);
        
        // Status: STARTING
        await this.updateMonitorStatus('🚀 Starting...', 'starting');
        
        this.isRunning = true;

        // Primo check immediato (invierà notifica iniziale)
        await this.check();

        // Sistema di check DINAMICO
        const dynamicCheck = async () => {
            if (!this.isRunning) return;
            
            const interval = this.getCurrentCheckInterval();
            const isIntensive = interval === this.intensiveCheckInterval * 1000;
            
            if (isIntensive && !this.lastIntensiveLog) {
                console.log(`[Shopify] 🔥 MODALITÀ INTENSIVA ATTIVATA - Check ogni ${this.intensiveCheckInterval}s`);
                this.lastIntensiveLog = true;
            } else if (!isIntensive && this.lastIntensiveLog) {
                console.log(`[Shopify] 💤 Modalità normale - Check ogni ${this.interval} min`);
                this.lastIntensiveLog = false;
            }
            
            await this.check();
            
            // Schedule prossimo check con intervallo dinamico
            this.intervalId = setTimeout(dynamicCheck, interval);
        };
        
        // Avvia ciclo
        const firstInterval = this.getCurrentCheckInterval();
        this.intervalId = setTimeout(dynamicCheck, firstInterval);
    }

    /**
     * Ferma monitor
     */
    async stop(deleteInterest = false) {
        if (!this.isRunning) return;
        
        console.log(`[Shopify] 🛑 Monitor fermato: ${this.productName}`);
        this.isRunning = false;
        clearInterval(this.intervalId);
        
        // 🗑️ Se richiesto, elimina l'interesse dal database (task auto-eliminata)
        if (deleteInterest && this.userId && this.monitorId) {
            try {
                console.log(`[Shopify] 🗑️ Eliminazione automatica task ${this.monitorId}...`);
                const API_BASE = process.env.NODE_ENV === 'production' ? 'https://shapiro.ninja' : 'https://localhost:3000';
                await axios.delete(`${API_BASE}/api/interests/${this.userId}/${this.monitorId}`);
                console.log(`[Shopify] ✅ Task eliminata automaticamente dalla tabella`);
            } catch (error) {
                console.error(`[Shopify] ⚠️ Errore eliminazione task:`, error.message);
            }
        }
        
        // NON inviare notifica Discord di STOP (già vedi status nella UI)
        
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
        // 🔧 FIX: Se productUrl è homepage, usa quella; altrimenti prova /collections/all
        let targetUrl = this.productUrl;
        
        // Se URL finisce con /, è homepage diretta
        if (!targetUrl.endsWith('/products/') && !targetUrl.includes('/collections/')) {
            // Prova prima homepage
            console.log(`[Shopify] 🏠 URL è homepage, navigo direttamente: ${targetUrl}`);
        } else {
            // Prova collections
            targetUrl = `${this.baseUrl}/collections/all`;
            console.log(`[Shopify] 🗂️ Navigo pagina collections: ${targetUrl}`);
        }
        
        await page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Wait per rendering completo (JS client-side)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Controlla se Cloudflare ha bloccato
        const text = await page.content();
        if (text.includes('Cloudflare') || text.includes('You do not have access') || text.includes('blocked')) {
            console.error(`[Shopify] ⚠️ Cloudflare block rilevato, riprovo prossimo check...`);
            return;
        }

        // ESTRAI PRODOTTI dalla pagina HTML (TUTTI i prodotti, anche non cliccabili)
        const products = await page.evaluate(() => {
            const productsMap = new Map();
            
            // STRATEGIA 1: Prodotti con link (prodotti online/acquistabili)
            const productLinks = document.querySelectorAll('a[href*="/products/"]');
            
            productLinks.forEach(el => {
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
                
                // Estrai immagine
                let imageUrl = null;
                if (img) {
                    imageUrl = img.src || img.getAttribute('data-src') || null;
                    if (!imageUrl && img.srcset) {
                        const srcsetMatch = img.srcset.match(/https?:\/\/[^\s]+/);
                        if (srcsetMatch) imageUrl = srcsetMatch[0];
                    }
                }
                
                // Rileva STATUS - cerca testo vicino al prodotto
                let status = null;
                const productContainer = el.closest('.product-item, .product-card, .grid-item, [class*="product"]') || el;
                const allText = productContainer.textContent.toLowerCase();
                
                // Badge o testo specifico
                const badge = productContainer.querySelector('.badge, .tag, [class*="badge"], [class*="status"]');
                const badgeText = badge ? badge.textContent.toLowerCase() : '';
                const fullText = allText + ' ' + badgeText;
                
                // Determina status con PRIORITÀ - VERIFICA REALE ACQUISTABILITÀ
                
                // 🔍 STRATEGIA MIGLIORATA: Per prodotti con link, assumi status sconosciuto
                // Lo verificheremo aprendo la pagina prodotto dopo
                status = 'UNKNOWN'; // Sarà verificato dopo aprendo la pagina
                
                // ⚠️ ECCEZIONE: Se ha testo esplicito SOLD OUT/SOON, marca subito
                if (fullText.match(/sold\s*out|soldout|out\s*of\s*stock|unavailable|not\s*available|esaurito/i)) {
                    status = 'SOLD OUT';
                } else if (fullText.match(/\bsoon\b|coming\s*soon|notify\s*me|pre\s*order|preorder|not\s*yet|upcoming/i)) {
                    status = 'SOON';
                }
                
                productsMap.set(handle, {
                    id: handle,
                    handle: handle,
                    title: title || handle,
                    url: href,
                    image: imageUrl,
                    status: status,
                    isClickable: true // Ha link prodotto
                });
            });
            
            // STRATEGIA 2: Prodotti SENZA link (coming soon, solo immagini)
            // Cerca elementi con testo tipo "AIR JORDAN" + "SOON" ma senza link
            const allContainers = document.querySelectorAll('.product-item, .product-card, .grid-item, [class*="product"], [class*="grid"]');
            
            allContainers.forEach(container => {
                // Se già ha un link /products/, skip (già processato sopra)
                if (container.querySelector('a[href*="/products/"]')) return;
                
                // Cerca titoli/testo nel container
                const titleElements = container.querySelectorAll('h2, h3, h4, .title, .product-title, [class*="title"], [class*="name"]');
                let title = '';
                
                if (titleElements.length > 0) {
                    title = Array.from(titleElements).map(el => el.textContent.trim()).join(' ');
                } else {
                    // Fallback: prendi alt text dalle immagini
                    const imgs = container.querySelectorAll('img[alt]');
                    if (imgs.length > 0) {
                        title = Array.from(imgs).map(img => img.alt).filter(Boolean).join(' ');
                    }
                }
                
                if (!title || title.length < 5) return; // Skip elementi vuoti
                
                // Genera un ID fittizio basato sul titolo
                const fakeHandle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
                if (productsMap.has(fakeHandle)) return; // Skip duplicati
                
                // Estrai immagine
                let imageUrl = null;
                const img = container.querySelector('img');
                if (img) {
                    imageUrl = img.src || img.getAttribute('data-src') || null;
                }
                
                // Rileva STATUS - VERIFICA ACQUISTABILITÀ REALE
                const allText = container.textContent.toLowerCase();
                let status = 'SOON'; // Default per prodotti non cliccabili
                
                // Cerca indicatori di acquisto VERI (form/button/testo carrello)
                const hasForm = container.querySelector('form[action*="cart"], form[action*="/cart"]');
                const hasAddButton = container.querySelector('button[name="add"], input[name="add"], button[type="submit"], [data-action*="add"], .add-to-cart, [class*="add-to-cart"]');
                const hasCartText = allText.match(/add\s*to\s*(cart|bag)|buy\s*now|shop\s*now|purchase|order\s*now/i);
                
                // ✅ ONLINE = Solo se ha form/button/testo carrello
                if (hasForm || hasAddButton || hasCartText) {
                    status = 'ONLINE';
                }
                // ❌ SOLD OUT = Esplicito
                else if (allText.match(/sold\s*out|soldout|esaurito/i)) {
                    status = 'SOLD OUT';
                }
                // ⏳ SOON = Esplicito o default (nessun indicatore acquisto)
                else if (allText.match(/\bsoon\b|coming\s*soon|notify|pre\s*order|upcoming/i)) {
                    status = 'SOON';
                }
                
                productsMap.set(fakeHandle, {
                    id: fakeHandle,
                    handle: fakeHandle,
                    title: title.trim(),
                    url: null, // Nessun link ancora
                    image: imageUrl,
                    status: status,
                    isClickable: false // NON ha link (solo immagine/testo)
                });
            });
            
            return Array.from(productsMap.values());
        });

        console.log(`[Shopify] 📦 Trovati ${products.length} prodotti sulla pagina (cliccabili + non cliccabili)`);

        // 🔍 VERIFICA STATUS + ESTRAI VARIANTI navigando pagina prodotto
        for (const product of products) {
            if (product.status === 'UNKNOWN' && product.url) {
                console.log(`[Shopify] 🔍 Check per: ${product.title}`);
                try {
                    const productPage = await this.browser.newPage();
                    const fullUrl = product.url.startsWith('http') ? product.url : `${this.baseUrl}${product.url}`;
                    
                    await productPage.goto(fullUrl, { 
                        waitUntil: 'domcontentloaded', 
                        timeout: 15000 
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Estrai JSON dal tag <script> della pagina
                    const productData = await productPage.evaluate(() => {
                        // Cerca script con JSON prodotto
                        const script = document.querySelector('script.js-product-json, script[type="application/json"][data-product-json]');
                        if (script) {
                            try {
                                return JSON.parse(script.textContent);
                            } catch (e) {
                                console.error('Parse error:', e);
                            }
                        }
                        return null;
                    });
                    
                    await productPage.close();
                    
                    if (productData && productData.variants) {
                        // ✅ ESTRAI VARIANTI CON DISPONIBILITÀ
                        const variants = productData.variants.map(v => ({
                            id: v.id.toString(),
                            title: (v.title || v.option1 || v.public_title || 'Default').toUpperCase(),
                            price: v.price || 0,
                            available: v.available || false
                        }));
                        
                        product.variants = variants;
                        
                        // ONLINE se almeno UNA variante disponibile
                        const hasAvailable = variants.some(v => v.available);
                        product.status = hasAvailable ? 'ONLINE' : 'SOON';
                        
                        const availableCount = variants.filter(v => v.available).length;
                        console.log(`[Shopify] ✅ ${product.title} → ${product.status} (${availableCount}/${variants.length} disponibili)`);
                    } else {
                        product.status = 'SOON';
                        product.variants = [];
                        console.log(`[Shopify] ⚠️ ${product.title} → Nessun JSON trovato`);
                    }
                    
                } catch (error) {
                    console.error(`[Shopify] ⚠️ Errore ${product.title}: ${error.message}`);
                    product.status = 'SOON';
                    product.variants = [];
                }
            }
        }

        console.log(`[Shopify] ✅ Status verificato per tutti i prodotti`);

        // Filtra per keywords se specificate
        let filteredProducts = products;
        if (this.productFilter && this.productFilter.trim()) {
            // Rimuovi virgolette e caratteri speciali, split su spazi
            const cleanFilter = this.productFilter.replace(/["""]/g, '').trim();
            const filterLower = cleanFilter.toLowerCase();
            
            filteredProducts = products.filter(p => {
                const title = p.title.toLowerCase();
                
                // STRATEGIA 1: Match ESATTO (ignora case e punteggiatura)
                const titleNormalized = title.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                const filterNormalized = filterLower.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                
                if (titleNormalized === filterNormalized) {
                    return true; // Match esatto!
                }
                
                // STRATEGIA 2: Match TUTTE le keywords principali (min 3 caratteri)
                const keywords = filterLower.split(/\s+/).filter(k => k.length >= 3);
                if (keywords.length > 0) {
                    const allKeywordsPresent = keywords.every(kw => title.includes(kw));
                    return allKeywordsPresent;
                }
                
                return false;
            });
            
            console.log(`[Shopify] 🔍 ${filteredProducts.length} prodotti matchano filtro "${this.productFilter}"`);
            if (filteredProducts.length === 0) {
                console.log(`[Shopify] ⚠️ NESSUN prodotto matcha il filtro. Titoli presenti:`);
                products.slice(0, 5).forEach(p => console.log(`  - "${p.title}"`));
            }
        }

        // Rileva NUOVI prodotti o CAMBIAMENTI DI STATUS
        const productsToNotify = [];
        
        for (const product of filteredProducts) {
            const productId = product.id;
            const currentStatus = product.status;
            const previousStatus = this.productStates.get(productId);
            
            // CASO 1: Prodotto mai visto prima → NUOVO
            if (!this.seenProductIds.has(productId)) {
                console.log(`[Shopify] 🆕 NUOVO PRODOTTO: ${product.title} (${currentStatus})`);
                productsToNotify.push({ ...product, changeType: 'NEW' });
                this.seenProductIds.add(productId);
                this.productStates.set(productId, currentStatus);
            }
            // CASO 2: Prodotto già visto, MA status cambiato
            else if (previousStatus && previousStatus !== currentStatus) {
                console.log(`[Shopify] 🔄 CAMBIO STATUS: ${product.title} [${previousStatus} → ${currentStatus}]`);
                productsToNotify.push({ ...product, changeType: 'STATUS_CHANGE', previousStatus });
                this.productStates.set(productId, currentStatus);
            }
            // CASO 3: Prodotto visto, status uguale → NESSUNA NOTIFICA
            else if (previousStatus === currentStatus) {
                // Nessuna azione, già notificato
            }
            // CASO 4: Prodotto visto ma non ha status precedente (primo check dopo init)
            else {
                this.productStates.set(productId, currentStatus);
            }
        }

        // 🎯 PRIMO CHECK: Inizializza status update
        if (!this.initialNotificationSent) {
            console.log(`[Shopify] 📢 Monitor avviato per: ${this.productFilter || 'tutti i prodotti'}`);
            await this.updateMonitorStatus('🔍 Monitoring...', 'monitoring');
            this.initialNotificationSent = true;
        }

        if (productsToNotify.length > 0) {
            console.log(`[Shopify] 📢 ${productsToNotify.length} prodotti da notificare`);
            
            // Status: PRODUCT FOUND
            const onlineCount = productsToNotify.filter(p => p.status === 'ONLINE').length;
            if (onlineCount > 0) {
                await this.updateMonitorStatus(`🎯 ${onlineCount} product${onlineCount > 1 ? 's' : ''} found!`, 'product found');
            }
            
            // 🛒 ESTRAI VARIANTI da API se non già presenti
            for (const product of productsToNotify) {
                // Se prodotto ONLINE ma senza varianti, usa API .js
                if (product.status === 'ONLINE' && (!product.variants || product.variants.length === 0)) {
                    console.log(`[Shopify] 🔍 Estraggo varianti API per: ${product.title}`);
                    
                    try {
                        const productPage = await this.browser.newPage();
                        const fullUrl = product.url.startsWith('http') ? product.url : `${this.baseUrl}${product.url}`;
                        
                        await productPage.goto(fullUrl, { 
                            waitUntil: 'domcontentloaded', 
                            timeout: 15000 
                        });
                        
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Estrai JSON dal tag <script>
                        const productData = await productPage.evaluate(() => {
                            const script = document.querySelector('script.js-product-json, script[type="application/json"][data-product-json]');
                            if (script) {
                                try {
                                    return JSON.parse(script.textContent);
                                } catch (e) { return null; }
                            }
                            return null;
                        });
                        
                        await productPage.close();
                        
                        if (productData && productData.variants) {
                            product.variants = productData.variants.map(v => ({
                                id: v.id.toString(),
                                title: (v.title || v.option1 || v.public_title || 'Default').toUpperCase(),
                                price: v.price || 0,
                                available: v.available || false
                            }));
                            
                            console.log(`[Shopify] ✅ ${product.variants.length} varianti estratte per ${product.title}`);
                        }
                        
                    } catch (err) {
                        console.error(`[Shopify] ❌ Errore varianti: ${err.message}`);
                        product.variants = [];
                    }
                }
                
                // Invia notifica con varianti
                const notificationSuccess = await this.notifyNewProduct(product);
                
                if (notificationSuccess && product.status === 'ONLINE' && product.variants && product.variants.length > 0) {
                    console.log(`[Shopify] ✅ Notifica ONLINE inviata: ${product.title} (${product.variants.length} taglie)`);
                }
                
                // Delay tra notifiche
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // 🎯 DOPO AVER INVIATO TUTTE LE NOTIFICHE → ELIMINA TASK
            const onlineProductsSent = productsToNotify.filter(p => p.status === 'ONLINE' && p.variants && p.variants.length > 0);
            if (onlineProductsSent.length > 0) {
                console.log(`[Shopify] 🛑 STOP MONITOR: ${onlineProductsSent.length} prodotti ONLINE inviati. ELIMINO TASK.`);
                await this.updateMonitorStatus(`🛑 Stopped`, 'stopped');
                await this.stop(true); // true = elimina task automaticamente
                return;
            }
            
        } else if (this.checksCount > 1) {
            console.log(`[Shopify] ⏳ Nessun nuovo prodotto. Prossimo check tra ${this.interval} minuti...`);
            await this.updateMonitorStatus(`🔍 Monitoring...`, 'monitoring');
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
            // 🛒 GENERA LINK DIRECT-TO-CART per ogni variante
            const variantLinks = variants.map(v => {
                const price = (v.price / 100).toFixed(2);
                const cartUrl = `${this.baseUrl}/cart/add?id=${v.id}&quantity=1`;
                const stockInfo = v.inventory_quantity ? ` (${v.inventory_quantity} disponibili)` : '';
                return `🛒 [**${v.title}** - $${price}${stockInfo}](${cartUrl})`;
            }).join('\n');

            const embed = {
                title: `🚨 ${product.title} DISPONIBILE!`,
                url: this.productUrl,
                color: 0x10b981,
                description: `**CLICCA LA TAGLIA PER AGGIUNGERLA AL CARRELLO** 👇`,
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
                        name: '🛒 Link Direct-to-Cart',
                        value: variantLinks || 'N/A',
                        inline: false
                    }
                ],
                thumbnail: {
                    url: product.images[0]?.src || product.featured_image
                },
                timestamp: new Date().toISOString(),
                footer: {
                    text: '🚀 Shappa Shopify Monitor - Click size to add to cart!'
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}> **🔥 DROP ALERT!**`,
                embeds: [embed]
            });

            console.log(`[Shopify] ✅ Notifica Discord inviata con ${variants.length} link direct-to-cart`);
        } catch (error) {
            console.error(`[Shopify] ❌ Errore invio notifica Discord:`, error.message);
        }
    }

    /**
     * Notifica NUOVO PRODOTTO rilevato
     * 🔴 IMPORTANTE: Questa è la notifica più importante!
     * @returns {boolean} true se notifica completa inviata (foto + titolo + status ONLINE + taglie)
     */
    async notifyNewProduct(product) {
        if (!this.discordWebhook) {
            console.log(`[Shopify] ⚠️ Webhook Discord non configurato`);
            return false;
        }

        try {
            const productUrl = `${this.baseUrl}/products/${product.handle}`;

            // 🛒 USA VARIANTI GIÀ ESTRATTE e genera link direct-to-cart
            let variantsField = null;
            
            if (product.variants && product.variants.length > 0) {
                // Ha varianti estratte con PREZZO!
                const variantLinks = product.variants.map(v => {
                    const cartUrl = `${this.baseUrl}/cart/add?id=${v.id}&quantity=1`;
                    const price = v.price ? ` - $${(v.price / 100).toFixed(2)}` : '';
                    const availIcon = v.available ? '✅' : '❌';
                    return `${availIcon} [**${v.title}**${price}](${cartUrl})`;
                }).join('\n');
                
                variantsField = {
                    name: `👟 Taglie (${product.variants.length})`,
                    value: variantLinks,
                    inline: false
                };
            }
            
            const embed = {
                title: product.title,
                url: productUrl,
                color: 0x10b981,
                fields: variantsField ? [variantsField] : [],
                image: {
                    url: product.images && product.images[0] ? product.images[0].src : null
                },
                timestamp: new Date().toISOString()
            };

            await axios.post(this.discordWebhook, {
                embeds: [embed]
            });

            console.log(`[Shopify] Notifica NUOVO PRODOTTO inviata: ${product.title} (matcha: ${matchesKeywords})`);

            // 🎯 Verifica se messaggio è COMPLETO (foto + titolo + status ONLINE + taglie)
            const hasImage = product.image || (product.images && product.images[0]);
            const hasTitle = product.title && product.title.length > 0;
            const isOnline = product.status === 'ONLINE';
            const hasVariants = product.variants && product.variants.length > 0;
            const isComplete = hasImage && hasTitle && isOnline && hasVariants;
            
            if (isComplete) {
                console.log(`[Shopify] ✅ Messaggio COMPLETO inviato! (foto + titolo + ${product.variants.length} taglie)`);
            }
            
            return isComplete; // Ritorna true se messaggio completo

        } catch (error) {
            console.error(`[Shopify] Errore notifica nuovo prodotto:`, error.message);
            if (error.response) {
                console.error(`[Shopify] Discord response:`, error.response.status, error.response.data);
            }
            return false; // Errore = notifica non completata
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

            // 🆕 Aggiungi embeds per ogni prodotto (max 10 invece di 5)
            const topProducts = filteredProducts.slice(0, 10);
            for (const product of topProducts) {
                // Colore status
                let statusColor = 0x10b981; // Verde default (ONLINE)
                if (product.status === 'SOON') {
                    statusColor = 0xf59e0b; // Arancione
                } else if (product.status === 'SOLD OUT') {
                    statusColor = 0xef4444; // Rosso
                }

                // 🛒 USA VARIANTI GIÀ ESTRATTE (nel loop principale)
                let variantsText = '[Prodotto in coming soon]';
                
                // ⚠️ VERIFICA: Solo se prodotto ha URL (prodotti cliccabili)
                if (product.url) {
                    variantsText = `[Vedi prodotto](${product.url.startsWith('http') ? product.url : `${this.baseUrl}${product.url}`})`;
                }
                
                // Se ha varianti già estratte, mostra link direct-to-cart
                if (product.variants && product.variants.length > 0) {
                    variantsText = product.variants.map(v => {
                        const cartUrl = `${this.baseUrl}/cart/add?id=${v.id}&quantity=1`;
                        const price = v.price ? ` - $${(v.price / 100).toFixed(2)}` : '';
                        const availableIcon = v.available ? '✅' : '❌';
                        return `${availableIcon} [**${v.title}**${price}](${cartUrl})`;
                    }).join('\n');
                    
                    console.log(`[Shopify] ✅ Notifica START: ${product.variants.length} varianti per ${product.title}`);
                }

                const productEmbed = {
                    title: product.title,
                    url: product.url ? (product.url.startsWith('http') ? product.url : `${this.baseUrl}${product.url}`) : this.baseUrl,
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
                        },
                        {
                            name: product.status === 'ONLINE' ? '👟 Taglie / Quick Buy' : '🔗 Link',
                            value: variantsText,
                            inline: false
                        }
                    ],
                    thumbnail: product.image ? { url: product.image } : null,
                    timestamp: new Date().toISOString()
                };
                embeds.push(productEmbed);
            }

            // Messaggio se ci sono più prodotti
            if (filteredProducts.length > 10) {
                const remainingEmbed = {
                    description: `... e altri **${filteredProducts.length - 10} prodotti** monitorati (non mostrati per evitare spam)`,
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
