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

// Initialize Agent AI Committee System
const { coordinator } = initializeAgents({
    figma: {
        figmaApiKey: process.env.FIGMA_API_KEY
    },
    userProfile: {
        priority: 10,
        verificationIntervalMs: 60000 // Verifica ogni minuto H24
    },
    security: {
        sessionTTL: 3600000, // 1 hour
        priority: 9
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
    ai: {
        priority: 8,
        openaiApiKey: process.env.OPENAI_API_KEY,
        googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY,
        claudeApiKey: process.env.CLAUDE_API_KEY,
        qwenApiKey: process.env.QWEN_API_KEY,
        huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY
    },
    bot: {
        priority: 7
    }
});

console.log('🤖 Agent AI Committee System initialized');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ⚠️ IMPORTANTE: express.static deve essere DOPO gli endpoint API
// per evitare che intercetti le richieste API
// app.use(express.static(__dirname)); // Spostato dopo gli endpoint API

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
// app.use('/assets', express.static(path.join(__dirname, 'assets'))); // Spostato dopo gli endpoint API

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

const INTERESTS_DIR = path.join(__dirname, 'data', 'interests');
const WEBHOOKS_DIR = path.join(__dirname, 'data', 'webhooks');
const USERS_DIR = path.join(__dirname, 'data', 'users');

// Ensure directories exist
if (!fs.existsSync(INTERESTS_DIR)) {
    fs.mkdirSync(INTERESTS_DIR, { recursive: true });
    console.log('📁 Created interests directory');
}

if (!fs.existsSync(WEBHOOKS_DIR)) {
    fs.mkdirSync(WEBHOOKS_DIR, { recursive: true });
    console.log('📁 Created webhooks directory');
}

if (!fs.existsSync(USERS_DIR)) {
    fs.mkdirSync(USERS_DIR, { recursive: true });
    console.log('📁 Created users directory');
}

// Get user interests file path
function getUserInterestsPath(userId) {
    return path.join(INTERESTS_DIR, `interests_${userId}.json`);
}

// Get user webhook file path
function getUserWebhookPath(userId) {
    return path.join(WEBHOOKS_DIR, `webhook_${userId}.json`);
}

// GET - Retrieve user interests
app.get('/api/interests/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        const filePath = getUserInterestsPath(userId);
        
        if (!fs.existsSync(filePath)) {
            return res.json({ success: true, interests: [] });
        }

        const data = await fsPromises.readFile(filePath, 'utf8');
        const interests = JSON.parse(data);
        
        return res.json({ success: true, interests });
    } catch (error) {
        console.error('❌ Error reading interests:', error);
        return res.status(500).json({ success: false, error: 'Failed to read interests' });
    }
});

// POST - Save user interests (full replacement)
app.post('/api/interests/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { interests } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        if (!Array.isArray(interests)) {
            return res.status(400).json({ success: false, error: 'interests must be an array' });
        }

        const filePath = getUserInterestsPath(userId);
        await fsPromises.writeFile(filePath, JSON.stringify(interests, null, 2), 'utf8');
        
        console.log(`💾 Saved ${interests.length} interests for user ${userId}`);
        
        // Notifica UserProfileAgent del cambiamento
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'interests',
                data: interests,
                source: 'interests_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ success: true, count: interests.length });
    } catch (error) {
        console.error('❌ Error saving interests:', error);
        return res.status(500).json({ success: false, error: 'Failed to save interests' });
    }
});

// POST - Add single interest
app.post('/api/interests/:userId/add', async (req, res) => {
    try {
        const { userId } = req.params;
        const interest = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        const filePath = getUserInterestsPath(userId);
        let interests = [];

        if (fs.existsSync(filePath)) {
            const data = await fsPromises.readFile(filePath, 'utf8');
            interests = JSON.parse(data);
        }

        interests.push(interest);
        await fsPromises.writeFile(filePath, JSON.stringify(interests, null, 2), 'utf8');
        
        console.log(`✅ Added interest "${interest.name}" for user ${userId}`);
        return res.json({ success: true, interest, total: interests.length });
    } catch (error) {
        console.error('❌ Error adding interest:', error);
        return res.status(500).json({ success: false, error: 'Failed to add interest' });
    }
});

// DELETE - Remove interest by ID
app.delete('/api/interests/:userId/:interestId', async (req, res) => {
    try {
        const { userId, interestId } = req.params;

        if (!userId || !interestId) {
            return res.status(400).json({ success: false, error: 'userId and interestId required' });
        }

        const filePath = getUserInterestsPath(userId);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'No interests found' });
        }

        const data = await fsPromises.readFile(filePath, 'utf8');
        const interests = JSON.parse(data);
        const filtered = interests.filter(i => i.id != interestId);

        await fsPromises.writeFile(filePath, JSON.stringify(filtered, null, 2), 'utf8');
        
        // 🛑 FERMA IL MONITOR se attivo
        monitorManager.stopMonitor(interestId);
        
        console.log(`🗑️ Deleted interest ${interestId} for user ${userId}`);
        return res.json({ success: true, remaining: filtered.length });
    } catch (error) {
        console.error('❌ Error deleting interest:', error);
        return res.status(500).json({ success: false, error: 'Failed to delete interest' });
    }
});

// ============================================
// DISCORD WEBHOOK ENDPOINTS (SERVER-SIDE)
// ============================================

// GET - Retrieve user Discord webhook
app.get('/api/webhooks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        const filePath = getUserWebhookPath(userId);
        
        if (!fs.existsSync(filePath)) {
            return res.json({ success: true, webhook: null });
        }

        const data = await fsPromises.readFile(filePath, 'utf8');
        const webhookData = JSON.parse(data);
        
        return res.json({ success: true, webhook: webhookData.url });
    } catch (error) {
        console.error('❌ Error reading webhook:', error);
        return res.status(500).json({ success: false, error: 'Failed to read webhook' });
    }
});

// POST - Save user Discord webhook
app.post('/api/webhooks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { webhook } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        if (!webhook || !webhook.includes('discord.com/api/webhooks/')) {
            return res.status(400).json({ success: false, error: 'Invalid webhook URL' });
        }

        const filePath = getUserWebhookPath(userId);
        const webhookData = {
            url: webhook,
            savedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await fsPromises.writeFile(filePath, JSON.stringify(webhookData, null, 2), 'utf8');
        
        console.log(`💾 Saved Discord webhook for user ${userId}`);
        
        // Notifica UserProfileAgent del cambiamento
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'webhooks',
                data: webhookData,
                source: 'webhooks_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ success: true });
    } catch (error) {
        console.error('❌ Error saving webhook:', error);
        return res.status(500).json({ success: false, error: 'Failed to save webhook' });
    }
});

// ============================================
// AUTHENTICATION ENDPOINTS (SERVER-SIDE)
// ============================================

