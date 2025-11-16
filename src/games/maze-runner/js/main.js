/**
 * Main - Entry point del gioco Maze Runner
 */

let gameEngine = null;
let saveManager = null;
let currentUser = null;

// UI Elements
let timerEl = null;
let keysEl = null;
let instructionsEl = null;
let victoryScreen = null;
let victoryTimeEl = null;
let bestTimeEl = null;

// Loading & Menu
let loadingScreen = null;
let loadingProgress = null;
let loadingStatus = null;
let mainMenu = null;

// Game Settings
let gameSettings = {
    difficulty: 'medium', // easy, medium, hard
    mazeSize: 15,
    audioEnabled: true,
    hintsEnabled: true,
    quality: 'medium'
};

// Initialize game - Wait for Three.js to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Maze Runner - Inizializzazione...');
    
    // Wait for THREE.js to load
    if (typeof THREE === 'undefined') {
        console.log('⏳ Aspetto che Three.js si carichi...');
        const checkThree = setInterval(() => {
            if (typeof THREE !== 'undefined') {
                clearInterval(checkThree);
                console.log('✅ Three.js caricato');
                initializeGame();
            }
        }, 100);
        return;
    }
    
    initializeGame();
});

async function initializeGame() {
    // Get UI elements
    timerEl = document.getElementById('timer');
    keysEl = document.getElementById('keys-collected');
    instructionsEl = document.getElementById('instructions');
    victoryScreen = document.getElementById('victory-screen');
    victoryTimeEl = document.getElementById('victory-time');
    bestTimeEl = document.getElementById('best-time');
    
    loadingScreen = document.getElementById('loading-screen');
    loadingProgress = document.getElementById('loading-progress');
    loadingStatus = document.getElementById('loading-status');
    mainMenu = document.getElementById('main-menu');
    
    // Check authentication
    checkAuth();
    
    // Update loading: 20%
    updateLoading(20, 'Inizializzazione motore grafico...');
    
    // Initialize game engine
    const canvas = document.getElementById('game-canvas');
    gameEngine = new MazeEngine(canvas);
    
    // Setup callbacks
    gameEngine.onKeyCollected = (collected, total) => {
        updateKeysUI(collected, total);
        
        if (collected >= total) {
            showMessage('🎉 Tutte le chiavi raccolte! Cerca il portale viola! 🎉', 'success');
        } else {
            showMessage(`🔑 Chiave raccolta! (${collected}/${total})`, 'info');
        }
    };
    
    gameEngine.onTimeUpdate = (time) => {
        updateTimerUI(time);
    };
    
    gameEngine.onGameComplete = async (time, keys) => {
        await handleGameComplete(time, keys);
    };
    
    // Update loading: 40%
    updateLoading(40, 'Caricamento modelli 3D...');
    
    // Preload assets in background
    await loadAssetsInBackground();
    
    // Update loading: 80%
    updateLoading(80, 'Preparazione menu...');
    
    // Setup menu controls
    setupMenuControls();
    
    // Load best time
    await loadBestTime();
    
    // Update loading: 100%
    updateLoading(100, 'Completato!');
    
    // Show main menu after short delay
    setTimeout(() => {
        hideLoading();
        showMainMenu();
    }, 500);
    
    // Handle resize
    window.addEventListener('resize', () => {
        if (gameEngine) {
            gameEngine.handleResize();
        }
    });
    
    // Back to menu button (in-game)
    const backBtn = document.getElementById('back-to-menu');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            pauseGame();
            showMainMenu();
        });
    }
    
    // Restart button (in-game)
    const restartBtn = document.getElementById('restart-game');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    // Victory screen buttons
    const victoryBackBtn = document.getElementById('victory-back');
    const victoryRestartBtn = document.getElementById('victory-restart');
    
    if (victoryBackBtn) {
        victoryBackBtn.addEventListener('click', () => {
            window.location.href = '../../pages/gaming-hub-dashboard.html';
        });
    }
    
    if (victoryRestartBtn) {
        victoryRestartBtn.addEventListener('click', () => {
            window.location.reload();
        });
    }
    
    console.log('✅ Maze Runner pronto!');
}

