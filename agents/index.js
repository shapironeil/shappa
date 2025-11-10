/**
 * Agent AI Committee System
 * 
 * Questo file inizializza e registra tutti gli agenti nel Coordinator
 */

const { getCoordinator } = require('./coordinator/Coordinator');
const MonitorAgent = require('./monitor/MonitorAgent');
const SportAgent = require('./sport/SportAgent');
const AutomationAgent = require('./automation/AutomationAgent');
const IntegrationAgent = require('./integration/IntegrationAgent');
const FigmaAgent = require('./figma/FigmaAgent');
const FrontendAgent = require('./frontend/FrontendAgent');
const DataAgent = require('./data/DataAgent');
const SecurityAgent = require('./security/SecurityAgent');
const NotificationAgent = require('./notification/NotificationAgent');
const RecipeAgent = require('./recipe/RecipeAgent');
const UserProfileAgent = require('./userprofile/UserProfileAgent');
const AIAgent = require('./ai/AIAgent');

/**
 * Inizializza il sistema di agenti
 */
function initializeAgents(config = {}) {
    const coordinator = getCoordinator();

    // Registra tutti gli agenti
    // IMPORTANTE: UserProfileAgent ha priorità massima (10) - deve essere registrato per primo
    const agents = [
        new UserProfileAgent(config.userProfile), // Priorità massima - unifica tutti i dati utente
        new MonitorAgent(config.monitor),
        new SportAgent(config.sport),
        new AutomationAgent(config.automation),
        new IntegrationAgent(config.integration),
        new FigmaAgent(config.figma),
        new FrontendAgent(config.frontend),
        new DataAgent(config.data),
        new SecurityAgent(config.security),
        new NotificationAgent(config.notification),
        new RecipeAgent(config.recipe),
        new AIAgent(config.ai)
    ];

    // Registra agenti nel coordinatore e passa riferimento al coordinator per comunicazione
    agents.forEach(agent => {
        // Passa riferimento al coordinator agli agenti per comunicazione inter-agente
        if (typeof agent.setCoordinator === 'function') {
            agent.setCoordinator(coordinator);
        }
        coordinator.registerAgent(agent);
        
        // Avvia verifica continua se l'agente lo supporta
        if (typeof agent.onRegistered === 'function') {
            agent.onRegistered();
        }
    });

    console.log(`✅ Agent AI Committee System initialized with ${agents.length} agents`);

    return {
        coordinator,
        agents
    };
}

/**
 * Ottiene il coordinatore
 */
function getAgentCoordinator() {
    return getCoordinator();
}

module.exports = {
    initializeAgents,
    getAgentCoordinator,
    // Esporta agenti per uso diretto se necessario
    MonitorAgent,
    SportAgent,
    AutomationAgent,
    IntegrationAgent,
    FigmaAgent,
    FrontendAgent,
    DataAgent,
    SecurityAgent,
    NotificationAgent,
    RecipeAgent,
    UserProfileAgent,
    AIAgent
};

