/**
 * UserProfileAgent - Agente di Memorizzazione e Unione Dati Utente
 * 
 * Responsabile di:
 * - Unificare tutti i dati utente in un profilo unico
 * - Monitorare salvataggi dati da tutte le pagine
 * - Mantenere coerenza tra dati sparsi
 * - Fornire profilo utente unificato per altre funzioni
 * - Verificare e validare dati utente
 * - Sincronizzare dati tra diverse fonti
 * 
 * Questo è l'agente più importante per il sistema H24
 */

const AgentBase = require('../base/AgentBase');
const fs = require('fs');
const path = require('path');

class UserProfileAgent extends AgentBase {
    constructor(config = {}) {
        super('UserProfileAgent', {
            priority: 10, // Priorità massima
            ...config
        });

        this.capabilities = [
            'unify_user_data',
            'get_unified_profile',
            'update_user_profile',
            'monitor_data_changes',
            'verify_user_data',
            'sync_user_data',
            'merge_user_data',
            'get_user_data_history'
        ];

        // Directory per profili unificati
        this.profilesDir = path.join(__dirname, '../../data/user-profiles');
        this.ensureProfilesDir();

        // Cache profili in memoria per accesso rapido
        this.profileCache = new Map();
        
        // Monitoraggio cambiamenti
        this.changeListeners = new Map(); // userId -> Set of listeners
        this.dataHistory = new Map(); // userId -> Array of changes
        
        // Verifica continua
        this.verificationInterval = null;
        this.verificationIntervalMs = config.verificationIntervalMs || 60000; // 1 minuto default
    }

