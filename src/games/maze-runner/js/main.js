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

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Maze Runner - Inizializzazione...');
    
    // Get UI elements
    timerEl = document.getElementById('timer');
    keysEl = document.getElementById('keys-collected');
    instructionsEl = document.getElementById('instructions');
    victoryScreen = document.getElementById('victory-screen');
    victoryTimeEl = document.getElementById('victory-time');
    bestTimeEl = document.getElementById('best-time');
    
    // Check authentication
    checkAuth();
    
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
    
    // Build maze
    gameEngine.buildMaze();
    
    // Handle resize
    window.addEventListener('resize', () => {
        gameEngine.handleResize();
    });
    
    // Back to menu button
    const backBtn = document.getElementById('back-to-menu');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../../pages/gaming-hub-dashboard.html';
        });
    }
    
    // Restart button
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
    console.log('💡 Clicca sullo schermo per iniziare');
});

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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (gameEngine) {
        gameEngine.destroy();
    }
});

