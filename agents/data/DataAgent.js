/**
 * DataAgent - Gestisce dati e cache
 * 
 * Responsabile di:
 * - Gestire cache dati
 * - Sincronizzare dati tra frontend e backend
 * - Gestire persistenza dati
 * - Ottimizzare accesso ai dati
 * - Gestire export/import dati
 */

const AgentBase = require('../base/AgentBase');
const fs = require('fs');
const path = require('path');

class DataAgent extends AgentBase {
    constructor(config = {}) {
        super('DataAgent', {
            priority: 6,
            ...config
        });

        this.capabilities = [
            'cache_data',
            'get_cached_data',
            'invalidate_cache',
            'sync_data',
            'export_data',
            'import_data',
            'backup_data',
            'restore_data'
        ];

        this.cacheDir = path.join(__dirname, '../../data/cache');
        this.ensureCacheDir();
        this.memoryCache = new Map(); // In-memory cache
        this.cacheTTL = config.cacheTTL || 3600000; // 1 hour default
    }

    /**
     * Assicura che la directory cache esista
     */
    ensureCacheDir() {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const dataTasks = [
            'cache_data',
            'get_cached_data',
            'invalidate_cache',
            'sync_data',
            'export_data',
            'import_data',
            'backup_data',
            'restore_data',
            'clear_cache',
            'get_cache_stats'
        ];

        return dataTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'cache_data':
                return await this.cacheData(task);
            
            case 'get_cached_data':
                return await this.getCachedData(task);
            
            case 'invalidate_cache':
                return await this.invalidateCache(task);
            
            case 'sync_data':
                return await this.syncData(task);
            
            case 'export_data':
                return await this.exportData(task);
            
            case 'import_data':
                return await this.importData(task);
            
            case 'backup_data':
                return await this.backupData(task);
            
            case 'restore_data':
                return await this.restoreData(task);
            
            case 'clear_cache':
                return await this.clearCache(task);
            
            case 'get_cache_stats':
                return await this.getCacheStats(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Salva dati in cache
     */
    async cacheData(task) {
        const { key, data, ttl } = task;
        
        if (!key || data === undefined) {
            throw new Error('key and data required');
        }

        const cacheEntry = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.cacheTTL
        };

        // Salva in memoria
        this.memoryCache.set(key, cacheEntry);

        // Salva su disco
        const cachePath = path.join(this.cacheDir, `${this.sanitizeKey(key)}.json`);
        fs.writeFileSync(cachePath, JSON.stringify(cacheEntry, null, 2), 'utf8');

        this.emit('dataCached', { key, timestamp: cacheEntry.timestamp });
        
        return {
            success: true,
            key,
            cached: true
        };
    }

    /**
     * Ottiene dati dalla cache
     */
    async getCachedData(task) {
        const { key } = task;
        
        if (!key) {
            throw new Error('key required');
        }

        // Controlla memoria prima
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && this.isCacheValid(memoryEntry)) {
            return {
                success: true,
                data: memoryEntry.data,
                fromCache: true,
                source: 'memory'
            };
        }

        // Controlla disco
        const cachePath = path.join(this.cacheDir, `${this.sanitizeKey(key)}.json`);
        if (fs.existsSync(cachePath)) {
            const diskEntry = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            
            if (this.isCacheValid(diskEntry)) {
                // Aggiorna memoria
                this.memoryCache.set(key, diskEntry);
                
                return {
                    success: true,
                    data: diskEntry.data,
                    fromCache: true,
                    source: 'disk'
                };
            } else {
                // Cache scaduta, rimuovi
                fs.unlinkSync(cachePath);
                this.memoryCache.delete(key);
            }
        }

        return {
            success: false,
            data: null,
            fromCache: false,
            message: 'Cache miss'
        };
    }

    /**
     * Verifica se cache è valida
     */
    isCacheValid(entry) {
        const now = Date.now();
        const age = now - entry.timestamp;
        return age < entry.ttl;
    }

    /**
     * Invalida cache
     */
    async invalidateCache(task) {
        const { key } = task;
        
        if (!key) {
            throw new Error('key required');
        }

        // Rimuovi da memoria
        this.memoryCache.delete(key);

        // Rimuovi da disco
        const cachePath = path.join(this.cacheDir, `${this.sanitizeKey(key)}.json`);
        if (fs.existsSync(cachePath)) {
            fs.unlinkSync(cachePath);
        }

        this.emit('cacheInvalidated', { key });
        
        return {
            success: true,
            key,
            invalidated: true
        };
    }

    /**
     * Sincronizza dati
     */
    async syncData(task) {
        const { userId, dataType, data } = task;
        
        if (!userId || !dataType) {
            throw new Error('userId and dataType required');
        }

        // Salva dati
        const dataDir = path.join(__dirname, '../../data', dataType);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dataPath = path.join(dataDir, `${userId}.json`);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

        // Invalida cache
        await this.invalidateCache({ key: `${dataType}_${userId}` });

        this.emit('dataSynced', { userId, dataType });
        
        return {
            success: true,
            userId,
            dataType,
            synced: true
        };
    }

