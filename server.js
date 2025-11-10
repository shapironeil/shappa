// Endpoint placeholder: listare un prodotto su eBay (sandbox)
// Note: questo è un mock. In futuro integreremo OAuth eBay e chiamate Sell APIs.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
const https = require('https');
const fs = require('fs');
const { promises: fsPromises } = require('fs');

// Import Monitor System
const monitorManager = require('./monitors/MonitorManager');

// Import Agent AI Committee System
const { initializeAgents, getAgentCoordinator } = require('./agents');

// Import Utility Modules
const fileUtils = require('./lib/utils/fileUtils');
const pathUtils = require('./lib/utils/pathUtils');
const responseUtils = require('./lib/utils/responseUtils');
const validationUtils = require('./lib/utils/validationUtils');

// Initialize Agent AI Committee System
const { coordinator } = initializeAgents({
    figma: {
        figmaApiKey: process.env.FIGMA_API_KEY
    },
    security: {
        sessionTTL: 3600000, // 1 hour
        priority: 10
    },
    monitor: {
        priority: 8
    },
    sport: {
        priority: 7
    },
    automation: {
        priority: 6
    },
    integration: {
        priority: 7
    },
    frontend: {
        priority: 7
    },
    data: {
        cacheTTL: 3600000, // 1 hour
        priority: 6
    },
    notification: {
        priority: 7
    },
    recipe: {
        priority: 7
    }
});

console.log('🤖 Agent AI Committee System initialized');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Endpoint placeholder: listare un prodotto su eBay (sandbox)
// Note: questo è un mock. In futuro integreremo OAuth eBay e chiamate Sell APIs.
app.post('/api/ebay/list', express.json(), async (req, res) => {
    try {
        const { id, title, price, automation } = req.body || {};
        if (!id) return res.status(400).json({ success: false, error: 'id richiesto' });
        // Simula risposta eBay sandbox
        const listingId = 'EBY-' + id + '-' + Date.now();
        return res.json({ success: true, listingId, message: 'Mock listing creato (sandbox)' });
    } catch (err) {
        console.error('ebay list error', err);
        return res.status(500).json({ success: false, error: 'internal_error' });
    }
});
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const sessions = new Map();

const EBAY_CONFIG = {
    clientId: process.env.EBAY_CLIENT_ID,
    clientSecret: process.env.EBAY_CLIENT_SECRET,
    devId: process.env.EBAY_DEV_ID,
    ruName: process.env.EBAY_RUNAME,
    // Ensure redirectUri uses https for localhost to satisfy eBay OAuth requirements
    redirectUri: process.env.EBAY_REDIRECT_URI || 'https://localhost:3000/auth/ebay/callback',
    authUrl: process.env.EBAY_AUTH_URL,
    tokenUrl: process.env.EBAY_TOKEN_URL,
    apiUrl: process.env.EBAY_API_URL,
    scopes: process.env.EBAY_SCOPES,
    marketplaceId: process.env.EBAY_MARKETPLACE_ID || 'EBAY_IT'
};
// === eBay FULL SCOPES (richiesta massima) ===
const ALL_EBAY_SCOPES = [
    'https://api.ebay.com/oauth/api_scope',
    'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
    'https://api.ebay.com/oauth/api_scope/commerce.catalog.readonly',
    'https://api.ebay.com/oauth/api_scope/commerce.notification.subscription',
    'https://api.ebay.com/oauth/api_scope/sell.inventory',
    'https://api.ebay.com/oauth/api_scope/sell.inventory.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.account',
    'https://api.ebay.com/oauth/api_scope/sell.account.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
    'https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.marketing',
    'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly',
    'https://api.ebay.com/oauth/api_scope/sell.finances',
    'https://api.ebay.com/oauth/api_scope/sell.payment.dispute',
    'https://api.ebay.com/oauth/api_scope/buy.shopping.cart',
    'https://api.ebay.com/oauth/api_scope/buy.deal.readonly',
    'https://api.ebay.com/oauth/api_scope/buy.marketing.readonly',
    'https://api.ebay.com/oauth/api_scope/buy.browse',
    'https://api.ebay.com/oauth/api_scope/buy.offer.auction',
    'https://api.ebay.com/oauth/api_scope/buy.order.readonly',
    'https://api.ebay.com/oauth/api_scope/buy.product.summary',
    'https://api.ebay.com/oauth/api_scope/buy.product.conclusion'
];
function buildAllScopes(custom) {
    const customParts = String(custom || '').split(/\s+/).filter(Boolean);
    const merged = [...ALL_EBAY_SCOPES, ...customParts];
    const seen = new Set();
    const uniq = [];
    for (const s of merged) { if (!seen.has(s)) { seen.add(s); uniq.push(s); } }
    return uniq.join(' ');
}
// Profili di scope incrementali: "basic" per connessione rapida (identity + sell.account.readonly), "full" per tutte le funzionalità.
const SCOPE_PROFILES = {
    basic: [
        'https://api.ebay.com/oauth/api_scope',
        'https://api.ebay.com/oauth/api_scope/commerce.identity.readonly',
        'https://api.ebay.com/oauth/api_scope/sell.account.readonly'
    ],
    full: ALL_EBAY_SCOPES // usa la lista completa definita sopra
};

function getScopesForProfile(profile, custom) {
    const base = SCOPE_PROFILES[profile] || SCOPE_PROFILES.basic;
    const merged = [...base, ...String(custom||'').split(/\s+/).filter(Boolean)];
    const seen = new Set();
    const uniq = [];
    for (const s of merged) { if (s && !seen.has(s)) { seen.add(s); uniq.push(s); } }
    return uniq.join(' ');
}

// Manteniamo FULL_SCOPES (profilo completo) per retrocompatibilità dove veniva usato.
const FULL_SCOPES = getScopesForProfile('full', EBAY_CONFIG.scopes);

if (EBAY_CONFIG.redirectUri && EBAY_CONFIG.redirectUri.startsWith('http://')) {
    console.warn('eBay redirectUri is using http:// — this may fail for OAuth. Prefer https://localhost:3000/auth/ebay/callback for local development.');
}

// Amazon scraper (Playwright)
const { scrapeAmazonProduct } = require('./lib/scraper/amazonScraper');
const priceMonitor = require('./lib/services/priceMonitor');

// Small admin protection token to allow clearing caches during development
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;

function generateState() {
    return crypto.randomBytes(32).toString('hex');
}

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', port: PORT });
});

app.get('/api/ebay/auth-url', (req, res) => {
    try {
        const state = generateState();
        const profile = (req.query.profile || 'basic').toLowerCase();
        const requestedScopes = getScopesForProfile(profile, EBAY_CONFIG.scopes);
        sessions.set(state, { timestamp: Date.now(), userId: req.query.userId || null, scopeProfile: profile, requestedScopes });
        
        const authUrl = new URL(EBAY_CONFIG.authUrl);
        authUrl.searchParams.append('client_id', EBAY_CONFIG.clientId);
        // eBay richiede il valore RUName nel parametro redirect_uri (non l'URL del callback)
        authUrl.searchParams.append('redirect_uri', EBAY_CONFIG.ruName);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', requestedScopes);
        // opzionale: forza login esplicito
        // authUrl.searchParams.append('prompt', 'login');
        
        console.log('Generated eBay auth URL');
        res.json({ success: true, authUrl: authUrl.toString(), state, profile, scopes: requestedScopes });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({ success: false, error: 'Failed to generate authorization URL' });
    }
});

app.get('/auth/ebay/callback', async (req, res) => {
    const { code, state, error, error_description } = req.query;
    
    if (error) {
        console.error('eBay OAuth error:', error, error_description);
        return res.send('<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Connection Failed</h1><p>' + (error_description || 'Authorization failed') + '</p><script>if(window.opener){window.opener.postMessage({type:"ebay-oauth-result",success:false,error:"' + error + '"},"*")}setTimeout(()=>window.close(),3000)</script></body></html>');
    }
    
    if (!code || !state) {
        return res.status(400).send('Missing required parameters');
    }
    
    const sessionData = sessions.get(state);
    if (!sessionData) {
        return res.status(400).send('Invalid or expired state parameter');
    }
    // Conserva userId PRIMA di eliminare lo state dalla memoria
    const callbackUserId = sessionData.userId || 'default';
    const requestedScopes = sessionData.requestedScopes || FULL_SCOPES;
    sessions.delete(state);
    
    try {
        const credentials = Buffer.from(EBAY_CONFIG.clientId + ':' + EBAY_CONFIG.clientSecret).toString('base64');
        
        const tokenResponse = await axios.post(
            EBAY_CONFIG.tokenUrl,
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                // Nello scambio token, redirect_uri deve essere identico al valore usato in authorize: RUName
                redirect_uri: EBAY_CONFIG.ruName
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + credentials
                }
            }
        );
        
        const tokenData = tokenResponse.data;
        console.log('Tokens obtained successfully');

        // Persist token to disk so the session remains connected across restarts
        try {
            const userId = callbackUserId;
            const tokensDir = path.join(__dirname, 'data', 'ebay', userId);
            await fsPromises.mkdir(tokensDir, { recursive: true });
            const tokenPath = path.join(tokensDir, 'tokens.json');
            // eBay restituisce l'elenco effettivo degli scope concessi (tokenData.scope)
            const grantedScope = tokenData.scope || requestedScopes;
            const payload = {
                obtainedAt: new Date().toISOString(),
                expiresIn: tokenData.expires_in,
                expiresAt: new Date(Date.now() + (tokenData.expires_in || 0) * 1000).toISOString(),
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                token_type: tokenData.token_type,
                scope: grantedScope,
                userId
            };
            await fsPromises.writeFile(tokenPath, JSON.stringify(payload, null, 2));
            console.log('eBay tokens persisted to', tokenPath);
        } catch (persistErr) {
            console.error('Failed to persist eBay tokens:', persistErr.message);
        }
        
        const tokenJson = JSON.stringify({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type
        });
        
        res.send('<!DOCTYPE html><html><head><title>Success</title></head><body><h1>Connected Successfully!</h1><script>if(window.opener){window.opener.postMessage({type:"ebay-oauth-result",success:true,tokenData:' + tokenJson + '},"*")}setTimeout(()=>window.close(),2000)</script></body></html>');
    } catch (err) {
        // Log fuller error info for debugging (including response body when available)
        try {
            if (err.response && err.response.data) {
                console.error('Token exchange error response data:', JSON.stringify(err.response.data));
            }
        } catch (e) { /* ignore logging issues */ }
        console.error('Token exchange error:', err.message);
        res.status(500).send('<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Token Exchange Failed</h1><pre>' + (err.response && err.response.data ? JSON.stringify(err.response.data) : err.message) + '</pre><script>if(window.opener){window.opener.postMessage({type:"ebay-oauth-result",success:false,error:"token_exchange_failed",details:' + JSON.stringify(err.response && err.response.data ? err.response.data : { message: err.message }) + '},"*")}setTimeout(()=>window.close(),3000)</script></body></html>');
    }
});

