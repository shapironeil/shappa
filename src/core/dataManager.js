/**
 * ========================================
 * SHAPPA DATA MANAGER
 * ========================================
 * Sistema unificato per gestire tutti i dati dell'applicazione
 * Centralizza: Sport, Dieta, Calendario, Obiettivi, Progetti, Interessi
 * 
 * @author Shappa Team
 * @version 1.0.0
 */

class DataManager {
    constructor() {
        this.API_BASE = 'https://shapiro.ninja';
        this.userId = null;
        
        // Cache dei dati
        this.cache = {
            sport: null,
            diet: null,
            calendar: null,
            goals: null,
            projects: null,
            interests: null,
            automations: null
        };
        
        this.init();
    }

    /**
     * Inizializza il Data Manager con l'utente corrente
     * Viene chiamato automaticamente al caricamento e dopo il login
     */
    init() {
        try {
            // Prova prima con AuthManager (sistema nuovo)
            if (window.AuthManager && typeof AuthManager.isLoggedIn === 'function' && AuthManager.isLoggedIn()) {
                const user = AuthManager.getCurrentUser();
                if (user) {
                    this.userId = user.id || user.username;
                    console.log('✅ DataManager initialized for user:', this.userId);
                    return;
                }
            }
            
            // Fallback: prova con ShappaAuth (sistema vecchio)
            if (window.ShappaAuth) {
                try {
                    const auth = new window.ShappaAuth();
                    if (auth.isLoggedIn && auth.isLoggedIn()) {
                        const user = auth.getCurrentUser();
                        if (user) {
                            this.userId = user.id || user.username;
                            console.log('✅ DataManager initialized for user (ShappaAuth):', this.userId);
                            return;
                        }
                    }
                } catch (e) {
                    // Ignora errori ShappaAuth
                }
            }
            
            // Se userId è già impostato manualmente, usa quello
            if (this.userId) {
                console.log('✅ DataManager using existing userId:', this.userId);
                return;
            }
            
            // Non loggare warning se AuthManager non è ancora inizializzato
            // (viene chiamato di nuovo quando l'utente si logga)
            if (window.AuthManager || window.ShappaAuth) {
                console.log('ℹ️ DataManager: Waiting for user authentication...');
            } else {
                console.warn('⚠️ DataManager: No user logged in');
            }
        } catch (error) {
            console.error('❌ DataManager init error:', error);
        }
    }

    /**
     * Verifica che l'utente sia autenticato
     */
    ensureAuth() {
        if (!this.userId) {
            this.init();
            if (!this.userId) {
                throw new Error('User not authenticated');
            }
        }
        return this.userId;
    }

    // ========================================
    // UNIFIED API - Get ALL user data in one call
    // ========================================

    /**
     * Ottiene TUTTI i dati dell'utente con una singola chiamata API
     * Restituisce: account, sport, interests, webhooks, automations, ebay
     */
    async getAllUserData(userId = null) {
        try {
            const targetUserId = userId || this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/admin/user-data/${targetUserId}`);
            const data = await response.json();
            
            if (data.success) {
                // Cache the data
                this.cache = {
                    sport: data.data.sport || null,
                    interests: data.data.interests || null,
                    automations: data.data.automations || null,
                    webhook: data.data.webhook || null,
                    account: data.data.account || null,
                    ebay: data.data.ebay || null
                };
                
                console.log('✅ All user data loaded:', Object.keys(data.data).length, 'modules');
                return data;
            }
            return null;
        } catch (error) {
            console.error('Error getting all user data:', error);
            return null;
        }
    }

    // ========================================
    // SPORT DATA
    // ========================================

    /**
     * Ottiene il profilo sport dell'utente
     */
    async getSportProfile() {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/sport/profile/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.cache.sport = data.data;
                return data.data;
            }
            return null;
        } catch (error) {
            console.error('Error getting sport profile:', error);
            return null;
        }
    }

    /**
     * Salva il profilo sport dell'utente
     */
    async saveSportProfile(profileData) {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/sport/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, profile: profileData })
            });
            
            const data = await response.json();
            if (data.success) {
                this.cache.sport = data.data;
            }
            return data;
        } catch (error) {
            console.error('Error saving sport profile:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Ottiene il programma attivo dell'utente
     */
    async getSportProgram() {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/sport/program/${userId}`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error getting sport program:', error);
            return null;
        }
    }

