/**
 * Path Utilities Module
 * 
 * Fornisce funzioni per gestire i path dei dati utente e sistema:
 * - Path per dati utente (interests, webhooks, automations, sport, etc.)
 * - Path per dati sistema (ebay tokens, saved products, etc.)
 * - Helper per costruire path consistenti
 * 
 * @module lib/utils/pathUtils
 */

const path = require('path');

// Base data directory
const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Restituisce il path della directory data
 * @returns {string} Path della directory data
 */
function getDataDir() {
    return DATA_DIR;
}

/**
 * Restituisce il path della directory per un tipo di dato
 * @param {string} dataType - Tipo di dato (es: 'interests', 'webhooks', 'users', etc.)
 * @param {string} subDir - Sottodirectory opzionale (es: 'profiles', 'programs')
 * @returns {string} Path della directory
 */
function getDataDirPath(dataType, subDir = null) {
    if (subDir) {
        return path.join(DATA_DIR, dataType, subDir);
    }
    return path.join(DATA_DIR, dataType);
}

/**
 * Restituisce il path del file interessi per un utente
 * @param {string} userId - ID utente
 * @returns {string} Path del file interessi
 */
function getUserInterestsPath(userId) {
    return path.join(DATA_DIR, 'interests', `interests_${userId}.json`);
}

/**
 * Restituisce il path del file webhook per un utente
 * @param {string} userId - ID utente
 * @returns {string} Path del file webhook
 */
function getUserWebhookPath(userId) {
    return path.join(DATA_DIR, 'webhooks', `webhook_${userId}.json`);
}

/**
 * Restituisce il path del file utente
 * @param {string} userId - ID utente
 * @returns {string} Path del file utente
 */
function getUserPath(userId) {
    return path.join(DATA_DIR, 'users', `${userId}.json`);
}

/**
 * Restituisce il path del file automazioni per un utente
 * @param {string} userId - ID utente
 * @returns {string} Path del file automazioni
 */
function getUserAutomationsPath(userId) {
    return path.join(DATA_DIR, 'automations', `${userId}.json`);
}

/**
 * Restituisce il path del file profilo sport per un utente
 * @param {string} userId - ID utente
 * @returns {string} Path del file profilo sport
 */
function getUserSportProfilePath(userId) {
    return path.join(DATA_DIR, 'sport', 'profiles', `${userId}.json`);
}

/**
 * Restituisce il path del file programma sport per un utente
 * @param {string} userId - ID utente
 * @returns {string} Path del file programma sport
 */
function getUserSportProgramPath(userId) {
    return path.join(DATA_DIR, 'sport', 'programs', `${userId}.json`);
}

/**
 * Restituisce il path del file statistiche sport per un utente
 * @param {string} userId - ID utente
 * @returns {string} Path del file statistiche sport
 */
function getUserSportStatsPath(userId) {
    return path.join(DATA_DIR, 'sport', 'stats', `${userId}.json`);
}

/**
 * Restituisce il path del file token eBay per un utente
 * @param {string} userId - ID utente
 * @returns {string} Path del file token eBay
 */
function getEbayTokenPath(userId) {
    return path.join(DATA_DIR, 'ebay', userId, 'tokens.json');
}

/**
 * Restituisce il path della directory token eBay per un utente
 * @param {string} userId - ID utente
 * @returns {string} Path della directory token eBay
 */
function getEbayTokenDir(userId) {
    return path.join(DATA_DIR, 'ebay', userId);
}

/**
 * Restituisce il path del file prodotto salvato
 * @param {string} asin - ASIN del prodotto
 * @returns {string} Path del file prodotto
 */
function getSavedProductPath(asin) {
    return path.join(DATA_DIR, 'saved-products', `${asin}.json`);
}

/**
 * Restituisce il path della directory immagini prodotto
 * @param {string} asin - ASIN del prodotto
 * @returns {string} Path della directory immagini
 */
function getProductImagesDir(asin) {
    return path.join(DATA_DIR, 'product-images', asin);
}

/**
 * Restituisce il path di un'immagine prodotto
 * @param {string} asin - ASIN del prodotto
 * @param {string} filename - Nome del file immagine
 * @returns {string} Path completo dell'immagine
 */
function getProductImagePath(asin, filename) {
    return path.join(DATA_DIR, 'product-images', asin, filename);
}

/**
 * Restituisce il path della directory immagini ricetta
 * @param {string} recipeId - ID della ricetta
 * @returns {string} Path della directory immagini ricetta
 */
function getRecipeImagesDir(recipeId) {
    return path.join(DATA_DIR, 'recipe-images', recipeId);
}

/**
 * Restituisce il path di un'immagine ricetta
 * @param {string} recipeId - ID della ricetta
 * @param {string} filename - Nome del file immagine
 * @returns {string} Path completo dell'immagine ricetta
 */
function getRecipeImagePath(recipeId, filename) {
    return path.join(DATA_DIR, 'recipe-images', recipeId, filename);
}

module.exports = {
    getDataDir,
    getDataDirPath,
    getUserInterestsPath,
    getUserWebhookPath,
    getUserPath,
    getUserAutomationsPath,
    getUserSportProfilePath,
    getUserSportProgramPath,
    getUserSportStatsPath,
    getEbayTokenPath,
    getEbayTokenDir,
    getSavedProductPath,
    getProductImagesDir,
    getProductImagePath,
    getRecipeImagesDir,
    getRecipeImagePath
};