// Endpoint to check current eBay token status
app.get('/api/ebay/status', async (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const tokenPath = path.join(__dirname, 'data', 'ebay', userId, 'tokens.json');
        if (!fs.existsSync(tokenPath)) return res.json({ connected: false });
        let data = JSON.parse(await fsPromises.readFile(tokenPath, 'utf8'));
        const expiresAt = data.expiresAt ? new Date(data.expiresAt).getTime() : 0;
        const now = Date.now();
        let secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

        // Auto refresh if less than 10 minutes remaining and refresh_token available
        if (secondsLeft < 600 && data.refresh_token) {
            try {
                const credentials = Buffer.from(EBAY_CONFIG.clientId + ':' + EBAY_CONFIG.clientSecret).toString('base64');
                const resp = await axios.post(
                    EBAY_CONFIG.tokenUrl,
                    new URLSearchParams({
                        grant_type: 'refresh_token',
                        refresh_token: data.refresh_token
                    }),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + credentials } }
                );
                const tokenData = resp.data;
                data = {
                    obtainedAt: new Date().toISOString(),
                    expiresIn: tokenData.expires_in,
                    expiresAt: new Date(Date.now() + (tokenData.expires_in || 0) * 1000).toISOString(),
                    access_token: tokenData.access_token,
                    refresh_token: data.refresh_token,
                    token_type: tokenData.token_type,
                    // eBay in refresh raramente ritorna gli scope: preserva quelli precedenti
                    scope: data.scope,
                    userId
                };
                await fsPromises.writeFile(tokenPath, JSON.stringify(data, null, 2));
                secondsLeft = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
            } catch (e) {
                console.warn('Auto-refresh token failed:', e.response?.data || e.message);
            }
        }
        return res.json({ connected: true, expiresAt: data.expiresAt, secondsLeft });
    } catch (e) {
        return res.status(500).json({ connected: false, error: e.message });
    }
});

// Refresh access token using saved refresh token
app.post('/api/ebay/refresh', async (req, res) => {
    try {
        const userId = (req.body && req.body.userId) || req.query.userId || 'default';
        const tokenPath = path.join(__dirname, 'data', 'ebay', userId, 'tokens.json');
        if (!fs.existsSync(tokenPath)) return res.status(400).json({ success: false, error: 'No token stored' });
        const saved = JSON.parse(await fsPromises.readFile(tokenPath, 'utf8'));
        const refreshToken = saved.refresh_token;
        if (!refreshToken) return res.status(400).json({ success: false, error: 'No refresh token available' });

        const credentials = Buffer.from(EBAY_CONFIG.clientId + ':' + EBAY_CONFIG.clientSecret).toString('base64');
        const resp = await axios.post(
            EBAY_CONFIG.tokenUrl,
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + credentials } }
        );

        const tokenData = resp.data;
        const payload = {
            obtainedAt: new Date().toISOString(),
            expiresIn: tokenData.expires_in,
            expiresAt: new Date(Date.now() + (tokenData.expires_in || 0) * 1000).toISOString(),
            access_token: tokenData.access_token,
            refresh_token: refreshToken, // eBay typically returns same refresh token
            token_type: tokenData.token_type,
            // preserva scope precedente; eBay può non restituirlo nel refresh
            scope: (JSON.parse(await fsPromises.readFile(tokenPath, 'utf8')).scope) || FULL_SCOPES
        };
        await fsPromises.writeFile(tokenPath, JSON.stringify(payload, null, 2));
        return res.json({ success: true, expiresAt: payload.expiresAt });
    } catch (e) {
        console.error('Refresh token failed:', e.response?.data || e.message);
        return res.status(500).json({ success: false, error: 'refresh_failed', details: e.response?.data || e.message });
    }
});

// Get eBay profile using stored token per user
app.get('/api/ebay/profile', async (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const tokenPath = path.join(__dirname, 'data', 'ebay', userId, 'tokens.json');
        if (!fs.existsSync(tokenPath)) return res.status(401).json({ success: false, error: 'not_connected' });
        let saved = JSON.parse(await fsPromises.readFile(tokenPath, 'utf8'));

        async function fetchProfile(accessToken) {
            const response = await axios.get(EBAY_CONFIG.apiUrl + '/commerce/identity/v1/user/', {
                  headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' }
            });
            return response.data;
        }

        try {
            const data = await fetchProfile(saved.access_token);
            return res.json({ success: true, user: data });
        } catch (err) {
            if (err.response && err.response.status === 401 && saved.refresh_token) {
                // try refresh then retry
                const credentials = Buffer.from(EBAY_CONFIG.clientId + ':' + EBAY_CONFIG.clientSecret).toString('base64');
                const resp = await axios.post(
                    EBAY_CONFIG.tokenUrl,
                    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: saved.refresh_token }),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + credentials } }
                );
                const tokenData = resp.data;
                saved = {
                    obtainedAt: new Date().toISOString(),
                    expiresIn: tokenData.expires_in,
                    expiresAt: new Date(Date.now() + (tokenData.expires_in || 0) * 1000).toISOString(),
                    access_token: tokenData.access_token,
                    refresh_token: saved.refresh_token,
                    token_type: tokenData.token_type,
                    scope: saved.scope,
                    userId
                };
                await fsPromises.writeFile(tokenPath, JSON.stringify(saved, null, 2));
                const data2 = await fetchProfile(saved.access_token);
                return res.json({ success: true, user: data2, refreshed: true });
            }
            throw err;
        }
    } catch (e) {
        const status = e.response?.status;
        const data = e.response?.data;
        const insufficient = status === 403 || (data && (data.error === 'insufficient_scope' || data.error_description?.includes('insufficient')));
        if (insufficient) {
            return res.status(403).json({ success: false, error: 'insufficient_scope' });
        }
        if (status === 404) {
            return res.status(404).json({ success: false, error: 'profile_not_found' });
        }
        console.error('profile error:', data || e.message);
        return res.status(500).json({ success: false, error: 'profile_failed', details: data || e.message });
    }
});

// Aggregated Account Info: Identity + Sell Account Privileges (best-effort)
app.get('/api/ebay/account-info', async (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const tokenPath = path.join(__dirname, 'data', 'ebay', userId, 'tokens.json');
        if (!fs.existsSync(tokenPath)) return res.status(401).json({ success: false, error: 'not_connected' });
        const saved = JSON.parse(await fsPromises.readFile(tokenPath, 'utf8'));

        const headers = {
            'Authorization': 'Bearer ' + saved.access_token,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': EBAY_CONFIG.marketplaceId
        };

        const results = { success: true, userId, scope: saved.scope, identity: null, privilege: null, errors: {} };

        // Identity
        try {
            const r = await axios.get(EBAY_CONFIG.apiUrl + '/commerce/identity/v1/user/', { headers });
            results.identity = r.data || null;
        } catch (e) {
            const st = e.response?.status;
            if (st === 403) results.errors.identity = 'insufficient_scope';
            else if (st === 404) results.errors.identity = 'profile_not_found';
            else results.errors.identity = e.response?.data || e.message;
        }

        // Sell Account Privileges (requires sell.account.readonly)
        try {
            const r2 = await axios.get(EBAY_CONFIG.apiUrl + '/sell/account/v1/privilege', { headers });
            results.privilege = r2.data || null;
        } catch (e) {
            const st = e.response?.status;
            if (st === 403) results.errors.privilege = 'insufficient_scope';
            else if (st === 404) results.errors.privilege = 'not_found';
            else results.errors.privilege = e.response?.data || e.message;
        }

        return res.json(results);
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
});

