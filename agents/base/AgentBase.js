/**
 * AgentBase - Classe base per tutti gli agenti AI
 * 
 * Ogni agente estende questa classe e implementa:
 * - processTask(): processa un task specifico
 * - canHandle(): determina se può gestire un task
 * - getCapabilities(): ritorna le capacità dell'agente
 */

const EventEmitter = require('events');

class AgentBase extends EventEmitter {
    constructor(name, config = {}) {
        super();
        this.name = name;
        this.config = config;
        this.status = 'idle'; // idle, processing, error
        this.tasksProcessed = 0;
        this.errors = [];
        this.capabilities = [];
        this.priority = config.priority || 5; // 1-10, 10 = highest priority
    }

    /**
     * Metodo astratto - deve essere implementato da ogni agente
     * Processa un task e ritorna un risultato
     */
    async processTask(task) {
        throw new Error(`processTask() must be implemented by ${this.name}`);
    }

    /**
     * Metodo astratto - determina se l'agente può gestire un task
     */
    canHandle(task) {
        throw new Error(`canHandle() must be implemented by ${this.name}`);
    }

    /**
     * Ritorna le capacità dell'agente
     */
    getCapabilities() {
        return this.capabilities;
    }

    /**
     * Esegue un task con gestione errori
     */
    async execute(task) {
        this.status = 'processing';
        this.tasksProcessed++;
        
        try {
            const result = await this.processTask(task);
            this.status = 'idle';
            this.emit('taskCompleted', { agent: this.name, task, result });
            return { success: true, agent: this.name, result };
        } catch (error) {
            this.status = 'error';
            this.errors.push({
                timestamp: new Date(),
                task,
                error: error.message,
                stack: error.stack
            });
            
            // Mantieni solo ultimi 50 errori
            if (this.errors.length > 50) {
                this.errors = this.errors.slice(-50);
            }
            
            this.emit('taskFailed', { agent: this.name, task, error });
            return { success: false, agent: this.name, error: error.message };
        }
    }

    /**
     * Ottiene statistiche dell'agente
     */
    getStats() {
        return {
            name: this.name,
            status: this.status,
            tasksProcessed: this.tasksProcessed,
            errors: this.errors.length,
            capabilities: this.capabilities,
            priority: this.priority,
            lastError: this.errors.length > 0 ? this.errors[this.errors.length - 1] : null
        };
    }

    /**
     * Reset statistiche
     */
    resetStats() {
        this.tasksProcessed = 0;
        this.errors = [];
        this.status = 'idle';
    }

    /**
     * Valuta la priorità di un task per questo agente
     */
    evaluatePriority(task) {
        // Default: ritorna la priorità dell'agente
        // Gli agenti possono sovrascrivere questo metodo
        return this.priority;
    }
}

module.exports = AgentBase;

