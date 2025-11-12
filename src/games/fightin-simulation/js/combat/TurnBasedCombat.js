/**
 * TurnBasedCombatSystem - Sistema di combattimento a turni (tipo Pokemon)
 */

class TurnBasedCombatSystem {
    constructor() {
        this.player = null;
        this.enemy = null;
        this.currentTurn = 'player'; // 'player' or 'enemy'
        this.combatLog = [];
        this.isCombatActive = false;
    }
    
    startCombat(playerStats, enemyData) {
        this.player = {
            ...playerStats,
            currentHealth: playerStats.maxHealth || playerStats.health
        };
        this.enemy = {
            ...enemyData,
            currentHealth: enemyData.maxHealth || enemyData.health
        };
        this.currentTurn = 'player';
        this.combatLog = [];
        this.isCombatActive = true;
        
        // Update UI
        this.updateCombatUI();
        this.renderCombatActions();
        this.addLogEntry(`Combattimento iniziato! Affronti ${this.enemy.name}!`, 'system');
    }
    
    updateCombatUI() {
        const playerNameEl = document.getElementById('player-name');
        const playerHealthEl = document.getElementById('player-health-bar');
        const playerHealthTextEl = document.getElementById('player-health-text');
        const enemyNameEl = document.getElementById('enemy-name');
        const enemyHealthEl = document.getElementById('enemy-health-bar');
        const enemyHealthTextEl = document.getElementById('enemy-health-text');
        
        if (playerNameEl) playerNameEl.textContent = 'Tu';
        if (playerHealthEl) {
            const healthPercent = (this.player.currentHealth / (this.player.maxHealth || 100)) * 100;
            playerHealthEl.style.width = `${Math.max(0, healthPercent)}%`;
        }
        if (playerHealthTextEl) {
            playerHealthTextEl.textContent = `${this.player.currentHealth}/${this.player.maxHealth || 100}`;
        }
        
        if (enemyNameEl) enemyNameEl.textContent = this.enemy.name;
        if (enemyHealthEl) {
            const healthPercent = (this.enemy.currentHealth / this.enemy.maxHealth) * 100;
            enemyHealthEl.style.width = `${Math.max(0, healthPercent)}%`;
        }
        if (enemyHealthTextEl) {
            enemyHealthTextEl.textContent = `${this.enemy.currentHealth}/${this.enemy.maxHealth}`;
        }
    }
    
    renderCombatActions() {
        const actionsContainer = document.getElementById('combat-actions');
        if (!actionsContainer) return;
        
        if (this.currentTurn === 'player') {
            actionsContainer.innerHTML = `
                <button class="combat-action-btn" onclick="window.combatSystem.playerAttack('punch')">
                    👊 Pugno
                </button>
                <button class="combat-action-btn" onclick="window.combatSystem.playerAttack('kick')">
                    🦵 Calcio
                </button>
                <button class="combat-action-btn" onclick="window.combatSystem.playerAttack('special')">
                    ⚡ Attacco Speciale
                </button>
                <button class="combat-action-btn" onclick="window.combatSystem.playerDefend()">
                    🛡️ Difendi
                </button>
            `;
        } else {
            actionsContainer.innerHTML = `
                <div class="combat-action-btn" style="cursor: default;">
                    ${this.enemy.name} sta pensando...
                </div>
            `;
        }
    }
    
    playerAttack(type) {
        if (this.currentTurn !== 'player' || !this.isCombatActive) return;
        
        let damage = 0;
        let attackName = '';
        
        switch(type) {
            case 'punch':
                damage = Math.floor((this.player.attack || 10) * 0.8);
                attackName = 'Pugno';
                break;
            case 'kick':
                damage = Math.floor((this.player.attack || 10) * 1.2);
                attackName = 'Calcio';
                break;
            case 'special':
                damage = Math.floor((this.player.attack || 10) * 1.5);
                attackName = 'Attacco Speciale';
                break;
        }
        
        // Apply weapon bonus if available
        if (window.gameState && window.gameState.equipment) {
            damage += window.gameState.equipment.attack || 0;
        }
        
        // Calculate actual damage (considering defense)
        const actualDamage = Math.max(1, damage - (this.enemy.defense || 0));
        this.enemy.currentHealth = Math.max(0, this.enemy.currentHealth - actualDamage);
        
        this.addLogEntry(`Usi ${attackName} e infliggi ${actualDamage} danni!`, 'player');
        this.updateCombatUI();
        
        // Check if enemy is defeated
        if (this.enemy.currentHealth <= 0) {
            this.endCombat(true);
            return;
        }
        
        // Switch to enemy turn
        this.currentTurn = 'enemy';
        this.renderCombatActions();
        
        // Enemy attacks after a delay
        setTimeout(() => {
            this.enemyAttack();
        }, 1500);
    }
    
