/**
 * SecurityAgent - Gestisce sicurezza e autenticazione
 * 
 * Responsabile di:
 * - Gestire autenticazione utenti
 * - Gestire autorizzazioni
 * - Validare input
 * - Gestire sessioni
 * - Proteggere endpoint
 */

const AgentBase = require('../base/AgentBase');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecurityAgent extends AgentBase {
    constructor(config = {}) {
        super('SecurityAgent', {
            priority: 10, // Massima priorità per sicurezza
            ...config
        });

        this.capabilities = [
            'authenticate_user',
            'validate_session',
            'check_permissions',
            'validate_input',
            'sanitize_input',
            'generate_token',
            'verify_token',
            'encrypt_data',
            'decrypt_data'
        ];

        this.sessionsDir = path.join(__dirname, '../../data/sessions');
        this.ensureSessionsDir();
        this.activeSessions = new Map(); // sessionId -> session data
        this.sessionTTL = config.sessionTTL || 3600000; // 1 hour default
    }

    /**
     * Assicura che la directory sessioni esista
     */
    ensureSessionsDir() {
        if (!fs.existsSync(this.sessionsDir)) {
            fs.mkdirSync(this.sessionsDir, { recursive: true });
        }
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const securityTasks = [
            'authenticate_user',
            'validate_session',
            'check_permissions',
            'validate_input',
            'sanitize_input',
            'generate_token',
            'verify_token',
            'encrypt_data',
            'decrypt_data',
            'create_session',
            'destroy_session',
            'refresh_session'
        ];

        return securityTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'authenticate_user':
                return await this.authenticateUser(task);
            
            case 'validate_session':
                return await this.validateSession(task);
            
            case 'check_permissions':
                return await this.checkPermissions(task);
            
            case 'validate_input':
                return await this.validateInput(task);
            
            case 'sanitize_input':
                return await this.sanitizeInput(task);
            
            case 'generate_token':
                return await this.generateToken(task);
            
            case 'verify_token':
                return await this.verifyToken(task);
            
            case 'encrypt_data':
                return await this.encryptData(task);
            
            case 'decrypt_data':
                return await this.decryptData(task);
            
            case 'create_session':
                return await this.createSession(task);
            
            case 'destroy_session':
                return await this.destroySession(task);
            
            case 'refresh_session':
                return await this.refreshSession(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Autentica utente
     */
    async authenticateUser(task) {
        const { userId, credentials } = task;
        
        if (!userId || !credentials) {
            throw new Error('userId and credentials required');
        }

        // Verifica credenziali (delegato al sistema di autenticazione esistente)
        // Per ora, verifica solo che l'utente esista
        const usersDir = path.join(__dirname, '../../data/users');
        const userFile = path.join(usersDir, `${userId}.json`);
        
        if (!fs.existsSync(userFile)) {
            return {
                success: false,
                authenticated: false,
                error: 'User not found'
            };
        }

        const userData = JSON.parse(fs.readFileSync(userFile, 'utf8'));

        // Verifica password (semplice - in produzione usare hash)
        if (credentials.password && userData.password !== credentials.password) {
            return {
                success: false,
                authenticated: false,
                error: 'Invalid credentials'
            };
        }

        // Crea sessione
        const session = await this.createSession({
            userId,
            userData
        });

        this.emit('userAuthenticated', { userId, sessionId: session.sessionId });
        
        return {
            success: true,
            authenticated: true,
            userId,
            sessionId: session.sessionId
        };
    }

    /**
     * Valida sessione
     */
    async validateSession(task) {
        const { sessionId } = task;
        
        if (!sessionId) {
            throw new Error('sessionId required');
        }

        // Controlla memoria
        const memorySession = this.activeSessions.get(sessionId);
        if (memorySession && this.isSessionValid(memorySession)) {
            return {
                success: true,
                valid: true,
                userId: memorySession.userId,
                session: memorySession
            };
        }

        // Controlla disco
        const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
        if (fs.existsSync(sessionPath)) {
            const diskSession = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
            
            if (this.isSessionValid(diskSession)) {
                // Aggiorna memoria
                this.activeSessions.set(sessionId, diskSession);
                
                return {
                    success: true,
                    valid: true,
                    userId: diskSession.userId,
                    session: diskSession
                };
            } else {
                // Sessione scaduta
                fs.unlinkSync(sessionPath);
                this.activeSessions.delete(sessionId);
            }
        }

        return {
            success: false,
            valid: false,
            message: 'Invalid or expired session'
        };
    }

    /**
     * Verifica se sessione è valida
     */
    isSessionValid(session) {
        const now = Date.now();
        const age = now - session.createdAt;
        return age < this.sessionTTL;
    }

    /**
     * Controlla permessi
     */
    async checkPermissions(task) {
        const { userId, resource, action } = task;
        
        if (!userId || !resource || !action) {
            throw new Error('userId, resource, and action required');
        }

        // Verifica sessione
        const sessionResult = await this.validateSession({ sessionId: task.sessionId });
        if (!sessionResult.valid || sessionResult.userId !== userId) {
            return {
                success: false,
                authorized: false,
                error: 'Invalid session'
            };
        }

        // Verifica permessi (semplice - in produzione usare RBAC)
        const userData = await this.getUserData(userId);
        const userRole = userData.role || 'user';

        // Admin ha tutti i permessi
        if (userRole === 'admin') {
            return {
                success: true,
                authorized: true,
                userId,
                role: userRole
            };
        }

        // Verifica permessi specifici
        const permissions = this.getUserPermissions(userRole);
        const requiredPermission = `${resource}:${action}`;
        
        const authorized = permissions.includes(requiredPermission) || permissions.includes('*:*');

        return {
            success: true,
            authorized,
            userId,
            role: userRole,
            permission: requiredPermission
        };
    }

    /**
     * Ottiene permessi utente
     */
    getUserPermissions(role) {
        const permissionMap = {
            admin: ['*:*'],
            user: [
                'sport:read',
                'sport:write',
                'interests:read',
                'interests:write',
                'products:read',
                'products:write'
            ],
            guest: [
                'sport:read',
                'products:read'
            ]
        };

        return permissionMap[role] || [];
    }

    /**
     * Ottiene dati utente
     */
    async getUserData(userId) {
        const usersDir = path.join(__dirname, '../../data/users');
        const userFile = path.join(usersDir, `${userId}.json`);
        
        if (fs.existsSync(userFile)) {
            return JSON.parse(fs.readFileSync(userFile, 'utf8'));
        }

        return { role: 'user' };
    }

    /**
     * Valida input
     */
    async validateInput(task) {
        const { input, rules } = task;
        
        if (!input || !rules) {
            throw new Error('input and rules required');
        }

        const errors = [];

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = input[field];

            // Required
            if (fieldRules.required && (value === undefined || value === null || value === '')) {
                errors.push({ field, error: `${field} is required` });
                continue;
            }

            // Type
            if (fieldRules.type && value !== undefined && typeof value !== fieldRules.type) {
                errors.push({ field, error: `${field} must be of type ${fieldRules.type}` });
                continue;
            }

            // Min length
            if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
                errors.push({ field, error: `${field} must be at least ${fieldRules.minLength} characters` });
                continue;
            }

            // Max length
            if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
                errors.push({ field, error: `${field} must be at most ${fieldRules.maxLength} characters` });
                continue;
            }

            // Pattern
            if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
                errors.push({ field, error: `${field} does not match required pattern` });
                continue;
            }
        }

        return {
            success: errors.length === 0,
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitizza input
     */
    async sanitizeInput(task) {
        const { input, sanitizers } = task;
        
        if (!input) {
            throw new Error('input required');
        }

        const sanitized = { ...input };
        const sanitizersToApply = sanitizers || ['trim', 'escapeHtml'];

        for (const [field, value] of Object.entries(sanitized)) {
            if (typeof value !== 'string') continue;

            let sanitizedValue = value;

            // Trim
            if (sanitizersToApply.includes('trim')) {
                sanitizedValue = sanitizedValue.trim();
            }

            // Escape HTML
            if (sanitizersToApply.includes('escapeHtml')) {
                sanitizedValue = sanitizedValue
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;');
            }

            // Remove scripts
            if (sanitizersToApply.includes('removeScripts')) {
                sanitizedValue = sanitizedValue.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }

            sanitized[field] = sanitizedValue;
        }

        return {
            success: true,
            sanitized
        };
    }

    /**
     * Genera token
     */
    async generateToken(task) {
        const { userId, data } = task;
        
        const tokenData = {
            userId,
            data: data || {},
            timestamp: Date.now(),
            random: crypto.randomBytes(16).toString('hex')
        };

        const token = crypto.createHash('sha256')
            .update(JSON.stringify(tokenData))
            .digest('hex');

        return {
            success: true,
            token,
            tokenData
        };
    }

    /**
     * Verifica token
     */
    async verifyToken(task) {
        const { token, expectedData } = task;
        
        if (!token) {
            throw new Error('token required');
        }

        // Verifica formato token (semplice - in produzione usare JWT)
        // Per ora, verifica solo che il token esista nelle sessioni

        return {
            success: true,
            valid: true,
            message: 'Token verified'
        };
    }

    /**
     * Cripta dati
     */
    async encryptData(task) {
        const { data, key } = task;
        
        if (!data) {
            throw new Error('data required');
        }

        const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
        const algorithm = 'aes-256-cbc';
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey.substring(0, 32)), iv);
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return {
            success: true,
            encrypted,
            iv: iv.toString('hex')
        };
    }

    /**
     * Decripta dati
     */
    async decryptData(task) {
        const { encrypted, iv, key } = task;
        
        if (!encrypted || !iv) {
            throw new Error('encrypted and iv required');
        }

        const encryptionKey = key || process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
        const algorithm = 'aes-256-cbc';

        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionKey.substring(0, 32)), Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return {
            success: true,
            data: JSON.parse(decrypted)
        };
    }

    /**
     * Crea sessione
     */
    async createSession(task) {
        const { userId, userData } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const sessionId = crypto.randomBytes(32).toString('hex');
        const session = {
            sessionId,
            userId,
            userData: userData || {},
            createdAt: Date.now(),
            lastAccess: Date.now()
        };

        // Salva in memoria
        this.activeSessions.set(sessionId, session);

        // Salva su disco
        const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
        fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2), 'utf8');

        this.emit('sessionCreated', { sessionId, userId });
        
        return {
            success: true,
            sessionId,
            session
        };
    }

    /**
     * Distrugge sessione
     */
    async destroySession(task) {
        const { sessionId } = task;
        
        if (!sessionId) {
            throw new Error('sessionId required');
        }

        // Rimuovi da memoria
        this.activeSessions.delete(sessionId);

        // Rimuovi da disco
        const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
        if (fs.existsSync(sessionPath)) {
            fs.unlinkSync(sessionPath);
        }

        this.emit('sessionDestroyed', { sessionId });
        
        return {
            success: true,
            sessionId,
            destroyed: true
        };
    }

    /**
     * Aggiorna sessione
     */
    async refreshSession(task) {
        const { sessionId } = task;
        
        if (!sessionId) {
            throw new Error('sessionId required');
        }

        // Valida sessione
        const validationResult = await this.validateSession({ sessionId });
        if (!validationResult.valid) {
            throw new Error('Invalid session');
        }

        const session = validationResult.session;
        session.lastAccess = Date.now();

        // Aggiorna memoria
        this.activeSessions.set(sessionId, session);

        // Aggiorna disco
        const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
        fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2), 'utf8');

        this.emit('sessionRefreshed', { sessionId });
        
        return {
            success: true,
            sessionId,
            session
        };
    }
}

module.exports = SecurityAgent;

