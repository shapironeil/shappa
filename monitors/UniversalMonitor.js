/**
 * UniversalMonitor - Modulo intelligente per qualsiasi sito
 * 
 * Funziona su:
 * - Travis Scott shop (rileva quando "SOON" sparisce)
 * - Nike SNKRS (rileva quando button diventa attivo)
 * - Supreme (rileva disponibilità)
 * - Qualsiasi altro sito e-commerce
 * 
 * LOGICA:
 * 1. Scarica HTML della pagina
 * 2. Cerca keywords di blocco (SOON, SOLD OUT, COMING SOON, etc.)
 * 3. Cerca button ATC (Add to Cart)
 * 4. Se keywords spariscono O button attivo → DISPONIBILE!
 */

const axios = require('axios');
const cheerio = require('cheerio');

class UniversalMonitor {
    constructor(config) {
        this.config = config;
        this.productUrl = config.url;
        this.keywords = config.name || 'SOON,SOLD OUT,COMING SOON,OUT OF STOCK,ESAURITO,NOT AVAILABLE';
        this.interval = config.interval || 5;
        this.userId = config.userId;
        this.discordWebhook = config.discordWebhook;
        this.customSelector = config.target;
        
        this.isRunning = false;
        this.intervalId = null;
        this.lastStatus = null;
        this.checksCount = 0;
        
        // Notification tracking
        this.hasNotifiedStart = false;
        this.lastHeartbeat = null;
        this.hasFoundKeyword = false; // One-time notification quando trova keyword blocco
        this.heartbeatInterval = 2 * 60 * 60 * 1000; // 2 ore in ms
        
        // Parse keywords
        this.blockingKeywords = this.keywords
            .split(',')
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 0);
        
