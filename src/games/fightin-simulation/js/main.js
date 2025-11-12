/**
 * FightinSimulation - Main Entry Point
 * Gestisce il menu principale e l'avvio del gioco
 */

let gameEngine = null;
let currentMode = null;

// Start game with selected mode
function startGame(mode) {
    console.log('🎮 Starting game in mode:', mode);
    
    // Hide menu
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-canvas-container').classList.remove('hidden');
    
    // Initialize game engine
    const canvas = document.getElementById('game-canvas');
    gameEngine = new GameEngine(canvas);
    
    // Start appropriate mode
    if (mode === 'story') {
        currentMode = new StoryMode(gameEngine);
    } else if (mode === 'simulation') {
        currentMode = new SimulationMode(gameEngine);
    }
    
    currentMode.start();
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