    /**
     * Assicura che la directory profili esista
     */
    ensureProfilesDir() {
        if (!fs.existsSync(this.profilesDir)) {
            fs.mkdirSync(this.profilesDir, { recursive: true });
        }
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const profileTasks = [
            'unify_user_data',
            'get_unified_profile',
            'update_user_profile',
            'monitor_data_changes',
            'verify_user_data',
            'sync_user_data',
            'merge_user_data',
            'get_user_data_history',
            'save_user_data',
            'load_user_data'
        ];

        return profileTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'unify_user_data':
                return await this.unifyUserData(task);
            
            case 'get_unified_profile':
                return await this.getUnifiedProfile(task);
            
            case 'update_user_profile':
                return await this.updateUserProfile(task);
            
            case 'monitor_data_changes':
                return await this.monitorDataChanges(task);
            
            case 'verify_user_data':
                return await this.verifyUserData(task);
            
            case 'sync_user_data':
                return await this.syncUserData(task);
            
            case 'merge_user_data':
                return await this.mergeUserData(task);
            
            case 'get_user_data_history':
                return await this.getUserDataHistory(task);
            
            case 'save_user_data':
                return await this.saveUserData(task);
            
            case 'load_user_data':
                return await this.loadUserData(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Unifica tutti i dati utente da diverse fonti in un profilo unico
     */
    async unifyUserData(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        try {
            // Carica dati da tutte le fonti
            const unifiedData = {
                userId,
                account: await this.loadAccountData(userId),
                sport: await this.loadSportData(userId),
                interests: await this.loadInterestsData(userId),
                automations: await this.loadAutomationsData(userId),
                webhooks: await this.loadWebhooksData(userId),
                ebay: await this.loadEbayData(userId),
                diet: await this.loadDietData(userId),
                monitors: await this.loadMonitorsData(userId),
                metadata: {
                    lastUnified: new Date().toISOString(),
                    version: '2.0',
                    sources: []
                }
            };

            // Salva profilo unificato
            const profilePath = path.join(this.profilesDir, `${userId}_unified.json`);
            fs.writeFileSync(profilePath, JSON.stringify(unifiedData, null, 2), 'utf8');
            
            // Aggiorna cache
            this.profileCache.set(userId, unifiedData);
            
            // Notifica altri agenti del cambiamento
            this.notifyDataChange('userProfileUnified', { userId, data: unifiedData }, null);
            
            // Log nella history
            this.logDataChange(userId, 'unified', unifiedData);

            this.emit('userProfileUnified', { userId, data: unifiedData });
            
            return {
                success: true,
                userId,
                data: unifiedData,
                cached: true
            };
        } catch (error) {
            throw new Error(`Failed to unify user data: ${error.message}`);
        }
    }

    /**
     * Ottiene profilo unificato (da cache o file)
     */
    async getUnifiedProfile(task) {
        const { userId, forceRefresh = false } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        // Controlla cache
        if (!forceRefresh && this.profileCache.has(userId)) {
            return {
                success: true,
                userId,
                data: this.profileCache.get(userId),
                fromCache: true
            };
        }

        // Carica da file
        const profilePath = path.join(this.profilesDir, `${userId}_unified.json`);
        if (fs.existsSync(profilePath)) {
            const data = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
            this.profileCache.set(userId, data);
            return {
                success: true,
                userId,
                data,
                fromCache: false
            };
        }

        // Se non esiste, unifica
        return await this.unifyUserData({ userId });
    }

    /**
     * Aggiorna profilo utente con nuovi dati
     */
    async updateUserProfile(task) {
        const { userId, data, source } = task;
        
        if (!userId || !data) {
            throw new Error('userId and data required');
        }

        try {
            // Carica profilo esistente
            const existingProfile = await this.getUnifiedProfile({ userId });
            const currentData = existingProfile.data || {};

            // Merge dati
            const updatedData = {
                ...currentData,
                ...data,
                metadata: {
                    ...currentData.metadata,
                    lastUpdated: new Date().toISOString(),
                    updatedBy: source || 'unknown',
                    sources: [...(currentData.metadata?.sources || []), source].filter(Boolean)
                }
            };

            // Salva
            const profilePath = path.join(this.profilesDir, `${userId}_unified.json`);
            fs.writeFileSync(profilePath, JSON.stringify(updatedData, null, 2), 'utf8');
            
            // Aggiorna cache
            this.profileCache.set(userId, updatedData);
            
            // Notifica altri agenti
            this.notifyDataChange('userProfileUpdated', { userId, data: updatedData, source }, null);
            
            // Log nella history
            this.logDataChange(userId, 'updated', { source, changes: data });

            this.emit('userProfileUpdated', { userId, data: updatedData, source });
            
            return {
                success: true,
                userId,
                data: updatedData
            };
        } catch (error) {
            throw new Error(`Failed to update user profile: ${error.message}`);
        }
    }

    /**
     * Monitora cambiamenti dati e aggiorna profilo automaticamente
     */
    async monitorDataChanges(task) {
        const { userId, dataType, data, source } = task;
        
        // Aggiorna profilo quando rileva cambiamenti
        const updateData = {};
        updateData[dataType] = data;
        
        return await this.updateUserProfile({
            userId,
            data: updateData,
            source: source || `monitor_${dataType}`
        });
    }

    /**
     * Verifica coerenza e validità dati utente
     */
    async verifyUserData(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const profile = await this.getUnifiedProfile({ userId });
        const data = profile.data;
        
        const issues = [];
        const warnings = [];

        // Verifica account
        if (!data.account || !data.account.username) {
            issues.push('Account data missing');
        }

        // Verifica coerenza sport/interests
        if (data.sport && data.interests) {
            // Logica di verifica
        }

        // Verifica webhooks
        if (data.webhooks) {
            // Validazione webhook URLs
        }

        return {
            success: true,
            userId,
            verified: issues.length === 0,
            issues,
            warnings,
            data
        };
    }

    /**
     * Sincronizza dati utente da tutte le fonti
     */
    async syncUserData(task) {
        const { userId } = task;
        return await this.unifyUserData({ userId });
    }

    /**
     * Merge dati da più fonti
     */
    async mergeUserData(task) {
        const { userId, dataSources } = task;
        
        if (!userId || !dataSources) {
            throw new Error('userId and dataSources required');
        }

        const mergedData = {};

        for (const source of dataSources) {
            const sourceData = await this.loadDataFromSource(userId, source);
            Object.assign(mergedData, sourceData);
        }

        return await this.updateUserProfile({
            userId,
            data: mergedData,
            source: 'merge'
        });
    }

    /**
     * Ottiene history cambiamenti dati utente
     */
    getUserDataHistory(task) {
        const { userId, limit = 50 } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const history = this.dataHistory.get(userId) || [];
        return {
            success: true,
            userId,
            history: history.slice(-limit),
            total: history.length
        };
    }

    /**
     * Salva dati utente (wrapper per monitorDataChanges)
     */
    async saveUserData(task) {
        const { userId, dataType, data, source } = task;
        return await this.monitorDataChanges({ userId, dataType, data, source });
    }

    /**
     * Carica dati utente (wrapper per getUnifiedProfile)
     */
    async loadUserData(task) {
        return await this.getUnifiedProfile(task);
    }

    // ========== HELPER METHODS - Carica dati da diverse fonti ==========

    async loadAccountData(userId) {
        try {
            const accountsPath = path.join(__dirname, '../../data/accounts.json');
            if (fs.existsSync(accountsPath)) {
                const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
                return accounts.find(a => a.id === userId || a.username === userId) || null;
            }
        } catch (error) {
            console.error(`Error loading account data for ${userId}:`, error);
        }
        return null;
    }

    async loadSportData(userId) {
        try {
            const sportPath = path.join(__dirname, '../../data/sport', `${userId}_profile.json`);
            if (fs.existsSync(sportPath)) {
                return JSON.parse(fs.readFileSync(sportPath, 'utf8'));
            }
        } catch (error) {
            console.error(`Error loading sport data for ${userId}:`, error);
        }
        return null;
    }

    async loadInterestsData(userId) {
        try {
            const interestsPath = path.join(__dirname, '../../data/interests', `${userId}.json`);
            if (fs.existsSync(interestsPath)) {
                return JSON.parse(fs.readFileSync(interestsPath, 'utf8'));
            }
        } catch (error) {
            console.error(`Error loading interests data for ${userId}:`, error);
        }
        return null;
    }

    async loadAutomationsData(userId) {
        try {
            const automationsPath = path.join(__dirname, '../../data/automations', `${userId}.json`);
            if (fs.existsSync(automationsPath)) {
                return JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
            }
        } catch (error) {
            console.error(`Error loading automations data for ${userId}:`, error);
        }
        return null;
    }

    async loadWebhooksData(userId) {
        try {
            // Prova nuovo formato prima
            let webhookPath = path.join(__dirname, '../../data/webhooks', `webhook_${userId}.json`);
            if (!fs.existsSync(webhookPath)) {
                webhookPath = path.join(__dirname, '../../data/webhooks', `${userId}.json`);
            }
            if (fs.existsSync(webhookPath)) {
                return JSON.parse(fs.readFileSync(webhookPath, 'utf8'));
            }
        } catch (error) {
            console.error(`Error loading webhooks data for ${userId}:`, error);
        }
        return null;
    }

    async loadEbayData(userId) {
        try {
            const ebayPath = path.join(__dirname, '../../data/ebay', `${userId}_tokens.json`);
            if (fs.existsSync(ebayPath)) {
                return JSON.parse(fs.readFileSync(ebayPath, 'utf8'));
            }
        } catch (error) {
            console.error(`Error loading ebay data for ${userId}:`, error);
        }
        return null;
    }

    async loadDietData(userId) {
        try {
            // Usa MongoDB invece di file system (online-first)
            const { getMongoDB } = require('../../lib/db/mongodb');
            const mongoDB = getMongoDB();
            
            const dietData = await mongoDB.findOne('diet_data', { userId });
            if (dietData) {
                // Rimuovi _id e userId (metadati MongoDB)
                const { _id, userId: _, ...data } = dietData;
                return data;
            }
        } catch (error) {
            console.error(`Error loading diet data for ${userId}:`, error);
        }
        return null;
    }

    async loadMonitorsData(userId) {
        try {
            const monitorsPath = path.join(__dirname, '../../data/monitors', `${userId}.json`);
            if (fs.existsSync(monitorsPath)) {
                return JSON.parse(fs.readFileSync(monitorsPath, 'utf8'));
            }
        } catch (error) {
            console.error(`Error loading monitors data for ${userId}:`, error);
        }
        return null;
    }

    async loadDataFromSource(userId, source) {
        switch (source) {
            case 'account':
                return { account: await this.loadAccountData(userId) };
            case 'sport':
                return { sport: await this.loadSportData(userId) };
            case 'interests':
                return { interests: await this.loadInterestsData(userId) };
            case 'automations':
                return { automations: await this.loadAutomationsData(userId) };
            case 'webhooks':
                return { webhooks: await this.loadWebhooksData(userId) };
            case 'ebay':
                return { ebay: await this.loadEbayData(userId) };
            case 'diet':
                return { diet: await this.loadDietData(userId) };
            case 'monitors':
                return { monitors: await this.loadMonitorsData(userId) };
            default:
                return {};
        }
    }

    /**
     * Log cambiamento dati nella history
     */
    logDataChange(userId, action, data) {
        if (!this.dataHistory.has(userId)) {
            this.dataHistory.set(userId, []);
        }

        const history = this.dataHistory.get(userId);
        history.push({
            action,
            data,
            timestamp: new Date().toISOString()
        });

        // Mantieni solo ultimi 100 cambiamenti
        if (history.length > 100) {
            history.shift();
        }
    }

    /**
     * Avvia verifica continua (H24)
     */
    startContinuousVerification() {
        if (this.verificationInterval) {
            clearInterval(this.verificationInterval);
        }

        this.verificationInterval = setInterval(async () => {
            await this.performContinuousVerification();
        }, this.verificationIntervalMs);

        console.log('🔄 UserProfileAgent: Continuous verification started (H24)');
    }

    /**
     * Esegue verifica continua
     */
    async performContinuousVerification() {
        try {
            // Ottieni tutti i profili salvati
            const profileFiles = fs.readdirSync(this.profilesDir)
                .filter(f => f.endsWith('_unified.json'));

            for (const file of profileFiles) {
                const userId = file.replace('_unified.json', '');
                
                // Verifica coerenza dati
                const verification = await this.verifyUserData({ userId });
                
                if (!verification.verified && verification.issues.length > 0) {
                    // Notifica altri agenti di problemi
                    this.notifyDataChange('userDataIssues', {
                        userId,
                        issues: verification.issues
                    }, null);
                }

                // Sincronizza se necessario
                if (verification.warnings.length > 0) {
                    await this.syncUserData({ userId });
                }
            }
        } catch (error) {
            console.error('Error in continuous verification:', error);
        }
    }

    /**
     * Ferma verifica continua
     */
    stopContinuousVerification() {
        if (this.verificationInterval) {
            clearInterval(this.verificationInterval);
            this.verificationInterval = null;
        }
        console.log('🔄 UserProfileAgent: Continuous verification stopped');
    }

    /**
     * Override: quando l'agente viene registrato, avvia verifica continua
     */
    onRegistered() {
        this.startContinuousVerification();
    }

    /**
     * Override: quando l'agente viene fermato, ferma verifica
     */
    onStopped() {
        this.stopContinuousVerification();
    }
}

module.exports = UserProfileAgent;

