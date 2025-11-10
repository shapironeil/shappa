/**
 * IntegrationAgent - Gestisce integrazioni esterne
 * 
 * Responsabile di:
 * - Gestire integrazione eBay (OAuth, API)
 * - Gestire integrazione Amazon (scraping, API)
 * - Gestire webhook Discord
 * - Gestire token e autenticazioni esterne
 */

const AgentBase = require('../base/AgentBase');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class IntegrationAgent extends AgentBase {
    constructor(config = {}) {
        super('IntegrationAgent', {
            priority: 7,
            ...config
        });

        this.capabilities = [
            'ebay_oauth',
            'ebay_refresh_token',
            'ebay_get_status',
            'ebay_create_listing',
            'amazon_search',
            'amazon_get_product',
            'discord_send_webhook',
            'manage_webhooks'
        ];

        this.dataDir = path.join(__dirname, '../../data');
        this.ebayTokensDir = path.join(this.dataDir, 'ebay');
        this.webhooksDir = path.join(this.dataDir, 'webhooks');
        this.ensureDirectories();
    }

    /**
     * Assicura che le directory esistano
     */
    ensureDirectories() {
        [this.ebayTokensDir, this.webhooksDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const integrationTasks = [
            'ebay_oauth',
            'ebay_refresh_token',
            'ebay_get_status',
            'ebay_create_listing',
            'ebay_test_connection',
            'amazon_search',
            'amazon_get_product',
            'amazon_scrape',
            'discord_send_webhook',
            'manage_webhooks',
            'save_webhook',
            'get_webhook'
        ];

        return integrationTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'ebay_oauth':
                return await this.handleEbayOAuth(task);
            
            case 'ebay_refresh_token':
                return await this.refreshEbayToken(task);
            
            case 'ebay_get_status':
                return await this.getEbayStatus(task);
            
            case 'ebay_create_listing':
                return await this.createEbayListing(task);
            
            case 'ebay_test_connection':
                return await this.testEbayConnection(task);
            
            case 'amazon_search':
                return await this.searchAmazon(task);
            
            case 'amazon_get_product':
                return await this.getAmazonProduct(task);
            
            case 'amazon_scrape':
                return await this.scrapeAmazon(task);
            
            case 'discord_send_webhook':
                return await this.sendDiscordWebhook(task);
            
            case 'manage_webhooks':
                return await this.manageWebhooks(task);
            
            case 'save_webhook':
                return await this.saveWebhook(task);
            
            case 'get_webhook':
                return await this.getWebhook(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Gestisce OAuth eBay
     */
    async handleEbayOAuth(task) {
        // Questo è un placeholder - l'OAuth viene gestito dal server
        // L'agente può essere usato per verificare lo stato o refresh token
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const tokenPath = path.join(this.ebayTokensDir, userId, 'tokens.json');
        
        if (!fs.existsSync(tokenPath)) {
            return {
                success: false,
                connected: false,
                message: 'No eBay tokens found'
            };
        }

        const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        
        return {
            success: true,
            connected: true,
            tokens: {
                expiresAt: tokens.expiresAt,
                scope: tokens.scope
            }
        };
    }

    /**
     * Refresh token eBay
     */
    async refreshEbayToken(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        // Questo dovrebbe chiamare l'endpoint del server per refresh
        // Per ora, ritorna lo stato
        return await this.getEbayStatus({ userId });
    }

    /**
     * Ottiene stato connessione eBay
     */
    async getEbayStatus(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const tokenPath = path.join(this.ebayTokensDir, userId, 'tokens.json');
        
        if (!fs.existsSync(tokenPath)) {
            return {
                success: true,
                connected: false
            };
        }

        const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        const expiresAt = tokens.expiresAt ? new Date(tokens.expiresAt).getTime() : 0;
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
        
        return {
            success: true,
            connected: true,
            expiresAt: tokens.expiresAt,
            secondsLeft,
            scope: tokens.scope
        };
    }

    /**
     * Crea listing eBay
     */
    async createEbayListing(task) {
        const { userId, listingData } = task;
        
        if (!userId || !listingData) {
            throw new Error('userId and listingData required');
        }

        // Verifica che l'utente sia connesso a eBay
        const status = await this.getEbayStatus({ userId });
        if (!status.connected) {
            throw new Error('User not connected to eBay');
        }

        // Questo dovrebbe chiamare l'API eBay reale
        // Per ora, emetti evento per delegare al server
        this.emit('ebayListingRequested', { userId, listingData });
        
        return {
            success: true,
            message: 'eBay listing creation requested',
            userId
        };
    }

    /**
     * Testa connessione eBay
     */
    async testEbayConnection(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const status = await this.getEbayStatus({ userId });
        
        return {
            success: status.connected,
            connected: status.connected,
            message: status.connected ? 'Connected to eBay' : 'Not connected to eBay'
        };
    }

    /**
     * Cerca prodotti Amazon
     */
    async searchAmazon(task) {
        const { query, country, limit } = task;
        
        if (!query) {
            throw new Error('query required');
        }

        // Questo dovrebbe chiamare l'endpoint del server per ricerca Amazon
        this.emit('amazonSearchRequested', { query, country, limit });
        
        return {
            success: true,
            message: 'Amazon search requested',
            query
        };
    }

    /**
     * Ottiene prodotto Amazon
     */
    async getAmazonProduct(task) {
        const { asin, country } = task;
        
        if (!asin) {
            throw new Error('asin required');
        }

        // Questo dovrebbe chiamare l'endpoint del server per prodotto Amazon
        this.emit('amazonProductRequested', { asin, country });
        
        return {
            success: true,
            message: 'Amazon product requested',
            asin
        };
    }

    /**
     * Scraping Amazon
     */
    async scrapeAmazon(task) {
        const { url, asin, country } = task;
        
        if (!url && !asin) {
            throw new Error('url or asin required');
        }

        // Questo dovrebbe chiamare l'endpoint del server per scraping
        this.emit('amazonScrapeRequested', { url, asin, country });
        
        return {
            success: true,
            message: 'Amazon scrape requested'
        };
    }

    /**
     * Invia webhook Discord
     */
    async sendDiscordWebhook(task) {
        const { userId, webhookUrl, message, embeds } = task;
        
        if (!webhookUrl) {
            // Prova a recuperare il webhook dell'utente
            const webhook = await this.getWebhook({ userId });
            if (!webhook || !webhook.url) {
                throw new Error('webhookUrl required or user webhook not found');
            }
            webhookUrl = webhook.url;
        }

        try {
            const payload = {
                content: message || null,
                embeds: embeds || []
            };

            const response = await axios.post(webhookUrl, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            this.emit('discordWebhookSent', { userId, success: true });
            
            return {
                success: true,
                message: 'Discord webhook sent successfully'
            };
        } catch (error) {
            this.emit('discordWebhookFailed', { userId, error: error.message });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Gestisce webhook
     */
    async manageWebhooks(task) {
        const { userId, action, webhookData } = task;
        
        if (!userId || !action) {
            throw new Error('userId and action required');
        }

        switch (action) {
            case 'save':
                return await this.saveWebhook({ userId, webhookData });
            
            case 'get':
                return await this.getWebhook({ userId });
            
            case 'delete':
                return await this.deleteWebhook({ userId });
            
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    /**
     * Salva webhook
     */
    async saveWebhook(task) {
        const { userId, webhookData } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const webhookPath = path.join(this.webhooksDir, `webhook_${userId}.json`);
        const dataToSave = {
            userId,
            url: webhookData.url,
            createdAt: new Date().toISOString(),
            lastUsed: null
        };

        fs.writeFileSync(webhookPath, JSON.stringify(dataToSave, null, 2));
        
        this.emit('webhookSaved', { userId, webhookData });
        
        return {
            success: true,
            message: 'Webhook saved successfully',
            userId
        };
    }

    /**
     * Ottiene webhook
     */
    async getWebhook(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const webhookPath = path.join(this.webhooksDir, `webhook_${userId}.json`);
        
        if (!fs.existsSync(webhookPath)) {
            return {
                success: true,
                webhook: null,
                message: 'No webhook found'
            };
        }

        const data = JSON.parse(fs.readFileSync(webhookPath, 'utf8'));
        
        return {
            success: true,
            webhook: data
        };
    }

    /**
     * Elimina webhook
     */
    async deleteWebhook(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const webhookPath = path.join(this.webhooksDir, `webhook_${userId}.json`);
        
        if (fs.existsSync(webhookPath)) {
            fs.unlinkSync(webhookPath);
            this.emit('webhookDeleted', { userId });
            
            return {
                success: true,
                message: 'Webhook deleted successfully'
            };
        }
        
        return {
            success: false,
            message: 'Webhook not found'
        };
    }
}

module.exports = IntegrationAgent;

