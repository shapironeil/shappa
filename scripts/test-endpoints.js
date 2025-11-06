// Script di test rapido per chiamare gli endpoint locali HTTPS (ignora validazione certificato)
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

(async function() {
  try {
  const base = 'https://www.localhost:3000';
    console.log('GET', base + '/health');
    const h = await axios.get(base + '/health', { timeout: 5000 });
    console.log('health:', JSON.stringify(h.data));

    console.log('GET', base + '/api/ebay/auth-url');
    const a = await axios.get(base + '/api/ebay/auth-url', { timeout: 5000 });
    console.log('ebay auth-url response:', JSON.stringify(a.data));

    console.log('GET', base + '/api/amazon/search?q=echo');
    const s = await axios.get(base + '/api/amazon/search', { params: { q: 'echo' }, timeout: 10000 });
    console.log('amazon search:', Array.isArray(s.data.products) ? `products:${s.data.products.length}` : JSON.stringify(s.data).slice(0,200));
  } catch (err) {
    console.error('ERROR', err.message);
    if (err.response) {
      console.error('status', err.response.status);
      try { console.error('data', JSON.stringify(err.response.data)); } catch(e){}
    }
  }
})();
