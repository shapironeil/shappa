/**
 * Coordinator - Coordina tutti gli agenti AI
 * 
 * Responsabile di:
 * - Distribuire task agli agenti appropriati
 * - Gestire la comunicazione tra agenti
 * - Monitorare lo stato degli agenti
 * - Gestire conflitti e priorità
 */

const EventEmitter = require('events');
const path = require('path');

class Coordinator extends EventEmitter {
    constructor() {
        super();
        this.agents = new Map(); // agentName -> agent instance
        this.taskQueue = [];
        this.processingTasks = new Set();
        this.maxConcurrentTasks = 10;
        this.taskHistory = [];
        this.maxHistorySize = 1000;
        
        // Comunicazione inter-agente
        this.communicationLog = []; // Log di tutte le comunicazioni
        this.maxCommunicationLogSize = 500;
        this.eventSubscriptions = new Map(); // eventType -> Set of agent names
        this.heartbeatInterval = null;
        this.heartbeatIntervalMs = 30000; // 30 secondi
        this.agentLastHeartbeat = new Map(); // agentName -> lastHeartbeat timestamp
        
        // Avvia heartbeat system
        this.startHeartbeat();
    }

    /**
     * Registra un agente
     */
    registerAgent(agent) {
        if (!agent || !agent.name) {
            throw new Error('Agent must have a name');
        }

        this.agents.set(agent.name, agent);
        this.agentLastHeartbeat.set(agent.name, Date.now());
        
        // Ascolta eventi dall'agente
        agent.on('taskCompleted', (data) => {
            this.emit('agentTaskCompleted', data);
            this.onTaskCompleted(data);
            this.logCommunication('taskCompleted', agent.name, data);
        });
        
        agent.on('taskFailed', (data) => {
            this.emit('agentTaskFailed', data);
            this.onTaskFailed(data);
            this.logCommunication('taskFailed', agent.name, data);
        });

        // Ascolta eventi di comunicazione dall'agente
        agent.on('agentCommunication', (data) => {
            this.handleAgentCommunication(agent.name, data);
        });

        // Ascolta eventi di verifica dati
        agent.on('dataVerification', (data) => {
            this.handleDataVerification(agent.name, data);
        });

        // Se l'agente ha un metodo per ricevere comunicazioni, registralo
        if (typeof agent.onCommunication === 'function') {
            // L'agente può ricevere comunicazioni via questo metodo
            this.on(`broadcast:${agent.name}`, (message) => {
                agent.onCommunication(message);
            });
        }

        console.log(`✅ Agent registered: ${agent.name} (capabilities: ${agent.getCapabilities().join(', ')})`);
        this.broadcast('agentRegistered', { agentName: agent.name, capabilities: agent.getCapabilities() });
    }

    /**
     * Rimuove un agente
     */
    unregisterAgent(agentName) {
        const agent = this.agents.get(agentName);
        if (agent) {
            agent.removeAllListeners();
            this.agents.delete(agentName);
            console.log(`🗑️ Agent unregistered: ${agentName}`);
        }
    }

    /**
     * Trova agenti che possono gestire un task
     */
    findAgentsForTask(task) {
        const capableAgents = [];
        
        for (const [name, agent] of this.agents.entries()) {
            try {
                if (agent.canHandle(task)) {
                    const priority = agent.evaluatePriority(task);
                    capableAgents.push({ agent, priority, name });
                }
            } catch (error) {
                console.error(`Error checking agent ${name} for task:`, error);
            }
        }
        
        // Ordina per priorità (più alta = prima)
        capableAgents.sort((a, b) => b.priority - a.priority);
        
        return capableAgents;
    }

    /**
     * Assegna un task a un agente
     */
    async assignTask(task, preferredAgent = null) {
        // Se un agente preferito è specificato, prova quello prima
        if (preferredAgent && this.agents.has(preferredAgent)) {
            const agent = this.agents.get(preferredAgent);
            if (agent.canHandle(task)) {
                return await agent.execute(task);
            }
        }

        // Trova agenti capaci
        const capableAgents = this.findAgentsForTask(task);
        
        if (capableAgents.length === 0) {
            throw new Error(`No agent can handle task: ${JSON.stringify(task)}`);
        }

        // Usa l'agente con priorità più alta
        const { agent } = capableAgents[0];
        
        return await agent.execute(task);
    }

