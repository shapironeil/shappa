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
    }

    /**
     * Registra un agente
     */
    registerAgent(agent) {
        if (!agent || !agent.name) {
            throw new Error('Agent must have a name');
        }

        this.agents.set(agent.name, agent);
        
        // Ascolta eventi dall'agente
        agent.on('taskCompleted', (data) => {
            this.emit('agentTaskCompleted', data);
            this.onTaskCompleted(data);
        });
        
        agent.on('taskFailed', (data) => {
            this.emit('agentTaskFailed', data);
            this.onTaskFailed(data);
        });

        console.log(`✅ Agent registered: ${agent.name} (capabilities: ${agent.getCapabilities().join(', ')})`);
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
            recentTasks: this.taskHistory.slice(-10)
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

