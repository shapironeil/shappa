/**
 * NotificationAgent - Gestisce notifiche
 * 
 * Responsabile di:
 * - Inviare notifiche Discord
 * - Inviare notifiche email
 * - Gestire notifiche in-app
 * - Programmare notifiche
 * - Gestire template notifiche
 */

const AgentBase = require('../base/AgentBase');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class NotificationAgent extends AgentBase {
    constructor(config = {}) {
        super('NotificationAgent', {
            priority: 7,
            ...config
        });

        this.capabilities = [
            'send_discord_notification',
            'send_email_notification',
            'send_in_app_notification',
            'schedule_notification',
            'cancel_notification',
            'get_notification_history',
            'create_notification_template'
        ];

        this.notificationsDir = path.join(__dirname, '../../data/notifications');
        this.ensureNotificationsDir();
        this.scheduledNotifications = new Map(); // notificationId -> notification data
    }

    /**
     * Assicura che la directory notifiche esista
     */
    ensureNotificationsDir() {
        if (!fs.existsSync(this.notificationsDir)) {
            fs.mkdirSync(this.notificationsDir, { recursive: true });
        }
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const notificationTasks = [
            'send_discord_notification',
            'send_email_notification',
            'send_in_app_notification',
            'schedule_notification',
            'cancel_notification',
            'get_notification_history',
            'create_notification_template',
            'send_notification',
            'broadcast_notification'
        ];

        return notificationTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'send_discord_notification':
                return await this.sendDiscordNotification(task);
            
            case 'send_email_notification':
                return await this.sendEmailNotification(task);
            
            case 'send_in_app_notification':
                return await this.sendInAppNotification(task);
            
            case 'schedule_notification':
                return await this.scheduleNotification(task);
            
            case 'cancel_notification':
                return await this.cancelNotification(task);
            
            case 'get_notification_history':
                return await this.getNotificationHistory(task);
            
            case 'create_notification_template':
                return await this.createNotificationTemplate(task);
            
            case 'send_notification':
                return await this.sendNotification(task);
            
            case 'broadcast_notification':
                return await this.broadcastNotification(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Invia notifica Discord
     */
    async sendDiscordNotification(task) {
        const { userId, webhookUrl, message, embeds, title, color } = task;
        
        if (!webhookUrl && !userId) {
            throw new Error('webhookUrl or userId required');
        }

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

        try {
            const payload = {
                content: message || null,
                embeds: embeds || []
            };

            // Aggiungi embed se title fornito
            if (title && !embeds) {
                payload.embeds = [{
                    title,
                    description: message,
                    color: color || 0x3498db,
                    timestamp: new Date().toISOString()
                }];
            }

            const response = await axios.post(webhook, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Salva notifica nella cronologia
            await this.saveNotificationHistory({
                userId,
                type: 'discord',
                message,
                success: true
            });

            this.emit('discordNotificationSent', { userId, message, success: true });
            
            return {
                success: true,
                message: 'Discord notification sent successfully',
                userId
            };
        } catch (error) {
            // Salva errore nella cronologia
            await this.saveNotificationHistory({
                userId,
                type: 'discord',
                message,
                success: false,
                error: error.message
            });

            this.emit('discordNotificationFailed', { userId, error: error.message });
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Invia notifica email
     */
    async sendEmailNotification(task) {
        const { userId, email, subject, body, template } = task;
        
        if (!email && !userId) {
            throw new Error('email or userId required');
        }

        // Recupera email utente se non fornita
        let recipientEmail = email;
        if (!recipientEmail && userId) {
            const userPath = path.join(__dirname, '../../data/users', `${userId}.json`);
            if (fs.existsSync(userPath)) {
                const userData = JSON.parse(fs.readFileSync(userPath, 'utf8'));
                recipientEmail = userData.email;
            }
        }

        if (!recipientEmail) {
            throw new Error('Email not found');
        }

        // TODO: Integrare con servizio email (SendGrid, AWS SES, etc.)
        // Per ora, salva solo nella cronologia
        await this.saveNotificationHistory({
            userId,
            type: 'email',
            email: recipientEmail,
            subject,
            body,
            success: true
        });

        this.emit('emailNotificationSent', { userId, email: recipientEmail, subject });
        
        return {
            success: true,
            message: 'Email notification queued',
            email: recipientEmail
        };
    }

    /**
     * Invia notifica in-app
     */
    async sendInAppNotification(task) {
        const { userId, title, message, type, action } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            title,
            message,
            type: type || 'info',
            action: action || null,
            read: false,
            createdAt: new Date().toISOString()
        };

        // Salva notifica
        const notificationsPath = path.join(this.notificationsDir, `notifications_${userId}.json`);
        let notifications = [];
        
        if (fs.existsSync(notificationsPath)) {
            notifications = JSON.parse(fs.readFileSync(notificationsPath, 'utf8'));
        }

        notifications.push(notification);
        
        // Mantieni solo ultime 100 notifiche
        if (notifications.length > 100) {
            notifications = notifications.slice(-100);
        }

        fs.writeFileSync(notificationsPath, JSON.stringify(notifications, null, 2), 'utf8');

        this.emit('inAppNotificationSent', { userId, notification });
        
        return {
            success: true,
            notification,
            message: 'In-app notification created'
        };
    }

    /**
     * Programma notifica
     */
    async scheduleNotification(task) {
        const { userId, notificationType, schedule, message, data } = task;
        
        if (!userId || !notificationType || !schedule) {
            throw new Error('userId, notificationType, and schedule required');
        }

        const notificationId = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const scheduledNotification = {
            id: notificationId,
            userId,
            type: notificationType,
            schedule,
            message,
            data: data || {},
            createdAt: new Date().toISOString(),
            sent: false
        };

        this.scheduledNotifications.set(notificationId, scheduledNotification);

        this.emit('notificationScheduled', { notificationId, scheduledNotification });
        
        return {
            success: true,
            notificationId,
            message: 'Notification scheduled successfully'
        };
    }

    /**
     * Cancella notifica programmata
     */
    async cancelNotification(task) {
        const { notificationId } = task;
        
        if (!notificationId) {
            throw new Error('notificationId required');
        }

        const removed = this.scheduledNotifications.delete(notificationId);
        
        if (removed) {
            this.emit('notificationCancelled', { notificationId });
        }
        
        return {
            success: removed,
            message: removed ? 'Notification cancelled successfully' : 'Notification not found'
        };
    }

    /**
     * Ottiene cronologia notifiche
     */
    async getNotificationHistory(task) {
        const { userId, type, limit = 50 } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const historyPath = path.join(this.notificationsDir, `history_${userId}.json`);
        
        if (!fs.existsSync(historyPath)) {
            return {
                success: true,
                history: []
            };
        }

        let history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        
        // Filtra per tipo se specificato
        if (type) {
            history = history.filter(n => n.type === type);
        }

        // Limita risultati
        history = history.slice(-limit);

        return {
            success: true,
            history,
            count: history.length
        };
    }

    /**
     * Salva notifica nella cronologia
     */
    async saveNotificationHistory(notification) {
        const { userId } = notification;
        
        if (!userId) return;

        const historyPath = path.join(this.notificationsDir, `history_${userId}.json`);
        let history = [];
        
        if (fs.existsSync(historyPath)) {
            history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        }

        history.push({
            ...notification,
            timestamp: new Date().toISOString()
        });

        // Mantieni solo ultime 1000 notifiche
        if (history.length > 1000) {
            history = history.slice(-1000);
        }

        fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
    }

    /**
     * Crea template notifica
     */
    async createNotificationTemplate(task) {
        const { templateId, template } = task;
        
        if (!templateId || !template) {
            throw new Error('templateId and template required');
        }

        const templatesPath = path.join(this.notificationsDir, 'templates.json');
        let templates = {};
        
        if (fs.existsSync(templatesPath)) {
            templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
        }

        templates[templateId] = {
            ...template,
            createdAt: new Date().toISOString()
        };

        fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf8');

        this.emit('notificationTemplateCreated', { templateId, template });
        
        return {
            success: true,
            templateId,
            message: 'Notification template created successfully'
        };
    }

    /**
     * Invia notifica (metodo generico)
     */
    async sendNotification(task) {
        const { userId, type, message, data } = task;
        
        if (!userId || !type) {
            throw new Error('userId and type required');
        }

        switch (type) {
            case 'discord':
                return await this.sendDiscordNotification({
                    userId,
                    message: message || data.message,
                    embeds: data.embeds,
                    title: data.title,
                    color: data.color
                });
            
            case 'email':
                return await this.sendEmailNotification({
                    userId,
                    subject: data.subject,
                    body: data.body || message
                });
            
            case 'in_app':
                return await this.sendInAppNotification({
                    userId,
                    title: data.title,
                    message: message || data.message,
                    type: data.type
                });
            
            default:
                throw new Error(`Unknown notification type: ${type}`);
        }
    }

    /**
     * Broadcast notifica a più utenti
     */
    async broadcastNotification(task) {
        const { userIds, type, message, data } = task;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            throw new Error('userIds array required');
        }

        const results = [];
        
        for (const userId of userIds) {
            try {
                const result = await this.sendNotification({
                    userId,
                    type,
                    message,
                    data
                });
                results.push({ userId, success: true, result });
            } catch (error) {
                results.push({ userId, success: false, error: error.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        
        return {
            success: true,
            total: userIds.length,
            successCount,
            failedCount: userIds.length - successCount,
            results
        };
    }
}

module.exports = NotificationAgent;

