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

            // LOGICA DISPONIBILITÀ
            let isAvailable = false;
            let reason = '';

            if (!hasBlockingKeyword && buttonAvailable) {
                isAvailable = true;
                reason = 'Keywords sparite + Button attivo';
            } else if (!hasBlockingKeyword) {
                isAvailable = true;
                reason = 'Keywords blocco non trovate';
            } else if (buttonAvailable) {
                isAvailable = true;
                reason = 'Button Add to Cart attivo';
            } else {
                isAvailable = false;
                const foundKeywords = this.blockingKeywords.filter(k => pageText.includes(k));
                reason = `Blocco attivo: ${foundKeywords.join(', ')}`;
            }

            console.log(`[Universal] Status: ${isAvailable ? '✅ DISPONIBILE' : '❌ NON DISPONIBILE'} (${reason})`);

            // Detect cambio stato
            if (this.lastStatus !== null && !this.lastStatus && isAvailable) {
                console.log(`[Universal] ⚡ CAMBIO STATO → DISPONIBILE!`);
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
}

module.exports = UniversalMonitor;
