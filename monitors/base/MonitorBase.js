/**
 * MonitorBase - Classe astratta per tutti i monitor
 * 
 * Ogni modulo deve estendere questa classe e implementare:
 * - check(): verifica disponibilità prodotto
 * - extractData(): estrae dati dal sito (prezzo, stock, etc.)
 */

const axios = require('axios');
const cheerio = require('cheerio');

class MonitorBase {
    constructor(config) {
        this.config = config;
        this.productName = config.name;
        this.productUrl = config.url;
        this.interval = config.interval || 5; // minuti
        this.target = config.target; // CSS selector o API endpoint
        this.notes = config.notes || '';
        this.userId = config.userId;
        this.monitorId = config.id;
        
        // Stato interno
        this.isRunning = false;
        this.intervalId = null;
        this.lastCheck = null;
        this.lastStatus = null;
        this.checksCount = 0;
        this.errors = [];
    }

    /**
     * Metodo astratto - deve essere implementato da ogni modulo
     * Ritorna: { available: boolean, data: object }
     */
    async check() {
        throw new Error('check() method must be implemented by subclass');
    }

    /**
     * Metodo astratto - estrae dati specifici dal sito
     * Ritorna: { price, stock, image, etc. }
     */
    async extractData(html) {
        throw new Error('extractData() method must be implemented by subclass');
    }

    /**
     * Avvia il monitoraggio
     */
    async start() {
        if (this.isRunning) {
            console.log(`[${this.productName}] Monitor già in esecuzione`);
            return;
        }

        console.log(`[${this.productName}] 🚀 Avvio monitor - Intervallo: ${this.interval}min`);
        this.isRunning = true;

        // Primo check immediato
        await this.performCheck();

        // Avvia polling
        this.intervalId = setInterval(() => {
            this.performCheck();
        }, this.interval * 60 * 1000);
    }

    /**
     * Ferma il monitoraggio
     */
    stop() {
        if (!this.isRunning) {
            return;
        }

        console.log(`[${this.productName}] 🛑 Stop monitor`);
        this.isRunning = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Esegue un singolo check
     */
    async performCheck() {
        this.checksCount++;
        this.lastCheck = new Date();

        try {
            console.log(`[${this.productName}] 🔍 Check #${this.checksCount} - ${this.lastCheck.toISOString()}`);
            
            const result = await this.check();
            
            // Verifica se lo stato è cambiato
            const statusChanged = this.lastStatus !== null && this.lastStatus !== result.available;
            
            if (statusChanged) {
                console.log(`[${this.productName}] ⚡ CAMBIO STATO: ${this.lastStatus ? 'disponibile' : 'non disponibile'} → ${result.available ? 'DISPONIBILE' : 'non disponibile'}`);
                
                // Notifica solo se diventa disponibile
                if (result.available) {
                    await this.onAvailable(result.data);
                }
            }

            this.lastStatus = result.available;

        } catch (error) {
            console.error(`[${this.productName}] ❌ Errore check:`, error.message);
            this.errors.push({
                timestamp: new Date(),
                error: error.message
            });

            // Mantieni solo ultimi 10 errori
            if (this.errors.length > 10) {
                this.errors = this.errors.slice(-10);
            }
        }
    }

    /**
     * Callback quando prodotto diventa disponibile
     */
    async onAvailable(data) {
        console.log(`[${this.productName}] 🎉 PRODOTTO DISPONIBILE!`);
        
        // Invia notifica Discord
        await this.sendDiscordNotification(data);
        
        // Aggiorna database
        await this.updateDatabase('available', data);
    }

    /**
     * Invia notifica Discord
     */
    async sendDiscordNotification(data) {
        try {
            // Carica webhook dal localStorage dell'utente (verrà gestito tramite API)
            const webhook = this.config.discordWebhook;
            
            if (!webhook) {
                console.log(`[${this.productName}] ⚠️ Webhook Discord non configurato`);
                return;
            }

            const embed = {
                title: `🚨 ${this.productName} DISPONIBILE!`,
                url: this.productUrl,
                color: 0x10b981, // verde
                fields: [],
                thumbnail: data.image ? { url: data.image } : undefined,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'Shappa Monitor System'
                }
            };

            // Aggiungi campi dinamici
            if (data.price) {
                embed.fields.push({
                    name: '💰 Prezzo',
                    value: data.price,
                    inline: true
                });
            }

            if (data.stock) {
                embed.fields.push({
                    name: '📦 Stock',
                    value: data.stock,
                    inline: true
                });
            }

            if (data.variants) {
                embed.fields.push({
                    name: '🎨 Varianti',
                    value: data.variants,
                    inline: true
                });
            }

            embed.fields.push({
                name: '🔗 Link Diretto',
                value: `[Acquista ora](${this.productUrl})`,
                inline: false
            });

            // Aggiungi bottoni per interagire con l'alert
            const components = [{
                type: 1, // ACTION_ROW
                components: [
                    {
                        type: 2, // BUTTON
                        style: 3, // SUCCESS (green)
                        label: 'Vedi Prodotto',
                        custom_id: `view_product:${this.productId || this.interestId}`,
                        emoji: { name: '🔗' }
                    },
                    {
                        type: 2, // BUTTON
                        style: 4, // DANGER (red)
                        label: 'Ferma Monitor',
                        custom_id: `stop_monitor:${this.interestId || this.productId}`,
                        emoji: { name: '🛑' }
                    }
                ]
            }];

            await axios.post(webhook, {
                content: `<@${this.userId}> ALERT!`,
                embeds: [embed],
                components
            });

            console.log(`[${this.productName}] ✅ Notifica Discord inviata`);

        } catch (error) {
            console.error(`[${this.productName}] ❌ Errore invio Discord:`, error.message);
        }
    }