const USERS_DB_FILE = path.join(USERS_DIR, 'users_db.json');

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
        const filePath = getUserInterestsPath(userId);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'User interests not found' });
        }

        const data = await fsPromises.readFile(filePath, 'utf8');
        const interests = JSON.parse(data);
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
            const filePath = getUserInterestsPath(userId);
            const data = await fsPromises.readFile(filePath, 'utf8');
            const interests = JSON.parse(data);
            const interest = interests.find(i => i.id == interestId);
            
            if (interest) {
                interest.status = 'stopped';
                await fsPromises.writeFile(filePath, JSON.stringify(interests, null, 2), 'utf8');
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

        // Notifica UserProfileAgent del cambiamento
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'sport',
                data: dataToSave,
                source: 'sport_profile_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }

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
        const skippedCount = programData.skippedWorkouts?.length || 0;
        const estimatedCalories = (programData.completedWorkouts || []).reduce((sum, w) => sum + (w.caloriesBurned || 400), 0);

        return res.json({ 
            success: true, 
            stats: {
                totalWorkouts: completedCount,
                skippedWorkouts: skippedCount,
                currentStreak: calculateStreak(programData.completedWorkouts || []),
                estimatedCalories,
                programTitle: programData.programData?.title
            }
        });
    } catch (error) {
        console.error('❌ Error getting stats:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/sport/stats - Update sport statistics (workout completed or skipped)
app.post('/api/sport/stats', async (req, res) => {
    try {
        const { userId, workoutCompleted, workoutSkipped, caloriesBurned, date, dayIndex } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        const programPath = path.join(SPORT_DATA_DIR, `${userId}_program.json`);
        
        // Se non esiste il file programma, crealo
        let programData = {};
        if (fs.existsSync(programPath)) {
            programData = JSON.parse(fs.readFileSync(programPath, 'utf8'));
        }

        // Inizializza array se non esistono
        if (!programData.completedWorkouts) {
            programData.completedWorkouts = [];
        }
        if (!programData.skippedWorkouts) {
            programData.skippedWorkouts = [];
        }

        const workoutDate = date || new Date().toISOString();

        if (workoutCompleted) {
            // Aggiungi workout completato
            programData.completedWorkouts.push({
                date: workoutDate,
                caloriesBurned: caloriesBurned || 400,
                completedAt: new Date().toISOString(),
                dayIndex: dayIndex
            });
            console.log(`✅ Workout completed for user: ${userId}`);
        } else if (workoutSkipped) {
            // Aggiungi workout saltato
            programData.skippedWorkouts.push({
                date: workoutDate,
                skippedAt: new Date().toISOString(),
                dayIndex: dayIndex
            });
            console.log(`⚠️ Workout skipped for user: ${userId}`);
        }

        // Salva i dati
        fs.writeFileSync(programPath, JSON.stringify(programData, null, 2), 'utf8');

        // Calcola stats aggiornate
        const stats = {
            totalWorkouts: programData.completedWorkouts.length,
            skippedWorkouts: programData.skippedWorkouts.length,
            currentStreak: calculateStreak(programData.completedWorkouts),
            estimatedCalories: programData.completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 400), 0)
        };

        return res.json({ 
            success: true, 
            stats
        });
    } catch (error) {
        console.error('❌ Error updating stats:', error);
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
            const userPath = path.join(USERS_DIR, `${userId}.json`);
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
            const interestsPath = path.join(INTERESTS_DIR, `${userId}.json`);
            if (fs.existsSync(interestsPath)) {
                const interestsData = JSON.parse(fs.readFileSync(interestsPath, 'utf8'));
                userData.data.interests = interestsData.interests || interestsData;
            }
        } catch (err) {
            console.log(`No interests for ${userId}`);
        }

        // 4. Webhooks
        try {
            // Try new format first (webhook_${userId}.json)
            let webhookPath = path.join(WEBHOOKS_DIR, `webhook_${userId}.json`);
            if (!fs.existsSync(webhookPath)) {
                // Try old format (${userId}.json)
                webhookPath = path.join(WEBHOOKS_DIR, `${userId}.json`);
            }
            if (fs.existsSync(webhookPath)) {
                const webhookData = JSON.parse(fs.readFileSync(webhookPath, 'utf8'));
                userData.data.webhook = webhookData.webhook || webhookData.url || webhookData;
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

        // 7. Diet Data (dieta, peso, calorie)
        userData.data.diet = {};
        try {
            // Cerca dati dieta salvati (potrebbero essere in localStorage lato client, 
            // ma se salvati sul server saranno qui)
            const dietDataPath = path.join(__dirname, 'data', 'diet', `${userId}.json`);
            if (fs.existsSync(dietDataPath)) {
                const dietData = JSON.parse(fs.readFileSync(dietDataPath, 'utf8'));
                userData.data.diet = {
                    selectedDiet: dietData.selectedDiet || null,
                    weightHistory: dietData.weightHistory || [],
                    calorieHistory: dietData.calorieHistory || [],
                    currentWeight: dietData.currentWeight || null,
                    currentCalories: dietData.currentCalories || null,
                    lastUpdated: dietData.lastUpdated || null
                };
            }
        } catch (err) {
            console.log(`No diet data for ${userId}`);
        }

        // 8. Monitor Data (se presente)
        try {
            const monitorPath = path.join(__dirname, 'data', 'monitors', `${userId}.json`);
            if (fs.existsSync(monitorPath)) {
                const monitorData = JSON.parse(fs.readFileSync(monitorPath, 'utf8'));
                userData.data.monitors = monitorData.monitors || [];
            }
        } catch (err) {
            console.log(`No monitor data for ${userId}`);
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

/**
 * POST /api/automations/sport
 * Save sport automation settings
 */
app.post('/api/automations/sport', async (req, res) => {
    try {
        const { userId, automations } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'Missing userId' });
        }

        const automationsDir = path.join(DATA_DIR, 'automations');
        if (!fs.existsSync(automationsDir)) {
            fs.mkdirSync(automationsDir, { recursive: true });
        }

        const automationsPath = path.join(automationsDir, `${userId}.json`);
        let existingData = {};
        
        if (fs.existsSync(automationsPath)) {
            existingData = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        }

        existingData.sport = {
            ...automations,
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(automationsPath, JSON.stringify(existingData, null, 2));
        console.log(`✅ Sport automations saved for user ${userId}`);
        
        // Notifica UserProfileAgent del cambiamento
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'automations',
                data: existingData,
                source: 'automations_sport_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }

        res.json({
            success: true,
            message: 'Sport automations saved',
            automations: existingData.sport
        });
    } catch (error) {
        console.error('Error saving sport automations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/automations/sport/:userId
 * Get sport automation settings
 */
app.get('/api/automations/sport/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const automationsPath = path.join(DATA_DIR, 'automations', `${userId}.json`);

        if (!fs.existsSync(automationsPath)) {
            return res.json({
                success: true,
                automations: {
                    enableNotifications: false,
                    notifyBefore: 30,
                    sendExercisesDiscord: false,
                    preferredTimeSlot: '18:00-20:00'
                }
            });
        }

        const data = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        res.json({
            success: true,
            automations: data.sport || {
                enableNotifications: false,
                notifyBefore: 30,
                sendExercisesDiscord: false,
                preferredTimeSlot: '18:00-20:00'
            }
        });
    } catch (error) {
        console.error('Error getting sport automations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/automations/habits
 * Save habit automation settings
 */
app.post('/api/automations/habits', async (req, res) => {
    try {
        const { userId, settings } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'Missing userId' });
        }

        const automationsDir = path.join(DATA_DIR, 'automations');
        if (!fs.existsSync(automationsDir)) {
            fs.mkdirSync(automationsDir, { recursive: true });
        }

        const automationsPath = path.join(automationsDir, `${userId}.json`);
        let existingData = {};
        
        if (fs.existsSync(automationsPath)) {
            existingData = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        }

        existingData.habits = {
            ...settings,
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(automationsPath, JSON.stringify(existingData, null, 2));
        console.log(`✅ Habit settings saved for user ${userId}`);

        res.json({
            success: true,
            message: 'Habit settings saved',
            settings: existingData.habits
        });
    } catch (error) {
        console.error('Error saving habit settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/automations/habits/:userId
 * Get habit automation settings
 */
app.get('/api/automations/habits/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const automationsPath = path.join(DATA_DIR, 'automations', `${userId}.json`);

        if (!fs.existsSync(automationsPath)) {
            return res.json({
                success: true,
                settings: {
                    autoTracking: true,
                    dailyReminder: 'evening',
                    streakNotifications: true,
                    weeklyGoal: 5
                }
            });
        }

        const data = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        res.json({
            success: true,
            settings: data.habits || {
                autoTracking: true,
                dailyReminder: 'evening',
                streakNotifications: true,
                weeklyGoal: 5
            }
        });
    } catch (error) {
        console.error('Error getting habit settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/automations/notifications
 * Save Discord notification settings
 */
app.post('/api/automations/notifications', async (req, res) => {
    try {
        const { userId, settings } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'Missing userId' });
        }

        const automationsDir = path.join(DATA_DIR, 'automations');
        if (!fs.existsSync(automationsDir)) {
            fs.mkdirSync(automationsDir, { recursive: true });
        }

        const automationsPath = path.join(automationsDir, `${userId}.json`);
        let existingData = {};
        
        if (fs.existsSync(automationsPath)) {
            existingData = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        }

        existingData.notifications = {
            ...settings,
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(automationsPath, JSON.stringify(existingData, null, 2));
        console.log(`✅ Notification settings saved for user ${userId}`);

        res.json({
            success: true,
            message: 'Notification settings saved',
            settings: existingData.notifications
        });
    } catch (error) {
        console.error('Error saving notification settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/automations/notifications/:userId
 * Get Discord notification settings
 */
app.get('/api/automations/notifications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const automationsPath = path.join(DATA_DIR, 'automations', `${userId}.json`);

        if (!fs.existsSync(automationsPath)) {
            return res.json({
                success: true,
                settings: {
                    notifyMonitorProducts: true,
                    notifyWorkouts: true,
                    notifyHabits: true,
                    notifyEbay: false,
                    frequency: 'realtime'
                }
            });
        }

        const data = JSON.parse(fs.readFileSync(automationsPath, 'utf8'));
        res.json({
            success: true,
            settings: data.notifications || {
                notifyMonitorProducts: true,
                notifyWorkouts: true,
                notifyHabits: true,
                notifyEbay: false,
                frequency: 'realtime'
            }
        });
    } catch (error) {
        console.error('Error getting notification settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

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

/**
 * POST /api/agents/broadcast
 * Broadcast message to all agents
 */
app.post('/api/agents/broadcast', async (req, res) => {
    try {
        const { eventType, data, excludeAgent } = req.body;
        
        if (!eventType) {
            return res.status(400).json({ 
                success: false, 
                error: 'eventType required' 
            });
        }

        const result = coordinator.broadcast(eventType, data || {}, excludeAgent || null);
        res.json({ 
            success: true, 
            result 
        });
    } catch (error) {
        console.error('Error broadcasting message:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/agents/subscribe
 * Subscribe agent to event type
 */
app.post('/api/agents/subscribe', async (req, res) => {
    try {
        const { agentName, eventType } = req.body;
        
        if (!agentName || !eventType) {
            return res.status(400).json({ 
                success: false, 
                error: 'agentName and eventType required' 
            });
        }

        coordinator.subscribe(agentName, eventType);
        res.json({ 
            success: true, 
            message: `Agent ${agentName} subscribed to ${eventType}` 
        });
    } catch (error) {
        console.error('Error subscribing agent:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/agents/communications
 * Get communication log
 */
app.get('/api/agents/communications', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const log = coordinator.getCommunicationLog(limit);
        res.json({ 
            success: true, 
            log,
            total: log.length
        });
    } catch (error) {
        console.error('Error getting communication log:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/agents/verify-data
 * Verify shared data across agents
 */
app.post('/api/agents/verify-data', async (req, res) => {
    try {
        const { dataType, data } = req.body;
        
        if (!dataType) {
            return res.status(400).json({ 
                success: false, 
                error: 'dataType required' 
            });
        }

        const results = await coordinator.verifySharedData(dataType, data || {});
        res.json({ 
            success: true, 
            results 
        });
    } catch (error) {
        console.error('Error verifying data:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/agents/heartbeat
 * Get heartbeat status
 */
app.get('/api/agents/heartbeat', async (req, res) => {
    try {
        const status = coordinator.getHeartbeatStatus();
        res.json({ 
            success: true, 
            status 
        });
    } catch (error) {
        console.error('Error getting heartbeat status:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/agents/communication-stats
 * Get communication statistics
 */
app.get('/api/agents/communication-stats', async (req, res) => {
    try {
        const stats = coordinator.getCommunicationStats();
        res.json({ 
            success: true, 
            stats 
        });
    } catch (error) {
        console.error('Error getting communication stats:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * ========== USER PROFILE AGENT API ENDPOINTS ==========
 * Sistema di memorizzazione e unione dati utente H24
 */

/**
 * GET /api/user-profile/:userId
 * Get unified user profile (profilo unificato)
 */
app.get('/api/user-profile/:userId', async (req, res) => {
    console.log(`📥 GET /api/user-profile/${req.params.userId}`);
    try {
        const { userId } = req.params;
        const { forceRefresh } = req.query;
        
        const result = await coordinator.assignTask({
            type: 'get_unified_profile',
            userId,
            forceRefresh: forceRefresh === 'true'
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error getting unified profile:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/user-profile/:userId/unify
 * Unify all user data into single profile
 */
app.post('/api/user-profile/:userId/unify', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await coordinator.assignTask({
            type: 'unify_user_data',
            userId
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error unifying user data:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/user-profile/:userId/verify
 * Verify user data consistency (verifica continua H24)
 */
app.post('/api/user-profile/:userId/verify', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await coordinator.assignTask({
            type: 'verify_user_data',
            userId
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error verifying user data:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * GET /api/user-profile/:userId/history
 * Get user data change history
 */
app.get('/api/user-profile/:userId/history', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit } = req.query;
        
        const result = await coordinator.assignTask({
            type: 'get_user_data_history',
            userId,
            limit: limit ? parseInt(limit) : 50
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error getting user data history:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * ========== DIET API ENDPOINTS ==========
 * Gestione dati dieta, frigo, preferenze alimentari (online-first)
 */

const DIET_DATA_DIR = path.join(__dirname, 'data', 'diet');
if (!fs.existsSync(DIET_DATA_DIR)) {
    fs.mkdirSync(DIET_DATA_DIR, { recursive: true });
}

console.log('✅ Diet API endpoints directory initialized:', DIET_DATA_DIR);

// Test endpoint per verificare che gli endpoint API siano registrati
app.get('/api/diet/test', (req, res) => {
    console.log('✅ Test endpoint /api/diet/test called');
    return res.json({ success: true, message: 'Diet API endpoints are working!' });
});

/**
 * GET /api/diet/data/:userId
 * Ottiene tutti i dati dieta per un utente
 */
app.get('/api/diet/data/:userId', async (req, res) => {
    console.log(`📥 GET /api/diet/data/${req.params.userId}`);
    try {
        const { userId } = req.params;
        const dietPath = path.join(DIET_DATA_DIR, `${userId}.json`);
        
        if (fs.existsSync(dietPath)) {
            const data = JSON.parse(fs.readFileSync(dietPath, 'utf8'));
            return res.json({ success: true, data });
        }
        
        return res.json({ 
            success: true, 
            data: {
                fridge: [],
                preferences: null,
                weight: [],
                calories: [],
                shoppingList: [],
                selectedDiet: null
            }
        });
    } catch (error) {
        console.error('Error loading diet data:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/diet/fridge/:userId
 * Salva/carica inventario frigo
 */
app.post('/api/diet/fridge/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { items } = req.body;
        
        const dietPath = path.join(DIET_DATA_DIR, `${userId}.json`);
        let dietData = {};
        
        if (fs.existsSync(dietPath)) {
            dietData = JSON.parse(fs.readFileSync(dietPath, 'utf8'));
        }
        
        dietData.fridge = items || [];
        dietData.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(dietPath, JSON.stringify(dietData, null, 2), 'utf8');
        
        // Notifica UserProfileAgent
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'diet',
                data: dietData,
                source: 'diet_fridge_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ success: true, count: dietData.fridge.length });
    } catch (error) {
        console.error('Error saving fridge:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/diet/preferences/:userId
 * Salva preferenze alimentari
 */
app.post('/api/diet/preferences/:userId', async (req, res) => {
    console.log(`📥 POST /api/diet/preferences/${req.params.userId}`);
    try {
        const { userId } = req.params;
        const preferences = req.body;
        
        const dietPath = path.join(DIET_DATA_DIR, `${userId}.json`);
        let dietData = {};
        
        if (fs.existsSync(dietPath)) {
            dietData = JSON.parse(fs.readFileSync(dietPath, 'utf8'));
        }
        
        dietData.preferences = preferences;
        dietData.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(dietPath, JSON.stringify(dietData, null, 2), 'utf8');
        
        // Notifica UserProfileAgent
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'diet',
                data: dietData,
                source: 'diet_preferences_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ success: true });
    } catch (error) {
        console.error('Error saving preferences:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/diet/weight/:userId
 * Salva entry peso
 */
app.post('/api/diet/weight/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { weight, date } = req.body;
        
        const dietPath = path.join(DIET_DATA_DIR, `${userId}.json`);
        let dietData = {};
        
        if (fs.existsSync(dietPath)) {
            dietData = JSON.parse(fs.readFileSync(dietPath, 'utf8'));
        }
        
        if (!dietData.weight) {
            dietData.weight = [];
        }
        
        dietData.weight.push({
            weight: parseFloat(weight),
            date: date || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        });
        
        // Mantieni solo ultimi 30 giorni
        dietData.weight = dietData.weight.slice(-30);
        dietData.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(dietPath, JSON.stringify(dietData, null, 2), 'utf8');
        
        // Notifica UserProfileAgent
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'diet',
                data: dietData,
                source: 'diet_weight_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ success: true });
    } catch (error) {
        console.error('Error saving weight:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/diet/calories/:userId
 * Salva entry calorie
 */
app.post('/api/diet/calories/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { consumed, burned, target, date } = req.body;
        
        const dietPath = path.join(DIET_DATA_DIR, `${userId}.json`);
        let dietData = {};
        
        if (fs.existsSync(dietPath)) {
            dietData = JSON.parse(fs.readFileSync(dietPath, 'utf8'));
        }
        
        if (!dietData.calories) {
            dietData.calories = [];
        }
        
        const dateStr = date || new Date().toISOString().split('T')[0];
        const existingIndex = dietData.calories.findIndex(c => c.date === dateStr);
        
        if (existingIndex >= 0) {
            dietData.calories[existingIndex] = {
                consumed: parseInt(consumed) || 0,
                burned: parseInt(burned) || 0,
                target: parseInt(target) || 2000,
                date: dateStr,
                updatedAt: new Date().toISOString()
            };
        } else {
            dietData.calories.push({
                consumed: parseInt(consumed) || 0,
                burned: parseInt(burned) || 0,
                target: parseInt(target) || 2000,
                date: dateStr,
                createdAt: new Date().toISOString()
            });
        }
        
        // Mantieni solo ultimi 30 giorni
        dietData.calories = dietData.calories.slice(-30);
        dietData.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(dietPath, JSON.stringify(dietData, null, 2), 'utf8');
        
        // Notifica UserProfileAgent
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'diet',
                data: dietData,
                source: 'diet_calories_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ success: true });
    } catch (error) {
        console.error('Error saving calories:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/diet/shopping-list/:userId
 * Salva lista spesa
 */
app.post('/api/diet/shopping-list/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { items } = req.body;
        
        const dietPath = path.join(DIET_DATA_DIR, `${userId}.json`);
        let dietData = {};
        
        if (fs.existsSync(dietPath)) {
            dietData = JSON.parse(fs.readFileSync(dietPath, 'utf8'));
        }
        
        dietData.shoppingList = items || [];
        dietData.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(dietPath, JSON.stringify(dietData, null, 2), 'utf8');
        
        // Notifica UserProfileAgent
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'diet',
                data: dietData,
                source: 'diet_shopping_list_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ success: true, count: dietData.shoppingList.length });
    } catch (error) {
        console.error('Error saving shopping list:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/diet/selected-diet/:userId
 * Salva dieta selezionata
 */
app.post('/api/diet/selected-diet/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { diet } = req.body;
        
        const dietPath = path.join(DIET_DATA_DIR, `${userId}.json`);
        let dietData = {};
        
        if (fs.existsSync(dietPath)) {
            dietData = JSON.parse(fs.readFileSync(dietPath, 'utf8'));
        }
        
        dietData.selectedDiet = diet;
        dietData.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(dietPath, JSON.stringify(dietData, null, 2), 'utf8');
        
        // Notifica UserProfileAgent
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'diet',
                data: dietData,
                source: 'diet_selected_diet_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ success: true });
    } catch (error) {
        console.error('Error saving selected diet:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ========== GAMING API ENDPOINTS ==========
 * Gestione profili gaming, livelli, esperienza, statistiche
 */

const GAMING_DATA_DIR = path.join(__dirname, 'data', 'gaming');
if (!fs.existsSync(GAMING_DATA_DIR)) {
    fs.mkdirSync(GAMING_DATA_DIR, { recursive: true });
}
console.log('✅ Gaming API endpoints directory initialized:', GAMING_DATA_DIR);

/**
 * GET /api/gaming/profile/:userId
 * Ottiene il profilo gaming di un utente
 */
app.get('/api/gaming/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profilePath = path.join(GAMING_DATA_DIR, `${userId}.json`);
        
        if (fs.existsSync(profilePath)) {
            const profileData = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
            return res.json({ success: true, data: profileData });
        } else {
            // Return default profile (level 1)
            const defaultProfile = {
                level: 1,
                experience: 0,
                experienceToNext: 100,
                totalGames: 0,
                wins: 0,
                losses: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            return res.json({ success: true, data: defaultProfile });
        }
    } catch (error) {
        console.error('Error loading gaming profile:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/gaming/profile/:userId
 * Crea o aggiorna il profilo gaming di un utente
 */
app.post('/api/gaming/profile/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profileData = req.body;
        
        // Ensure default values
        const profile = {
            level: profileData.level || 1,
            experience: profileData.experience || 0,
            experienceToNext: profileData.experienceToNext || 100,
            totalGames: profileData.totalGames || 0,
            wins: profileData.wins || 0,
            losses: profileData.losses || 0,
            createdAt: profileData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const profilePath = path.join(GAMING_DATA_DIR, `${userId}.json`);
        fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf8');
        
        // Notify UserProfileAgent
        if (coordinator) {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'gaming',
                data: profile,
                source: 'gaming_profile_endpoint'
            });
        }
        
        console.log('✅ Gaming profile saved for user:', userId);
        return res.json({ success: true, data: profile });
    } catch (error) {
        console.error('Error saving gaming profile:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/gaming/profile/:userId/add-experience
 * Aggiunge esperienza e gestisce level up
 */
app.post('/api/gaming/profile/:userId/add-experience', async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid experience amount' });
        }
        
        const profilePath = path.join(GAMING_DATA_DIR, `${userId}.json`);
        let profile = {
            level: 1,
            experience: 0,
            experienceToNext: 100,
            totalGames: 0,
            wins: 0,
            losses: 0,
            createdAt: new Date().toISOString()
        };
        
        if (fs.existsSync(profilePath)) {
            profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        }
        
        // Add experience
        profile.experience = (profile.experience || 0) + amount;
        
        // Check for level up
        let leveledUp = false;
        while (profile.experience >= profile.experienceToNext) {
            profile.experience -= profile.experienceToNext;
            profile.level = (profile.level || 1) + 1;
            profile.experienceToNext = Math.floor(profile.experienceToNext * 1.5); // Increase exp needed
            leveledUp = true;
        }
        
        profile.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf8');
        
        // Notify UserProfileAgent
        if (coordinator) {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'gaming',
                data: profile,
                source: 'gaming_experience_endpoint'
            });
        }
        
        return res.json({ 
            success: true, 
            data: profile,
            leveledUp,
            newLevel: leveledUp ? profile.level : null
        });
    } catch (error) {
        console.error('Error adding experience:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * ========== CALENDAR API ENDPOINTS ==========
 * Gestione eventi calendario unificati (Sport, Impegni, Dieta)
 */

const CALENDAR_DATA_DIR = path.join(__dirname, 'data', 'calendar');
if (!fs.existsSync(CALENDAR_DATA_DIR)) {
    fs.mkdirSync(CALENDAR_DATA_DIR, { recursive: true });
}
console.log('✅ Calendar API endpoints directory initialized:', CALENDAR_DATA_DIR);

/**
 * GET /api/calendar/events/:userId
 * Ottiene tutti gli eventi calendario per un utente
 * Raccoglie schede settimanali da Sport, Dieta, Impegni e le converte in eventi ricorrenti
 */
app.get('/api/calendar/events/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        
        // Determina range date (mese corrente se non specificato)
        const today = new Date();
        const start = startDate ? new Date(startDate) : new Date(today.getFullYear(), today.getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Normalizza date (solo giorno, senza ora)
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        let allEvents = [];
        
        // ========== SPORT: Leggi weekSchedule e converti in eventi ricorrenti ==========
        try {
            const programPath = path.join(SPORT_DATA_DIR, `${userId}_program.json`);
            if (fs.existsSync(programPath)) {
                const programData = JSON.parse(fs.readFileSync(programPath, 'utf8'));
                
                // weekSchedule contiene array di { dayIndex, workoutId, workoutTitle, workoutType, duration }
                const weekSchedule = programData.weekSchedule || [];
                
                weekSchedule.forEach(workout => {
                    if (workout.dayIndex !== undefined && workout.dayIndex !== null) {
                        // Converti dayIndex (0=Lun, 6=Dom) in date ricorrenti per il range
                        const dates = getRecurringDatesForDayIndex(workout.dayIndex, start, end);
                        
                        dates.forEach(date => {
                            allEvents.push({
                                id: `sport_${workout.workoutId || 'unknown'}_${workout.dayIndex}_${date}`,
                                date: date,
                                startTime: workout.startTime || '09:00',
                                endTime: workout.endTime || null,
                                title: workout.workoutTitle || 'Allenamento',
                                description: workout.workoutType || workout.description || '',
                                category: 'sport',
                                source: 'sport',
                                workoutId: workout.workoutId,
                                duration: workout.duration,
                                recurring: true,
                                dayIndex: workout.dayIndex
                            });
                        });
                    }
                });
            }
        } catch (err) {
            console.error('Error loading sport events:', err);
        }
        
        // ========== DIETA: Leggi weekPlan e converti in eventi ricorrenti ==========
        try {
            const dietPath = path.join(DIET_DATA_DIR, `${userId}.json`);
            if (fs.existsSync(dietPath)) {
                const dietData = JSON.parse(fs.readFileSync(dietPath, 'utf8'));
                
                // selectedDiet contiene weekPlan con giorni della settimana come chiavi
                if (dietData.selectedDiet && dietData.selectedDiet.weekPlan) {
                    const weekPlan = dietData.selectedDiet.weekPlan;
                    
                    // Mappa giorni italiani a dayIndex (0=Lun, 6=Dom)
                    const dayMap = {
                        'Lunedì': 0, 'Martedì': 1, 'Mercoledì': 2, 'Giovedì': 3,
                        'Venerdì': 4, 'Sabato': 5, 'Domenica': 6
                    };
                    
                    // Per ogni giorno della settimana nella dieta
                    Object.keys(weekPlan).forEach(dayName => {
                        const dayIndex = dayMap[dayName];
                        if (dayIndex !== undefined) {
                            const dayPlan = weekPlan[dayName];
                            
                            // Converti dayIndex in date ricorrenti per il range
                            const dates = getRecurringDatesForDayIndex(dayIndex, start, end);
                            
                            // Crea eventi per ogni pasto del giorno
                            const meals = [
                                { name: 'Colazione', time: '08:00', meal: dayPlan.breakfast },
                                { name: 'Spuntino 1', time: '11:00', meal: dayPlan.snack1 },
                                { name: 'Pranzo', time: '13:00', meal: dayPlan.lunch },
                                { name: 'Spuntino 2', time: '17:00', meal: dayPlan.snack2 },
                                { name: 'Cena', time: '20:00', meal: dayPlan.dinner }
                            ];
                            
                            dates.forEach(date => {
                                meals.forEach(mealData => {
                                    if (mealData.meal && mealData.meal.trim()) {
                                        allEvents.push({
                                            id: `diet_${dayName}_${mealData.name}_${date}`,
                                            date: date,
                                            startTime: mealData.time,
                                            endTime: null,
                                            title: `${mealData.name}: ${mealData.meal.substring(0, 50)}${mealData.meal.length > 50 ? '...' : ''}`,
                                            description: mealData.meal,
                                            category: 'dieta',
                                            source: 'diet',
                                            recurring: true,
                                            dayName: dayName,
                                            calories: dayPlan.calories
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Error loading diet events:', err);
        }
        
        // ========== IMPEGNI: Leggi eventi personalizzati (non ricorrenti) ==========
        try {
            const calendarPath = path.join(CALENDAR_DATA_DIR, `${userId}.json`);
            if (fs.existsSync(calendarPath)) {
                const calendarData = JSON.parse(fs.readFileSync(calendarPath, 'utf8'));
                const customEvents = (calendarData.events || [])
                    .filter(event => {
                        // Filtra eventi nel range
                        const eventDate = new Date(event.date);
                        return eventDate >= start && eventDate <= end;
                    })
                    .map(event => ({
                        ...event,
                        category: event.category || 'impegni',
                        source: 'custom',
                        recurring: false
                    }));
                
                allEvents = allEvents.concat(customEvents);
            }
        } catch (err) {
            console.error('Error loading custom events:', err);
        }
        
        // Ordina per data e ora
        allEvents.sort((a, b) => {
            const dateCompare = new Date(a.date) - new Date(b.date);
            if (dateCompare !== 0) return dateCompare;
            return (a.startTime || '00:00').localeCompare(b.startTime || '00:00');
        });
        
        return res.json({ 
            success: true, 
            events: allEvents,
            count: allEvents.length
        });
    } catch (error) {
        console.error('Error loading calendar events:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/calendar/events/:userId
 * Crea o aggiorna un evento calendario
 */
app.post('/api/calendar/events/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { id, title, date, startTime, endTime, category, description, allDay } = req.body;
        
        if (!title || !date) {
            return res.status(400).json({ 
                success: false, 
                error: 'Title and date are required' 
            });
        }
        
        const calendarPath = path.join(CALENDAR_DATA_DIR, `${userId}.json`);
        let calendarData = { events: [] };
        
        if (fs.existsSync(calendarPath)) {
            calendarData = JSON.parse(fs.readFileSync(calendarPath, 'utf8'));
        }
        
        const eventData = {
            id: id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title,
            date,
            startTime: allDay ? null : (startTime || '09:00'),
            endTime: allDay ? null : endTime,
            category: category || 'impegni',
            description: description || '',
            allDay: allDay || false,
            createdAt: id ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (id) {
            // Aggiorna evento esistente
            const index = calendarData.events.findIndex(e => e.id === id);
            if (index >= 0) {
                calendarData.events[index] = { ...calendarData.events[index], ...eventData };
            } else {
                calendarData.events.push(eventData);
            }
        } else {
            // Crea nuovo evento
            calendarData.events.push(eventData);
        }
        
        calendarData.updatedAt = new Date().toISOString();
        
        fs.writeFileSync(calendarPath, JSON.stringify(calendarData, null, 2), 'utf8');
        
        // Notifica UserProfileAgent
        try {
            await coordinator.assignTask({
                type: 'monitor_data_changes',
                userId,
                dataType: 'calendar',
                data: eventData,
                source: 'calendar_events_endpoint'
            });
        } catch (err) {
            console.error('Error notifying UserProfileAgent:', err);
        }
        
        return res.json({ 
            success: true, 
            event: eventData 
        });
    } catch (error) {
        console.error('Error saving calendar event:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/calendar/events/:userId/:eventId
 * Elimina un evento calendario
 */
app.delete('/api/calendar/events/:userId/:eventId', async (req, res) => {
    try {
        const { userId, eventId } = req.params;
        
        const calendarPath = path.join(CALENDAR_DATA_DIR, `${userId}.json`);
        if (!fs.existsSync(calendarPath)) {
            return res.status(404).json({ success: false, error: 'Calendar not found' });
        }
        
        const calendarData = JSON.parse(fs.readFileSync(calendarPath, 'utf8'));
        const initialLength = calendarData.events.length;
        calendarData.events = calendarData.events.filter(e => e.id !== eventId);
        
        if (calendarData.events.length === initialLength) {
            return res.status(404).json({ success: false, error: 'Event not found' });
        }
        
        calendarData.updatedAt = new Date().toISOString();
        fs.writeFileSync(calendarPath, JSON.stringify(calendarData, null, 2), 'utf8');
        
        return res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Helper: Converte dayIndex (0=Lun, 6=Dom) in date ricorrenti per un range di date
 * @param {number} dayIndex - 0=Lunedì, 6=Domenica
 * @param {Date} startDate - Data inizio range
 * @param {Date} endDate - Data fine range
 * @returns {string[]} Array di date ISO (YYYY-MM-DD)
 */
function getRecurringDatesForDayIndex(dayIndex, startDate, endDate) {
    const dates = [];
    const current = new Date(startDate);
    
    // Trova il primo giorno della settimana corrispondente nel range
    // dayIndex: 0=Lun, 1=Mar, ..., 6=Dom
    // current.getDay(): 0=Dom, 1=Lun, ..., 6=Sab
    
    // Converti getDay() a formato dayIndex (0=Lun, 6=Dom)
    const currentDayIndex = (current.getDay() + 6) % 7;
    
    // Calcola giorni da aggiungere per arrivare al primo giorno corrispondente
    let daysToAdd = dayIndex - currentDayIndex;
    if (daysToAdd < 0) {
        daysToAdd += 7; // Prossima settimana
    }
    
    current.setDate(current.getDate() + daysToAdd);
    
    // Aggiungi tutte le occorrenze settimanali nel range
    while (current <= endDate) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 7); // Prossima settimana
    }
    
    return dates;
}

/**
 * ========== AI AGENT API ENDPOINTS ==========
 * Estrazione dati da foto e testi
 */

/**
 * POST /api/ai/extract-text-from-image
 * Estrae testo da immagine (OCR)
 */
app.post('/api/ai/extract-text-from-image', async (req, res) => {
    try {
        const result = await coordinator.assignTask({
            type: 'extract_text_from_image',
            ...req.body
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error extracting text from image:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/ai/analyze-image
 * Analizza immagine e estrae informazioni
 */
app.post('/api/ai/analyze-image', async (req, res) => {
    try {
        const result = await coordinator.assignTask({
            type: 'analyze_image',
            ...req.body
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/ai/extract-data-from-text
 * Estrae dati strutturati da testo
 */
app.post('/api/ai/extract-data-from-text', async (req, res) => {
    try {
        const result = await coordinator.assignTask({
            type: 'extract_data_from_text',
            ...req.body
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error extracting data from text:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/ai/extract-structured-data
 * Estrae dati strutturati (generico - da immagine o testo)
 */
app.post('/api/ai/extract-structured-data', async (req, res) => {
    try {
        const result = await coordinator.assignTask({
            type: 'extract_structured_data',
            ...req.body
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error extracting structured data:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/ai/extract-entities
 * Estrae entità da testo
 */
app.post('/api/ai/extract-entities', async (req, res) => {
    try {
        const result = await coordinator.assignTask({
            type: 'extract_entities',
            ...req.body
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error extracting entities:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/ai/analyze-sentiment
 * Analizza sentiment di un testo
 */
app.post('/api/ai/analyze-sentiment', async (req, res) => {
    try {
        const result = await coordinator.assignTask({
            type: 'analyze_sentiment',
            ...req.body
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/ai/classify-text
 * Classifica testo in categorie
 */
app.post('/api/ai/classify-text', async (req, res) => {
    try {
        const result = await coordinator.assignTask({
            type: 'classify_text',
            ...req.body
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error classifying text:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/figma/apply-to-dieta
 * Applica design Figma alla pagina dieta mantenendo tutte le funzioni
 */
app.post('/api/figma/apply-to-dieta', async (req, res) => {
    try {
        const { fileKey = 'qEikXdYIE1SPArKu66qw0m', nodeId = '0-1' } = req.body;
        
        console.log(`🎨 Applicando design Figma alla pagina dieta...`);
        console.log(`📋 File Key: ${fileKey}`);
        console.log(`📍 Node ID: ${nodeId}`);

        // Step 1: Recupera file Figma
        const fileResult = await coordinator.assignTask({
            type: 'fetch_figma_file',
            fileKey,
            nodeIds: nodeId ? [nodeId] : null,
            isMakeFile: true
        });

        if (!fileResult.success) {
            throw new Error('Failed to fetch Figma file: ' + fileResult.error);
        }

        // Step 2: Analizza componenti
        const analysisResult = await coordinator.assignTask({
            type: 'analyze_figma_components',
            fileKey,
            nodeId
        });

        // Step 3: Genera codice
        const codeResult = await coordinator.assignTask({
            type: 'generate_frontend_code',
            fileKey,
            nodeId,
            pageName: 'dieta'
        });

        // Step 4: Leggi pagina esistente
        const dietaPath = path.join(__dirname, 'src', 'pages', 'dieta.html');
        const existingContent = fs.readFileSync(dietaPath, 'utf8');

        // Estrai funzioni JavaScript
        const jsMatches = existingContent.match(/<script>([\s\S]*?)<\/script>/g);
        const existingJS = jsMatches ? jsMatches.map(m => m.replace(/<\/?script>/g, '')).join('\n\n') : '';

        // Estrai sidebar
        const sidebarMatch = existingContent.match(/(<aside class="venus-sidebar"[\s\S]*?<\/aside>)/);
        const sidebar = sidebarMatch ? sidebarMatch[1] : '';

        // Estrai stili esistenti (funzionalità specifiche)
        const existingStyles = extractDietaStyles(existingContent);

        // Step 5: Costruisci nuova pagina
        const figmaHTML = codeResult.code.html;
        const figmaCSS = codeResult.code.css;
        
        const bodyMatch = figmaHTML.match(/<body>([\s\S]*?)<\/body>/);
        let figmaBodyContent = bodyMatch ? bodyMatch[1] : '';
        figmaBodyContent = figmaBodyContent
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '');

        const newPage = buildDietaPage(figmaBodyContent, figmaCSS, existingJS, sidebar, existingStyles, fileKey, nodeId);

        // Step 6: Salva
        fs.writeFileSync(dietaPath, newPage, 'utf8');

        res.json({
            success: true,
            message: 'Design Figma applicato alla pagina dieta',
            components: codeResult.components,
            fileKey,
            nodeId
        });

    } catch (error) {
        console.error('Error applying Figma to dieta:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * Estrae stili funzionalità specifiche dalla pagina dieta
 */
function extractDietaStyles(content) {
    const styleMatches = content.match(/<style>([\s\S]*?)<\/style>/g);
    if (!styleMatches) return '';
    
    let styles = '';
    styleMatches.forEach(match => {
        const styleContent = match.replace(/<\/?style>/g, '');
        // Mantieni solo stili per funzionalità (calendario, ricette, tracker)
        if (styleContent.includes('calendar') || 
            styleContent.includes('recipe') || 
            styleContent.includes('tracker') ||
            styleContent.includes('meal') ||
            styleContent.includes('dinner')) {
            styles += styleContent + '\n';
        }
    });
    
    return styles;
}

/**
 * Costruisce pagina dieta combinando design Figma + funzioni esistenti
 */
function buildDietaPage(figmaBody, figmaCSS, existingJS, sidebar, existingStyles, fileKey, nodeId) {
    return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cookin'Shappa - Dieta & Salute</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/venus.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg">
    <!-- 
        Figma Design Reference:
        File: Health-Diet-Dashboard--Copy-
        File Key: ${fileKey}
        URL: https://www.figma.com/make/${fileKey}/Health-Diet-Dashboard--Copy-?node-id=${nodeId}
        Design applicato da FigmaAgent - ${new Date().toISOString()}
    -->
    <style>
        /* Reset e Base */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--venus-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
            background: linear-gradient(to bottom right, #f0fdf4, #eff6ff, #faf5ff);
            min-height: 100vh;
            color: var(--venus-text-primary, #1f2937);
            line-height: 1.5;
        }

        .venus-dashboard-layout {
            display: flex;
            height: 100vh;
        }

        .venus-main-content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
        }

        /* Figma Generated Styles */
        ${figmaCSS}

        /* Existing Functionality Styles */
        ${existingStyles}
    </style>
</head>
<body>
    <div class="venus-dashboard-layout">
        ${sidebar}
        
        <main class="venus-main-content">
            ${figmaBody}
        </main>
    </div>

    <script src="../utils/auth-v2.js"></script>
    <script>
        ${existingJS}
        
        // Inizializza funzioni dopo caricamento
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎨 Pagina dieta caricata con design Figma');
            
            if (typeof setupCalendar === 'function') {
                setupCalendar();
                renderCalendar();
            }
            
            if (typeof loadDinnerRecipes === 'function') {
                setTimeout(() => loadDinnerRecipes(), 1000);
            }
        });
    </script>
</body>
</html>`;
}

/**
 * POST /api/figma/fetch-make-file
 * Fetch Figma file da /make/ (community files)
 */
app.post('/api/figma/fetch-make-file', async (req, res) => {
    try {
        const { fileKey, nodeIds } = req.body;
        
        if (!fileKey) {
            return res.status(400).json({ 
                success: false, 
                error: 'fileKey required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'fetch_figma_file',
            fileKey,
            nodeIds,
            isMakeFile: true // Indica che è un file /make/
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching Figma make file:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * ========== BOT AGENT API ENDPOINTS ==========
 * Gestione comandi e interazioni bot Discord
 */

/**
 * POST /api/bot/command
 * Gestisce comando bot Discord
 */
app.post('/api/bot/command', async (req, res) => {
    try {
        const { command, userId, discordUserId, options } = req.body;
        
        if (!command) {
            return res.status(400).json({ 
                success: false, 
                error: 'command required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'handle_discord_command',
            command,
            userId,
            discordUserId,
            options
        });

        res.json(result);
    } catch (error) {
        console.error('Error handling bot command:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/bot/interaction
 * Gestisce interazione Discord (button, select, modal)
 */
app.post('/api/bot/interaction', async (req, res) => {
    try {
        const { interactionType, customId, userId, discordUserId, values, data } = req.body;
        
        if (!interactionType || !customId) {
            return res.status(400).json({ 
                success: false, 
                error: 'interactionType and customId required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'handle_discord_interaction',
            interactionType,
            customId,
            userId,
            discordUserId,
            values,
            data
        });

        res.json(result);
    } catch (error) {
        console.error('Error handling bot interaction:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/bot/workout-confirm
 * Conferma workout da Discord
 */
app.post('/api/bot/workout-confirm', async (req, res) => {
    try {
        const { userId, workoutId, workoutDate, confirmed } = req.body;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'userId required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'handle_workout_confirmation',
            userId,
            workoutId,
            workoutDate,
            confirmed: confirmed !== false
        });

        res.json(result);
    } catch (error) {
        console.error('Error confirming workout:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/bot/product-alert-response
 * Gestisce risposta a alert prodotto
 */
app.post('/api/bot/product-alert-response', async (req, res) => {
    try {
        const { userId, productId, action, interestId, productUrl } = req.body;
        
        if (!userId || !action) {
            return res.status(400).json({ 
                success: false, 
                error: 'userId and action required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'handle_product_alert_response',
            userId,
            productId,
            action,
            interestId,
            productUrl
        });

        res.json(result);
    } catch (error) {
        console.error('Error handling product alert response:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/bot/send-response
 * Invia risposta bot a Discord
 */
app.post('/api/bot/send-response', async (req, res) => {
    try {
        const { userId, webhookUrl, message, embeds, components } = req.body;
        
        if (!webhookUrl && !userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'webhookUrl or userId required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'send_bot_response',
            userId,
            webhookUrl,
            message,
            embeds,
            components
        });

        res.json(result);
    } catch (error) {
        console.error('Error sending bot response:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/bot/process-message
 * Processa messaggio bot (text command)
 */
app.post('/api/bot/process-message', async (req, res) => {
    try {
        const { message, userId, discordUserId } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                error: 'message required' 
            });
        }

        const result = await coordinator.assignTask({
            type: 'process_bot_message',
            message,
            userId,
            discordUserId
        });

        res.json(result);
    } catch (error) {
        console.error('Error processing bot message:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

/**
 * POST /api/figma/generate-code
 * Genera codice da design Figma
 */
app.post('/api/figma/generate-code', async (req, res) => {
    try {
        const { fileKey, nodeId, framework = 'html', outputPath, useTailwind = true } = req.body;
        
        if (!fileKey) {
            return res.status(400).json({ 
                success: false, 
                error: 'fileKey required' 
            });
        }

        // Prima recupera il file Figma
        const fileResult = await coordinator.assignTask({
            type: 'fetch_figma_file',
            fileKey,
            nodeIds: nodeId ? [nodeId] : null
        });

        // Poi genera codice
        const FigmaToCodeGenerator = require('./lib/figma/figmaToCode');
        const generator = new FigmaToCodeGenerator();
        
        const result = await generator.generateFromFigmaJSON(fileResult.fileData, {
            outputPath,
            framework,
            useTailwind,
            extractAssets: true
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error generating code from Figma:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

function startHttp() {
    console.log('� Starting HTTP server as fallback...');
// ========== STATIC FILES MIDDLEWARE ==========
// IMPORTANTE: Questo DEVE essere DOPO tutti gli endpoint API ma PRIMA che il server inizi ad ascoltare
// Su Vercel, questo viene eseguito immediatamente quando il modulo viene caricato
if (!app._staticFilesConfigured) {
    app.use(express.static(__dirname));
    app.use('/assets', express.static(path.join(__dirname, 'assets')));
    app._staticFilesConfigured = true;
    console.log('✅ Static files middleware configured (after API routes)');
}

function startHttp() {
    console.log('🚀 Starting HTTP server as fallback...');
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

// Export app for Vercel
module.exports = app;