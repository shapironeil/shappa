/**
 * MonitorAgent - Gestisce monitoraggi prodotti
 * 
 * Responsabile di:
 * - Avviare/fermare monitoraggi
 * - Monitorare cambiamenti prezzi/disponibilità
 * - Gestire notifiche per prodotti disponibili
 * - Coordinare con MonitorManager
 */

const AgentBase = require('../base/AgentBase');
const monitorManager = require('../../monitors/MonitorManager');

class MonitorAgent extends AgentBase {
    constructor(config = {}) {
        super('MonitorAgent', {
            priority: 8, // Alta priorità per monitoraggi
            ...config
        });

        this.capabilities = [
            'start_monitor',
            'stop_monitor',
            'check_monitor_status',
            'get_monitor_stats',
            'handle_price_change',
            'handle_availability_change'
        ];
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const monitorTasks = [
            'start_monitor',
            'stop_monitor',
            'check_monitor_status',
            'get_monitor_stats',
            'price_change',
            'availability_change',
            'monitor_product',
            'stop_user_monitors'
        ];

        return monitorTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'start_monitor':
                return await this.startMonitor(task);
            
            case 'stop_monitor':
                return await this.stopMonitor(task);
            
            case 'check_monitor_status':
                return await this.checkMonitorStatus(task);
            
            case 'get_monitor_stats':
                return await this.getMonitorStats(task);
            
            case 'price_change':
            case 'availability_change':
                return await this.handleChange(task);
            
            case 'monitor_product':
                return await this.monitorProduct(task);
            
            case 'stop_user_monitors':
                return await this.stopUserMonitors(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Avvia un monitor
     */
    async startMonitor(task) {
        const { interestData, userId } = task;
        
        if (!interestData || !userId) {
            throw new Error('interestData and userId required');
        }

        const result = await monitorManager.startMonitor(interestData, userId);
        
        if (result.success) {
            this.emit('monitorStarted', { monitorId: result.monitorId, userId });
        }
        
        return result;
    }

    /**
     * Ferma un monitor
     */
    async stopMonitor(task) {
        const { monitorId } = task;
        
        if (!monitorId) {
            throw new Error('monitorId required');
        }

        const result = monitorManager.stopMonitor(monitorId);
        
        if (result.success) {
            this.emit('monitorStopped', { monitorId });
        }
        
        return result;
    }

    /**
     * Ferma tutti i monitor di un utente
     */
    async stopUserMonitors(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const result = monitorManager.stopUserMonitors(userId);
        
        if (result.success) {
            this.emit('userMonitorsStopped', { userId, stopped: result.stopped });
        }
        
        return result;
    }

    /**
     * Controlla lo stato di un monitor
     */
    async checkMonitorStatus(task) {
        const { monitorId } = task;
        
        if (!monitorId) {
            throw new Error('monitorId required');
        }

        const stats = monitorManager.getStats();
        const monitor = stats.monitors.find(m => m.monitorId === monitorId);
        
        return {
            success: true,
            monitor: monitor || null,
            exists: !!monitor
        };
    }

    /**
     * Ottiene statistiche di tutti i monitor
     */
    async getMonitorStats(task) {
        const { userId } = task;
        
        if (userId) {
            // Statistiche per un utente specifico
            const monitors = monitorManager.getUserMonitors(userId);
            return {
                success: true,
                userId,
                monitors,
                count: monitors.length
            };
        } else {
            // Statistiche globali
            const stats = monitorManager.getStats();
            return {
                success: true,
                stats
            };
        }
    }

    /**
     * Gestisce cambiamenti (prezzo/disponibilità)
     */
    async handleChange(task) {
        const { monitorId, changeType, oldValue, newValue, data } = task;
        
        console.log(`[MonitorAgent] Change detected: ${changeType} for monitor ${monitorId}`);
        
        // Emetti evento per notifiche
        this.emit('monitorChange', {
            monitorId,
            changeType,
            oldValue,
            newValue,
            data,
            timestamp: new Date()
        });
        
        return {
            success: true,
            monitorId,
            changeType,
            handled: true
        };
    }

    /**
     * Monitora un prodotto (task combinato)
     */
    async monitorProduct(task) {
        const { product, userId, options = {} } = task;
        
        if (!product || !userId) {
            throw new Error('product and userId required');
        }

        // Crea interestData se necessario
        const interestData = {
            id: product.id || `monitor_${Date.now()}`,
            name: product.name || product.title,
            url: product.url,
            type: 'releasing',
            status: 'active',
            interval: options.interval || 5,
            module: options.module || 'universal'
        };

        // Avvia monitor
        return await this.startMonitor({ interestData, userId });
    }

    /**
     * Valuta priorità - i monitoraggi sono prioritari
     */
    evaluatePriority(task) {
        if (task.type === 'availability_change' || task.type === 'price_change') {
            return 10; // Massima priorità per cambiamenti
        }
        return this.priority;
    }
}

module.exports = MonitorAgent;