    /**
     * Aggiunge un task alla coda
     */
    async queueTask(task, preferredAgent = null) {
        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const queuedTask = {
            id: taskId,
            task,
            preferredAgent,
            queuedAt: new Date(),
            status: 'queued'
        };

        this.taskQueue.push(queuedTask);
        this.emit('taskQueued', queuedTask);

        // Processa la coda
        this.processQueue();

        return taskId;
    }

    /**
     * Processa la coda dei task
     */
    async processQueue() {
        // Evita troppi task concorrenti
        if (this.processingTasks.size >= this.maxConcurrentTasks) {
            return;
        }

        // Processa task in coda
        while (this.taskQueue.length > 0 && this.processingTasks.size < this.maxConcurrentTasks) {
            const queuedTask = this.taskQueue.shift();
            if (!queuedTask) break;

            this.processingTasks.add(queuedTask.id);
            queuedTask.status = 'processing';

            // Esegui task in background
            this.assignTask(queuedTask.task, queuedTask.preferredAgent)
                .then(result => {
                    queuedTask.status = 'completed';
                    queuedTask.result = result;
                    queuedTask.completedAt = new Date();
                    this.addToHistory(queuedTask);
                })
                .catch(error => {
                    queuedTask.status = 'failed';
                    queuedTask.error = error.message;
                    queuedTask.completedAt = new Date();
                    this.addToHistory(queuedTask);
                })
                .finally(() => {
                    this.processingTasks.delete(queuedTask.id);
                    this.emit('taskProcessed', queuedTask);
                    // Continua a processare la coda
                    this.processQueue();
                });
        }
    }

    /**
     * Aggiunge un task alla cronologia
     */
    addToHistory(task) {
        this.taskHistory.push(task);
        
        // Mantieni solo ultimi N task
        if (this.taskHistory.length > this.maxHistorySize) {
            this.taskHistory = this.taskHistory.slice(-this.maxHistorySize);
        }
    }

    /**
     * Callback quando un task è completato
     */
    onTaskCompleted(data) {
        console.log(`✅ Task completed by ${data.agent}:`, data.task.type);
    }

    /**
     * Callback quando un task fallisce
     */
    onTaskFailed(data) {
        console.error(`❌ Task failed by ${data.agent}:`, data.error);
    }

    /**
     * Ottiene statistiche del coordinatore
     */
    getStats() {
        const agentStats = {};
        for (const [name, agent] of this.agents.entries()) {
            agentStats[name] = agent.getStats();
        }

        return {
            agents: Object.keys(agentStats).length,
            agentStats,
            queueSize: this.taskQueue.length,
            processingTasks: this.processingTasks.size,
            taskHistorySize: this.taskHistory.length,
            recentTasks: this.taskHistory.slice(-10),
            communicationStats: this.getCommunicationStats(),
            heartbeatStatus: this.getHeartbeatStatus()
        };
    }

    /**
     * Ottiene lo stato di un agente specifico
     */
    getAgentStatus(agentName) {
        const agent = this.agents.get(agentName);
        return agent ? agent.getStats() : null;
    }

    /**
     * Ottiene tutti gli agenti
     */
    getAgents() {
        return Array.from(this.agents.values());
    }

    /**
     * Comunica con un agente specifico
     */
    async communicateWithAgent(agentName, message) {
        const agent = this.agents.get(agentName);
        if (!agent) {
            throw new Error(`Agent ${agentName} not found`);
        }

        // Se l'agente ha un metodo communicate, usalo
        if (typeof agent.communicate === 'function') {
            return await agent.communicate(message);
        }

        // Altrimenti, crea un task di comunicazione
        return await this.assignTask({
            type: 'communication',
            agent: agentName,
            message
        }, agentName);
    }

    /**
     * Coordina più agenti per un task complesso
     */
    async coordinateTask(task) {
        // Trova tutti gli agenti coinvolti
        const involvedAgents = this.findAgentsForTask(task);
        
        if (involvedAgents.length === 0) {
            throw new Error('No agents can handle this coordinated task');
        }

        // Se c'è un solo agente, esegui normalmente
        if (involvedAgents.length === 1) {
            return await this.assignTask(task);
        }

        // Altrimenti, coordina tra più agenti
        // Questo è un esempio semplice - può essere esteso per task più complessi
        const results = [];
        for (const { agent } of involvedAgents) {
            try {
                const result = await agent.execute(task);
                results.push(result);
            } catch (error) {
                console.error(`Agent ${agent.name} failed:`, error);
            }
        }

        return {
            success: results.some(r => r.success),
            results,
            agents: involvedAgents.map(a => a.name)
        };
    }