        // Estrai nome prodotto dall'URL per notifiche
        this.productName = this.extractProductName(config.url);
    }

    /**
     * Estrae nome prodotto dall'URL
     */
    extractProductName(url) {
        try {
            const urlObj = new URL(url);
            const parts = urlObj.pathname.split('/').filter(p => p);
            
            // Prendi ultimo segmento e pulisci
            const lastPart = parts[parts.length - 1] || 'Product';
            return lastPart
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
        } catch {
            return 'Product';
        }
    }

    /**
     * Avvia monitor
     */
    async start() {
        if (this.isRunning) return;
        
        console.log(`[Universal] 🚀 Monitor avviato: ${this.productName}`);
        console.log(`[Universal] 🔍 Keywords blocco: ${this.blockingKeywords.join(', ')}`);
        this.isRunning = true;

        // 🔔 NOTIFICA 1: Monitor Started
        if (!this.hasNotifiedStart) {
            await this.notifyMonitorStart();
            this.hasNotifiedStart = true;
        }

        // Primo check immediato
        await this.check();

        // Polling
        this.intervalId = setInterval(() => {
            this.check();
        }, this.interval * 60 * 1000);
    }

    /**
     * Ferma monitor
     */
    stop() {
        if (!this.isRunning) return;
        
        console.log(`[Universal] 🛑 Monitor fermato: ${this.productName}`);
        this.isRunning = false;
        clearInterval(this.intervalId);
    }

    /**
     * Check disponibilità
     */
    async check() {
        this.checksCount++;

        try {
            console.log(`[Universal] 🔍 Check #${this.checksCount} - ${this.productName}`);

            // Fetch HTML
            const html = await this.fetchHTML();
            const $ = cheerio.load(html);
            
            // Rimuovi script/style per ridurre noise
            $('script, style').remove();
            
            // Ottieni tutto il testo visibile
            const pageText = $('body').text().toLowerCase();

            // 1. CHECK KEYWORDS BLOCCO
            const hasBlockingKeyword = this.blockingKeywords.some(keyword => 
                pageText.includes(keyword)
            );

            // 2. CHECK BUTTON ADD TO CART
            const buttonAvailable = this.checkButtonAvailability($);

            // 3. CHECK PREZZO (extra sicurezza)
            const hasPriceVisible = this.checkPriceVisibility($);

            // 4. CHECK FORM PRODOTTO (extra sicurezza)
            const hasProductForm = $('form[action*="cart"]').length > 0 || 
                                   $('form.product-form').length > 0 ||
                                   $('[data-product-form]').length > 0;

            // LOGICA DISPONIBILITÀ - Multi-check per sicurezza massima
            let isAvailable = false;
            let reason = '';
            let confidence = 0; // Score 0-100

            // Calcola confidence score
            if (!hasBlockingKeyword) confidence += 40; // Keywords OK
            if (buttonAvailable) confidence += 30;      // Button OK
            if (hasPriceVisible) confidence += 15;      // Prezzo visibile
            if (hasProductForm) confidence += 15;       // Form presente

            // Determina disponibilità basata su confidence
            if (confidence >= 70) {
                isAvailable = true;
                const checks = [];
                if (!hasBlockingKeyword) checks.push('Keywords OK');
                if (buttonAvailable) checks.push('Button attivo');
                if (hasPriceVisible) checks.push('Prezzo visibile');
                if (hasProductForm) checks.push('Form acquisto presente');
                reason = `${checks.join(' + ')} (Confidence: ${confidence}%)`;
            } else {
                isAvailable = false;
                const blocks = [];
                if (hasBlockingKeyword) {
                    const found = this.blockingKeywords.filter(k => pageText.includes(k));
                    blocks.push(`Keywords: ${found.join(', ')}`);
                }
                if (!buttonAvailable) blocks.push('Button inattivo');
                if (!hasPriceVisible) blocks.push('Prezzo nascosto');
                if (!hasProductForm) blocks.push('Form mancante');
                reason = `Blocchi: ${blocks.join(' | ')} (Confidence: ${confidence}%)`;
            }

            console.log(`[Universal] Status: ${isAvailable ? '✅ DISPONIBILE' : '❌ NON DISPONIBILE'} (${reason})`);

            // 🔔 NOTIFICA 4: Keyword Detected (one-time quando trova keyword blocco)
            if (hasBlockingKeyword && !this.hasFoundKeyword) {
                const foundKeywords = this.blockingKeywords.filter(k => pageText.includes(k));
                await this.notifyKeywordDetected(foundKeywords);
                this.hasFoundKeyword = true;
            }

            // 🔔 NOTIFICA 2: Heartbeat ogni 2 ore
            const now = Date.now();
            if (!this.lastHeartbeat || (now - this.lastHeartbeat) >= this.heartbeatInterval) {
                await this.notifyHeartbeat(isAvailable, confidence);
                this.lastHeartbeat = now;
            }

            // Detect cambio stato
            if (this.lastStatus !== null && !this.lastStatus && isAvailable) {
                console.log(`[Universal] ⚡ CAMBIO STATO → DISPONIBILE!`);
                // 🔔 NOTIFICA 3: Product Found (esistente)
                await this.notifyDiscord(reason);
            }

            this.lastStatus = isAvailable;

        } catch (error) {
            console.error(`[Universal] ❌ Errore check:`, error.message);
        }
    }

    /**
     * Verifica button Add to Cart
     */
    checkButtonAvailability($) {
        const selectors = [
            'button[name="add"]',
            '.add-to-cart',
            '#add-to-cart',
            'button.product-form__submit',
            'button[type="submit"].btn-cart',
            '.product-form__submit',
            'input[type="submit"][name="add"]',
            'button.btn-add-cart',
            '.atc-button',
            '[data-add-to-cart]'
        ];

        // Se utente ha specificato selettore custom, usalo
        if (this.customSelector) {
            selectors.unshift(this.customSelector);
        }

        for (const selector of selectors) {
            const button = $(selector).first();
            
            if (button.length > 0) {
                const isDisabled = button.prop('disabled') || 
                                 button.attr('disabled') !== undefined ||
                                 button.hasClass('disabled') ||
                                 button.hasClass('sold-out');

                const buttonText = button.text().toLowerCase().trim();
                const unavailableTexts = [
                    'sold out',
                    'esaurito',
                    'non disponibile',
                    'out of stock',
                    'coming soon',
                    'soon',
                    'notify',
                    'avvisami'
                ];

                const hasUnavailableText = unavailableTexts.some(text => buttonText.includes(text));

                if (!isDisabled && !hasUnavailableText) {
                    console.log(`[Universal] ✅ Button trovato e attivo: "${buttonText}"`);
                    return true;
                }

                console.log(`[Universal] ❌ Button trovato ma inattivo: disabled=${isDisabled}, text="${buttonText}"`);
                return false;
            }
        }

        console.log(`[Universal] ⚠️ Nessun button ATC trovato`);
        return false;
    }

    /**
     * Verifica visibilità prezzo (extra check)
     */
    checkPriceVisibility($) {
        const priceSelectors = [
            '.price',
            '.product-price',
            '.money',
            '[data-price]',
            '.price__current',
            'span.amount',
            '.product__price'
        ];

        for (const selector of priceSelectors) {
            const priceEl = $(selector).first();
            if (priceEl.length > 0) {
                const priceText = priceEl.text().trim();
                // Prezzo deve contenere numeri
                if (/\d+/.test(priceText)) {
                    console.log(`[Universal] ✅ Prezzo trovato: "${priceText}"`);
                    return true;
                }
            }
        }

        console.log(`[Universal] ⚠️ Nessun prezzo visibile`);
        return false;
    }

    /**
     * Fetch HTML
     */
    async fetchHTML() {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        };

        const response = await axios.get(this.productUrl, {
            headers,
            timeout: 15000,
            maxRedirects: 5
        });

        return response.data;
    }

    /**
     * Invia notifica Discord
     */
    async notifyDiscord(reason) {
        if (!this.discordWebhook) {
            console.log(`[Universal] ⚠️ Webhook Discord non configurato`);
            return;
        }

        try {
            const embed = {
                title: `🚨 ${this.productName} DISPONIBILE!`,
                url: this.productUrl,
                color: 0x10b981,
                fields: [
                    {
                        name: '✅ Motivo',
                        value: reason,
                        inline: false
                    },
                    {
                        name: '🔗 Link Diretto',
                        value: `[Acquista ORA](${this.productUrl})`,
                        inline: false
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Shappa Universal Monitor'
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}> **🚨 ALERT DROP!**`,
                embeds: [embed]
            });

            console.log(`[Universal] ✅ Notifica Discord inviata`);

        } catch (error) {
            console.error(`[Universal] ❌ Errore Discord:`, error.message);
        }
    }

    /**
     * Stats monitor
     */
    getStats() {
        return {
            productName: this.productName,
            productUrl: this.productUrl,
            keywords: this.blockingKeywords.join(', '),
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
            const embed = {
                title: `🚀 Monitor Avviato`,
                url: this.productUrl,
                color: 0x3b82f6, // Blu
                description: `Il monitoraggio per **${this.productName}** è iniziato!`,
                fields: [
                    {
                        name: '🔗 URL',
                        value: this.productUrl,
                        inline: false
                    },
                    {
                        name: '🔍 Keywords Blocco',
                        value: this.blockingKeywords.join(', '),
                        inline: false
                    },
                    {
                        name: '⏱️ Intervallo Check',
                        value: `${this.interval} minuto/i`,
                        inline: true
                    },
                    {
                        name: '🌐 Modulo',
                        value: 'Universal Monitor',
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Shappa Monitor System'
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}>`,
                embeds: [embed]
            });

            console.log(`[Universal] ✅ Notifica START inviata`);
        } catch (error) {
            console.error(`[Universal] ❌ Errore notifica START:`, error.message);
        }
    }

    /**
     * 🔔 NOTIFICA 2: Heartbeat ogni 2 ore
     */
    async notifyHeartbeat(isAvailable, confidence) {
        if (!this.discordWebhook) return;

        try {
            const statusEmoji = isAvailable ? '✅' : '⏳';
            const statusText = isAvailable ? 'DISPONIBILE' : 'Non ancora disponibile';
            const colorCode = isAvailable ? 0x10b981 : 0x6b7280; // Verde o Grigio

            const embed = {
                title: `💓 Heartbeat - Monitor Attivo`,
                url: this.productUrl,
                color: colorCode,
                description: `Status update per **${this.productName}**`,
                fields: [
                    {
                        name: `${statusEmoji} Status Corrente`,
                        value: statusText,
                        inline: true
                    },
                    {
                        name: '🎯 Confidence Score',
                        value: `${confidence}%`,
                        inline: true
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

            console.log(`[Universal] ✅ Notifica HEARTBEAT inviata`);
        } catch (error) {
            console.error(`[Universal] ❌ Errore notifica HEARTBEAT:`, error.message);
        }
    }

    /**
     * 🔔 NOTIFICA 4: Keyword Detected (one-time)
     */
    async notifyKeywordDetected(foundKeywords) {
        if (!this.discordWebhook) return;

        try {
            const embed = {
                title: `🔍 Keyword Rilevata`,
                url: this.productUrl,
                color: 0xf59e0b, // Arancione
                description: `Ho rilevato keyword di blocco su **${this.productName}**`,
                fields: [
                    {
                        name: '⚠️ Keywords Trovate',
                        value: foundKeywords.map(k => `\`${k.toUpperCase()}\``).join(', '),
                        inline: false
                    },
                    {
                        name: '📌 Cosa significa?',
                        value: 'Il prodotto NON è ancora disponibile. Ti avviserò quando la keyword sparisce!',
                        inline: false
                    },
                    {
                        name: '🔗 Link',
                        value: `[Monitora pagina](${this.productUrl})`,
                        inline: false
                    }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Notifica one-time - continuerò a monitorare'
                }
            };

            await axios.post(this.discordWebhook, {
                content: `<@${this.userId}>`,
                embeds: [embed]
            });

            console.log(`[Universal] ✅ Notifica KEYWORD DETECTED inviata`);
        } catch (error) {
            console.error(`[Universal] ❌ Errore notifica KEYWORD:`, error.message);
        }
    }
}

module.exports = UniversalMonitor;
