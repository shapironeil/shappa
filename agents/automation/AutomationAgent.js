/**
 * AutomationAgent - Gestisce automazioni
 * 
 * Responsabile di:
 * - Gestire automazioni sport
 * - Gestire automazioni abitudini
 * - Programmare reminder
 * - Gestire trigger e azioni
 */

const AgentBase = require('../base/AgentBase');
const fs = require('fs');
const path = require('path');

class AutomationAgent extends AgentBase {
    constructor(config = {}) {
        super('AutomationAgent', {
            priority: 6,
            ...config
        });

        this.capabilities = [
            'save_sport_automations',
            'get_sport_automations',
            'save_habit_settings',
            'get_habit_settings',
            'trigger_automation',
            'schedule_reminder',
            'cancel_reminder'
        ];

        this.automationsDir = path.join(__dirname, '../../data/automations');
        this.ensureAutomationsDir();
        this.scheduledReminders = new Map(); // reminderId -> reminder data
    }

    /**
     * Assicura che la directory automazioni esista
     */
    ensureAutomationsDir() {
        if (!fs.existsSync(this.automationsDir)) {
            fs.mkdirSync(this.automationsDir, { recursive: true });
        }
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const automationTasks = [
            'save_sport_automations',
            'get_sport_automations',
            'save_habit_settings',
            'get_habit_settings',
            'trigger_automation',
            'schedule_reminder',
            'cancel_reminder',
            'check_reminders',
            'execute_automation'
        ];

        return automationTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'save_sport_automations':
                return await this.saveSportAutomations(task);
            
            case 'get_sport_automations':
                return await this.getSportAutomations(task);
            
            case 'save_habit_settings':
                return await this.saveHabitSettings(task);
            
            case 'get_habit_settings':
                return await this.getHabitSettings(task);
            
            case 'trigger_automation':
                return await this.triggerAutomation(task);
            
            case 'schedule_reminder':
                return await this.scheduleReminder(task);
            
            case 'cancel_reminder':
                return await this.cancelReminder(task);
            
            case 'check_reminders':
                return await this.checkReminders(task);
            
            case 'execute_automation':
                return await this.executeAutomation(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Salva automazioni sport
     */
    async saveSportAutomations(task) {
        const { userId, automations } = task;
        
        if (!userId || !automations) {
            throw new Error('userId and automations required');
        }

        const automationsPath = path.join(this.automationsDir, `${userId}.json`);
        let existingData = {};
        
        if (fs.existsSync(automationsPath)) {
            existingData = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        }

        existingData.sport = {
            ...automations,
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(automationsPath, JSON.stringify(existingData, null, 2));
        
        this.emit('sportAutomationsSaved', { userId, automations });
        
        return {
            success: true,
            message: 'Sport automations saved successfully',
            automations: existingData.sport
        };
    }

    /**
     * Ottiene automazioni sport
     */
    async getSportAutomations(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const automationsPath = path.join(this.automationsDir, `${userId}.json`);
        
        if (!fs.existsSync(automationsPath)) {
            return {
                success: true,
                automations: {
                    enableNotifications: false,
                    notifyBefore: 30,
                    sendExercisesDiscord: false,
                    preferredTimeSlot: '18:00-20:00'
                }
            };
        }

        const data = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        
        return {
            success: true,
            automations: data.sport || {
                enableNotifications: false,
                notifyBefore: 30,
                sendExercisesDiscord: false,
                preferredTimeSlot: '18:00-20:00'
            }
        };
    }

    /**
     * Salva impostazioni abitudini
     */
    async saveHabitSettings(task) {
        const { userId, settings } = task;
        
        if (!userId || !settings) {
            throw new Error('userId and settings required');
        }

        const automationsPath = path.join(this.automationsDir, `${userId}.json`);
        let existingData = {};
        
        if (fs.existsSync(automationsPath)) {
            existingData = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        }

        existingData.habits = {
            ...settings,
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(automationsPath, JSON.stringify(existingData, null, 2));
        
        this.emit('habitSettingsSaved', { userId, settings });
        
        // Programma reminder se necessario
        if (settings.dailyReminder) {
            await this.scheduleHabitReminder(userId, settings);
        }
        
        return {
            success: true,
            message: 'Habit settings saved successfully',
            settings: existingData.habits
        };
    }

    /**
     * Ottiene impostazioni abitudini
     */
    async getHabitSettings(task) {
        const { userId } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const automationsPath = path.join(this.automationsDir, `${userId}.json`);
        
        if (!fs.existsSync(automationsPath)) {
            return {
                success: true,
                settings: {
                    autoTracking: true,
                    dailyReminder: 'evening',
                    streakNotifications: true,
                    weeklyGoal: 5
                }
            };
        }

        const data = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        
        return {
            success: true,
            settings: data.habits || {
                autoTracking: true,
                dailyReminder: 'evening',
                streakNotifications: true,
                weeklyGoal: 5
            }
        };
    }

    /**
     * Programma reminder abitudini
     */
    async scheduleHabitReminder(userId, settings) {
        const reminderId = `habit_reminder_${userId}`;
        
        // Calcola ora del reminder basata su dailyReminder
        let reminderHour = 20; // Default: evening (8 PM)
        if (settings.dailyReminder === 'morning') {
            reminderHour = 9;
        } else if (settings.dailyReminder === 'afternoon') {
            reminderHour = 14;
        } else if (settings.dailyReminder === 'evening') {
            reminderHour = 20;
        }
        
        const reminder = {
            id: reminderId,
            userId,
            type: 'habit_reminder',
            hour: reminderHour,
            enabled: true,
            createdAt: new Date().toISOString()
        };
        
        this.scheduledReminders.set(reminderId, reminder);
        
        this.emit('reminderScheduled', { reminder });
        
        return reminder;
    }

    /**
     * Triggera un'automazione
     */
    async triggerAutomation(task) {
        const { userId, automationType, data } = task;
        
        if (!userId || !automationType) {
            throw new Error('userId and automationType required');
        }

        this.emit('automationTriggered', {
            userId,
            automationType,
            data,
            timestamp: new Date()
        });
        
        return {
            success: true,
            message: `Automation ${automationType} triggered`,
            userId
        };
    }

    /**
     * Programma un reminder
     */
    async scheduleReminder(task) {
        const { userId, reminderType, schedule, data } = task;
        
        if (!userId || !reminderType || !schedule) {
            throw new Error('userId, reminderType, and schedule required');
        }

        const reminderId = `reminder_${userId}_${Date.now()}`;
        const reminder = {
            id: reminderId,
            userId,
            type: reminderType,
            schedule,
            data,
            createdAt: new Date().toISOString(),
            enabled: true
        };
        
        this.scheduledReminders.set(reminderId, reminder);
        
        this.emit('reminderScheduled', { reminder });
        
        return {
            success: true,
            reminderId,
            message: 'Reminder scheduled successfully'
        };
    }

    /**
     * Cancella un reminder
     */
    async cancelReminder(task) {
        const { reminderId } = task;
        
        if (!reminderId) {
            throw new Error('reminderId required');
        }

        const removed = this.scheduledReminders.delete(reminderId);
        
        if (removed) {
            this.emit('reminderCancelled', { reminderId });
        }
        
        return {
            success: removed,
            message: removed ? 'Reminder cancelled successfully' : 'Reminder not found'
        };
    }

    /**
     * Controlla reminder scaduti
     */
    async checkReminders(task) {
        const now = new Date();
        const currentHour = now.getHours();
        
        const dueReminders = [];
        
        for (const [reminderId, reminder] of this.scheduledReminders.entries()) {
            if (!reminder.enabled) continue;
            
            // Controlla se il reminder è scaduto
            if (reminder.hour !== undefined && reminder.hour === currentHour) {
                dueReminders.push(reminder);
            }
        }
        
        // Emetti eventi per reminder scaduti
        for (const reminder of dueReminders) {
            this.emit('reminderDue', { reminder });
        }
        
        return {
            success: true,
            dueReminders: dueReminders.length,
            reminders: dueReminders
        };
    }

    /**
     * Esegue un'automazione
     */
    async executeAutomation(task) {
        const { userId, automationType, action, data } = task;
        
        if (!userId || !automationType || !action) {
            throw new Error('userId, automationType, and action required');
        }

        this.emit('automationExecuted', {
            userId,
            automationType,
            action,
            data,
            timestamp: new Date()
        });
        
        return {
            success: true,
            message: `Automation ${automationType} executed with action ${action}`,
            userId
        };
    }
}

module.exports = AutomationAgent;

