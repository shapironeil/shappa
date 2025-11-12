/**
 * FightinSimulation - Main Entry Point
 * Gestisce il menu principale e l'avvio del gioco
 */

let gameEngine = null;
let currentMode = null;
let gameState = {
    gender: null,
    equipment: null,
    currentStage: 1,
    evolution: 'human', // human -> superhuman -> super_saiyan -> god
    playerStats: null
};

// Start game with selected mode
function startGame(mode) {
    console.log('🎮 Starting game in mode:', mode);
    
    if (mode === 'story') {
        // Show gender selection
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('gender-selection').classList.remove('hidden');
    } else if (mode === 'simulation') {
        // Direct to simulation mode
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-canvas-container').classList.remove('hidden');
        
        const canvas = document.getElementById('game-canvas');
        gameEngine = new GameEngine(canvas);
        currentMode = new SimulationMode(gameEngine);
        currentMode.start();
    }
}

// Select gender
function selectGender(gender) {
    gameState.gender = gender;
    console.log('Selected gender:', gender);
    
    // Show equipment selection
    document.getElementById('gender-selection').classList.add('hidden');
    showEquipmentSelection();
}

// Show equipment selection
function showEquipmentSelection() {
    const equipmentScreen = document.getElementById('equipment-selection');
    const subtitle = document.getElementById('equipment-subtitle');
    const grid = document.getElementById('equipment-grid');
    
    // Get available equipment based on stage
    const availableEquipment = getAvailableEquipment(gameState.currentStage);
    
    subtitle.textContent = `Stage ${gameState.currentStage} - Scegli il tuo equipaggiamento`;
    
    grid.innerHTML = availableEquipment.map(eq => `
        <div class="equipment-item" onclick="selectEquipment('${eq.id}')">
            <div class="equipment-icon">${eq.icon}</div>
            <div class="equipment-name">${eq.name}</div>
            <div class="equipment-stats">+${eq.attack} Attacco</div>
        </div>
    `).join('');
    
    equipmentScreen.classList.remove('hidden');
}

// Select equipment
function selectEquipment(equipmentId) {
    const equipment = getEquipmentData(equipmentId);
    gameState.equipment = equipment;
    console.log('Selected equipment:', equipment);
    
    // Update player stats
    if (!gameState.playerStats) {
        gameState.playerStats = {
            health: 100,
            maxHealth: 100,
            attack: 10,
            defense: 5,
            speed: 8
        };
    }
    
    gameState.playerStats.attack += equipment.attack || 0;
    
    // Start the game - show path selection
    document.getElementById('equipment-selection').classList.add('hidden');
    showPathSelection();
}

// Show path selection (choose enemy)
function showPathSelection() {
    const pathScreen = document.getElementById('path-selection');
    const container = document.getElementById('path-container');
    const stageLabel = document.getElementById('current-stage');
    
    stageLabel.textContent = gameState.currentStage;
    
    // Generate two random enemies for this path
    const enemies = generateEnemiesForStage(gameState.currentStage);
    
    container.innerHTML = enemies.map((enemy, index) => `
        <div class="path-option" onclick="selectEnemy(${index})">
            <div class="enemy-preview" id="enemy-preview-${index}">
                ${enemy.icon}
            </div>
            <div class="enemy-info">
                <div class="enemy-name">${enemy.name}</div>
                <div class="enemy-details">
                    <div class="enemy-weapon">
                        <span>${enemy.weaponIcon}</span>
                        <span>${enemy.weapon}</span>
                    </div>
                    <div>${enemy.gender === 'male' ? '👨 Maschio' : '👩 Femmina'}</div>
                    <div>HP: ${enemy.health}</div>
                </div>
            </div>
            <button class="view-btn" onclick="viewEnemy3D(${index}, event)">Visualizza 3D</button>
        </div>
    `).join('');
    
    // Store enemies for later use
    window.currentEnemies = enemies;
    
    pathScreen.classList.remove('hidden');
}

// View enemy in 3D
function viewEnemy3D(enemyIndex, event) {
    event.stopPropagation();
    
    const enemy = window.currentEnemies[enemyIndex];
    console.log('Viewing enemy in 3D:', enemy);
    
    // Show 3D viewer
    const viewer = document.getElementById('game-canvas-container');
    viewer.classList.remove('hidden');
    
    // Initialize 3D scene if not already done
    if (!gameEngine) {
        const canvas = document.getElementById('game-canvas');
        gameEngine = new GameEngine(canvas);
    }
    
    // Load enemy model (placeholder for now)
    loadEnemyModel(enemy);
}

// Close 3D viewer
function close3DViewer() {
    document.getElementById('game-canvas-container').classList.add('hidden');
}

// Select enemy to fight
function selectEnemy(enemyIndex) {
    const enemy = window.currentEnemies[enemyIndex];
    console.log('Selected enemy:', enemy);
    
    // Hide path selection
    document.getElementById('path-selection').classList.add('hidden');
    
    // Start combat
    startCombat(enemy);
}

// Start combat
function startCombat(enemy) {
    const combatScreen = document.getElementById('combat-screen');
    combatScreen.classList.remove('hidden');
    
    // Initialize turn-based combat
    if (!window.combatSystem) {
        window.combatSystem = new TurnBasedCombatSystem();
    }
    
    window.combatSystem.startCombat(gameState.playerStats, enemy);
}

// Back to main menu
function backToMainMenu() {
    document.getElementById('gender-selection').classList.add('hidden');
    document.getElementById('equipment-selection').classList.add('hidden');
    document.getElementById('path-selection').classList.add('hidden');
    document.getElementById('combat-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    
    gameState = {
        gender: null,
        equipment: null,
        currentStage: 1,
        evolution: 'human',
        playerStats: null
    };
}

// Back to gender selection
function backToGenderSelection() {
    document.getElementById('equipment-selection').classList.add('hidden');
    document.getElementById('gender-selection').classList.remove('hidden');
    gameState.equipment = null;
}

// Go back to dashboard
function goBack() {
    if (gameEngine) {
        gameEngine.destroy();
        gameEngine = null;
    }
    window.location.href = '../../pages/gaming-hub-dashboard.html';
}

// Handle window resize
window.addEventListener('resize', () => {
    if (gameEngine) {
        gameEngine.handleResize();
    }
});

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Zoom controls for 3D viewer
function zoomIn() {
    if (gameEngine && gameEngine.camera) {
        gameEngine.camera.position.z = Math.max(5, gameEngine.camera.position.z - 1);
    }
}

function zoomOut() {
    if (gameEngine && gameEngine.camera) {
        gameEngine.camera.position.z = Math.min(20, gameEngine.camera.position.z + 1);
    }
}

function resetView() {
    if (gameEngine && gameEngine.camera) {
        gameEngine.camera.position.set(0, 5, 10);
        gameEngine.camera.lookAt(0, 0, 0);
    }
}