function checkAuth() {
    // Simple auth check - use same system as gaming hub
    const authData = localStorage.getItem('shappa_auth_v2');
    if (authData) {
        try {
            const auth = JSON.parse(authData);
            if (auth.user && auth.token) {
                currentUser = auth.user;
                saveManager = new SaveManager(currentUser.username);
                console.log('✅ Utente autenticato:', currentUser.username);
                return;
            }
        } catch (e) {
            console.error('Errore parsing auth:', e);
        }
    }
    
    // Fallback: guest mode
    currentUser = { username: 'guest' };
    saveManager = new SaveManager('guest');
    console.log('ℹ️ Modalità guest (progressi non salvati)');
}

function updateTimerUI(time) {
    if (timerEl) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        const ms = Math.floor((time % 1) * 100);
        timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
}

function updateKeysUI(collected, total) {
    if (keysEl) {
        keysEl.textContent = `${collected}/${total}`;
        
        // Animate
        keysEl.style.transform = 'scale(1.3)';
        setTimeout(() => {
            keysEl.style.transform = 'scale(1)';
        }, 200);
    }
}

function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('message');
    if (!messageEl) return;
    
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

async function handleGameComplete(time, keys) {
    console.log('🏆 Vittoria! Tempo:', time.toFixed(2), 's');
    
    // Hide instructions
    if (instructionsEl) {
        instructionsEl.style.display = 'none';
    }
    
    // Update victory screen
    if (victoryTimeEl) {
        const minutes = Math.floor(time / 60);
        const seconds = (time % 60).toFixed(2);
        victoryTimeEl.textContent = `${minutes}:${seconds.padStart(5, '0')}`;
    }
    
    // Load and save best time
    let bestTime = null;
    if (saveManager && currentUser.username !== 'guest') {
        try {
            const progress = await saveManager.loadProgress();
            if (progress && progress.bestTime) {
                bestTime = progress.bestTime;
            }
            
            // Save if new best or first completion
            if (!bestTime || time < bestTime) {
                await saveManager.saveCompletionTime(1, time, keys);
                bestTime = time;
                
                if (bestTimeEl) {
                    bestTimeEl.innerHTML = `🎉 <strong>Nuovo Record!</strong> ${formatTime(bestTime)}`;
                }
            } else {
                if (bestTimeEl) {
                    bestTimeEl.innerHTML = `⏱️ Miglior Tempo: ${formatTime(bestTime)}`;
                }
            }
        } catch (error) {
            console.error('Errore salvataggio:', error);
        }
    } else {
        if (bestTimeEl) {
            bestTimeEl.innerHTML = '⚠️ Progressi non salvati (modalità guest)';
        }
    }
    
    // Show victory screen
    if (victoryScreen) {
        victoryScreen.style.display = 'flex';
    }
    
    // Release pointer lock
    if (document.exitPointerLock) {
        document.exitPointerLock();
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${minutes}:${secs.padStart(5, '0')}`;
}

// ========== LOADING FUNCTIONS ==========

function updateLoading(percent, status) {
    if (loadingProgress) {
        loadingProgress.style.width = percent + '%';
    }
    if (loadingStatus) {
        loadingStatus.textContent = status;
    }
}

function hideLoading() {
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

async function loadAssetsInBackground() {
    try {
        // Aspetta che AssetManager sia pronto
        if (!gameEngine || !gameEngine.assetManager) {
            console.log('⏳ Aspetto AssetManager...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Carica asset in background (non bloccante)
        console.log('📦 Preload asset in background...');
    } catch (error) {
        console.error('Errore preload asset:', error);
    }
}

async function loadBestTime() {
    if (saveManager && currentUser.username !== 'guest') {
        try {
            const progress = await saveManager.loadProgress();
            if (progress && progress.bestTime) {
                const bestTimeDisplay = document.getElementById('best-time-display');
                if (bestTimeDisplay) {
                    bestTimeDisplay.textContent = `🏆 Miglior Tempo: ${formatTime(progress.bestTime)}`;
                }
            }
        } catch (error) {
            console.log('Nessun record precedente');
        }
    }
}

// ========== MENU FUNCTIONS ==========

function showMainMenu() {
    if (mainMenu) {
        mainMenu.style.display = 'flex';
        mainMenu.style.opacity = '0';
        setTimeout(() => {
            mainMenu.style.transition = 'opacity 0.5s ease';
            mainMenu.style.opacity = '1';
        }, 50);
    }
}

function hideMainMenu() {
    if (mainMenu) {
        mainMenu.style.opacity = '0';
        setTimeout(() => {
            mainMenu.style.display = 'none';
        }, 300);
    }
}

function setupMenuControls() {
    // Difficulty selection
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            difficultyBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            const difficulty = btn.dataset.difficulty;
            gameSettings.difficulty = difficulty;
            
            // Update maze size
            if (difficulty === 'easy') gameSettings.mazeSize = 10;
            else if (difficulty === 'medium') gameSettings.mazeSize = 15;
            else if (difficulty === 'hard') gameSettings.mazeSize = 20;
            
            console.log('Difficoltà:', difficulty, 'Maze:', gameSettings.mazeSize);
        });
    });
    
    // Settings checkboxes
    const audioCheckbox = document.getElementById('audio-enabled');
    if (audioCheckbox) {
        audioCheckbox.addEventListener('change', (e) => {
            gameSettings.audioEnabled = e.target.checked;
        });
    }
    
    const hintsCheckbox = document.getElementById('hints-enabled');
    if (hintsCheckbox) {
        hintsCheckbox.addEventListener('change', (e) => {
            gameSettings.hintsEnabled = e.target.checked;
        });
    }
    
    const qualitySelect = document.getElementById('quality-setting');
    if (qualitySelect) {
        qualitySelect.addEventListener('change', (e) => {
            gameSettings.quality = e.target.value;
        });
    }
    
    // Start game button
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startGameWithSettings();
        });
    }
    
    // Back to dashboard button
    const backDashboardBtn = document.getElementById('back-dashboard-btn');
    if (backDashboardBtn) {
        backDashboardBtn.addEventListener('click', () => {
            window.location.href = '../../pages/gaming-hub-dashboard.html';
        });
    }
}

async function startGameWithSettings() {
    console.log('🎮 Avvio gioco con impostazioni:', gameSettings);
    
    hideMainMenu();
    
    // Show canvas and UI
    const canvas = document.getElementById('game-canvas');
    const gameUI = document.getElementById('game-ui');
    if (canvas) canvas.style.display = 'block';
    if (gameUI) gameUI.style.display = 'block';
    
    // Apply settings to engine
    if (gameEngine) {
        gameEngine.mazeWidth = gameSettings.mazeSize;
        gameEngine.mazeHeight = gameSettings.mazeSize;
        
        // Build maze with 3D models
        showMessage('🏗️ Generazione labirinto...', 'info');
        await gameEngine.buildMaze();
        showMessage('✅ Pronto! Click per iniziare', 'success');
    }
}

function pauseGame() {
    if (gameEngine && gameEngine.isRunning) {
        gameEngine.pause();
    }
}

// ========== GAME FUNCTIONS ==========

// Initialize game (async)
async function initGame() {
    try {
        showMessage('🎨 Caricamento modelli 3D...', 'info');
        await gameEngine.buildMaze();
        showMessage('✅ Gioco pronto! Click per iniziare', 'success');
    } catch (error) {
        console.error('Errore inizializzazione gioco:', error);
        showMessage('⚠️ Errore caricamento. Usa fallback.', 'warning');
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (gameEngine) {
        gameEngine.destroy();
    }
});