    /**
     * Aggiorna database
     */
    async updateDatabase(status, data) {
        // Placeholder - verrà implementato nel MonitorManager
        console.log(`[${this.productName}] 💾 Update DB: ${status}`, data);
    }

    /**
     * Fetch HTML con headers custom
     */
    async fetchHTML(url) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            ...this.parseCustomHeaders()
        };

        const response = await axios.get(url, {
            headers,
            timeout: 15000,
            maxRedirects: 5
        });

        return response.data;
    }

    /**
     * Fetch JSON API
     */
    async fetchJSON(url) {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            ...this.parseCustomHeaders()
        };

        const response = await axios.get(url, {
            headers,
            timeout: 10000
        });

        return response.data;
    }

    /**
     * Parse custom headers dalle note
     */
    parseCustomHeaders() {
        if (!this.notes) return {};

        const headers = {};
        const lines = this.notes.split('\n');

        for (const line of lines) {
            const match = line.match(/^([^:]+):\s*(.+)$/);
            if (match) {
                headers[match[1].trim()] = match[2].trim();
            }
        }

        return headers;
    }

    /**
     * Estrae selettore CSS
     */
    extractWithSelector(html, selector) {
        const $ = cheerio.load(html);
        return $(selector);
    }

    /**
     * Ottiene statistiche monitor
     */
    getStats() {
        return {
            productName: this.productName,
            isRunning: this.isRunning,
            checksCount: this.checksCount,
            lastCheck: this.lastCheck,
            lastStatus: this.lastStatus,
            interval: this.interval,
            errors: this.errors.length,
            uptime: this.lastCheck ? Date.now() - this.lastCheck.getTime() : 0
        };
    }

    /**
     * FUTURO: Acquisto automatico
     * Ogni modulo implementerà la sua logica ATC + checkout
     */
    async autoCheckout(userProfile) {
        throw new Error('autoCheckout() not implemented yet - coming soon!');
    }
}

module.exports = MonitorBase;
