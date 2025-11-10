/**
 * Response Utilities Module
 * 
 * Fornisce funzioni per standardizzare le risposte API:
 * - Risposte di successo standardizzate
 * - Risposte di errore standardizzate
 * - Validazione risposte
 * 
 * @module lib/utils/responseUtils
 */

/**
 * Invia una risposta di successo standardizzata
 * @param {Object} res - Express response object
 * @param {*} data - Dati da inviare
 * @param {string} message - Messaggio opzionale
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Response object
 */
function sendSuccess(res, data = null, message = null, statusCode = 200) {
    const response = {
        success: true
    };
    
    if (data !== null) {
        if (typeof data === 'object' && !Array.isArray(data)) {
            Object.assign(response, data);
        } else {
            response.data = data;
        }
    }
    
    if (message) {
        response.message = message;
    }
    
    return res.status(statusCode).json(response);
}

/**
 * Invia una risposta di errore standardizzata
 * @param {Object} res - Express response object
 * @param {string|Error} error - Messaggio di errore o Error object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} details - Dettagli aggiuntivi dell'errore
 * @returns {Object} Response object
 */
function sendError(res, error, statusCode = 500, details = null) {
    const errorMessage = error instanceof Error ? error.message : error;
    
    const response = {
        success: false,
        error: errorMessage
    };
    
    if (details) {
        response.details = details;
    }
    
    // Log errore sul server
    console.error(`❌ API Error [${statusCode}]:`, errorMessage);
    if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
    }
    
    return res.status(statusCode).json(response);
}

/**
 * Invia una risposta di errore di validazione
 * @param {Object} res - Express response object
 * @param {string|Array} errors - Messaggio di errore o array di errori
 * @returns {Object} Response object
 */
function sendValidationError(res, errors) {
    const errorMessage = Array.isArray(errors) 
        ? errors.join(', ') 
        : errors;
    
    return sendError(res, errorMessage, 400);
}

/**
 * Invia una risposta di errore di autenticazione
 * @param {Object} res - Express response object
 * @param {string} message - Messaggio di errore (default: 'Unauthorized')
 * @returns {Object} Response object
 */
function sendUnauthorized(res, message = 'Unauthorized') {
    return sendError(res, message, 401);
}

/**
 * Invia una risposta di errore di permessi insufficienti
 * @param {Object} res - Express response object
 * @param {string} message - Messaggio di errore (default: 'Forbidden')
 * @returns {Object} Response object
 */
function sendForbidden(res, message = 'Forbidden') {
    return sendError(res, message, 403);
}

/**
 * Invia una risposta di errore di risorsa non trovata
 * @param {Object} res - Express response object
 * @param {string} message - Messaggio di errore (default: 'Not found')
 * @returns {Object} Response object
 */
function sendNotFound(res, message = 'Not found') {
    return sendError(res, message, 404);
}

/**
 * Wrapper per gestire errori in route handlers async
 * @param {Function} fn - Funzione async da eseguire
 * @returns {Function} Express route handler
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Valida che un campo richiesto sia presente
 * @param {Object} data - Oggetto da validare
 * @param {string|Array} fields - Campo o array di campi richiesti
 * @returns {Object|null} Oggetto con errori o null se valido
 */
function validateRequired(data, fields) {
    const requiredFields = Array.isArray(fields) ? fields : [fields];
    const errors = [];
    
    for (const field of requiredFields) {
        if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
            errors.push(`${field} is required`);
        }
    }
    
    return errors.length > 0 ? { errors } : null;
}

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
    sendUnauthorized,
    sendForbidden,
    sendNotFound,
    asyncHandler,
    validateRequired
};