// Debug endpoint per ispezionare token/scope salvati (per-utente)
app.get('/api/ebay/token-info', async (req, res) => {
    try {
        const userId = req.query.userId || 'default';
        const tokenPath = path.join(__dirname, 'data', 'ebay', userId, 'tokens.json');
        if (!fs.existsSync(tokenPath)) return res.json({ exists: false });
        const saved = JSON.parse(await fsPromises.readFile(tokenPath, 'utf8'));
        return res.json({ exists: true, userId, scope: saved.scope, expiresAt: saved.expiresAt });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Disconnect and remove stored tokens for user
app.post('/api/ebay/disconnect', async (req, res) => {
    try {
        const userId = (req.body && req.body.userId) || req.query.userId || 'default';
        const dir = path.join(__dirname, 'data', 'ebay', userId);
        const tokenPath = path.join(dir, 'tokens.json');
        if (fs.existsSync(tokenPath)) await fsPromises.unlink(tokenPath);
        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/ebay/user-info', async (req, res) => {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ success: false, error: 'Missing access_token' });
    
    try {
        const response = await axios.get(EBAY_CONFIG.apiUrl + '/commerce/identity/v1/user/', {
            headers: { 'Authorization': 'Bearer ' + access_token, 'Content-Type': 'application/json' }
        });
        
        const userData = {
            userId: response.data.userId || 'eBay User',
            username: response.data.username || 'eBay User',
            email: response.data.email || null,
            accountType: response.data.accountType || 'INDIVIDUAL',
            status: response.data.status || 'CONFIRMED'
        };
        
        return res.json({ success: true, userData });
    } catch (error) {
        return res.json({
            success: true,
            userData: {
                userId: 'eBay User',
                username: 'eBay User',
                email: null,
                accountType: 'INDIVIDUAL',
                status: 'CONFIRMED'
            }
        });
    }
});

app.get('/api/amazon/search', async (req, res) => {
    // Accetta sia ?q= che ?query=
    const query = req.query.q || req.query.query;
    const country = req.query.country || 'IT';
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 24;
    if (!query) return res.status(400).json({ success: false, error: 'Missing search query' });
    
    // Try stealth scraper first
    try {
        console.log(`[API] Attempting stealth scraper for "${query}"`);
        const { StealthAmazonScraper } = require('./lib/scraper/stealthAmazonScraper');
        const scraper = new StealthAmazonScraper();
        const products = await scraper.searchProducts(query, country, limit);
        
        if (products && products.length > 0) {
            console.log(`[API] Stealth scraper succeeded with ${products.length} products`);
            return res.json({ success: true, products, source: 'stealth_scraper' });
        }
    } catch (stealthErr) {
        console.error('[API] Stealth scraper failed:', stealthErr.message);
    }
    
    // Try original scraper as backup
    try {
        console.log(`[API] Attempting original scraper for "${query}"`);
        const { scrapeAmazonSearch } = require('./lib/scraper/amazonScraper');
        const products = await scrapeAmazonSearch({ query, country, page, limit });
        
        if (products && products.length > 0) {
            console.log(`[API] Original scraper succeeded with ${products.length} products`);
            return res.json({ success: true, products, source: 'original_scraper' });
        }
    } catch (originalErr) {
        console.error('[API] Original scraper failed:', originalErr.message);
    }
    
    // Entrambi gli scraper falliti
    if (process.env.USE_AMAZON_DEMO === '1') {
        console.log('[API] Both scrapers failed, USING demo fallback (USE_AMAZON_DEMO=1)');
        const demoProducts = [
            {
                asin: 'DEMO-1',
                url: 'https://amazon.it/dp/DEMO-1',
                title: `${query} (Demo) Esempio 1`,
                price: '€29,99',
                brand: 'DemoBrand',
                image: 'https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Demo+1',
                rating: '4,3 su 5 stelle',
                isPrime: true
            },
            {
                asin: 'DEMO-2',
                url: 'https://amazon.it/dp/DEMO-2',
                title: `${query} (Demo) Esempio 2`,
                price: '€19,90',
                brand: 'DemoBrand',
                image: 'https://via.placeholder.com/300x300/50C878/FFFFFF?text=Demo+2',
                rating: '4,1 su 5 stelle',
                isPrime: false
            }
        ].slice(0, limit);
        return res.json({ success: true, products: demoProducts, source: 'demo_fallback' });
    }
    console.log('[API] Both scrapers failed, NO fallback (returning 503)');
    return res.status(503).json({
        success: false,
        error: 'Ricerca temporaneamente non disponibile. Riprova tra qualche minuto.',
        message: 'Amazon scraping failed - no results from both stealth and original scrapers'
    });
});

// Stub search endpoints per altri provider (placeholder finché non implementati)
app.get('/api/aliexpress/search', async (req, res) => {
    const query = req.query.q || req.query.query || '';
    return res.json({ success: true, products: [], source: 'stub', provider: 'aliexpress', message: 'Motore Aliexpress non ancora disponibile', query });
});

app.get('/api/alibaba/search', async (req, res) => {
    const query = req.query.q || req.query.query || '';
    return res.json({ success: true, products: [], source: 'stub', provider: 'alibaba', message: 'Motore Alibaba non ancora disponibile', query });
});

// Get detailed product information by ASIN
app.get('/api/amazon/product/:asin', async (req, res) => {
    const { asin } = req.params;
    const country = req.query.country || 'IT';
    
    if (!asin) return res.status(400).json({ success: false, error: 'ASIN required' });
    
    try {
        console.log(`[API] Getting product details for ASIN: ${asin}`);
        const { StealthAmazonScraper } = require('./lib/scraper/stealthAmazonScraper');
        const scraper = new StealthAmazonScraper();
        const productDetails = await scraper.getProductDetails(asin, country);
        
        console.log(`[API] Successfully got details for ${asin}`);
        return res.json({ success: true, product: productDetails, source: 'stealth_scraper' });
        
    } catch (err) {
        console.error(`[API] Product details failed for ${asin}:`, err.message);
        
        // Fallback to demo data for the specific ASIN
        const demoProduct = {
            asin,
            title: `Prodotto ${asin} - Dettagli Completi`,
            brand: 'BrandDemo',
            price: '€39,99',
            originalPrice: '€49,99',
            rating: '4.5 su 5 stelle',
            reviewsCount: '1,234',
            mainImage: 'https://via.placeholder.com/500x500/4A90E2/FFFFFF?text=Prodotto+Dettaglio',
            images: [
                'https://via.placeholder.com/500x500/4A90E2/FFFFFF?text=Immagine+1',
                'https://via.placeholder.com/500x500/50C878/FFFFFF?text=Immagine+2',
                'https://via.placeholder.com/500x500/FF6B6B/FFFFFF?text=Immagine+3',
                'https://via.placeholder.com/500x500/9B59B6/FFFFFF?text=Immagine+4'
            ],
            features: [
                'Caratteristica principale del prodotto con descrizione dettagliata',
                'Materiali di alta qualità utilizzati nella costruzione',
                'Design ergonomico per il massimo comfort',
                'Compatibile con diversi sistemi e dispositivi',
                'Garanzia di 2 anni inclusa'
            ],
            techDetails: {
                'Dimensioni': '25 x 15 x 8 cm',
                'Peso': '500g',
                'Materiale': 'Plastica ABS, Metallo',
                'Colore': 'Blu, Nero, Bianco',
                'Produttore': 'BrandDemo'
            },
            availability: 'Disponibile',
            delivery: 'Consegna entro 2-3 giorni lavorativi',
            isPrime: true,
            variants: {
                'Colore': ['Blu', 'Nero', 'Bianco'],
                'Taglia': ['S', 'M', 'L', 'XL']
            },
            categories: ['Elettronica', 'Accessori', 'Gadget'],
            url: `https://amazon.it/dp/${asin}`
        };
        
        return res.json({ 
            success: true, 
            product: demoProduct,
            source: 'demo_data',
            message: 'Dati di esempio - scraping dettagli temporaneamente non disponibile'
        });
    }
});

// On-demand scrape of a specific product page (legacy endpoint)
app.get('/api/amazon/scrape', async (req, res) => {
    try {
        const { url, asin, country = 'IT' } = req.query;
        const { scrapeAmazonProduct } = require('./lib/scraper/amazonScraper');
        if (!url && !asin) return res.status(400).json({ success: false, error: 'Provide url or asin' });
        const product = await scrapeAmazonProduct({ url, asin, country });
        return res.json({ success: true, product });
    } catch (err) {
        console.error('Scrape error:', err);
        return res.status(500).json({ success: false, error: err.message || 'scrape_failed' });
    }
});

// Save product endpoint
app.post('/api/products/save', (req, res) => {
    try {
        const productData = req.body;
        
        if (!productData.asin) {
            return res.status(400).json({ success: false, error: 'ASIN required' });
        }

        // Create saved products directory if it doesn't exist
        const fs = require('fs');
        const path = require('path');
        const savedProductsDir = path.join(__dirname, 'data', 'saved-products');
        
        if (!fs.existsSync(savedProductsDir)) {
            fs.mkdirSync(savedProductsDir, { recursive: true });
        }

        // Save product to JSON file
        const filename = `${productData.asin}.json`;
        const filepath = path.join(savedProductsDir, filename);
        
        const savedProduct = {
            ...productData,
            savedAt: new Date().toISOString(),
            id: productData.asin
        };

        fs.writeFileSync(filepath, JSON.stringify(savedProduct, null, 2));
        
        console.log(`[API] Product ${productData.asin} saved successfully`);
        
        // Download images in background (don't wait for completion)
        if (productData.images || productData.mainImage) {
            console.log(`[API] Starting background image download for ${productData.asin}`);
            setImmediate(async () => {
                try {
                    const imagesToDownload = [];
                    if (productData.mainImage) imagesToDownload.push(productData.mainImage);
                    if (productData.images && Array.isArray(productData.images)) {
                        imagesToDownload.push(...productData.images);
                    }
                    
                    // Remove duplicates
                    const uniqueImages = [...new Set(imagesToDownload)];
                    
                    // Trigger image download
                    const imageReq = {
                        body: {
                            asin: productData.asin,
                            images: uniqueImages,
                            mainImage: productData.mainImage,
                            title: productData.title
                        }
                    };
                    
                    const imageRes = {
                        json: (data) => console.log(`[API] Background image download result:`, data),
                        status: (code) => ({ json: (data) => console.log(`[API] Image download error ${code}:`, data) })
                    };
                    
                    // Call the image download function
                    await downloadProductImages(imageReq, imageRes);
                } catch (error) {
                    console.error(`[API] Background image download failed for ${productData.asin}:`, error.message);
                }
            });
        }
        
        return res.json({ 
            success: true, 
            message: 'Prodotto salvato con successo. Immagini in download...',
            productId: productData.asin
        });

    } catch (error) {
        console.error('[API] Error saving product:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Errore nel salvataggio del prodotto' 
        });
    }
});

// Download and archive product images at maximum resolution
async function downloadProductImages(req, res) {
    try {
        const { asin, images, mainImage, title } = req.body;
        
        if (!asin || (!images && !mainImage)) {
            return res.status(400).json({ success: false, error: 'ASIN and images required' });
        }

        console.log(`[ImageDownloader] Starting download for ASIN: ${asin}`);
        
        // Create images directory structure
        const imagesDir = path.join(__dirname, 'data', 'product-images', asin);
        await fsPromises.mkdir(imagesDir, { recursive: true });
        
        const downloadedImages = [];
        let imageIndex = 0;
        
        // Download main image first
        if (mainImage) {
            try {
                const filename = `main-image.jpg`;
                const filepath = path.join(imagesDir, filename);
                
                console.log(`[ImageDownloader] Downloading main image: ${mainImage}`);
                await downloadImageToFile(mainImage, filepath);
                
                // Verify image dimensions
                const dimensions = await getImageDimensions(filepath);
                console.log(`[ImageDownloader] Main image saved: ${dimensions.width}x${dimensions.height}px - ${Math.round(dimensions.fileSize/1024)}KB`);
                
                downloadedImages.push({
                    type: 'main',
                    filename,
                    filepath,
                    originalUrl: mainImage,
                    dimensions
                });
            } catch (error) {
                console.error(`[ImageDownloader] Failed to download main image:`, error.message);
            }
        }
        
        // Download additional images
        if (images && Array.isArray(images)) {
            for (const imageUrl of images) {
                if (imageUrl === mainImage) continue; // Skip if same as main
                
                try {
                    imageIndex++;
                    const filename = `image-${imageIndex}.jpg`;
                    const filepath = path.join(imagesDir, filename);
                    
                    console.log(`[ImageDownloader] Downloading image ${imageIndex}: ${imageUrl}`);
                    await downloadImageToFile(imageUrl, filepath);
                    
                    // Verify image dimensions
                    const dimensions = await getImageDimensions(filepath);
                    console.log(`[ImageDownloader] Image ${imageIndex} saved: ${dimensions.width}x${dimensions.height}px - ${Math.round(dimensions.fileSize/1024)}KB`);
                    
                    downloadedImages.push({
                        type: 'additional',
                        filename,
                        filepath,
                        originalUrl: imageUrl,
                        dimensions
                    });
                } catch (error) {
                    console.error(`[ImageDownloader] Failed to download image ${imageIndex}:`, error.message);
                }
            }
        }
        
        // Save download metadata
        const metadata = {
            asin,
            title,
            downloadDate: new Date().toISOString(),
            totalImages: downloadedImages.length,
            images: downloadedImages,
            status: 'completed'
        };
        
        const metadataPath = path.join(imagesDir, 'metadata.json');
        await fsPromises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        
        console.log(`[ImageDownloader] ✅ Completed: ${downloadedImages.length} HD images saved for ${asin}`);
        
        return res.json({
            success: true,
            message: `Downloaded ${downloadedImages.length} images at maximum resolution`,
            asin,
            imagesPath: imagesDir,
            images: downloadedImages
        });
        
    } catch (error) {
        console.error('[ImageDownloader] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to download images'
        });
    }
}

app.post('/api/products/download-images', downloadProductImages);

// Get product images status
app.get('/api/products/:asin/images', async (req, res) => {
    try {
        const { asin } = req.params;
        const imagesDir = path.join(__dirname, 'data', 'product-images', asin);
        const metadataPath = path.join(imagesDir, 'metadata.json');
        
        // Check if images directory exists
        if (!fs.existsSync(imagesDir)) {
            return res.json({
                success: true,
                asin,
                status: 'not_downloaded',
                images: []
            });
        }
        
        // Check if metadata exists
        if (!fs.existsSync(metadataPath)) {
            return res.json({
                success: true,
                asin,
                status: 'in_progress',
                images: []
            });
        }
        
        // Read metadata
        const metadata = JSON.parse(await fsPromises.readFile(metadataPath, 'utf8'));
        
        return res.json({
            success: true,
            asin,
            status: metadata.status || 'completed',
            downloadDate: metadata.downloadDate,
            totalImages: metadata.totalImages,
            images: metadata.images
        });
        
    } catch (error) {
        console.error('[API] Error getting image status:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get image status'
        });
    }
});

// Helper function to download image to file
async function downloadImageToFile(url, filepath) {
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 30000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Helper function to get image dimensions
async function getImageDimensions(filepath) {
    try {
        // Simple approach: try to read basic image info
        const stats = await fsPromises.stat(filepath);
        return {
            width: 'Unknown',
            height: 'Unknown',
            fileSize: stats.size
        };
    } catch (error) {
        return {
            width: 'Unknown',
            height: 'Unknown',
            fileSize: 0
        };
    }
}

// Get saved products
app.get('/api/products/saved', (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const savedProductsDir = path.join(__dirname, 'data', 'saved-products');
        
        if (!fs.existsSync(savedProductsDir)) {
            return res.json({ success: true, products: [] });
        }

        const files = fs.readdirSync(savedProductsDir);
        const products = [];

        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const filepath = path.join(savedProductsDir, file);
                    const productData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                    products.push(productData);
                } catch (error) {
                    console.error(`Error reading product file ${file}:`, error);
                }
            }
        });

        // Sort by savedAt date (most recent first)
        products.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

        return res.json({ success: true, products });

    } catch (error) {
        console.error('[API] Error getting saved products:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Errore nel recupero dei prodotti salvati' 
        });
    }
});

