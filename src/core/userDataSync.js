/**
 * ========================================
 * USER DATA SYNC MANAGER
 * ========================================
 * Sistema per sincronizzare tutti i dati utente dal server
 * Garantisce che i dati siano sempre sincronizzati tra dispositivi
 */

class UserDataSyncManager {
    constructor() {
        this.isSyncing = false;
        this.lastSyncTime = null;
        this.syncListeners = [];
    }

    /**
     * Sincronizza TUTTI i dati utente dal server
     * Chiamato automaticamente dopo il login
     */
    async syncAllUserData(userId) {
        if (this.isSyncing) {
            console.log('⏳ Sync già in corso, skip...');
            return;
        }

        this.isSyncing = true;
        console.log('🔄 Starting full user data sync for:', userId);

        try {
            if (!window.DataManager) {
                console.warn('⚠️ DataManager not available');
                return;
            }

            // Sincronizza tutti i dati in parallelo
            const syncResults = await Promise.allSettled([
                this.syncInterests(userId),
                this.syncSportProfile(userId),
                this.syncAutomations(userId),
                this.syncWebhook(userId)
            ]);

            // Log risultati
            syncResults.forEach((result, index) => {
                const names = ['Interests', 'Sport Profile', 'Automations', 'Webhook'];
                if (result.status === 'fulfilled') {
                    console.log(`✅ ${names[index]} synced`);
                } else {
                    console.warn(`⚠️ ${names[index]} sync failed:`, result.reason);
                }
            });

            this.lastSyncTime = new Date().toISOString();
            console.log('✅ Full user data sync completed');

            // Notifica listener
            this.notifySyncComplete();

        } catch (error) {
            console.error('❌ Error during full sync:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    async syncInterests(userId) {
        if (!window.DataManager) return;
        return await window.DataManager.getInterests();
    }

    async syncSportProfile(userId) {
        if (!window.DataManager) return;
        return await window.DataManager.getSportProfile();
    }

    async syncAutomations(userId) {
        if (!window.DataManager) return;
        return await Promise.all([
            window.DataManager.getSportAutomations(),
            window.DataManager.getHabitSettings()
        ]);
    }

    async syncWebhook(userId) {
        try {
            const response = await fetch(`https://shapiro.ninja/api/webhooks/${userId}`);
            const data = await response.json();
            return data.success ? data.webhook : null;
        } catch (error) {
            console.warn('Webhook sync failed:', error);
            return null;
        }
    }

    /**
     * Aggiungi listener per quando la sincronizzazione è completata
     */
    onSyncComplete(callback) {
        this.syncListeners.push(callback);
    }

    notifySyncComplete() {
        this.syncListeners.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Sync listener error:', error);
            }
        });
    }

    /**
     * Forza una nuova sincronizzazione
     */
    async forceSync(userId) {
        console.log('🔄 Force sync requested');
        this.lastSyncTime = null;
        return await this.syncAllUserData(userId);
    }
}

// Crea istanza globale
window.UserDataSyncManager = new UserDataSyncManager();

console.log('✅ UserDataSyncManager loaded');

