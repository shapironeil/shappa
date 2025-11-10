/**
 * BotAgent - Gestisce Comandi e Interazioni Bot Discord
 * 
 * Responsabile di:
 * - Gestire comandi Discord (slash commands, text commands)
 * - Gestire interazioni (buttons, select menus, modals)
 * - Processare conferme workout da Discord
 * - Gestire risposte bot a eventi
 * - Coordinare agenti per rispondere a comandi
 * - Gestire autenticazione utente via Discord
 */

const AgentBase = require('../base/AgentBase');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class BotAgent extends AgentBase {
    constructor(config = {}) {
        super('BotAgent', {
            priority: 7,
            ...config
        });

        this.capabilities = [
            'handle_discord_command',
            'handle_discord_interaction',
            'handle_workout_confirmation',
            'handle_product_alert_response',
            'send_bot_response',
            'process_bot_message',
            'register_slash_commands',
            'handle_button_click',
            'handle_select_menu',
            'handle_modal_submit'
        ];

        this.commandsDir = path.join(__dirname, '../../data/bot_commands');
        this.interactionsDir = path.join(__dirname, '../../data/bot_interactions');
        this.ensureDirs();

        // Mappa comandi disponibili
        this.commands = new Map();
        this.registerDefaultCommands();
    }

    /**
     * Assicura che le directory esistano
     */
    ensureDirs() {
        if (!fs.existsSync(this.commandsDir)) {
            fs.mkdirSync(this.commandsDir, { recursive: true });
        }
        if (!fs.existsSync(this.interactionsDir)) {
            fs.mkdirSync(this.interactionsDir, { recursive: true });
        }
    }

    /**
     * Registra comandi default
     */
    registerDefaultCommands() {
        // Comandi workout
        this.commands.set('complete_workout', {
            name: 'complete_workout',
            description: 'Conferma completamento workout',
            handler: this.handleCompleteWorkout.bind(this),
            requiresAuth: true
        });

        this.commands.set('workout_stats', {
            name: 'workout_stats',
            description: 'Mostra statistiche workout',
            handler: this.handleWorkoutStats.bind(this),
            requiresAuth: true
        });

        // Comandi monitor
        this.commands.set('monitor_status', {
            name: 'monitor_status',
            description: 'Mostra stato monitor attivi',
            handler: this.handleMonitorStatus.bind(this),
            requiresAuth: true
        });

        this.commands.set('stop_monitor', {
            name: 'stop_monitor',
            description: 'Ferma un monitor',
            handler: this.handleStopMonitor.bind(this),
            requiresAuth: true
        });

        // Comandi profilo
        this.commands.set('profile', {
            name: 'profile',
            description: 'Mostra profilo utente',
            handler: this.handleProfile.bind(this),
            requiresAuth: true
        });

        // Comandi dieta
        this.commands.set('diet_today', {
            name: 'diet_today',
            description: 'Mostra dieta di oggi',
            handler: this.handleDietToday.bind(this),
            requiresAuth: true
        });

        // Comandi AI
        this.commands.set('analyze_image', {
            name: 'analyze_image',
            description: 'Analizza immagine caricata',
            handler: this.handleAnalyzeImage.bind(this),
            requiresAuth: true
        });
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const botTasks = [
            'handle_discord_command',
            'handle_discord_interaction',
            'handle_workout_confirmation',
            'handle_product_alert_response',
            'send_bot_response',
            'process_bot_message',
            'register_slash_commands',
            'handle_button_click',
            'handle_select_menu',
            'handle_modal_submit',
            'bot_command',
            'bot_interaction'
        ];

        return botTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'handle_discord_command':
            case 'bot_command':
                return await this.handleDiscordCommand(task);
            
            case 'handle_discord_interaction':
            case 'bot_interaction':
                return await this.handleDiscordInteraction(task);
            
            case 'handle_workout_confirmation':
                return await this.handleWorkoutConfirmation(task);
            
            case 'handle_product_alert_response':
                return await this.handleProductAlertResponse(task);
            
            case 'send_bot_response':
                return await this.sendBotResponse(task);
            
            case 'process_bot_message':
                return await this.processBotMessage(task);
            
            case 'handle_button_click':
                return await this.handleButtonClick(task);
            
            case 'handle_select_menu':
                return await this.handleSelectMenu(task);
            
            case 'handle_modal_submit':
                return await this.handleModalSubmit(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Gestisce comando Discord
     */
    async handleDiscordCommand(task) {
        const { command, userId, discordUserId, options, interaction } = task;
        
        if (!command) {
            throw new Error('command required');
        }

        const commandHandler = this.commands.get(command);
        if (!commandHandler) {
            return {
                success: false,
                error: `Command '${command}' not found`,
                response: `❌ Comando '${command}' non riconosciuto. Usa /help per vedere i comandi disponibili.`
            };
        }

        try {
            // Verifica autenticazione se richiesta
            if (commandHandler.requiresAuth && !userId) {
                return {
                    success: false,
                    error: 'Authentication required',
                    response: '❌ Devi essere autenticato per usare questo comando.'
                };
            }

            // Esegui handler
            const result = await commandHandler.handler({
                userId,
                discordUserId,
                options,
                interaction,
                command
            });

            return {
                success: true,
                result,
                response: result.response || '✅ Comando eseguito con successo'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                response: `❌ Errore: ${error.message}`
            };
        }
    }

    /**
     * Gestisce interazione Discord (button, select, modal)
     */
    async handleDiscordInteraction(task) {
        const { interactionType, customId, userId, discordUserId, values, data } = task;

        switch (interactionType) {
            case 'button':
                return await this.handleButtonClick({ customId, userId, discordUserId, data });
            
            case 'select_menu':
                return await this.handleSelectMenu({ customId, userId, discordUserId, values, data });
            
            case 'modal':
                return await this.handleModalSubmit({ customId, userId, discordUserId, data });
            
            default:
                throw new Error(`Unknown interaction type: ${interactionType}`);
        }
    }

    /**
     * Gestisce conferma workout da Discord
     */
    async handleWorkoutConfirmation(task) {
        const { userId, workoutId, workoutDate, confirmed } = task;

        if (!userId) {
            throw new Error('userId required');
        }

        try {
            // Delega a SportAgent
            if (this.coordinator) {
                const result = await this.coordinator.assignTask({
                    type: 'complete_workout',
                    userId,
                    workoutId,
                    workoutDate,
                    confirmed: confirmed !== false
                });

                // Notifica UserProfileAgent
                await this.coordinator.assignTask({
                    type: 'monitor_data_changes',
                    userId,
                    dataType: 'sport',
                    data: { workoutCompleted: true, workoutId, workoutDate },
                    source: 'bot_workout_confirmation'
                });

                return {
                    success: true,
                    message: 'Workout confermato con successo!',
                    result
                };
            }

            throw new Error('Coordinator not available');
        } catch (error) {
            throw new Error(`Failed to confirm workout: ${error.message}`);
        }
    }

    /**
     * Gestisce risposta a alert prodotto
     */
    async handleProductAlertResponse(task) {
        const { userId, productId, action, interestId } = task;

        if (!userId || !action) {
            throw new Error('userId and action required');
        }

        try {
            switch (action) {
                case 'stop_monitor':
                    if (this.coordinator) {
                        await this.coordinator.assignTask({
                            type: 'stop_monitor',
                            userId,
                            interestId: interestId || productId
                        });
                    }
                    return {
                        success: true,
                        message: 'Monitor fermato con successo!'
                    };
                
                case 'view_product':
                    return {
                        success: true,
                        message: 'Apertura prodotto...',
                        action: 'open_url',
                        url: task.productUrl
                    };
                
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        } catch (error) {
            throw new Error(`Failed to handle product alert: ${error.message}`);
        }
    }

    /**
     * Invia risposta bot
     */
    async sendBotResponse(task) {
        const { userId, webhookUrl, message, embeds, components, ephemeral } = task;

        if (!webhookUrl && !userId) {
            throw new Error('webhookUrl or userId required');
        }

        try {
            // Recupera webhook se non fornito
            let webhook = webhookUrl;
            if (!webhook && userId) {
                const webhookPath = path.join(__dirname, '../../data/webhooks', `webhook_${userId}.json`);
                if (fs.existsSync(webhookPath)) {
                    const webhookData = JSON.parse(fs.readFileSync(webhookPath, 'utf8'));
                    webhook = webhookData.url;
                }
            }

            if (!webhook) {
                throw new Error('Webhook not found');
            }

            const payload = {
                content: message || null,
                embeds: embeds || [],
                components: components || []
            };

            const response = await axios.post(webhook, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                message: 'Bot response sent successfully'
            };
        } catch (error) {
            throw new Error(`Failed to send bot response: ${error.message}`);
        }
    }

    /**
     * Processa messaggio bot
     */
    async processBotMessage(task) {
        const { message, userId, discordUserId } = task;

        if (!message) {
            throw new Error('message required');
        }

        // Estrai comando dal messaggio
        const commandMatch = message.match(/^\/(\w+)(?:\s+(.+))?$/);
        if (!commandMatch) {
            return {
                success: false,
                error: 'Invalid command format',
                response: '❌ Formato comando non valido. Usa /comando [opzioni]'
            };
        }

        const [, command, args] = commandMatch;
        const options = args ? this.parseCommandArgs(args) : {};

        return await this.handleDiscordCommand({
            command,
            userId,
            discordUserId,
            options
        });
    }

    /**
     * Gestisce click button
     */
    async handleButtonClick(task) {
        const { customId, userId, discordUserId, data } = task;

        if (!customId) {
            throw new Error('customId required');
        }

        // Parse customId per capire l'azione
        const [action, ...params] = customId.split(':');

        switch (action) {
            case 'complete_workout':
                return await this.handleWorkoutConfirmation({
                    userId,
                    workoutId: params[0],
                    workoutDate: params[1],
                    confirmed: true
                });
            
            case 'stop_monitor':
                return await this.handleProductAlertResponse({
                    userId,
                    productId: params[0],
                    interestId: params[1],
                    action: 'stop_monitor'
                });
            
            case 'view_product':
                return await this.handleProductAlertResponse({
                    userId,
                    productId: params[0],
                    action: 'view_product',
                    productUrl: data?.url
                });
            
            default:
                throw new Error(`Unknown button action: ${action}`);
        }
    }

    /**
     * Gestisce select menu
     */
    async handleSelectMenu(task) {
        const { customId, userId, discordUserId, values } = task;

        if (!customId || !values || values.length === 0) {
            throw new Error('customId and values required');
        }

        const [action] = customId.split(':');

        switch (action) {
            case 'select_workout':
                // Gestisci selezione workout
                return {
                    success: true,
                    message: `Workout selezionato: ${values[0]}`
                };
            
            case 'select_diet':
                // Gestisci selezione dieta
                return {
                    success: true,
                    message: `Dieta selezionata: ${values[0]}`
                };
            
            default:
                throw new Error(`Unknown select menu action: ${action}`);
        }
    }

    /**
     * Gestisce submit modal
     */
    async handleModalSubmit(task) {
        const { customId, userId, discordUserId, data } = task;

        if (!customId || !data) {
            throw new Error('customId and data required');
        }

        const [action] = customId.split(':');

        switch (action) {
            case 'update_profile':
                // Aggiorna profilo con dati modal
                if (this.coordinator) {
                    await this.coordinator.assignTask({
                        type: 'monitor_data_changes',
                        userId,
                        dataType: 'profile',
                        data: data,
                        source: 'bot_modal_submit'
                    });
                }
                return {
                    success: true,
                    message: 'Profilo aggiornato con successo!'
                };
            
            default:
                throw new Error(`Unknown modal action: ${action}`);
        }
    }

    // ========== COMMAND HANDLERS ==========

    /**
     * Handler: complete_workout
     */
    async handleCompleteWorkout({ userId, options }) {
        const workoutId = options.workoutId || options.id;
        const workoutDate = options.date || new Date().toISOString().split('T')[0];

        return await this.handleWorkoutConfirmation({
            userId,
            workoutId,
            workoutDate,
            confirmed: true
        });
    }

    /**
     * Handler: workout_stats
     */
    async handleWorkoutStats({ userId }) {
        if (!this.coordinator) {
            throw new Error('Coordinator not available');
        }

        const stats = await this.coordinator.assignTask({
            type: 'get_sport_stats',
            userId
        });

        const response = `📊 **Statistiche Workout**
        
✅ Allenamenti completati: ${stats.totalCompleted || 0}
🔥 Calorie bruciate: ${stats.totalCalories || 0} kcal
📅 Streak attuale: ${stats.currentStreak || 0} giorni
🎯 Obiettivo settimanale: ${stats.weeklyGoal || 0} allenamenti`;

        return {
            success: true,
            stats,
            response
        };
    }

    /**
     * Handler: monitor_status
     */
    async handleMonitorStatus({ userId }) {
        if (!this.coordinator) {
            throw new Error('Coordinator not available');
        }

        const status = await this.coordinator.assignTask({
            type: 'get_monitor_stats',
            userId
        });

        const activeMonitors = status.activeMonitors || 0;
        const response = `🔍 **Stato Monitor**
        
✅ Monitor attivi: ${activeMonitors}
📊 Check totali: ${status.totalChecks || 0}
🚨 Alert inviati: ${status.totalAlerts || 0}`;

        return {
            success: true,
            status,
            response
        };
    }

    /**
     * Handler: stop_monitor
     */
    async handleStopMonitor({ userId, options }) {
        const interestId = options.interestId || options.id;

        if (!interestId) {
            return {
                success: false,
                response: '❌ Specifica l\'ID del monitor da fermare'
            };
        }

        return await this.handleProductAlertResponse({
            userId,
            productId: interestId,
            interestId,
            action: 'stop_monitor'
        });
    }

    /**
     * Handler: profile
     */
    async handleProfile({ userId }) {
        if (!this.coordinator) {
            throw new Error('Coordinator not available');
        }

        const profile = await this.coordinator.assignTask({
            type: 'get_unified_profile',
            userId
        });

        const data = profile.data || {};
        const response = `👤 **Profilo Utente**

📧 Email: ${data.account?.email || 'N/A'}
💪 Sport: ${data.sport ? 'Configurato' : 'Non configurato'}
⭐ Interessi: ${data.interests?.length || 0}
🔔 Webhook: ${data.webhook ? 'Configurato' : 'Non configurato'}`;

        return {
            success: true,
            profile,
            response
        };
    }

    /**
     * Handler: diet_today
     */
    async handleDietToday({ userId }) {
        // TODO: Implementare con RecipeAgent
        return {
            success: true,
            response: '🍽️ **Dieta di Oggi**\n\nFunzionalità in sviluppo...'
        };
    }

    /**
     * Handler: analyze_image
     */
    async handleAnalyzeImage({ userId, options }) {
        if (!this.coordinator) {
            throw new Error('Coordinator not available');
        }

        const imageUrl = options.imageUrl || options.url;
        if (!imageUrl) {
            return {
                success: false,
                response: '❌ Fornisci un URL immagine da analizzare'
            };
        }

        const result = await this.coordinator.assignTask({
            type: 'analyze_image',
            imageUrl,
            prompt: options.prompt || 'Analizza questa immagine e descrivi cosa vedi'
        });

        return {
            success: true,
            result,
            response: `🔍 **Analisi Immagine**\n\n${result.data || 'Analisi completata'}`
        };
    }

    /**
     * Parse argomenti comando
     */
    parseCommandArgs(args) {
        const options = {};
        const parts = args.split(/\s+/);
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part.startsWith('--')) {
                const key = part.slice(2);
                const value = parts[i + 1];
                if (value && !value.startsWith('--')) {
                    options[key] = value;
                    i++;
                } else {
                    options[key] = true;
                }
            } else if (part.includes('=')) {
                const [key, value] = part.split('=');
                options[key] = value;
            }
        }
        
        return options;
    }
}

module.exports = BotAgent;

