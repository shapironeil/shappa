/**
 * Validation Utilities Module
 * 
 * Fornisce funzioni di validazione riutilizzabili:
 * - Validazione email
 * - Validazione username
 * - Validazione password
 * - Validazione URL
 * - Validazione altri tipi di dati comuni
 * 
 * @module lib/utils/validationUtils
 */

/**
 * Valida un indirizzo email
 * @param {string} email - Email da validare
 * @returns {boolean} true se l'email è valida
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Valida un username
 * @param {string} username - Username da validare
 * @param {number} minLength - Lunghezza minima (default: 3)
 * @param {number} maxLength - Lunghezza massima (default: 20)
 * @returns {Object} { valid: boolean, error: string|null }
 */
function validateUsername(username, minLength = 3, maxLength = 20) {
    if (!username || typeof username !== 'string') {
        return { valid: false, error: 'Username is required' };
    }
    
    const trimmed = username.trim();
    
    if (trimmed.length < minLength) {
        return { valid: false, error: `Username must be at least ${minLength} characters` };
    }
    
    if (trimmed.length > maxLength) {
        return { valid: false, error: `Username must be at most ${maxLength} characters` };
    }
    
    // Solo lettere, numeri, underscore e trattini
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmed)) {
        return { valid: false, error: 'Username can only contain letters, numbers, underscores and hyphens' };
    }
    
    return { valid: true, error: null };
}

/**
 * Valida una password
 * @param {string} password - Password da validare
 * @param {number} minLength - Lunghezza minima (default: 8)
 * @returns {Object} { valid: boolean, error: string|null }
 */
function validatePassword(password, minLength = 8) {
    if (!password || typeof password !== 'string') {
        return { valid: false, error: 'Password is required' };
    }
    
    if (password.length < minLength) {
        return { valid: false, error: `Password must be at least ${minLength} characters` };
    }
    
    return { valid: true, error: null };
}

/**
 * Valida un URL
 * @param {string} url - URL da validare
 * @returns {boolean} true se l'URL è valido
 */
function isValidUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }
    
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Valida un Discord webhook URL
 * @param {string} webhookUrl - Webhook URL da validare
 * @returns {boolean} true se è un webhook Discord valido
 */
function isValidDiscordWebhook(webhookUrl) {
    if (!webhookUrl || typeof webhookUrl !== 'string') {
        return false;
    }
    
    return webhookUrl.includes('discord.com/api/webhooks/');
}

/**
 * Valida un userId
 * @param {string} userId - User ID da validare
 * @returns {boolean} true se l'ID è valido
 */
function isValidUserId(userId) {
    if (!userId || typeof userId !== 'string') {
        return false;
    }
    
    // User ID deve essere non vuoto e non contenere solo spazi
    return userId.trim().length > 0;
}

/**
 * Valida un ASIN Amazon
 * @param {string} asin - ASIN da validare
 * @returns {boolean} true se l'ASIN è valido
 */
function isValidASIN(asin) {
    if (!asin || typeof asin !== 'string') {
        return false;
    }
    
    // ASIN Amazon è tipicamente 10 caratteri alfanumerici
    const asinRegex = /^[A-Z0-9]{10}$/;
    return asinRegex.test(asin.toUpperCase());
}

/**
 * Valida un numero positivo
 * @param {*} value - Valore da validare
 * @returns {boolean} true se è un numero positivo
 */
function isPositiveNumber(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0;
}

/**
 * Valida un numero intero positivo
 * @param {*} value - Valore da validare
 * @returns {boolean} true se è un intero positivo
 */
function isPositiveInteger(value) {
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num) && num > 0;
}

/**
 * Valida che un valore sia in un array di valori permessi
 * @param {*} value - Valore da validare
 * @param {Array} allowedValues - Array di valori permessi
 * @returns {boolean} true se il valore è permesso
 */
function isAllowedValue(value, allowedValues) {
    return allowedValues.includes(value);
}

/**
 * Sanitizza una stringa rimuovendo caratteri pericolosi
 * @param {string} str - Stringa da sanitizzare
 * @returns {string} Stringa sanitizzata
 */
function sanitizeString(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }
    
    return str.trim().replace(/[<>]/g, '');
}

/**
 * Valida i dati di registrazione utente
 * @param {Object} data - Dati da validare { username, email, password }
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validateRegistrationData(data) {
    const errors = [];
    
    // Valida username
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.valid) {
        errors.push(usernameValidation.error);
    }
    
    // Valida email
    if (!isValidEmail(data.email)) {
        errors.push('Invalid email format');
    }
    
    // Valida password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
        errors.push(passwordValidation.error);
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    isValidEmail,
    validateUsername,
    validatePassword,
    isValidUrl,
    isValidDiscordWebhook,
    isValidUserId,
    isValidASIN,
    isPositiveNumber,
    isPositiveInteger,
    isAllowedValue,
    sanitizeString,
    validateRegistrationData
};