// API endpoint per ottenere lo stato delle immagini di un prodotto
app.get('/api/images/status/:asin', async (req, res) => {
  try {
    const { asin } = req.params;
    const productDir = path.join(__dirname, 'data', 'product-images', asin);
    const metadataPath = path.join(productDir, 'metadata.json');
    
    // Controlla se la cartella esiste
    if (!fs.existsSync(productDir)) {
      return res.json({
        downloaded: false,
        downloading: false,
        count: 0,
        maxDimensions: '0x0'
      });
    }
    
    // Controlla se esiste il file metadata.json
    if (!fs.existsSync(metadataPath)) {
      // Controlla se ci sono file nella cartella (download in corso)
      const files = fs.readdirSync(productDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
      
      // Se ci sono file ma nessun metadata, potrebbe essere un download interrotto
      // Controlla l'età dei file per determinare se è ancora in corso
      if (files.length > 0) {
        const newestFile = files.map(f => ({
          name: f,
          mtime: fs.statSync(path.join(productDir, f)).mtime
        })).sort((a, b) => b.mtime - a.mtime)[0];
        
        const ageMinutes = (Date.now() - newestFile.mtime.getTime()) / (1000 * 60);
        
        // Se il file più recente è più vecchio di 5 minuti, considera il download fallito
        const downloading = ageMinutes < 5;
        
        return res.json({
          downloaded: false,
          downloading: downloading,
          count: files.length,
          progress: downloading ? 50 : 0,
          maxDimensions: '0x0',
          status: downloading ? 'in_progress' : 'incomplete'
        });
      }
      
      return res.json({
        downloaded: false,
        downloading: false,
        count: 0,
        progress: 0,
        maxDimensions: '0x0'
      });
    }
    
    // Leggi i metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const files = fs.readdirSync(productDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    
    // Calcola le dimensioni massime
    let maxWidth = 0;
    let maxHeight = 0;
    
    if (metadata.images && metadata.images.length > 0) {
      metadata.images.forEach(img => {
        if (img.dimensions) {
          const [width, height] = img.dimensions.split('x').map(Number);
          maxWidth = Math.max(maxWidth, width);
          maxHeight = Math.max(maxHeight, height);
        }
      });
    }
    
    res.json({
      downloaded: true,
      downloading: false,
      count: files.length,
      maxDimensions: `${maxWidth}x${maxHeight}`,
      downloadDate: metadata.downloadDate,
      images: metadata.images || []
    });
    
  } catch (error) {
    console.error('Errore nel controllo stato immagini:', error);
    res.status(500).json({ error: 'Errore nel controllo stato immagini' });
  }
});

// API endpoint per avviare il download delle immagini di un prodotto
app.post('/api/images/download', async (req, res) => {
  try {
    const { asin, images } = req.body;
    
    if (!asin || !images || !Array.isArray(images)) {
      return res.status(400).json({ error: 'ASIN e array di immagini richiesti' });
    }
    
    console.log(`[ImageDownload] Avvio download per ASIN: ${asin} - ${images.length} immagini`);
    
    // Avvia il download in background
    downloadProductImages(asin, images);
    
    res.json({ 
      success: true, 
      message: 'Download immagini avviato in background',
      asin: asin,
      imageCount: images.length
    });
    
  } catch (error) {
    console.error('Errore nell\'avvio del download immagini:', error);
    res.status(500).json({ error: 'Errore nell\'avvio del download immagini' });
  }
});

// API endpoint per ottenere le immagini HD scaricate di un prodotto
app.get('/api/images/downloaded/:asin', async (req, res) => {
  try {
    const { asin } = req.params;
    const productDir = path.join(__dirname, 'data', 'product-images', asin);
    const metadataPath = path.join(productDir, 'metadata.json');
    
    if (!fs.existsSync(productDir) || !fs.existsSync(metadataPath)) {
      return res.json({ images: [] });
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const downloadedImages = [];
    
    if (metadata.images && metadata.images.length > 0) {
      for (const imgInfo of metadata.images) {
        const imagePath = path.join(productDir, imgInfo.filename);
        if (fs.existsSync(imagePath)) {
          // Converti il path in URL servibile
          const imageUrl = `/api/images/serve/${asin}/${imgInfo.filename}`;
          downloadedImages.push({
            url: imageUrl,
            originalUrl: imgInfo.originalUrl,
            filename: imgInfo.filename,
            dimensions: imgInfo.dimensions,
            fileSize: imgInfo.fileSize,
            downloadDate: imgInfo.downloadDate
          });
        }
      }
    }
    
    res.json({ 
      images: downloadedImages,
      count: downloadedImages.length,
      downloadDate: metadata.downloadDate
    });
    
  } catch (error) {
    console.error('Errore nel recupero immagini scaricate:', error);
    res.status(500).json({ error: 'Errore nel recupero immagini scaricate' });
  }
});

// API endpoint per servire le immagini scaricate
app.get('/api/images/serve/:asin/:filename', (req, res) => {
  try {
    const { asin, filename } = req.params;
    const imagePath = path.join(__dirname, 'data', 'product-images', asin, filename);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Immagine non trovata' });
    }
    
    // Imposta gli headers per la cache
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 ore
    res.setHeader('Content-Type', 'image/jpeg');
    
    // Serve l'immagine
    res.sendFile(path.resolve(imagePath));
    
  } catch (error) {
    console.error('Errore nel servire immagine:', error);
    res.status(500).json({ error: 'Errore nel servire immagine' });
  }
});

// API endpoint per creare listing eBay
app.post('/api/ebay/create-listing', async (req, res) => {
  try {
    const { sku, title, description, price, images, categoryId, condition, quantity, marketplace } = req.body;
    
    console.log(`[eBayAPI] Creating listing: ${title}`);
    
    // Validazione dati richiesti
    if (!sku || !title || !price) {
      return res.status(400).json({ 
        error: 'SKU, titolo e prezzo sono richiesti' 
      });
    }
    
    // Simulazione creazione listing eBay (sostituire con vera API eBay)
    const mockEbayResponse = {
      success: true,
      listingId: `eBay-${sku}-${Date.now()}`,
      itemId: Math.floor(Math.random() * 1000000000),
      sku: sku,
      title: title,
      price: price,
      condition: condition || 'NEW',
      marketplace: marketplace || 'EBAY_IT',
      status: 'active',
      createdAt: new Date().toISOString(),
      ebayUrl: `https://www.ebay.it/itm/${Math.floor(Math.random() * 1000000000)}`
    };
    
    // TODO: Integrare con vera eBay API
    // const ebayClient = new eBayApi({
    //   clientId: process.env.EBAY_CLIENT_ID,
    //   clientSecret: process.env.EBAY_CLIENT_SECRET,
    //   env: 'PRODUCTION' // or 'SANDBOX'
    // });
    
    // const ebayListing = await ebayClient.sell.inventory.createOffer({
    //   sku: sku,
    //   marketplaceId: marketplace,
    //   format: 'FIXED_PRICE',
    //   availableQuantity: quantity,
    //   categoryId: categoryId,
    //   listingDescription: description,
    //   pricingSummary: {
    //     price: {
    //       currency: 'EUR',
    //       value: price.toString()
    //     }
    //   }
    // });
    
    console.log(`[eBayAPI] Listing created (mock): ${mockEbayResponse.listingId}`);
    
    res.json(mockEbayResponse);
    
  } catch (error) {
    console.error('[eBayAPI] Error creating listing:', error);
    res.status(500).json({ 
      error: 'Errore nella creazione del listing eBay',
      details: error.message 
    });
  }
});

// Delete saved product
app.delete('/api/products/saved/:asin', (req, res) => {
    try {
        const { asin } = req.params;
        const fs = require('fs');
        const path = require('path');
        const filepath = path.join(__dirname, 'data', 'saved-products', `${asin}.json`);
        
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log(`[API] Product ${asin} deleted successfully`);
            return res.json({ success: true, message: 'Prodotto eliminato' });
        } else {
            return res.status(404).json({ success: false, error: 'Prodotto non trovato' });
        }

    } catch (error) {
        console.error('[API] Error deleting product:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Errore nell\'eliminazione del prodotto' 
        });
    }
});

// Price monitor endpoints
app.post('/api/monitor/add', (req, res) => {
    try {
        const { asin, country } = req.body || {};
        if (!asin) return res.status(400).json({ success: false, error: 'asin required' });
        const info = priceMonitor.addMonitor({ asin, country, onChange: ({ asin, oldPrice, newPrice }) => {
            console.log(`Price changed for ${asin}: ${oldPrice} -> ${newPrice}`);
            // TODO: trigger eBay price update rule here
        }});
        return res.json({ success: true, monitor: info });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/monitor/remove', (req, res) => {
    const { asin } = req.body || {};
    if (!asin) return res.status(400).json({ success: false, error: 'asin required' });
    priceMonitor.removeMonitor(asin);
    return res.json({ success: true });
});

app.get('/api/monitor/list', (req, res) => {
    return res.json({ success: true, monitors: priceMonitor.listMonitors() });
});

// eBay Listings Management Endpoints
app.get('/api/ebay/listings', async (req, res) => {
    // Get user's eBay listings
    try {
        // For now return empty array - in production would fetch from eBay API
        const listings = [];
        
        // TODO: Implement actual eBay API call to get listings
        // const response = await ebayApi.getMyListings(accessToken);
        
        res.json({ success: true, listings });
    } catch (error) {
        console.error('Error fetching eBay listings:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch listings' });
    }
});

app.post('/api/ebay/sync-listings', async (req, res) => {
    // Sync listings with eBay
    try {
        console.log('Syncing eBay listings...');
        
        // TODO: Implement actual eBay sync
        // const response = await ebayApi.syncListings(accessToken);
        
        res.json({ success: true, message: 'Listings synced successfully' });
    } catch (error) {
        console.error('Error syncing eBay listings:', error);
        res.status(500).json({ success: false, error: 'Failed to sync listings' });
    }
});

app.post('/api/ebay/publish', async (req, res) => {
    // Publish draft to eBay
    try {
        const { title, description, price, image, brand, sourceProduct } = req.body;
        
        console.log('Publishing to eBay:', { title, price });
        
        // TODO: Implement actual eBay listing creation
        // const listingData = {
        //     title,
        //     description,
        //     price: parseFloat(price.replace(/[^\d,.]/g, '').replace(',', '.')),
        //     image,
        //     brand,
        //     category: 'Electronics' // Default category
        // };
        // const response = await ebayApi.createListing(accessToken, listingData);
        
        // For now return success
        const mockListingId = 'eb_' + Date.now();
        
        res.json({ 
            success: true, 
            listingId: mockListingId,
            message: 'Draft published to eBay successfully'
        });
    } catch (error) {
        console.error('Error publishing to eBay:', error);
        res.status(500).json({ success: false, error: 'Failed to publish to eBay' });
    }
});

