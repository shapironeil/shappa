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
        this.coordinator = null; // Riferimento al coordinator per comunicazione inter-agente
    }

    /**
     * Imposta il riferimento al coordinator
     */
    setCoordinator(coordinator) {
        this.coordinator = coordinator;
        
        // Ascolta eventi broadcast dal coordinator
        if (coordinator) {
            coordinator.on('broadcast', (message) => {
                this.onCommunication(message);
            });
            
            // Ascolta eventi specifici per questo agente
            coordinator.on(`broadcast:${this.name}`, (message) => {
                this.onCommunication(message);
            });
        }
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

    /**
     * Metodo per ricevere comunicazioni da altri agenti
     * Gli agenti possono sovrascrivere questo metodo per gestire comunicazioni specifiche
     */
    onCommunication(message) {
        // Default: log silenzioso, non emettere evento per evitare loop
        // Gli agenti che vogliono reagire a comunicazioni devono sovrascrivere questo metodo
        // Solo per debug: console.log(`[${this.name}] Received:`, message);
    }

    /**
     * Metodo per comunicare con altri agenti
     * Gli agenti possono usare questo metodo per inviare messaggi ad altri agenti
     */
    communicate(targetAgent, message) {
        const communication = {
            from: this.name,
            targetAgent,
            message,
            timestamp: new Date().toISOString()
        };

        // Emetti evento per il coordinator
        this.emit('agentCommunication', communication);

        // Se il coordinator è disponibile, usalo per inoltrare
        if (this.coordinator && typeof this.coordinator.handleAgentCommunication === 'function') {
            this.coordinator.handleAgentCommunication(this.name, communication);
        }

        return communication;
    }

    /**
     * Metodo per heartbeat
     * Gli agenti possono sovrascrivere questo metodo per implementare heartbeat specifico
     */
    async heartbeat() {
        // Default: ritorna stats dell'agente
        return {
            status: this.status,
            tasksProcessed: this.tasksProcessed,
            errors: this.errors.length,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Metodo per verificare dati condivisi
     * Gli agenti possono sovrascrivere questo metodo per verificare dati specifici
     */
    async verifyData(dataType, data, sourceAgent = null) {
        // Default: verifica base
        this.emit('dataVerification', {
            agent: this.name,
            dataType,
            data,
            sourceAgent,
            timestamp: new Date().toISOString()
        });

        return {
            verified: true,
            agent: this.name,
            dataType,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Metodo per notificare altri agenti di cambiamenti dati
     */
    notifyDataChange(dataType, data, targetAgents = null) {
        const notification = {
            from: this.name,
            dataType,
            data,
            targetAgents,
            timestamp: new Date().toISOString()
        };

        // Emetti evento per il coordinator
        this.emit('dataVerification', notification);

        return notification;
    }
}

module.exports = AgentBase;

