/**
 * EvolutionSystem - Sistema di evoluzione personaggio
 * Da ragazzo normale a dio
 */

// Evolution stages (da ragazzo a dio)
const EVOLUTION_STAGES = [
    { id: 'human', name: 'Umano', multiplier: 1.0, stage: 1, icon: '👤' },
    { id: 'trained', name: 'Allenato', multiplier: 1.5, stage: 2, icon: '💪' },
    { id: 'warrior', name: 'Guerriero', multiplier: 2.0, stage: 3, icon: '⚔️' },
    { id: 'master', name: 'Maestro', multiplier: 3.0, stage: 4, icon: '🥷' },
    { id: 'superhuman', name: 'Superumano', multiplier: 5.0, stage: 5, icon: '🦸' },
    { id: 'super_saiyan', name: 'Super Saiyan', multiplier: 10.0, stage: 6, icon: '💥' },
    { id: 'super_saiyan_2', name: 'Super Saiyan 2', multiplier: 20.0, stage: 7, icon: '⚡' },
    { id: 'super_saiyan_3', name: 'Super Saiyan 3', multiplier: 50.0, stage: 8, icon: '🔥' },
    { id: 'god', name: 'Dio', multiplier: 100.0, stage: 9, icon: '👑' }
];

function getEvolutionForStage(stage) {
    const evolutionIndex = Math.min(Math.floor((stage - 1) / 2), EVOLUTION_STAGES.length - 1);
    return EVOLUTION_STAGES[evolutionIndex];
}

function getEvolutionData(evolutionId) {
    return EVOLUTION_STAGES.find(ev => ev.id === evolutionId) || EVOLUTION_STAGES[0];
}

function applyEvolutionMultiplier(stats, evolutionId) {
    const evolution = getEvolutionData(evolutionId);
    return {
        health: Math.floor(stats.health * evolution.multiplier),
        maxHealth: Math.floor(stats.maxHealth * evolution.multiplier),
        attack: Math.floor(stats.attack * evolution.multiplier),
        defense: Math.floor(stats.defense * evolution.multiplier),
        speed: Math.floor(stats.speed * evolution.multiplier)
    };
}

// Make functions globally available
window.getEvolutionForStage = getEvolutionForStage;
window.getEvolutionData = getEvolutionData;
window.applyEvolutionMultiplier = applyEvolutionMultiplier;

