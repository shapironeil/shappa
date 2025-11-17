/**
 * Helper per gestire path dei modelli 3D
 * 
 * Supporta sia file locali che Digital Ocean Spaces
 */

/**
 * Ottiene il path corretto per un modello GLB
 * 
 * @param {string} filename - Nome del file (es: 'laptop_free.glb')
 * @param {string} basePath - Path base ('models' o '3d')
 * @returns {string} - Path completo al modello
 */
function getModelPath(filename, basePath = 'models') {
    // Se Digital Ocean Spaces è configurato, usa Spaces
    if (process.env.DO_SPACES_ENDPOINT && process.env.DO_SPACES_BUCKET) {
        const endpoint = process.env.DO_SPACES_ENDPOINT;
        const bucket = process.env.DO_SPACES_BUCKET;
        
        // Usa CDN se disponibile, altrimenti endpoint diretto
        const cdnUrl = endpoint.replace('.digitaloceanspaces.com', '.cdn.digitaloceanspaces.com');
        return `${cdnUrl}/${bucket}/${basePath}/${filename}`;
    }
    
    // Fallback: file locale
    return `/${basePath}/${filename}`;
}

/**
 * Ottiene il path usando l'endpoint API (redirect)
 * 
 * @param {string} filename - Nome del file
 * @returns {string} - Path API endpoint
 */
function getModelApiPath(filename) {
    return `/api/models/${filename}`;
}

// Export per Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getModelPath,
        getModelApiPath
    };
}

// Export per browser (globale)
if (typeof window !== 'undefined') {
    window.ModelPathHelper = {
        getModelPath: (filename, basePath = 'models') => {
            // In browser, usa sempre path locale o API endpoint
            // Se l'endpoint API è disponibile, usalo
            return `/api/models/${filename}`;
        },
        getModelApiPath
    };
}