    /**
     * Salva il programma sport selezionato
     */
    async saveSportProgram(programData) {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/sport/program`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...programData })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error saving sport program:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Ottiene le statistiche sport dell'utente
     */
    async getSportStats() {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/sport/stats/${userId}`);
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Error getting sport stats:', error);
            return null;
        }
    }

    /**
     * Segna un workout come completato
     */
    async completeWorkout(workoutData) {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/sport/workout-completed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...workoutData })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error completing workout:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // DIET DATA (placeholder - da implementare quando necessario)
    // ========================================

    async getDietPlan() {
        // TODO: Implement when diet module is ready
        console.log('Diet data not yet implemented');
        return null;
    }

    async saveDietPlan(dietData) {
        // TODO: Implement when diet module is ready
        console.log('Diet data not yet implemented');
        return { success: false, error: 'Not implemented' };
    }

    // ========================================
    // CALENDAR DATA (placeholder)
    // ========================================

    async getCalendarEvents() {
        // TODO: Implement calendar API integration
        console.log('Calendar data not yet implemented');
        return [];
    }

    async saveCalendarEvent(eventData) {
        // TODO: Implement calendar API integration
        console.log('Calendar data not yet implemented');
        return { success: false, error: 'Not implemented' };
    }

    // ========================================
    // GOALS DATA (placeholder)
    // ========================================

    async getGoals() {
        // TODO: Implement goals API
        console.log('Goals data not yet implemented');
        return [];
    }

    async saveGoal(goalData) {
        // TODO: Implement goals API
        console.log('Goals data not yet implemented');
        return { success: false, error: 'Not implemented' };
    }

    // ========================================
    // PROJECTS DATA (placeholder)
    // ========================================

    async getProjects() {
        // TODO: Implement projects API
        console.log('Projects data not yet implemented');
        return [];
    }

    async saveProject(projectData) {
        // TODO: Implement projects API
        console.log('Projects data not yet implemented');
        return { success: false, error: 'Not implemented' };
    }

    // ========================================
    // INTERESTS DATA
    // ========================================

    async getInterests() {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/interests/${userId}`);
            const data = await response.json();
            
            if (data.success) {
                this.cache.interests = data.interests;
                return data.interests;
            }
            return [];
        } catch (error) {
            console.error('Error getting interests:', error);
            return [];
        }
    }

    async saveInterest(interestData) {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/interests/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(interestData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error saving interest:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteInterest(interestId) {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/interests/${userId}/${interestId}`, {
                method: 'DELETE'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error deleting interest:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // AUTOMATIONS DATA
    // ========================================

    async getSportAutomations() {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/automations/sport/${userId}`);
            const data = await response.json();
            return data.success ? data.automations : null;
        } catch (error) {
            console.error('Error getting sport automations:', error);
            return null;
        }
    }

    async saveSportAutomations(automations) {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/automations/sport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, automations })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error saving sport automations:', error);
            return { success: false, error: error.message };
        }
    }

    async getHabitSettings() {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/automations/habits/${userId}`);
            const data = await response.json();
            return data.success ? data.settings : null;
        } catch (error) {
            console.error('Error getting habit settings:', error);
            return null;
        }
    }

    async saveHabitSettings(settings) {
        try {
            const userId = this.ensureAuth();
            const response = await fetch(`${this.API_BASE}/api/automations/habits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, settings })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error saving habit settings:', error);
            return { success: false, error: error.message };
        }
    }

    // ========================================
    // ADMIN - EXPORT ALL DATA
    // ========================================

    /**
     * Esporta tutti i dati dell'utente per l'admin panel
     * USA LA NUOVA API UNIFICATA per ottenere tutto in un colpo solo
     */
    async exportAllData() {
        try {
            const userId = this.ensureAuth();
            
            console.log('🔄 Exporting all data for user (UNIFIED API):', userId);
            
            // Usa la nuova API unificata invece di multiple chiamate
            const unifiedData = await this.getAllUserData(userId);
            
            if (!unifiedData || !unifiedData.success) {
                throw new Error('Failed to fetch unified data');
            }

            const exportData = {
                userId: userId,
                exportDate: new Date().toISOString(),
                version: '2.0.0', // Updated version with unified API
                source: 'unified-api',
                data: unifiedData.data
            };

            console.log('✅ Data export completed (unified):', Object.keys(exportData.data).length, 'modules');
            return exportData;
        } catch (error) {
            console.error('❌ Error exporting all data:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Scarica i dati come file JSON
     */
    downloadDataAsJSON() {
        this.exportAllData().then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shappa-data-${this.userId}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('📥 Data downloaded as JSON');
        });
    }

    /**
     * Cancella la cache locale
     */
    clearCache() {
        this.cache = {
            sport: null,
            diet: null,
            calendar: null,
            goals: null,
            projects: null,
            interests: null,
            automations: null
        };
        console.log('🗑️ Cache cleared');
    }
}

// Crea istanza globale
window.DataManager = new DataManager();

console.log('✅ DataManager loaded');