app.post('/api/ebay/listings/:id/end', async (req, res) => {
    // End eBay listing
    try {
        const listingId = req.params.id;
        console.log('Ending eBay listing:', listingId);
        
        // TODO: Implement actual eBay listing end
        // const response = await ebayApi.endListing(accessToken, listingId);
        
        res.json({ success: true, message: 'Listing ended successfully' });
    } catch (error) {
        console.error('Error ending eBay listing:', error);
        res.status(500).json({ success: false, error: 'Failed to end listing' });
    }
});

app.post('/api/ebay/listings/:id/relist', async (req, res) => {
    // Relist eBay item
    try {
        const listingId = req.params.id;
        console.log('Relisting eBay item:', listingId);
        
        // TODO: Implement actual eBay relisting
        // const response = await ebayApi.relistItem(accessToken, listingId);
        
        const newListingId = 'eb_relist_' + Date.now();
        
        res.json({ 
            success: true, 
            newListingId,
            message: 'Item relisted successfully' 
        });
    } catch (error) {
        console.error('Error relisting eBay item:', error);
        res.status(500).json({ success: false, error: 'Failed to relist item' });
    }
});

// Admin: clear internal caches (protected by ADMIN_TOKEN env). Not exposed in production without token.
app.post('/api/admin/clear-cache', (req, res) => {
    const token = req.headers['x-admin-token'] || req.body && req.body.token;
    if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) return res.status(401).json({ success: false, error: 'unauthorized' });
    try {
        // Nessuna cache da pulire (SerpApi rimosso)
        return res.json({ success: true, message: 'No cache to clear (SerpApi removed)' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message || 'failed' });
    }
});

// ============================================
// INTERESTS API - User-specific product monitoring
// ============================================

// Ensure data directories exist (using utility modules)
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('interests'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('webhooks'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('users'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('automations'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('sport'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('sport', 'profiles'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('sport', 'programs'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('sport', 'stats'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('ebay'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('saved-products'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('product-images'));
fileUtils.ensureDirectorySync(pathUtils.getDataDirPath('recipe-images'));

// GET - Retrieve user interests
app.get('/api/interests/:userId', responseUtils.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'userId is required');
    }

    const filePath = pathUtils.getUserInterestsPath(userId);
    const interests = await fileUtils.readJSONFile(filePath, []);
    
    return responseUtils.sendSuccess(res, { interests });
}));

// POST - Save user interests (full replacement)
app.post('/api/interests/:userId', responseUtils.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { interests } = req.body;

    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'userId is required');
    }

    if (!Array.isArray(interests)) {
        return responseUtils.sendValidationError(res, 'interests must be an array');
    }

    const filePath = pathUtils.getUserInterestsPath(userId);
    const success = await fileUtils.writeJSONFile(filePath, interests);
    
    if (!success) {
        return responseUtils.sendError(res, 'Failed to save interests', 500);
    }
    
    console.log(`💾 Saved ${interests.length} interests for user ${userId}`);
    return responseUtils.sendSuccess(res, { count: interests.length });
}));

// POST - Add single interest
app.post('/api/interests/:userId/add', responseUtils.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const interest = req.body;

    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'userId is required');
    }

    const filePath = pathUtils.getUserInterestsPath(userId);
    let interests = await fileUtils.readJSONFile(filePath, []);

    interests.push(interest);
    const success = await fileUtils.writeJSONFile(filePath, interests);
    
    if (!success) {
        return responseUtils.sendError(res, 'Failed to add interest', 500);
    }
    
    console.log(`✅ Added interest "${interest.name}" for user ${userId}`);
    return responseUtils.sendSuccess(res, { interest, total: interests.length });
}));

// DELETE - Remove interest by ID
app.delete('/api/interests/:userId/:interestId', responseUtils.asyncHandler(async (req, res) => {
    const { userId, interestId } = req.params;

    if (!validationUtils.isValidUserId(userId) || !interestId) {
        return responseUtils.sendValidationError(res, 'userId and interestId are required');
    }

    const filePath = pathUtils.getUserInterestsPath(userId);
    let interests = await fileUtils.readJSONFile(filePath, null);
    
    if (interests === null) {
        return responseUtils.sendNotFound(res, 'No interests found');
    }

    const filtered = interests.filter(i => i.id != interestId);
    const success = await fileUtils.writeJSONFile(filePath, filtered);
    
    if (!success) {
        return responseUtils.sendError(res, 'Failed to delete interest', 500);
    }
    
    // 🛑 FERMA IL MONITOR se attivo
    monitorManager.stopMonitor(interestId);
    
    console.log(`🗑️ Deleted interest ${interestId} for user ${userId}`);
    return responseUtils.sendSuccess(res, { remaining: filtered.length });
}));

// ============================================
// DISCORD WEBHOOK ENDPOINTS (SERVER-SIDE)
// ============================================

// POST - Save user Discord webhook (with page context support)
app.post('/api/webhooks/:userId', responseUtils.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { webhook, page = 'generale' } = req.body;

    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'userId is required');
    }

    if (!validationUtils.isValidDiscordWebhook(webhook)) {
        return responseUtils.sendValidationError(res, 'Invalid webhook URL');
    }

    const filePath = pathUtils.getUserWebhookPath(userId);
    let webhookData = fileUtils.readJSONFileSync(filePath, {});
    
    // If old format (just URL string), convert to new format
    if (typeof webhookData === 'string' && webhookData.startsWith('http')) {
        webhookData = { generale: webhookData };
    }
    
    // Save webhook for specific page
    if (!webhookData.webhooks) {
        webhookData.webhooks = {};
    }
    webhookData.webhooks[page] = {
        url: webhook,
        updatedAt: new Date().toISOString()
    };
    webhookData.default = webhook; // Keep default for backward compatibility
    webhookData.updatedAt = new Date().toISOString();

    const success = fileUtils.writeJSONFileSync(filePath, webhookData);
    
    if (!success) {
        return responseUtils.sendError(res, 'Failed to save webhook', 500);
    }
    
    console.log(`💾 Saved Discord webhook for user ${userId}, page: ${page}`);
    return responseUtils.sendSuccess(res, { page });
}));

// GET - Get user Discord webhook (with page context support)
app.get('/api/webhooks/:userId', responseUtils.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 'generale' } = req.query;

    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'userId is required');
    }

    const filePath = pathUtils.getUserWebhookPath(userId);
    let webhookData = fileUtils.readJSONFileSync(filePath, null);
    
    if (webhookData === null) {
        return responseUtils.sendSuccess(res, { webhook: null });
    }
    
    // Old format (just URL string)
    if (typeof webhookData === 'string') {
        return responseUtils.sendSuccess(res, { webhook: webhookData.trim() });
    }
    
    // New format: get webhook for specific page
    if (webhookData.webhooks && webhookData.webhooks[page]) {
        return responseUtils.sendSuccess(res, { 
            webhook: webhookData.webhooks[page].url || webhookData.default 
        });
    }
    
    // Fallback to default
    return responseUtils.sendSuccess(res, { 
        webhook: webhookData.default || webhookData.webhook || null 
    });
}));

// ============================================
// AUTHENTICATION ENDPOINTS (SERVER-SIDE)
// ============================================

const USERS_DB_FILE = path.join(pathUtils.getDataDirPath('users'), 'users_db.json');

// Initialize users database
function initUsersDatabase() {
    if (!fs.existsSync(USERS_DB_FILE)) {
        const defaultData = {
            version: '1.0',
            users: [],
            created: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        fs.writeFileSync(USERS_DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
        console.log('🗄️ Users database initialized');
    }
}

// Get all users from database
function getUsers() {
    try {
        if (!fs.existsSync(USERS_DB_FILE)) {
            initUsersDatabase();
        }
        const data = fs.readFileSync(USERS_DB_FILE, 'utf8');
        const db = JSON.parse(data);
        return db.users || [];
    } catch (error) {
        console.error('❌ Error reading users database:', error);
        return [];
    }
}

// Save users to database
function saveUsers(users) {
    try {
        const db = {
            version: '1.0',
            users: users,
            lastModified: new Date().toISOString()
        };
        fs.writeFileSync(USERS_DB_FILE, JSON.stringify(db, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('❌ Error saving users database:', error);
        return false;
    }
}

// Generate user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// POST /api/auth/register - Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ success: false, error: 'Username must be between 3 and 20 characters' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
        }

        // Check if user exists
        const users = getUsers();
        const existingUser = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() || 
            u.username.toLowerCase() === username.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({ success: false, error: 'Email or username already exists' });
        }

        // Create new user
        const newUser = {
            id: generateUserId(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: password, // ⚠️ In produzione: hash con bcrypt!
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profile: {
                avatar: null,
                bio: null,
                settings: {}
            }
        };

        users.push(newUser);
        saveUsers(users);

        console.log(`✅ Registered new user: ${username}`);

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        return res.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        console.error('❌ Error during registration:', error);
        return res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// POST /api/auth/login - User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            return res.status(400).json({ success: false, error: 'Email/username and password required' });
        }

        const users = getUsers();
        const user = users.find(u => 
            (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
             u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
            u.password === password
        );

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        saveUsers(users);

        console.log(`✅ User logged in: ${user.username}`);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return res.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        console.error('❌ Error during login:', error);
        return res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// GET /api/auth/user/:userId - Get user by ID
app.get('/api/auth/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const users = getUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return res.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        console.error('❌ Error fetching user:', error);
        return res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
});

// PUT /api/auth/user/:userId - Update user profile
app.put('/api/auth/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Update user data (merge with existing)
        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            id: userId, // Prevent ID change
            password: users[userIndex].password // Prevent password change via this endpoint
        };

        saveUsers(users);

        console.log(`✅ Updated user profile: ${userId}`);

        // Return user without password
        const { password: _, ...userWithoutPassword } = users[userIndex];
        return res.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        console.error('❌ Error updating user:', error);
        return res.status(500).json({ success: false, error: 'Failed to update user' });
    }
});

// POST /api/auth/logout - Logout utente (stoppa tutti i monitor)
app.post('/api/auth/logout', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        console.log(`🚪 Logout richiesto per utente: ${userId}`);

        // Stoppa tutti i monitor dell'utente
        const result = monitorManager.stopUserMonitors(userId);
        
        console.log(`✅ Logout completato: ${userId} - ${result.stopped} monitor fermati`);

        return res.json({ 
            success: true, 
            message: 'Logout completato',
            monitorsStopped: result.stopped
        });

    } catch (error) {
        console.error('❌ Error during logout:', error);
        return res.status(500).json({ success: false, error: 'Failed to logout' });
    }
});

// Initialize database on startup
initUsersDatabase();

// ============================================
// MONITOR SYSTEM ENDPOINTS
// ============================================

/**
 * POST /api/monitors/start
 * Avvia un monitor per un interesse
 */
