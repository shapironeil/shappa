const axios = require('axios');
// Prefer the realtime endpoint used in the docs / screenshots
const baseURL = process.env.OPENWEBNINJA_BASEURL || 'https://api.openwebninja.com/realtime-amazon-data';
const apiKey = process.env.OPENWEBNINJA_KEY || process.env.OPENWEBNINJA_API_KEY || null;

const defaultHeaders = { 'Accept': 'application/json' };
if (apiKey) defaultHeaders['X-API-Key'] = apiKey;

const client = axios.create({
  baseURL,
  timeout: 20000,
  headers: defaultHeaders
});

client.interceptors.response.use(
  (resp) => resp,
  (err) => {
    console.error('OpenWebNinja API error:', err.response ? err.response.data : err.message);
    return Promise.reject(err);
  }
);

// Request logging for debugging (masks API key)
client.interceptors.request.use((cfg) => {
  try {
    const headers = { ...cfg.headers };
    if (headers['X-API-Key']) headers['X-API-Key'] = '****';
    if (headers['x-api-key']) headers['x-api-key'] = '****';
    console.log('OpenWebNinja request ->', cfg.method.toUpperCase(), cfg.baseURL + (cfg.url || ''), 'params=', JSON.stringify(cfg.params || {}), 'headers=', headers);
  } catch (e) { /* ignore logging errors */ }
  return cfg;
});

module.exports = client;
