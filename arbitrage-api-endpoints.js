/**
 * 💰 ARBITRAGE HUB - API ENDPOINTS
 * Endpoint MongoDB per Arbitrage Hub
 * 
 * ISTRUZIONI: Aggiungi questi endpoint al file server.js
 * dopo gli altri endpoint API esistenti
 */

// ========== ARBITRAGE HUB ENDPOINTS ==========

// Directory per dati arbitrage
const ARBITRAGE_DATA_DIR = path.join(__dirname, 'data', 'arbitrage');

if (!fs.existsSync(ARBITRAGE_DATA_DIR)) {
    fs.mkdirSync(ARBITRAGE_DATA_DIR, { recursive: true });
    console.log('✅ Arbitrage API endpoints directory initialized:', ARBITRAGE_DATA_DIR);
}

/**
 * GET /api/arbitrage/dashboard/:username
 * Ottiene dati dashboard per un utente
 */
app.get('/api/arbitrage/dashboard/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        // Carica dati da MongoDB
        const dashboardData = await mongoDB.findOne('arbitrage_dashboards', { username });
        
        if (dashboardData) {
            return res.json({ success: true, data: dashboardData });
        }
        
        // Dati default se non esistono
        return res.json({
            success: true,
            data: {
                username,
                totalProfit: 0,
                activeListings: 0,
                salesToday: 0,
                avgROI: 0,
                workshopItems: 0,
                createdAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/arbitrage/activity/:username
 * Ottiene attività recente
 */
app.get('/api/arbitrage/activity/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const activities = await mongoDB.find('arbitrage_activities', 
            { username }, 
            { sort: { timestamp: -1 }, limit: 10 }
        );
        
        return res.json({ success: true, data: activities || [] });
    } catch (error) {
        console.error('Error loading activities:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/arbitrage/listings/:username
 * Ottiene tutti i listings attivi
 */
app.get('/api/arbitrage/listings/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const listings = await mongoDB.find('arbitrage_listings', { username });
        
        return res.json({ success: true, listings: listings || [] });
    } catch (error) {
        console.error('Error loading listings:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/arbitrage/listings
 * Crea nuovo listing
 */
app.post('/api/arbitrage/listings', async (req, res) => {
    try {
        const { username, listing } = req.body;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const newListing = {
            id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username,
            ...listing,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await mongoDB.insertOne('arbitrage_listings', newListing);
        
        // Aggiorna stats dashboard
        await updateDashboardStats(username, mongoDB);
        
        console.log('✅ Listing created:', newListing.id);
        return res.json({ success: true, listing: newListing });
    } catch (error) {
        console.error('Error creating listing:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/arbitrage/listings/:listingId
 * Aggiorna listing esistente
 */
app.put('/api/arbitrage/listings/:listingId', async (req, res) => {
    try {
        const { listingId } = req.params;
        const { username, updates } = req.body;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const result = await mongoDB.updateOne(
            'arbitrage_listings',
            { id: listingId, username },
            { 
                $set: { 
                    ...updates, 
                    updatedAt: new Date().toISOString() 
                } 
            }
        );
        
        if (result.modifiedCount > 0) {
            await updateDashboardStats(username, mongoDB);
            return res.json({ success: true });
        }
        
        return res.status(404).json({ success: false, error: 'Listing not found' });
    } catch (error) {
        console.error('Error updating listing:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/arbitrage/listings/:listingId
 * Elimina listing
 */
app.delete('/api/arbitrage/listings/:listingId', async (req, res) => {
    try {
        const { listingId } = req.params;
        const { username } = req.body;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        await mongoDB.deleteOne('arbitrage_listings', { id: listingId, username });
        await updateDashboardStats(username, mongoDB);
        
        console.log('🗑️ Listing deleted:', listingId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting listing:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/arbitrage/suppliers/:username
 * Ottiene fornitori connessi
 */
app.get('/api/arbitrage/suppliers/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const suppliers = await mongoDB.find('arbitrage_suppliers', { username });
        
        return res.json({ success: true, suppliers: suppliers || [] });
    } catch (error) {
        console.error('Error loading suppliers:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/arbitrage/suppliers
 * Connette nuovo fornitore
 */
app.post('/api/arbitrage/suppliers', async (req, res) => {
    try {
        const { username, supplier } = req.body;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const newSupplier = {
            id: `supplier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username,
            ...supplier,
            createdAt: new Date().toISOString()
        };
        
        await mongoDB.insertOne('arbitrage_suppliers', newSupplier);
        
        console.log('✅ Supplier connected:', newSupplier.key);
        return res.json({ success: true, supplier: newSupplier });
    } catch (error) {
        console.error('Error connecting supplier:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/arbitrage/workshop/:username
 * Ottiene items in workshop
 */
app.get('/api/arbitrage/workshop/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const workshopItems = await mongoDB.find('arbitrage_workshop', { username });
        
        return res.json({ success: true, items: workshopItems || [] });
    } catch (error) {
        console.error('Error loading workshop items:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/arbitrage/workshop
 * Aggiunge item al workshop
 */
app.post('/api/arbitrage/workshop', async (req, res) => {
    try {
        const { username, item } = req.body;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const newItem = {
            id: `workshop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username,
            ...item,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await mongoDB.insertOne('arbitrage_workshop', newItem);
        
        // Aggiorna counter workshop nel dashboard
        await mongoDB.updateOne(
            'arbitrage_dashboards',
            { username },
            { $inc: { workshopItems: 1 } },
            { upsert: true }
        );
        
        console.log('✅ Workshop item added:', newItem.id);
        return res.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error adding workshop item:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/arbitrage/workshop/:itemId
 * Aggiorna item in workshop
 */
app.put('/api/arbitrage/workshop/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { username, updates } = req.body;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        await mongoDB.updateOne(
            'arbitrage_workshop',
            { id: itemId, username },
            { 
                $set: { 
                    ...updates, 
                    updatedAt: new Date().toISOString() 
                } 
            }
        );
        
        return res.json({ success: true });
    } catch (error) {
        console.error('Error updating workshop item:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/arbitrage/workshop/:itemId
 * Elimina item dal workshop
 */
app.delete('/api/arbitrage/workshop/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        const { username } = req.body;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        await mongoDB.deleteOne('arbitrage_workshop', { id: itemId, username });
        
        // Aggiorna counter workshop nel dashboard
        await mongoDB.updateOne(
            'arbitrage_dashboards',
            { username },
            { $inc: { workshopItems: -1 } }
        );
        
        console.log('🗑️ Workshop item deleted:', itemId);
        return res.json({ success: true });
    } catch (error) {
        console.error('Error deleting workshop item:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/arbitrage/sync
 * Sincronizza inventario
 */
app.post('/api/arbitrage/sync', async (req, res) => {
    try {
        const { username } = req.body;
        
        // TODO: Implementa logica sincronizzazione con marketplace
        console.log('🔄 Syncing inventory for:', username);
        
        return res.json({ 
            success: true, 
            message: 'Inventory synchronized',
            syncedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error syncing inventory:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/arbitrage/settings
 * Salva impostazioni utente
 */
app.post('/api/arbitrage/settings', async (req, res) => {
    try {
        const { username, settings } = req.body;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        await mongoDB.updateOne(
            'arbitrage_settings',
            { username },
            { 
                $set: { 
                    ...settings, 
                    updatedAt: new Date().toISOString() 
                } 
            },
            { upsert: true }
        );
        
        console.log('✅ Settings saved for:', username);
        return res.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/arbitrage/settings/:username
 * Carica impostazioni utente
 */
app.get('/api/arbitrage/settings/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { getMongoDB } = require('./lib/db/mongodb');
        const mongoDB = getMongoDB();
        
        const settings = await mongoDB.findOne('arbitrage_settings', { username });
        
        return res.json({ success: true, settings: settings || null });
    } catch (error) {
        console.error('Error loading settings:', error);
        return res.status(503).json({ success: false, error: error.message });
    }
});

// ========== HELPER FUNCTIONS ==========

/**
 * Aggiorna statistiche dashboard
 */
async function updateDashboardStats(username, mongoDB) {
    try {
        const listings = await mongoDB.find('arbitrage_listings', { username });
        const workshop = await mongoDB.find('arbitrage_workshop', { username });
        
        const activeListings = listings.filter(l => l.status === 'active').length;
        const totalProfit = listings.reduce((sum, l) => sum + (l.profit || 0), 0);
        const avgROI = listings.length > 0 
            ? listings.reduce((sum, l) => sum + (l.roi || 0), 0) / listings.length 
            : 0;
        
        await mongoDB.updateOne(
            'arbitrage_dashboards',
            { username },
            {
                $set: {
                    activeListings,
                    totalProfit,
                    avgROI,
                    workshopItems: workshop.length,
                    updatedAt: new Date().toISOString()
                }
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

console.log('✅ Arbitrage Hub API endpoints loaded');