app.post('/api/monitors/start', async (req, res) => {
    try {
        const { userId, interestId, discordWebhook } = req.body;

        if (!userId || !interestId) {
            return res.status(400).json({ success: false, error: 'Missing userId or interestId' });
        }

        // Carica interesse dal database
        const filePath = pathUtils.getUserInterestsPath(userId);
        const interests = await fileUtils.readJSONFile(filePath, null);
        
        if (interests === null) {
            return res.status(404).json({ success: false, error: 'User interests not found' });
        }
        const interest = interests.find(i => i.id == interestId);

        if (!interest) {
            return res.status(404).json({ success: false, error: 'Interest not found' });
        }

        if (interest.type !== 'releasing') {
            return res.status(400).json({ success: false, error: 'Only releasing monitors can be started' });
        }

        // Aggiungi webhook al config
        interest.discordWebhook = discordWebhook;

        // Avvia monitor
        const result = await monitorManager.startMonitor(interest, userId);

        // ⚠️ NON riscrivere il file qui! Il monitor gestisce lo status tramite updateMonitorStatus()
        // Se riscriviamo, perdiamo statusMessage e nextCheckTime che il monitor ha appena aggiunto

        return res.json(result);
    } catch (error) {
        console.error('❌ Error starting monitor:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/monitors/stop/:interestId
 * Ferma un monitor
 */
app.post('/api/monitors/stop/:interestId', async (req, res) => {
    try {
        const { interestId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'Missing userId' });
        }

        const result = monitorManager.stopMonitor(parseInt(interestId));

        if (result.success) {
            // Aggiorna status nel database
            const filePath = pathUtils.getUserInterestsPath(userId);
            const interests = await fileUtils.readJSONFile(filePath, null);
            
            if (interests !== null) {
                const interest = interests.find(i => i.id == interestId);
                
                if (interest) {
                    interest.status = 'stopped';
                    await fileUtils.writeJSONFile(filePath, interests);
                }
            }
        }

        return res.json(result);
    } catch (error) {
        console.error('❌ Error stopping monitor:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/monitors/stop-all
 * Ferma TUTTI i monitor + Elimina tutti gli interessi (admin utility)
 */
app.post('/api/monitors/stop-all', async (req, res) => {
    try {
        console.log('🛑 Richiesta STOP ALL MONITORS + DELETE ALL INTERESTS');
        
        const result = monitorManager.stopAllMonitors();
        
        console.log(`✅ Tutti i monitor fermati: ${result.stopped}`);
        
        // 🗑️ Elimina tutti i file interests
        const interestsDir = path.join(__dirname, 'data', 'interests');
        const files = fs.readdirSync(interestsDir);
        let deletedCount = 0;
        
        for (const file of files) {
            if (file.startsWith('interests_') && file.endsWith('.json')) {
                const filePath = path.join(interestsDir, file);
                fs.writeFileSync(filePath, '[]', 'utf8'); // Svuota invece di eliminare
                deletedCount++;
                console.log(`🗑️ Svuotato file interests: ${file}`);
            }
        }
        
        console.log(`✅ ${deletedCount} file interests svuotati`);
        
        return res.json({ 
            success: true, 
            message: `Fermati ${result.stopped} monitor e svuotati ${deletedCount} file interests`,
            stopped: result.stopped,
            interestsCleared: deletedCount
        });
    } catch (error) {
        console.error('❌ Error stopping all monitors:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/monitors/stats
 * Ottiene statistiche di tutti i monitor
 */
app.get('/api/monitors/stats', (req, res) => {
    try {
        const stats = monitorManager.getStats();
        return res.json({ success: true, ...stats });
    } catch (error) {
        console.error('❌ Error getting monitor stats:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/monitors/user/:userId
 * Ottiene monitor attivi di un utente
 */
app.get('/api/monitors/user/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const monitors = monitorManager.getUserMonitors(userId);
        return res.json({ success: true, monitors });
    } catch (error) {
        console.error('❌ Error getting user monitors:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/admin/server-data
 * Admin endpoint: visualizza TUTTI i dati server (users, interests, webhooks, monitors)
 */
app.get('/api/admin/server-data', async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        // Leggi tutti i file dal server
        const usersDir = path.join(__dirname, 'data', 'users');
        const interestsDir = path.join(__dirname, 'data', 'interests');
        const webhooksDir = path.join(__dirname, 'data', 'webhooks');
        
        // Funzione helper per leggere directory
        const readDirFiles = async (dir) => {
            try {
                const files = await fs.readdir(dir);
                const data = {};
                
                for (const file of files) {
                    if (file.endsWith('.json')) {
                        const filePath = path.join(dir, file);
                        const content = await fs.readFile(filePath, 'utf8');
                        data[file] = JSON.parse(content);
                    }
                }
                
                return data;
            } catch (err) {
                console.error(`Error reading dir ${dir}:`, err);
                return {};
            }
        };
        
        // Leggi tutti i dati
        const users = await readDirFiles(usersDir);
        const interests = await readDirFiles(interestsDir);
        const webhooks = await readDirFiles(webhooksDir);
        
        // Statistiche monitor attivi
        const monitorStats = monitorManager.getStats();
        
        return res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                users,
                interests,
                webhooks,
                monitorStats
            },
            counts: {
                totalUsers: Object.keys(users).length,
                totalInterests: Object.keys(interests).length,
                totalWebhooks: Object.keys(webhooks).length,
                activeMonitors: monitorStats.total
            }
        });
        
    } catch (error) {
        console.error('❌ Error getting admin data:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/admin/user/:userId
 * Admin endpoint: elimina completamente un utente (user file + interests + webhooks)
 */
app.delete('/api/admin/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const fs = require('fs').promises;
        const path = require('path');
        
        // 1. Ferma tutti i monitor dell'utente
        const stoppedMonitors = monitorManager.stopUserMonitors(userId);
        
        // 2. Elimina file user
        const userFile = path.join(__dirname, 'data', 'users', `${userId}.json`);
        try {
            await fs.unlink(userFile);
            console.log(`🗑️ Deleted user file: ${userId}`);
        } catch (err) {
            console.log(`⚠️ User file not found: ${userId}`);
        }
        
        // 3. Elimina interests
        const interestsFile = path.join(__dirname, 'data', 'interests', `interests_${userId}.json`);
        try {
            await fs.unlink(interestsFile);
            console.log(`🗑️ Deleted interests file: ${userId}`);
        } catch (err) {
            console.log(`⚠️ Interests file not found: ${userId}`);
        }
        
        // 4. Elimina webhooks
        const webhooksFile = path.join(__dirname, 'data', 'webhooks', `webhooks_${userId}.json`);
        try {
            await fs.unlink(webhooksFile);
            console.log(`🗑️ Deleted webhooks file: ${userId}`);
        } catch (err) {
            console.log(`⚠️ Webhooks file not found: ${userId}`);
        }
        
        return res.json({
            success: true,
            message: `User ${userId} completamente eliminato`,
            monitorsStopped: stoppedMonitors.stopped
        });
        
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SPORT & FITNESS ENDPOINTS
// ============================================

const SPORT_DATA_DIR = path.join(__dirname, 'data', 'sport');
if (!fs.existsSync(SPORT_DATA_DIR)) {
    fs.mkdirSync(SPORT_DATA_DIR, { recursive: true });
}

const SPORT_WEBHOOK_CONFIG_FILE = path.join(SPORT_DATA_DIR, 'webhook_config.json');

// Helper to get sport webhook URL
function getSportWebhookUrl() {
    try {
        if (fs.existsSync(SPORT_WEBHOOK_CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(SPORT_WEBHOOK_CONFIG_FILE, 'utf8'));
            return config.webhookUrl || null;
        }
    } catch (error) {
        console.warn('⚠️ Could not read webhook config:', error.message);
    }
    return null;
}

// POST /api/sport/profile - Save user sport profile (quiz data)
app.post('/api/sport/profile', async (req, res) => {
    try {
        const { userId, profileData } = req.body;
        
        if (!userId || !profileData) {
            return res.status(400).json({ success: false, error: 'userId and profileData required' });
        }

        // Salva profilo sport dell'utente
        const sportProfilePath = path.join(SPORT_DATA_DIR, `${userId}_profile.json`);
        const dataToSave = {
            userId,
            profile: profileData,
            savedAt: new Date().toISOString(),
            version: '1.0'
        };

        fs.writeFileSync(sportProfilePath, JSON.stringify(dataToSave, null, 2), 'utf8');
        console.log(`💪 Sport profile saved for user: ${userId}`);

        return res.json({ success: true, message: 'Profile saved successfully' });
    } catch (error) {
        console.error('❌ Error saving sport profile:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/sport/profiles/all - Get all sport profiles for admin panel
app.get('/api/sport/profiles/all', async (req, res) => {
    try {
        if (!fs.existsSync(SPORT_DATA_DIR)) {
            return res.json({ success: true, profiles: [] });
        }

        const files = fs.readdirSync(SPORT_DATA_DIR);
        const profiles = [];

        for (const file of files) {
            if (file.endsWith('_profile.json')) {
                try {
                    const filePath = path.join(SPORT_DATA_DIR, file);
                    const profileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    
                    // Get program data if exists
                    const userId = file.replace('_profile.json', '');
                    const programPath = path.join(SPORT_DATA_DIR, `${userId}_program.json`);
                    let programData = null;
                    
                    if (fs.existsSync(programPath)) {
                        programData = JSON.parse(fs.readFileSync(programPath, 'utf8'));
                    }

                    profiles.push({
                        userId: profileData.userId,
                        profile: profileData.profile,
                        savedAt: profileData.savedAt,
                        programTitle: programData?.programData?.title || null,
                        completedWorkouts: programData?.completedWorkouts?.length || 0,
                        totalCalories: (programData?.completedWorkouts?.length || 0) * 
                                      (programData?.programData?.estimatedCalories || 400)
                    });
                } catch (err) {
                    console.warn(`⚠️ Could not parse ${file}:`, err.message);
                }
            }
        }

        return res.json({ 
            success: true, 
            profiles: profiles.sort((a, b) => 
                new Date(b.savedAt) - new Date(a.savedAt)
            )
        });
    } catch (error) {
        console.error('❌ Error getting all profiles:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/sport/profile/:userId - Get user sport profile
app.get('/api/sport/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const sportProfilePath = path.join(SPORT_DATA_DIR, `${userId}_profile.json`);

        if (!fs.existsSync(sportProfilePath)) {
            return res.status(404).json({ success: false, error: 'Profile not found' });
        }

        const data = JSON.parse(fs.readFileSync(sportProfilePath, 'utf8'));
        return res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Error loading sport profile:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/sport/program - Save selected workout program
app.post('/api/sport/program', async (req, res) => {
    try {
        const { userId, programId, programData } = req.body;
        
        if (!userId || !programId) {
            return res.status(400).json({ success: false, error: 'userId and programId required' });
        }

        // Salva programma scelto
        const programPath = path.join(SPORT_DATA_DIR, `${userId}_program.json`);
        const dataToSave = {
            userId,
            programId,
            programData,
            startedAt: new Date().toISOString(),
            completedWorkouts: [],
            weekSchedule: programData?.weekSchedule || [],
            version: '1.0'
        };

        fs.writeFileSync(programPath, JSON.stringify(dataToSave, null, 2), 'utf8');
        console.log(`🏋️ Program ${programId} saved for user: ${userId}`);

        // Invia webhook notifica
        try {
            const webhookUrl = getSportWebhookUrl();
            if (webhookUrl) {
                await axios.post(webhookUrl, {
                    content: `🎯 **Nuovo Allenamento Scelto!**\n\nUser ID: \`${userId}\`\nProgramma: **${programData?.title || programId}**\nData: ${new Date().toLocaleString('it-IT')}`
                });
                console.log('📢 Webhook inviato per nuovo programma');
            } else {
                console.log('ℹ️ Nessun webhook configurato');
            }
        } catch (webhookError) {
            console.warn('⚠️ Webhook failed:', webhookError.message);
        }

        return res.json({ success: true, message: 'Program saved successfully' });
    } catch (error) {
        console.error('❌ Error saving program:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/sport/program/:userId - Get user's active program
app.get('/api/sport/program/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const programPath = path.join(SPORT_DATA_DIR, `${userId}_program.json`);

        if (!fs.existsSync(programPath)) {
            return res.status(404).json({ success: false, error: 'Program not found' });
        }

        const data = JSON.parse(fs.readFileSync(programPath, 'utf8'));
        return res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Error loading program:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/sport/workout-completed - Mark workout as completed
app.post('/api/sport/workout-completed', async (req, res) => {
    try {
        const { userId, workoutDate, sessionData } = req.body;
        
        if (!userId || !workoutDate) {
            return res.status(400).json({ success: false, error: 'userId and workoutDate required' });
        }

        const programPath = path.join(SPORT_DATA_DIR, `${userId}_program.json`);
        
        if (!fs.existsSync(programPath)) {
            return res.status(404).json({ success: false, error: 'Program not found' });
        }

        const programData = JSON.parse(fs.readFileSync(programPath, 'utf8'));
        
        // Aggiungi workout completato
        if (!programData.completedWorkouts) {
            programData.completedWorkouts = [];
        }
        
        programData.completedWorkouts.push({
            date: workoutDate,
            sessionData,
            completedAt: new Date().toISOString()
        });

        fs.writeFileSync(programPath, JSON.stringify(programData, null, 2), 'utf8');
        console.log(`✅ Workout completed for user: ${userId}`);

        return res.json({ 
            success: true, 
            totalCompleted: programData.completedWorkouts.length 
        });
    } catch (error) {
        console.error('❌ Error marking workout completed:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/sport/stats/:userId - Get user sport statistics
app.get('/api/sport/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const programPath = path.join(SPORT_DATA_DIR, `${userId}_program.json`);

        if (!fs.existsSync(programPath)) {
            return res.json({ 
                success: true, 
                stats: {
                    totalWorkouts: 0,
                    currentStreak: 0,
                    estimatedCalories: 0
                }
            });
        }

        const programData = JSON.parse(fs.readFileSync(programPath, 'utf8'));
        const completedCount = programData.completedWorkouts?.length || 0;
        const estimatedCalories = completedCount * (programData.programData?.estimatedCalories || 400);

        return res.json({ 
            success: true, 
            stats: {
                totalWorkouts: completedCount,
                currentStreak: calculateStreak(programData.completedWorkouts),
                estimatedCalories,
                programTitle: programData.programData?.title
            }
        });
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function to calculate workout streak
function calculateStreak(completedWorkouts) {
    if (!completedWorkouts || completedWorkouts.length === 0) return 0;
    
    // Sort by date descending
    const sorted = [...completedWorkouts].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const workout of sorted) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// POST /api/sport/test-webhook - Test webhook notification
app.post('/api/sport/test-webhook', async (req, res) => {
    try {
        const { webhookUrl } = req.body;
        
        if (!webhookUrl) {
            return res.status(400).json({ success: false, error: 'webhookUrl required' });
        }

        // Salva webhook URL
        fs.writeFileSync(SPORT_WEBHOOK_CONFIG_FILE, JSON.stringify({ 
            webhookUrl,
            updatedAt: new Date().toISOString() 
        }, null, 2), 'utf8');

        // Invia notifica di test
        await axios.post(webhookUrl, {
            content: `🧪 **Test Webhook Sport & Fitness**\n\n✅ Webhook configurato correttamente!\n\nRiceverai notifiche quando gli utenti scelgono un programma di allenamento.\n\n📅 ${new Date().toLocaleString('it-IT')}`
        });

        console.log('📢 Test webhook sent successfully');
        return res.json({ success: true, message: 'Test webhook sent' });
    } catch (error) {
        console.error('❌ Error sending test webhook:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/sport/webhook - Get configured webhook URL
app.get('/api/sport/webhook', async (req, res) => {
    try {
        const webhookUrl = getSportWebhookUrl();
        return res.json({ 
            success: true, 
            webhookUrl: webhookUrl || null,
            configured: !!webhookUrl
        });
    } catch (error) {
        console.error('❌ Error getting webhook:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ========================================
// AUTOMATIONS API
// ========================================

/**
 * GET /api/admin/user-data/:userId
 * UNIFIED API - Get ALL user data in one call
 * Returns: user account, sport data, interests, webhooks, automations
 */
app.get('/api/admin/user-data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        const userData = {
            userId,
            timestamp: new Date().toISOString(),
            data: {}
        };

        // 1. User Account (from users/)
        try {
            const userPath = pathUtils.getUserPath(userId);
            if (fs.existsSync(userPath)) {
                userData.data.account = JSON.parse(fs.readFileSync(userPath, 'utf8'));
            }
        } catch (err) {
            console.log(`No user account for ${userId}`);
        }

        // 2. Sport Data (profile, program, stats)
        userData.data.sport = {};
        try {
            const sportProfilePath = path.join(SPORT_DATA_DIR, `${userId}_profile.json`);
            if (fs.existsSync(sportProfilePath)) {
                const sportData = JSON.parse(fs.readFileSync(sportProfilePath, 'utf8'));
                userData.data.sport.profile = sportData.profile || sportData;
                
                // Extract key info
                if (sportData.profile) {
                    userData.data.sport.age = sportData.profile.age;
                    userData.data.sport.height = sportData.profile.height;
                    userData.data.sport.weight = sportData.profile.weight;
                    userData.data.sport.goal = sportData.profile.goal;
                    userData.data.sport.level = sportData.profile.level;
                }
            }
        } catch (err) {
            console.log(`No sport profile for ${userId}`);
        }

        try {
            const sportProgramPath = path.join(SPORT_DATA_DIR, `${userId}_program.json`);
            if (fs.existsSync(sportProgramPath)) {
                const programData = JSON.parse(fs.readFileSync(sportProgramPath, 'utf8'));
                userData.data.sport.program = programData;
                
                // Extract weekly schedule
                if (programData.weekSchedule) {
                    userData.data.sport.weeklyCommitment = programData.weekSchedule.length + ' giorni/settimana';
                }
            }
        } catch (err) {
            console.log(`No sport program for ${userId}`);
        }

        try {
            const sportStatsPath = path.join(SPORT_DATA_DIR, `${userId}_stats.json`);
            if (fs.existsSync(sportStatsPath)) {
                userData.data.sport.stats = JSON.parse(fs.readFileSync(sportStatsPath, 'utf8'));
            }
        } catch (err) {
            console.log(`No sport stats for ${userId}`);
        }

        // 3. Interests
        try {
            const interestsPath = pathUtils.getUserInterestsPath(userId);
            if (fs.existsSync(interestsPath)) {
                const interestsData = JSON.parse(fs.readFileSync(interestsPath, 'utf8'));
                userData.data.interests = interestsData.interests || interestsData;
            }
        } catch (err) {
            console.log(`No interests for ${userId}`);
        }

        // 4. Webhooks (new format with multiple pages)
        try {
            const webhookPath = pathUtils.getUserWebhookPath(userId);
            if (fs.existsSync(webhookPath)) {
                const webhookData = JSON.parse(fs.readFileSync(webhookPath, 'utf8'));
                // Return full webhook data (supports both old and new format)
                userData.data.webhook = webhookData;
            }
        } catch (err) {
            console.log(`No webhook for ${userId}`);
        }

        // 5. Automations
        try {
            const automationsPath = path.join(__dirname, 'data', 'automations', `${userId}.json`);
            if (fs.existsSync(automationsPath)) {
                userData.data.automations = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
            }
        } catch (err) {
            console.log(`No automations for ${userId}`);
        }

        // 6. eBay Connection Status
        try {
            const ebayTokenPath = path.join(__dirname, 'data', 'ebay', userId, 'tokens.json');
            if (fs.existsSync(ebayTokenPath)) {
                const tokenData = JSON.parse(fs.readFileSync(ebayTokenPath, 'utf8'));
                userData.data.ebay = {
                    connected: true,
                    scope: tokenData.scope,
                    expiresAt: tokenData.expires_at
                };
            } else {
                userData.data.ebay = { connected: false };
            }
        } catch (err) {
            userData.data.ebay = { connected: false };
        }

        console.log(`✅ Unified user data retrieved for: ${userId}`);
        
        return res.json({
            success: true,
            ...userData
        });
        
    } catch (error) {
        console.error('❌ Error getting unified user data:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// AUTOMATIONS API
// ============================================

// AUTOMATIONS_DIR è già stato creato sopra con fileUtils.ensureDirectorySync

/**
 * POST /api/automations/sport
 * Save sport automation settings
 */
app.post('/api/automations/sport', responseUtils.asyncHandler(async (req, res) => {
    const { userId, automations } = req.body;
    
    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'Missing userId');
    }

    const automationsPath = pathUtils.getUserAutomationsPath(userId);
    let existingData = fileUtils.readJSONFileSync(automationsPath, {});

    existingData.sport = {
        ...automations,
        lastUpdated: new Date().toISOString()
    };

    const success = fileUtils.writeJSONFileSync(automationsPath, existingData);
    
    if (!success) {
        return responseUtils.sendError(res, 'Failed to save sport automations', 500);
    }
    
    console.log(`✅ Sport automations saved for user ${userId}`);
    return responseUtils.sendSuccess(res, {
        message: 'Sport automations saved',
        automations: existingData.sport
    });
}));

/**
 * GET /api/automations/sport/:userId
 * Get sport automation settings
 */
app.get('/api/automations/sport/:userId', responseUtils.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'userId is required');
    }

    const automationsPath = pathUtils.getUserAutomationsPath(userId);
    const data = fileUtils.readJSONFileSync(automationsPath, null);
    
    const defaultAutomations = {
        enableNotifications: false,
        notifyBefore: 30,
        sendExercisesDiscord: false,
        preferredTimeSlot: '18:00-20:00'
    };

    if (data === null || !data.sport) {
        return responseUtils.sendSuccess(res, { automations: defaultAutomations });
    }

    return responseUtils.sendSuccess(res, {
        automations: data.sport || defaultAutomations
    });
}));

/**
 * POST /api/automations/habits
 * Save habit automation settings
 */
app.post('/api/automations/habits', responseUtils.asyncHandler(async (req, res) => {
    const { userId, settings } = req.body;
    
    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'Missing userId');
    }

    const automationsPath = pathUtils.getUserAutomationsPath(userId);
    let existingData = fileUtils.readJSONFileSync(automationsPath, {});

    existingData.habits = {
        ...settings,
        lastUpdated: new Date().toISOString()
    };

    const success = fileUtils.writeJSONFileSync(automationsPath, existingData);
    
    if (!success) {
        return responseUtils.sendError(res, 'Failed to save habit settings', 500);
    }
    
    console.log(`✅ Habit settings saved for user ${userId}`);
    return responseUtils.sendSuccess(res, {
        message: 'Habit settings saved',
        settings: existingData.habits
    });
}));

/**
 * GET /api/automations/habits/:userId
 * Get habit automation settings
 */
app.get('/api/automations/habits/:userId', responseUtils.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'userId is required');
    }

    const automationsPath = pathUtils.getUserAutomationsPath(userId);
    const data = fileUtils.readJSONFileSync(automationsPath, null);
    
    const defaultSettings = {
        autoTracking: true,
        dailyReminder: 'evening',
        streakNotifications: true,
        weeklyGoal: 5
    };

    if (data === null || !data.habits) {
        return responseUtils.sendSuccess(res, { settings: defaultSettings });
    }

    return responseUtils.sendSuccess(res, {
        settings: data.habits || defaultSettings
    });
}));

/**
 * POST /api/automations/notifications
 * Save Discord notification settings
 */
app.post('/api/automations/notifications', responseUtils.asyncHandler(async (req, res) => {
    const { userId, settings } = req.body;
    
    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'Missing userId');
    }

    const automationsPath = pathUtils.getUserAutomationsPath(userId);
    let existingData = fileUtils.readJSONFileSync(automationsPath, {});

    existingData.notifications = {
        ...settings,
        lastUpdated: new Date().toISOString()
    };

    const success = fileUtils.writeJSONFileSync(automationsPath, existingData);
    
    if (!success) {
        return responseUtils.sendError(res, 'Failed to save notification settings', 500);
    }
    
    console.log(`✅ Notification settings saved for user ${userId}`);
    return responseUtils.sendSuccess(res, {
        message: 'Notification settings saved',
        settings: existingData.notifications
    });
}));

/**
 * GET /api/automations/notifications/:userId
 * Get Discord notification settings
 */
app.get('/api/automations/notifications/:userId', responseUtils.asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!validationUtils.isValidUserId(userId)) {
        return responseUtils.sendValidationError(res, 'userId is required');
    }

    const automationsPath = pathUtils.getUserAutomationsPath(userId);
    const data = fileUtils.readJSONFileSync(automationsPath, null);
    
    const defaultSettings = {
        notifyMonitorProducts: true,
        notifyWorkouts: true,
        notifyHabits: true,
        notifyEbay: false,
        frequency: 'realtime'
    };

    if (data === null || !data.notifications) {
        return responseUtils.sendSuccess(res, { settings: defaultSettings });
    }

    return responseUtils.sendSuccess(res, {
        settings: data.notifications || defaultSettings
    });
}));

// ============================================
// AGENT AI COMMITTEE ENDPOINTS
// ============================================

/**
 * POST /api/agents/task
 * Assign a task to the agent system
 */
app.post('/api/agents/task', async (req, res) => {
    try {
        const task = req.body;
        
        if (!task || !task.type) {
            return res.status(400).json({ 
                success: false, 
                error: 'Task type required' 
            });
        }

        const result = await coordinator.assignTask(task);
        res.json(result);
    } catch (error) {
        console.error('Error assigning task:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/agents/queue
 * Queue a task to the agent system
 */
app.post('/api/agents/queue', async (req, res) => {
    try {
        const { task, preferredAgent } = req.body;
        
        if (!task || !task.type) {
            return res.status(400).json({ 
                success: false, 
                error: 'Task type required' 
            });
        }

        const taskId = await coordinator.queueTask(task, preferredAgent);
        res.json({ 
            success: true, 
            taskId,
            message: 'Task queued successfully' 
        });
    } catch (error) {
        console.error('Error queueing task:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/agents/stats
 * Get agent system statistics
 */
app.get('/api/agents/stats', async (req, res) => {
    try {
        const stats = coordinator.getStats();
        res.json({ 
            success: true, 
            stats 
        });
    } catch (error) {
        console.error('Error getting agent stats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/agents/agent/:agentName
 * Get specific agent status
 */
app.get('/api/agents/agent/:agentName', async (req, res) => {
    try {
        const { agentName } = req.params;
        const agentStats = coordinator.getAgentStatus(agentName);
        
        if (!agentStats) {
            return res.status(404).json({ 
                success: false, 
                error: 'Agent not found' 
            });
        }

        res.json({ 
            success: true, 
            agent: agentStats 
        });
    } catch (error) {
        console.error('Error getting agent status:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/figma/create-page
 * Create a page from Figma design
 */
app.post('/api/figma/create-page', async (req, res) => {
    try {
        const { fileKey, nodeId, pageName, pagePath, backendConfig, exportAssets, assetNodeIds } = req.body;
        
        if (!fileKey || !pageName) {
            return res.status(400).json({ 
                success: false, 
                error: 'fileKey and pageName required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'create_page_from_figma',
            fileKey,
            nodeId,
            pageName,
            pagePath,
            backendConfig,
            exportAssets,
            assetNodeIds,
            assetFormat: req.body.assetFormat || 'png'
        });

        res.json(result);
    } catch (error) {
        console.error('Error creating page from Figma:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/figma/sync
 * Sync Figma design
 */
app.post('/api/figma/sync', async (req, res) => {
    try {
        const { fileKey, nodeId } = req.body;
        
        if (!fileKey) {
            return res.status(400).json({ 
                success: false, 
                error: 'fileKey required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'sync_figma_design',
            fileKey,
            nodeId
        });

        res.json(result);
    } catch (error) {
        console.error('Error syncing Figma design:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// ========== Recipe API Endpoints (GialloZafferano Integration) ==========

// Cerca ricette su GialloZafferano
app.post('/api/recipes/search', async (req, res) => {
    try {
        const { query, limit } = req.body;
        
        if (!query) {
            return res.status(400).json({ 
                success: false, 
                error: 'Query is required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'search_giallozafferano_recipes',
            query,
            limit: limit || 20
        });

        res.json(result);
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Scraping ricetta da GialloZafferano
app.post('/api/recipes/fetch', async (req, res) => {
    try {
        const { url, saveToDatabase, downloadImage } = req.body;
        
        if (!url) {
            return res.status(400).json({ 
                success: false, 
                error: 'Recipe URL is required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'fetch_recipe_from_giallozafferano',
            url,
            saveToDatabase: saveToDatabase !== false, // default true
            downloadImage: downloadImage !== false // default true
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Import batch di ricette
app.post('/api/recipes/batch-import', async (req, res) => {
    try {
        const { urls, saveToDatabase, downloadImages } = req.body;
        
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'URLs array is required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'batch_import_recipes',
            urls,
            saveToDatabase: saveToDatabase !== false,
            downloadImages: downloadImages !== false
        });

        res.json(result);
    } catch (error) {
        console.error('Error batch importing recipes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Servi immagini ricette
app.get('/api/recipes/images/:recipeId/:filename', async (req, res) => {
    try {
        const { recipeId, filename } = req.params;
        const imagePath = path.join(__dirname, 'data', 'recipe-images', recipeId, filename);
        
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error serving recipe image:', error);
        res.status(500).json({ error: 'Error serving image' });
    }
});

// Recupera ricetta dal database
app.get('/api/recipes/:recipeId', async (req, res) => {
    try {
        const { recipeId } = req.params;
        
        const result = await coordinator.assignTask({
            type: 'get_recipe_from_database',
            recipeId
        });

        res.json(result);
    } catch (error) {
        console.error('Error getting recipe:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cerca ricette nel database
app.get('/api/recipes', async (req, res) => {
    try {
        const { q, limit, skip } = req.query;
        
        const result = await coordinator.assignTask({
            type: 'search_recipes_in_database',
            query: q,
            limit: limit ? parseInt(limit) : 20,
            skip: skip ? parseInt(skip) : 0
        });

        res.json(result);
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/frontend/link-page
 * Link a page to backend APIs
 */
app.post('/api/frontend/link-page', async (req, res) => {
    try {
        const { pagePath, apiConfig } = req.body;
        
        if (!pagePath || !apiConfig) {
            return res.status(400).json({ 
                success: false, 
                error: 'pagePath and apiConfig required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'link_page_to_api',
            pagePath,
            apiConfig
        });

        res.json(result);
    } catch (error) {
        console.error('Error linking page to API:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/agents/communicate
 * Communicate with a specific agent
 */
app.post('/api/agents/communicate', async (req, res) => {
    try {
        const { agentName, message } = req.body;
        
        if (!agentName || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'agentName and message required' 
            });
        }

        const result = await coordinator.communicateWithAgent(agentName, message);
        res.json({ 
            success: true, 
            result 
        });
    } catch (error) {
        console.error('Error communicating with agent:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

function startHttp() {
    console.log('� Starting HTTP server as fallback...');
    const httpServer = app.listen(PORT, '0.0.0.0', () => {
        const addr = httpServer.address();
    console.log('✅ Shappa Backend Server Running (HTTP)');
    console.log(`🌐 Bound to ${addr ? (typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`) : 'unknown'}`);
        console.log('🌐 URL: http://localhost:' + PORT);
    });
}

try {
    let httpsOptions = {};
    const pfxPath = path.join(__dirname, 'ssl', 'key.pfx');
    const pemKeyPath = path.join(__dirname, 'ssl', 'key.pem');
    const pemCertPath = path.join(__dirname, 'ssl', 'cert.pem');
    if (fs.existsSync(pfxPath)) {
        try {
            httpsOptions.pfx = fs.readFileSync(pfxPath);
            httpsOptions.passphrase = process.env.DEV_PFX_PASSPHRASE || 'shappa-dev';
            console.log('🔐 Using PFX for HTTPS from', pfxPath);
        } catch (e) {
            console.warn('⚠️ Failed to read PFX, falling back to PEM if available', e.message);
        }
    }
    if (!httpsOptions.pfx && fs.existsSync(pemKeyPath) && fs.existsSync(pemCertPath)) {
        httpsOptions.key = fs.readFileSync(pemKeyPath);
        httpsOptions.cert = fs.readFileSync(pemCertPath);
        console.log('🔐 Using PEM key/cert for HTTPS from ssl folder');
    }
    console.log('� Starting HTTPS server...');
    const httpsServer = https.createServer(httpsOptions, app);
    httpsServer.on('error', (err) => {
        console.error('❌ HTTPS server error:', err.message);
        console.warn('🔄 Falling back to HTTP...');
        startHttp();
    });
    httpsServer.listen(PORT, '0.0.0.0', () => {
        const addr = httpsServer.address();
        console.log('✅ Shappa Backend Server Running (HTTPS)');
        console.log(`🌐 Bound to ${addr ? (typeof addr === 'string' ? addr : `${addr.address}:${addr.port}`) : 'unknown'}`);
        console.log('🌐 URL: https://localhost:' + PORT);
        try {
            priceMonitor.startPriceMonitor();
            console.log('⏱️ Price monitor started (every 30m)');
        } catch (e) {
            console.log('Price monitor failed to start:', e.message);
        }
        
        // Carica monitor attivi al boot
        monitorManager.loadAllMonitors().then(result => {
            if (result.success) {
                console.log(`🚀 Loaded ${result.loaded} active monitors`);
            }
        }).catch(err => {
            console.error('❌ Failed to load monitors:', err.message);
        });
    });
} catch (err) {
    console.error('❌ HTTPS startup failed:', err.message);
    console.warn('🔄 Falling back to HTTP...');
    startHttp();
}