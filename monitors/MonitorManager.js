/**
 * MonitorManager - Gestisce tutti i monitor attivi
 * 
 * Responsabile di:
 * - Avviare/fermare monitor
 * - Tenere traccia monitor attivi
 * - Caricare configurazioni da database
 */

const ShopifyMonitor = require('./ShopifyMonitor');
const fs = require('fs').promises;
const path = require('path');

class MonitorManager {
    constructor() {
        this.activeMonitors = new Map(); // monitorId -> monitor instance
        this.dataDir = path.join(__dirname, '../data/interests');
    }

    /**
     * Crea e avvia un monitor
     */
    async startMonitor(interestData, userId) {
        const monitorId = interestData.id;

        // Se già attivo, skip
        if (this.activeMonitors.has(monitorId)) {
            console.log(`[Manager] Monitor ${monitorId} già attivo`);
            return { success: false, message: 'Monitor già attivo' };
        }

        try {
            // Carica webhook Discord dell'utente
            const discordWebhook = await this.loadUserWebhook(userId);

            // Crea config per monitor
            const config = {
                id: monitorId,
                name: interestData.name,
                url: interestData.url,
                interval: interestData.interval || 5,
                userId: userId,
                discordWebhook: discordWebhook
            };

            // Determina tipo monitor e crea istanza
            let monitor;
            const module = interestData.module || 'shopify';

            if (module === 'shopify') {
                monitor = new ShopifyMonitor(config);
            } else {
                throw new Error(`Modulo ${module} non ancora implementato`);
            }

            // Avvia monitor
            await monitor.start();

            // Salva in memoria
            this.activeMonitors.set(monitorId, monitor);

            console.log(`[Manager] ✅ Monitor ${monitorId} avviato con successo`);
            return { success: true, monitorId };

        } catch (error) {
            console.error(`[Manager] ❌ Errore avvio monitor:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Ferma un monitor
     */
    stopMonitor(monitorId) {
        const monitor = this.activeMonitors.get(monitorId);
        
        if (!monitor) {
            console.log(`[Manager] Monitor ${monitorId} non trovato`);
            return { success: false, message: 'Monitor non trovato' };
        }

        monitor.stop();
        this.activeMonitors.delete(monitorId);

        console.log(`[Manager] ✅ Monitor ${monitorId} fermato`);
        return { success: true };
    }

    /**
     * Ferma tutti i monitor di un utente
     */
    stopUserMonitors(userId) {
        let stopped = 0;
        
        for (const [monitorId, monitor] of this.activeMonitors.entries()) {
            if (monitor.userId === userId) {
                monitor.stop();
                this.activeMonitors.delete(monitorId);
                stopped++;
            }
        }

        console.log(`[Manager] Fermati ${stopped} monitor per user ${userId}`);
        return { success: true, stopped };
    }

    /**
     * Carica tutti i monitor attivi al boot del server
     */
    async loadAllMonitors() {
        console.log(`[Manager] 🔄 Caricamento monitor attivi...`);

        try {
            // Leggi tutti i file interests
            const files = await fs.readdir(this.dataDir);
            let totalLoaded = 0;

            for (const file of files) {
                if (!file.startsWith('interests_') || !file.endsWith('.json')) {
                    continue;
                }

                const userId = file.replace('interests_', '').replace('.json', '');
                const filePath = path.join(this.dataDir, file);
                const content = await fs.readFile(filePath, 'utf8');
                const interests = JSON.parse(content);

                // Avvia solo monitor "releasing" con status "active"
                const activeMonitors = interests.filter(i => 
                    i.type === 'releasing' && 
                    (i.status === 'active' || i.status === 'monitoring')
                );

                for (const interest of activeMonitors) {
                    await this.startMonitor(interest, userId);
                    totalLoaded++;
                }
            }

            console.log(`[Manager] ✅ Caricati ${totalLoaded} monitor attivi`);
            return { success: true, loaded: totalLoaded };

        } catch (error) {
            console.error(`[Manager] ❌ Errore caricamento monitor:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Carica webhook Discord dell'utente
     */
    async loadUserWebhook(userId) {
        try {
            // TODO: implementare storage webhook in database
            // Per ora ritorna null, verrà gestito dal frontend
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Ottiene statistiche di tutti i monitor
     */
    getStats() {
        const stats = [];
        
        for (const [monitorId, monitor] of this.activeMonitors.entries()) {
            stats.push({
                monitorId,
                ...monitor.getStats()
            });
        }

        return {
            total: stats.length,
            monitors: stats
        };
    }

    /**
     * Ottiene monitor di un utente
     */
    getUserMonitors(userId) {
        const monitors = [];
        
        for (const [monitorId, monitor] of this.activeMonitors.entries()) {
            if (monitor.userId === userId) {
                monitors.push({
                    monitorId,
                    ...monitor.getStats()
                });
            }
        }

        return monitors;
    }
}

// Singleton
const monitorManager = new MonitorManager();

module.exports = monitorManager;
