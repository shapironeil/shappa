/**
 * SaveManager - Gestisce salvataggio progressi su MongoDB
 */

class SaveManager {
    constructor(username) {
        this.username = username;
        this.apiBase = '/api/maze';
    }
    
    /**
     * Carica progressi del giocatore
     */
    async loadProgress() {
        try {
            const response = await fetch(`${this.apiBase}/progress/${this.username}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('✅ Progressi caricati:', data.data);
                    return data.data;
                }
            } else if (response.status === 404) {
                console.log('ℹ️ Nessun progresso trovato, nuovo giocatore');
                return null;
            }
        } catch (error) {
            console.error('❌ Errore caricamento progressi:', error);
        }
        return null;
    }
    
    /**
     * Salva tempo completamento livello
     */
    async saveCompletionTime(level, timeInSeconds, keysCollected) {
        try {
            const data = {
                level,
                time: timeInSeconds,
                keysCollected,
                completedAt: new Date().toISOString()
            };
            
            const response = await fetch(`${this.apiBase}/complete/${this.username}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Tempo salvato:', result);
                return result;
            } else {
                console.error('❌ Errore salvataggio tempo');
            }
        } catch (error) {
            console.error('❌ Errore salvataggio:', error);
        }
        return null;
    }
    
    /**
     * Ottieni leaderboard
     */
    async getLeaderboard(level = 1, limit = 10) {
        try {
            const response = await fetch(`${this.apiBase}/leaderboard/${level}?limit=${limit}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return data.data;
                }
            }
        } catch (error) {
            console.error('❌ Errore caricamento leaderboard:', error);
        }
        return [];
    }
    
    /**
     * Salva statistiche generali
     */
    async updateStats(stats) {
        try {
            const response = await fetch(`${this.apiBase}/stats/${this.username}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stats)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Statistiche aggiornate:', result);
                return result;
            }
        } catch (error) {
            console.error('❌ Errore aggiornamento stats:', error);
        }
        return null;
    }
}