    /**
     * Broadcast messaggio a tutti gli agenti
     */
    broadcast(eventType, data, excludeAgent = null) {
        const message = {
            eventType,
            data,
            timestamp: new Date().toISOString(),
            source: 'coordinator'
        };

        this.logCommunication('broadcast', 'coordinator', message);

        // Emetti evento globale
        this.emit('broadcast', message);
        this.emit(`broadcast:${eventType}`, message);

        // Invia a tutti gli agenti (tranne quello escluso)
        for (const [name, agent] of this.agents.entries()) {
            if (excludeAgent && name === excludeAgent) continue;

            // Se l'agente ha un metodo onCommunication, usalo
            if (typeof agent.onCommunication === 'function') {
                try {
                    agent.onCommunication(message);
                } catch (error) {
                    console.error(`Error sending broadcast to ${name}:`, error);
                }
            }

            // Emetti evento specifico per l'agente
            this.emit(`broadcast:${name}`, message);
        }

        return { success: true, recipients: this.agents.size - (excludeAgent ? 1 : 0) };
    }

    /**
     * Iscrivi un agente a un tipo di evento
     */
    subscribe(agentName, eventType) {
        if (!this.eventSubscriptions.has(eventType)) {
            this.eventSubscriptions.set(eventType, new Set());
        }
        this.eventSubscriptions.get(eventType).add(agentName);
        this.logCommunication('subscribe', agentName, { eventType });
    }

    /**
     * Disiscrivi un agente da un tipo di evento
     */
    unsubscribe(agentName, eventType) {
        if (this.eventSubscriptions.has(eventType)) {
            this.eventSubscriptions.get(eventType).delete(agentName);
        }
        this.logCommunication('unsubscribe', agentName, { eventType });
    }

    /**
     * Log comunicazione
     */
    logCommunication(type, agentName, data) {
        const logEntry = {
            type,
            agentName,
            data,
            timestamp: new Date().toISOString()
        };

        this.communicationLog.push(logEntry);

        // Mantieni solo ultimi N log
        if (this.communicationLog.length > this.maxCommunicationLogSize) {
            this.communicationLog = this.communicationLog.slice(-this.maxCommunicationLogSize);
        }

        // Emetti evento per logging esterno
        this.emit('communication', logEntry);
    }

    /**
     * Ottieni log comunicazioni
     */
    getCommunicationLog(limit = 100) {
        return this.communicationLog.slice(-limit);
    }

    /**
     * Gestisci comunicazione da agente
     */
    handleAgentCommunication(agentName, data) {
        this.logCommunication('agentCommunication', agentName, data);
        
        // Se la comunicazione è per un altro agente, inoltra
        if (data.targetAgent) {
            const targetAgent = this.agents.get(data.targetAgent);
            if (targetAgent && typeof targetAgent.onCommunication === 'function') {
                targetAgent.onCommunication({
                    eventType: 'agentCommunication',
                    data: data.message || data,
                    source: agentName,
                    timestamp: new Date().toISOString()
                });
            }
        } else {
            // Broadcast a tutti gli agenti interessati
            this.broadcast('agentCommunication', { from: agentName, message: data.message || data });
        }
    }

    /**
     * Gestisci verifica dati da agente
     */
    handleDataVerification(agentName, data) {
        this.logCommunication('dataVerification', agentName, data);
        
        // Verifica dati condivisi con altri agenti
        if (data.dataType && data.verifyWith) {
            const verifyWithAgents = Array.isArray(data.verifyWith) ? data.verifyWith : [data.verifyWith];
            
            for (const otherAgentName of verifyWithAgents) {
                const otherAgent = this.agents.get(otherAgentName);
                if (otherAgent && typeof otherAgent.verifyData === 'function') {
                    otherAgent.verifyData(data.dataType, data.data, agentName);
                }
            }
        }

        // Emetti evento per altri agenti interessati
        this.emit('dataVerification', { agent: agentName, data });
    }