    playerDefend() {
        if (this.currentTurn !== 'player' || !this.isCombatActive) return;
        
        this.addLogEntry('Ti prepari a difenderti!', 'player');
        
        // Switch to enemy turn
        this.currentTurn = 'enemy';
        this.renderCombatActions();
        
        // Enemy attacks after a delay
        setTimeout(() => {
            this.enemyAttack(true); // Pass defending flag
        }, 1500);
    }
    
    enemyAttack(playerDefending = false) {
        if (this.currentTurn !== 'enemy' || !this.isCombatActive) return;
        
        const damage = Math.floor((this.enemy.attack || 10) * (Math.random() * 0.4 + 0.8));
        const actualDamage = playerDefending 
            ? Math.max(1, Math.floor(damage * 0.5)) // Defending reduces damage by 50%
            : Math.max(1, damage - (this.player.defense || 0));
        
        this.player.currentHealth = Math.max(0, this.player.currentHealth - actualDamage);
        
        this.addLogEntry(
            `${this.enemy.name} attacca e infligge ${actualDamage} danni!${playerDefending ? ' (Difesa attiva!)' : ''}`,
            'enemy'
        );
        this.updateCombatUI();
        
        // Check if player is defeated
        if (this.player.currentHealth <= 0) {
            this.endCombat(false);
            return;
        }
        
        // Switch back to player turn
        this.currentTurn = 'player';
        this.renderCombatActions();
    }
    
    endCombat(playerWon) {
        this.isCombatActive = false;
        
        if (playerWon) {
            this.addLogEntry(`🎉 Hai sconfitto ${this.enemy.name}!`, 'system');
            
            // Show victory screen and progress
            setTimeout(() => {
                this.showVictoryScreen();
            }, 2000);
        } else {
            this.addLogEntry('💀 Sei stato sconfitto!', 'system');
            
            // Show defeat screen
            setTimeout(() => {
                this.showDefeatScreen();
            }, 2000);
        }
    }
    
    showVictoryScreen() {
        const actionsContainer = document.getElementById('combat-actions');
        if (actionsContainer) {
            actionsContainer.innerHTML = `
                <button class="combat-action-btn" onclick="window.combatSystem.continueToNextStage()" style="background: linear-gradient(135deg, #10b981, #059669);">
                    🎉 Continua al Prossimo Stage
                </button>
                <button class="combat-action-btn secondary" onclick="window.combatSystem.returnToPath()">
                    ← Torna alla Selezione
                </button>
            `;
        }
    }
    
    showDefeatScreen() {
        const actionsContainer = document.getElementById('combat-actions');
        if (actionsContainer) {
            actionsContainer.innerHTML = `
                <button class="combat-action-btn" onclick="window.combatSystem.retryCombat()" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                    🔄 Riprova
                </button>
                <button class="combat-action-btn secondary" onclick="window.combatSystem.returnToPath()">
                    ← Torna alla Selezione
                </button>
            `;
        }
    }
    
    continueToNextStage() {
        window.gameState.currentStage++;
        
        // Check for evolution
        const newEvolution = getEvolutionForStage(window.gameState.currentStage);
        if (newEvolution.id !== window.gameState.evolution) {
            window.gameState.evolution = newEvolution.id;
            alert(`✨ Evoluzione! Sei diventato ${newEvolution.name}!`);
        }
        
        // Hide combat screen
        document.getElementById('combat-screen').classList.add('hidden');
        
        // Show equipment selection for new stage
        showEquipmentSelection();
    }
    
    retryCombat() {
        // Reset player health
        window.gameState.playerStats.currentHealth = window.gameState.playerStats.maxHealth || 100;
        
        // Restart combat
        this.startCombat(window.gameState.playerStats, this.enemy);
    }
    
    returnToPath() {
        // Reset player health
        if (window.gameState.playerStats) {
            window.gameState.playerStats.currentHealth = window.gameState.playerStats.maxHealth || 100;
        }
        
        // Hide combat screen
        document.getElementById('combat-screen').classList.add('hidden');
        
        // Show path selection again
        showPathSelection();
    }
    
    addLogEntry(message, type) {
        this.combatLog.push({ message, type, timestamp: Date.now() });
        
        const logContainer = document.getElementById('combat-log');
        if (logContainer) {
            const entry = document.createElement('div');
            entry.className = `combat-log-entry ${type}`;
            entry.textContent = message;
            logContainer.appendChild(entry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }
    }
}

