/**
 * MongoDB Helper - Gestione connessione e operazioni database
 * 
 * Pattern centralizzato per tutte le operazioni MongoDB nel progetto
 * Usa connection pooling e gestione errori
 */

const { MongoClient } = require('mongodb');

class MongoDBHelper {
    constructor() {
        this.client = null;
        this.db = null;
        this.uri = process.env.MONGODB_URI;
        this.dbName = process.env.MONGODB_DB_NAME || 'shappa'; // Nome database dal progetto
        this.isConnected = false;
    }

    /**
     * Connetti al database MongoDB
     * Ritorna null se MongoDB non è configurato (graceful degradation)
     */
    async connect() {
        if (this.isConnected && this.client) {
            return this.db;
        }

        if (!this.uri) {
            console.warn('⚠️ MongoDB not configured (MONGODB_URI missing). MongoDB features will be disabled.');
            return null;
        }

        try {
            this.client = new MongoClient(this.uri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
            });

            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.isConnected = true;
            
            console.log(`✅ MongoDB connected to database: ${this.dbName}`);
            return this.db;
        } catch (error) {
            console.error('❌ MongoDB connection error:', error.message);
            console.warn('⚠️ MongoDB features will be disabled. Server will continue without MongoDB.');
            this.isConnected = false;
            return null; // Non bloccare il server se MongoDB fallisce
        }
    }

    /**
     * Disconnetti dal database
     */
    async disconnect() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            this.client = null;
            this.db = null;
            console.log('🔌 MongoDB disconnected');
        }
    }

    /**
     * Ottieni una collection
     */
    async getCollection(collectionName) {
        const db = await this.connect();
        if (!db) {
            throw new Error('MongoDB not configured or connection failed');
        }
        return db.collection(collectionName);
    }

    /**
     * Inserisci un documento
     */
    async insertOne(collectionName, document) {
        const collection = await this.getCollection(collectionName);
        const result = await collection.insertOne({
            ...document,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return result;
    }

    /**
     * Trova un documento
     */
    async findOne(collectionName, query) {
        const collection = await this.getCollection(collectionName);
        return await collection.findOne(query);
    }

    /**
     * Trova più documenti
     */
    async findMany(collectionName, query = {}, options = {}) {
        const collection = await this.getCollection(collectionName);
        let cursor = collection.find(query);
        
        if (options.sort) {
            cursor = cursor.sort(options.sort);
        }
        if (options.limit) {
            cursor = cursor.limit(options.limit);
        }
        if (options.skip) {
            cursor = cursor.skip(options.skip);
        }
        
        return await cursor.toArray();
    }

    /**
     * Aggiorna un documento
     */
    async updateOne(collectionName, query, update, options = {}) {
        const collection = await this.getCollection(collectionName);
        const updateDoc = {
            $set: {
                ...update,
                updatedAt: new Date().toISOString()
            }
        };
        return await collection.updateOne(query, updateDoc, options);
    }

    /**
     * Aggiorna o inserisci (upsert)
     */
    async upsertOne(collectionName, query, document) {
        const collection = await this.getCollection(collectionName);
        const updateDoc = {
            $set: {
                ...document,
                updatedAt: new Date().toISOString()
            },
            $setOnInsert: {
                createdAt: new Date().toISOString()
            }
        };
        return await collection.updateOne(query, updateDoc, { upsert: true });
    }

    /**
     * Elimina un documento
     */
    async deleteOne(collectionName, query) {
        const collection = await this.getCollection(collectionName);
        return await collection.deleteOne(query);
    }

    /**
     * Conta documenti
     */
    async count(collectionName, query = {}) {
        const collection = await this.getCollection(collectionName);
        return await collection.countDocuments(query);
    }

    /**
     * Crea indice
     */
    async createIndex(collectionName, index, options = {}) {
        const collection = await this.getCollection(collectionName);
        return await collection.createIndex(index, options);
    }
}

// Singleton instance
let mongoInstance = null;

function getMongoDB() {
    if (!mongoInstance) {
        mongoInstance = new MongoDBHelper();
    }
    return mongoInstance;
}

module.exports = {
    MongoDBHelper,
    getMongoDB
};