    /**
     * Esporta dati
     */
    async exportData(task) {
        const { userId, dataTypes, outputPath } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        const dataDir = path.join(__dirname, '../../data');
        const exportData = {
            userId,
            exportDate: new Date().toISOString(),
            version: '1.0',
            data: {}
        };

        const types = dataTypes || ['sport', 'interests', 'automations', 'webhooks'];
        
        for (const dataType of types) {
            const typeDir = path.join(dataDir, dataType);
            if (fs.existsSync(typeDir)) {
                const files = fs.readdirSync(typeDir);
                const userFiles = files.filter(f => f.startsWith(`${userId}.`) || f.startsWith(`${userId}_`));
                
                exportData.data[dataType] = {};
                for (const file of userFiles) {
                    const filePath = path.join(typeDir, file);
                    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    exportData.data[dataType][file] = fileData;
                }
            }
        }

        // Salva export
        const exportPath = outputPath || path.join(dataDir, 'exports', `export_${userId}_${Date.now()}.json`);
        const exportDir = path.dirname(exportPath);
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf8');

        this.emit('dataExported', { userId, exportPath });
        
        return {
            success: true,
            userId,
            exportPath,
            dataTypes: Object.keys(exportData.data)
        };
    }

    /**
     * Importa dati
     */
    async importData(task) {
        const { importPath, userId } = task;
        
        if (!importPath) {
            throw new Error('importPath required');
        }

        if (!fs.existsSync(importPath)) {
            throw new Error('Import file not found');
        }

        const importData = JSON.parse(fs.readFileSync(importPath, 'utf8'));
        const targetUserId = userId || importData.userId;

        if (!targetUserId) {
            throw new Error('userId required for import');
        }

        const dataDir = path.join(__dirname, '../../data');
        
        // Importa dati
        for (const [dataType, data] of Object.entries(importData.data || {})) {
            const typeDir = path.join(dataDir, dataType);
            if (!fs.existsSync(typeDir)) {
                fs.mkdirSync(typeDir, { recursive: true });
            }

            for (const [fileName, fileData] of Object.entries(data)) {
                // Sostituisci userId se necessario
                if (fileData.userId && fileData.userId !== targetUserId) {
                    fileData.userId = targetUserId;
                }

                // Determina nome file
                const newFileName = fileName.replace(importData.userId, targetUserId);
                const filePath = path.join(typeDir, newFileName);
                fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
            }
        }

        this.emit('dataImported', { userId: targetUserId, importPath });
        
        return {
            success: true,
            userId: targetUserId,
            imported: true,
            dataTypes: Object.keys(importData.data || {})
        };
    }

    /**
     * Backup dati
     */
    async backupData(task) {
        const { userId, backupPath } = task;
        
        if (!userId) {
            throw new Error('userId required');
        }

        // Crea backup esportando tutti i dati
        const exportResult = await this.exportData({
            userId,
            backupPath: backupPath || path.join(__dirname, '../../data/backups', `backup_${userId}_${Date.now()}.json`)
        });

        this.emit('dataBackedUp', { userId, backupPath: exportResult.exportPath });
        
        return {
            success: true,
            userId,
            backupPath: exportResult.exportPath
        };
    }

    /**
     * Ripristina dati
     */
    async restoreData(task) {
        const { backupPath, userId } = task;
        
        if (!backupPath) {
            throw new Error('backupPath required');
        }

        // Ripristina importando dati
        return await this.importData({
            importPath: backupPath,
            userId
        });
    }

    /**
     * Pulisce cache
     */
    async clearCache(task) {
        const { pattern } = task;
        
        let cleared = 0;

        // Pulisci memoria
        if (pattern) {
            for (const key of this.memoryCache.keys()) {
                if (key.includes(pattern)) {
                    this.memoryCache.delete(key);
                    cleared++;
                }
            }
        } else {
            this.memoryCache.clear();
            cleared = this.memoryCache.size;
        }

        // Pulisci disco
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                if (pattern) {
                    if (file.includes(pattern)) {
                        fs.unlinkSync(path.join(this.cacheDir, file));
                        cleared++;
                    }
                } else {
                    fs.unlinkSync(path.join(this.cacheDir, file));
                    cleared++;
                }
            }
        }

        this.emit('cacheCleared', { pattern, cleared });
        
        return {
            success: true,
            cleared,
            pattern: pattern || 'all'
        };
    }

    /**
     * Ottiene statistiche cache
     */
    async getCacheStats(task) {
        const memorySize = this.memoryCache.size;
        const diskFiles = fs.readdirSync(this.cacheDir).filter(f => f.endsWith('.json'));
        const diskSize = diskFiles.length;

        // Calcola dimensione totale cache su disco
        let totalSize = 0;
        for (const file of diskFiles) {
            const filePath = path.join(this.cacheDir, file);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
        }

        return {
            success: true,
            stats: {
                memoryEntries: memorySize,
                diskEntries: diskSize,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
            }
        };
    }

    /**
     * Sanitizza chiave per nome file
     */
    sanitizeKey(key) {
        return key
            .replace(/[^a-z0-9]/gi, '_')
            .replace(/_+/g, '_')
            .substring(0, 100);
    }
}

module.exports = DataAgent;

