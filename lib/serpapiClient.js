const axios = require('axios');

const apiKey = process.env.SERPAPI_KEY || '1cc66154153eca009a37b01a5a8ee276dabe484f2196c4739a3e6ce82d85d3e2';
const baseURL = 'https://serpapi.com';

const client = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Shappa/1.0'
  }
});

client.interceptors.response.use(
  (resp) => resp,
  (err) => {
    console.error('SerpApi error:', err.response ? err.response.data : err.message);
    return Promise.reject(err);
  }
);

// Request logging for debugging (masks API key)
client.interceptors.request.use((cfg) => {
  try {
    const params = { ...cfg.params };
    if (params.api_key) params.api_key = '****';
    console.log('SerpApi request ->', cfg.method.toUpperCase(), cfg.baseURL + (cfg.url || ''), 'params=', JSON.stringify(params));
  } catch (e) { /* ignore logging errors */ }
  return cfg;
});

module.exports = client;