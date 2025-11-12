/**
 * PathSystem - Sistema di generazione percorsi e nemici
 */

// Equipment progression (da matita a lanciafiamme)
const EQUIPMENT_PROGRESSION = [
    { id: 'pencil', name: 'Matita', icon: '✏️', attack: 1, stage: 1 },
    { id: 'stick', name: 'Bastone', icon: '🪵', attack: 2, stage: 2 },
    { id: 'knife', name: 'Coltello', icon: '🔪', attack: 5, stage: 3 },
    { id: 'brass_knuckles', name: 'Tirapugni', icon: '👊', attack: 8, stage: 4 },
    { id: 'sword', name: 'Spada', icon: '⚔️', attack: 12, stage: 5 },
    { id: 'katana', name: 'Katana', icon: '🗡️', attack: 18, stage: 6 },
    { id: 'axe', name: 'Ascia', icon: '🪓', attack: 25, stage: 7 },
    { id: 'flamethrower', name: 'Lanciafiamme', icon: '🔥', attack: 50, stage: 8 }
];

// Evolution stages (da ragazzo a dio)
const EVOLUTION_STAGES = [
    { id: 'human', name: 'Umano', multiplier: 1.0, stage: 1 },
    { id: 'trained', name: 'Allenato', multiplier: 1.5, stage: 2 },
    { id: 'warrior', name: 'Guerriero', multiplier: 2.0, stage: 3 },
    { id: 'master', name: 'Maestro', multiplier: 3.0, stage: 4 },
    { id: 'superhuman', name: 'Superumano', multiplier: 5.0, stage: 5 },
    { id: 'super_saiyan', name: 'Super Saiyan', multiplier: 10.0, stage: 6 },
    { id: 'super_saiyan_2', name: 'Super Saiyan 2', multiplier: 20.0, stage: 7 },
    { id: 'super_saiyan_3', name: 'Super Saiyan 3', multiplier: 50.0, stage: 8 },
    { id: 'god', name: 'Dio', multiplier: 100.0, stage: 9 }
];

// Enemy types
const ENEMY_TYPES = [
    { name: 'Bullo', icon: '👨', gender: 'male', baseHealth: 50, baseAttack: 5 },
    { name: 'Lottatore', icon: '🥷', gender: 'male', baseHealth: 80, baseAttack: 10 },
    { name: 'Gangster', icon: '🕴️', gender: 'male', baseHealth: 100, baseAttack: 15 },
    { name: 'Ninja', icon: '🥷', gender: 'male', baseHealth: 120, baseAttack: 20 },
    { name: 'Samurai', icon: '⚔️', gender: 'male', baseHealth: 150, baseAttack: 25 },
    { name: 'Ragazza Combattente', icon: '👩', gender: 'female', baseHealth: 70, baseAttack: 12 },
    { name: 'Assassina', icon: '🗡️', gender: 'female', baseHealth: 90, baseAttack: 18 },
    { name: 'Guerriera', icon: '⚔️', gender: 'female', baseHealth: 110, baseAttack: 22 }
];

// Weapons
const WEAPONS = [
    { name: 'Nessuna', icon: '👊', attack: 0 },
    { name: 'Coltello', icon: '🔪', attack: 5 },
    { name: 'Tirapugni', icon: '👊', attack: 8 },
    { name: 'Spada', icon: '⚔️', attack: 12 },
    { name: 'Katana', icon: '🗡️', attack: 18 },
    { name: 'Ascia', icon: '🪓', attack: 25 },
    { name: 'Pistola', icon: '🔫', attack: 30 },
    { name: 'Lanciafiamme', icon: '🔥', attack: 50 }
];

function getAvailableEquipment(stage) {
    return EQUIPMENT_PROGRESSION.filter(eq => eq.stage <= stage);
}

function getEquipmentData(equipmentId) {
    return EQUIPMENT_PROGRESSION.find(eq => eq.id === equipmentId) || EQUIPMENT_PROGRESSION[0];
}

function getEvolutionForStage(stage) {
    const evolutionIndex = Math.min(Math.floor(stage / 2), EVOLUTION_STAGES.length - 1);
    return EVOLUTION_STAGES[evolutionIndex];
}

function generateEnemiesForStage(stage) {
    const enemies = [];
    const stageMultiplier = 1 + (stage - 1) * 0.3;
    
    // Generate 2 random enemies
    for (let i = 0; i < 2; i++) {
        const enemyType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
        const weapon = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
        
        const enemy = {
            id: `enemy_${stage}_${i}`,
            name: enemyType.name,
            icon: enemyType.icon,
            gender: enemyType.gender,
            health: Math.floor(enemyType.baseHealth * stageMultiplier),
            maxHealth: Math.floor(enemyType.baseHealth * stageMultiplier),
            attack: Math.floor(enemyType.baseAttack * stageMultiplier),
            defense: Math.floor(5 * stageMultiplier),
            weapon: weapon.name,
            weaponIcon: weapon.icon,
            weaponAttack: weapon.attack,
            stage: stage
        };
        
        enemies.push(enemy);
    }
    
    return enemies;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getAvailableEquipment,
        getEquipmentData,
        getEvolutionForStage,
        generateEnemiesForStage,
        EQUIPMENT_PROGRESSION,
        EVOLUTION_STAGES
    };
}