    /**
     * Avvia sistema heartbeat
     */
    startHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            this.performHeartbeat();
        }, this.heartbeatIntervalMs);

        console.log('💓 Heartbeat system started');
    }

    /**
     * Ferma sistema heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        console.log('💓 Heartbeat system stopped');
    }

    /**
     * Esegui heartbeat check
     */
    async performHeartbeat() {
        const now = Date.now();
        const heartbeatResults = {};

        // Invia heartbeat a tutti gli agenti
        for (const [name, agent] of this.agents.entries()) {
            try {
                // Se l'agente ha un metodo heartbeat, chiamalo
                if (typeof agent.heartbeat === 'function') {
                    const result = await agent.heartbeat();
                    heartbeatResults[name] = { status: 'ok', result, timestamp: now };
                    this.agentLastHeartbeat.set(name, now);
                } else {
                    // Altrimenti, verifica solo che l'agente risponda
                    const stats = agent.getStats();
                    heartbeatResults[name] = { status: stats.status, timestamp: now };
                    this.agentLastHeartbeat.set(name, now);
                }

                // Broadcast stato agente
                this.broadcast('agentHeartbeat', { agentName: name, status: heartbeatResults[name].status }, name);
            } catch (error) {
                heartbeatResults[name] = { status: 'error', error: error.message, timestamp: now };
                console.error(`Heartbeat failed for ${name}:`, error);
            }
        }

        // Verifica agenti non rispondenti
        const timeout = 60000; // 60 secondi
        for (const [name, lastHeartbeat] of this.agentLastHeartbeat.entries()) {
            if (now - lastHeartbeat > timeout) {
                console.warn(`⚠️ Agent ${name} has not responded for ${Math.round((now - lastHeartbeat) / 1000)}s`);
                this.broadcast('agentTimeout', { agentName: name, lastHeartbeat }, name);
            }
        }

        this.emit('heartbeat', heartbeatResults);
    }

    /**
     * Ottieni stato heartbeat
     */
    getHeartbeatStatus() {
        const now = Date.now();
        const status = {};

        for (const [name, lastHeartbeat] of this.agentLastHeartbeat.entries()) {
            const timeSinceLastHeartbeat = now - lastHeartbeat;
            status[name] = {
                lastHeartbeat: new Date(lastHeartbeat).toISOString(),
                timeSinceLastHeartbeat,
                isAlive: timeSinceLastHeartbeat < 60000 // 60 secondi
            };
        }

        return status;
    }

    /**
     * Verifica dati condivisi tra agenti
     */
    async verifySharedData(dataType, data) {
        const verificationResults = {};
        
        // Chiedi a tutti gli agenti di verificare i dati
        for (const [name, agent] of this.agents.entries()) {
            if (typeof agent.verifyData === 'function') {
                try {
                    const result = await agent.verifyData(dataType, data);
                    verificationResults[name] = { status: 'ok', result };
                } catch (error) {
                    verificationResults[name] = { status: 'error', error: error.message };
                }
            }
        }

        this.logCommunication('dataVerification', 'coordinator', { dataType, verificationResults });
        return verificationResults;
    }

    /**
     * Ottieni statistiche comunicazioni
     */
    getCommunicationStats() {
        const statsByAgent = {};
        const statsByType = {};

        for (const log of this.communicationLog) {
            // Stats per agente
            if (!statsByAgent[log.agentName]) {
                statsByAgent[log.agentName] = { count: 0, types: {} };
            }
            statsByAgent[log.agentName].count++;
            statsByAgent[log.agentName].types[log.type] = (statsByAgent[log.agentName].types[log.type] || 0) + 1;

            // Stats per tipo
            statsByType[log.type] = (statsByType[log.type] || 0) + 1;
        }

        return {
            totalCommunications: this.communicationLog.length,
            statsByAgent,
            statsByType,
            subscriptions: Object.fromEntries(
                Array.from(this.eventSubscriptions.entries()).map(([eventType, agents]) => [
                    eventType,
                    Array.from(agents)
                ])
            ),
            heartbeatStatus: this.getHeartbeatStatus()
        };
    }
}

// Singleton
let coordinatorInstance = null;

function getCoordinator() {
    if (!coordinatorInstance) {
        coordinatorInstance = new Coordinator();
    }
    return coordinatorInstance;
}

module.exports = { Coordinator, getCoordinator };

