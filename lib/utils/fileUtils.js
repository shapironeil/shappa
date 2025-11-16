/**
 * File Utilities Module
 * 
 * Fornisce funzioni riutilizzabili per operazioni file comuni:
 * - Lettura/scrittura file JSON
 * - Creazione directory
 * - Gestione errori file operations
 * 
 * @module lib/utils/fileUtils
 */

const fs = require('fs');
const { promises: fsPromises } = require('fs');
const path = require('path');

/**
 * Legge un file JSON in modo sicuro
 * @param {string} filePath - Path del file da leggere
 * @param {*} defaultValue - Valore di default se il file non esiste o è invalido
 * @returns {Promise<*>} Contenuto del file parsato o defaultValue
 */
async function readJSONFile(filePath, defaultValue = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return defaultValue;
        }
        
        const content = await fsPromises.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Error reading JSON file ${filePath}:`, error.message);
        return defaultValue;
    }
}

/**
 * Legge un file JSON in modo sincrono
 * @param {string} filePath - Path del file da leggere
 * @param {*} defaultValue - Valore di default se il file non esiste o è invalido
 * @returns {*} Contenuto del file parsato o defaultValue
 */
function readJSONFileSync(filePath, defaultValue = null) {
    try {
        if (!fs.existsSync(filePath)) {
            return defaultValue;
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Error reading JSON file ${filePath}:`, error.message);
        return defaultValue;
    }
}

/**
 * Scrive un file JSON in modo sicuro
 * @param {string} filePath - Path del file da scrivere
 * @param {*} data - Dati da scrivere (saranno convertiti in JSON)
 * @param {number} indent - Indentazione per il JSON (default: 2)
 * @returns {Promise<boolean>} true se successo, false altrimenti
 */
async function writeJSONFile(filePath, data, indent = 2) {
    try {
        // Assicura che la directory esista
        const dir = path.dirname(filePath);
        await fsPromises.mkdir(dir, { recursive: true });
        
        // Scrive il file
        await fsPromises.writeFile(
            filePath,
            JSON.stringify(data, null, indent),
            'utf8'
        );
        
        return true;
    } catch (error) {
        console.error(`❌ Error writing JSON file ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Scrive un file JSON in modo sincrono
 * @param {string} filePath - Path del file da scrivere
 * @param {*} data - Dati da scrivere (saranno convertiti in JSON)
 * @param {number} indent - Indentazione per il JSON (default: 2)
 * @returns {boolean} true se successo, false altrimenti
 */
function writeJSONFileSync(filePath, data, indent = 2) {
    try {
        // Assicura che la directory esista
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Scrive il file
        fs.writeFileSync(
            filePath,
            JSON.stringify(data, null, indent),
            'utf8'
        );
        
        return true;
    } catch (error) {
        console.error(`❌ Error writing JSON file ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Assicura che una directory esista
 * @param {string} dirPath - Path della directory
 * @returns {Promise<boolean>} true se la directory esiste o è stata creata
 */
async function ensureDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            await fsPromises.mkdir(dirPath, { recursive: true });
            console.log(`📁 Created directory: ${dirPath}`);
        }
        return true;
    } catch (error) {
        console.error(`❌ Error creating directory ${dirPath}:`, error.message);
        return false;
    }
}

/**
 * Assicura che una directory esista (sincrono)
 * @param {string} dirPath - Path della directory
 * @returns {boolean} true se la directory esiste o è stata creata
 */
function ensureDirectorySync(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`📁 Created directory: ${dirPath}`);
        }
        return true;
    } catch (error) {
        console.error(`❌ Error creating directory ${dirPath}:`, error.message);
        return false;
    }
}

/**
 * Verifica se un file esiste
 * @param {string} filePath - Path del file
 * @returns {boolean} true se il file esiste
 */
function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Elimina un file in modo sicuro
 * @param {string} filePath - Path del file da eliminare
 * @returns {Promise<boolean>} true se eliminato con successo
 */
async function deleteFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            await fsPromises.unlink(filePath);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Error deleting file ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Legge tutti i file JSON in una directory
 * @param {string} dirPath - Path della directory
 * @returns {Promise<Object>} Oggetto con nome file come chiave e contenuto come valore
 */
async function readAllJSONFiles(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            return {};
        }
        
        const files = await fsPromises.readdir(dirPath);
        const result = {};
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(dirPath, file);
                const content = await readJSONFile(filePath);
                if (content !== null) {
                    result[file] = content;
                }
            }
        }
        
        return result;
    } catch (error) {
        console.error(`❌ Error reading directory ${dirPath}:`, error.message);
        return {};
    }
}

module.exports = {
    readJSONFile,
    readJSONFileSync,
    writeJSONFile,
    writeJSONFileSync,
    ensureDirectory,
    ensureDirectorySync,
    fileExists,
    deleteFile,
    readAllJSONFiles
};







