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

/**
 * Inizializza il sistema di agenti
 */
function initializeAgents(config = {}) {
    const coordinator = getCoordinator();

    // Registra tutti gli agenti
    const agents = [
        new MonitorAgent(config.monitor),
        new SportAgent(config.sport),
        new AutomationAgent(config.automation),
        new IntegrationAgent(config.integration),
        new FigmaAgent(config.figma),
        new FrontendAgent(config.frontend),
        new DataAgent(config.data),
        new SecurityAgent(config.security),
        new NotificationAgent(config.notification),
        new RecipeAgent(config.recipe)
    ];

    // Registra agenti nel coordinatore
    agents.forEach(agent => {
        coordinator.registerAgent(agent);
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
    RecipeAgent
};

