/**
 * SportAgent - Gestisce workout e fitness
 * 
 * Responsabile di:
 * - Gestire profili sport utenti
 * - Gestire programmi di allenamento
 * - Tracciare workout completati
 * - Calcolare statistiche
 * - Gestire automazioni sport
 */

const AgentBase = require('../base/AgentBase');
const fs = require('fs');
const path = require('path');

class SportAgent extends AgentBase {
    constructor(config = {}) {
        super('SportAgent', {
            priority: 7,
            ...config
        });

        this.capabilities = [
            'save_sport_profile',
            'get_sport_profile',
            'save_sport_program',
            'get_sport_program',
            'complete_workout',
            'get_sport_stats',
            'get_workout_history',
            'manage_sport_automations'
        ];

        this.sportDataDir = path.join(__dirname, '../../data/sport');
        this.ensureSportDataDir();
    }

    /**
     * Assicura che la directory dati sport esista
     */
    ensureSportDataDir() {
        if (!fs.existsSync(this.sportDataDir)) {
            fs.mkdirSync(this.sportDataDir, { recursive: true });
        }
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const sportTasks = [
            'save_sport_profile',
            'get_sport_profile',
            'save_sport_program',
            'get_sport_program',
            'complete_workout',
            'get_sport_stats',
            'get_workout_history',
            'manage_sport_automations',
            'sport_notification',
            'workout_reminder'
        ];

        return sportTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'save_sport_profile':
                return await this.saveSportProfile(task);
            
            case 'get_sport_profile':
                return await this.getSportProfile(task);
            
            case 'save_sport_program':
                return await this.saveSportProgram(task);
            
            case 'get_sport_program':
                return await this.getSportProgram(task);
            
            case 'complete_workout':
                return await this.completeWorkout(task);
            
            case 'get_sport_stats':
                return await this.getSportStats(task);
            
            case 'get_workout_history':
                return await this.getWorkoutHistory(task);
            
            case 'manage_sport_automations':
                return await this.manageSportAutomations(task);
            
            case 'sport_notification':
                return await this.sendSportNotification(task);
            
            case 'workout_reminder':
                return await this.sendWorkoutReminder(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Salva profilo sport
     */
    async saveSportProfile(task) {
        const { userId, profileData } = task;
        
        if (!userId || !profileData) {
            throw new Error('userId and profileData required');
        }

        const profilePath = path.join(this.sportDataDir, `${userId}_profile.json`);
        const dataToSave = {
            userId,
            profile: profileData,
            savedAt: new Date().toISOString(),
            version: '1.0'
        };

        fs.writeFileSync(profilePath, JSON.stringify(dataToSave, null, 2), 'utf8');
        
        this.emit('sportProfileSaved', { userId, profileData });
        
        return {
            success: true,
            message: 'Sport profile saved successfully',
            userId
        };
    }

    /**
     * Ottiene profilo sport
     */
    async getSportProfile(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const profilePath = path.join(this.sportDataDir, `${userId}_profile.json`);
        
        if (!fs.existsSync(profilePath)) {
            return {
                success: true,
                profile: null,
                message: 'No profile found'
            };
        }

        const data = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        
        return {
            success: true,
            profile: data.profile,
            savedAt: data.savedAt
        };
    }

    /**
     * Salva programma sport
     */
    async saveSportProgram(task) {
        const { userId, programData } = task;
        
        if (!userId || !programData) {
            throw new Error('userId and programData required');
        }

        const programPath = path.join(this.sportDataDir, `${userId}_program.json`);
        
        let existingData = {
            userId,
            programData: programData,
            completedWorkouts: [],
            startedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        // Se esiste già, mantieni i workout completati
        if (fs.existsSync(programPath)) {
            const existing = JSON.parse(fs.readFileSync(programPath, 'utf8'));
            existingData.completedWorkouts = existing.completedWorkouts || [];
            existingData.startedAt = existing.startedAt || existingData.startedAt;
        }

        existingData.lastUpdated = new Date().toISOString();
        fs.writeFileSync(programPath, JSON.stringify(existingData, null, 2), 'utf8');
        
        this.emit('sportProgramSaved', { userId, programData });
        
        return {
            success: true,
            message: 'Sport program saved successfully',
            userId
        };
    }

    /**
     * Ottiene programma sport
     */
    async getSportProgram(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const programPath = path.join(this.sportDataDir, `${userId}_program.json`);
        
        if (!fs.existsSync(programPath)) {
            return {
                success: true,
                program: null,
                message: 'No program found'
            };
        }

        const data = JSON.parse(fs.readFileSync(programPath, 'utf8'));
        
        return {
            success: true,
            program: data
        };
    }

    /**
     * Completa un workout
     */
    async completeWorkout(task) {
        const { userId, workoutData } = task;
        
        if (!userId || !workoutData) {
            throw new Error('userId and workoutData required');
        }

        const programPath = path.join(this.sportDataDir, `${userId}_program.json`);
        
        if (!fs.existsSync(programPath)) {
            throw new Error('No program found for user');
        }

        const data = JSON.parse(fs.readFileSync(programPath, 'utf8'));
        
        // Aggiungi workout completato
        const completedWorkout = {
            ...workoutData,
            completedAt: new Date().toISOString(),
            id: `workout_${Date.now()}`
        };

        data.completedWorkouts = data.completedWorkouts || [];
        data.completedWorkouts.push(completedWorkout);
        data.lastUpdated = new Date().toISOString();

        fs.writeFileSync(programPath, JSON.stringify(data, null, 2), 'utf8');
        
        this.emit('workoutCompleted', { userId, workoutData: completedWorkout });
        
        return {
            success: true,
            message: 'Workout completed successfully',
            workout: completedWorkout
        };
    }

    /**
     * Ottiene statistiche sport
     */
    async getSportStats(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const programPath = path.join(this.sportDataDir, `${userId}_program.json`);
        
        if (!fs.existsSync(programPath)) {
            return {
                success: true,
                stats: {
                    completedWorkouts: 0,
                    totalCalories: 0,
                    totalDuration: 0,
                    currentStreak: 0
                }
            };
        }

        const data = JSON.parse(fs.readFileSync(programPath, 'utf8'));
        const completedWorkouts = data.completedWorkouts || [];
        
        // Calcola statistiche
        const totalCalories = completedWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
        const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        
        // Calcola streak (giorni consecutivi con workout)
        let currentStreak = 0;
        if (completedWorkouts.length > 0) {
            const sortedWorkouts = completedWorkouts
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
            
            let lastDate = new Date(sortedWorkouts[0].completedAt);
            lastDate.setHours(0, 0, 0, 0);
            
            for (const workout of sortedWorkouts) {
                const workoutDate = new Date(workout.completedAt);
                workoutDate.setHours(0, 0, 0, 0);
                
                const diffDays = Math.floor((lastDate - workoutDate) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0 || diffDays === 1) {
                    currentStreak++;
                    lastDate = workoutDate;
                } else {
                    break;
                }
            }
        }
        
        return {
            success: true,
            stats: {
                completedWorkouts: completedWorkouts.length,
                totalCalories,
                totalDuration,
                currentStreak,
                programTitle: data.programData?.title || null
            }
        };
    }

    /**
     * Ottiene cronologia workout
     */
    async getWorkoutHistory(task) {
        const { userId, limit = 50 } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const programPath = path.join(this.sportDataDir, `${userId}_program.json`);
        
        if (!fs.existsSync(programPath)) {
            return {
                success: true,
                history: []
            };
        }

        const data = JSON.parse(fs.readFileSync(programPath, 'utf8'));
        const completedWorkouts = data.completedWorkouts || [];
        
        // Ordina per data (più recenti prima)
        const sortedWorkouts = completedWorkouts
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, limit);
        
        return {
            success: true,
            history: sortedWorkouts
        };
    }

    /**
     * Gestisce automazioni sport
     */
    async manageSportAutomations(task) {
        const { userId, automations } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        // Delega al AutomationAgent se disponibile
        // Per ora, gestiamo solo le notifiche
        if (automations && automations.enableNotifications) {
            this.emit('sportAutomationsUpdated', { userId, automations });
        }
        
        return {
            success: true,
            message: 'Sport automations managed'
        };
    }

    /**
     * Invia notifica sport
     */
    async sendSportNotification(task) {
        const { userId, notificationType, data } = task;
        
        this.emit('sportNotification', {
            userId,
            notificationType,
            data,
            timestamp: new Date()
        });
        
        return {
            success: true,
            message: 'Sport notification sent'
        };
    }

    /**
     * Invia reminder workout
     */
    async sendWorkoutReminder(task) {
        const { userId, workoutData } = task;
        
        this.emit('workoutReminder', {
            userId,
            workoutData,
            timestamp: new Date()
        });
        
        return {
            success: true,
            message: 'Workout reminder sent'
        };
    }
}

module.exports = SportAgent;

