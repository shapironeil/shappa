/**
 * Amazon Search Service usando SerpApi
 * Sostituisce OpenWebNinja con SerpApi per migliorare la qualità dei dati
 */

const client = require('../serpapiClient');

const SEARCH_CACHE = new Map();
const PRODUCT_CACHE = new Map();
const CACHE_TTL = (Number(process.env.AMAZON_CACHE_TTL) || 90) * 1000; // default 90s

const API_KEY = process.env.SERPAPI_KEY || '1cc66154153eca009a37b01a5a8ee276dabe484f2196c4739a3e6ce82d85d3e2';

function cacheGet(map, key) {
  const entry = map.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { map.delete(key); return null; }
  return entry.data;
}

function cacheSet(map, key, data) {
  map.set(key, { ts: Date.now(), data });
}

function normalizePrice(priceRaw) {
  if (priceRaw == null) return { price_display: 'N/A', price_value: null, currency: null };
  let s = String(priceRaw).replace(/\u00A0/g, ' ').trim(); // NBSP -> space
  
  // Extract currency symbols (€, £, $) if present
  const currencyMatch = s.match(/(€|EUR|GBP|£|\$|USD)/i);
  let currency = currencyMatch ? currencyMatch[0] : null;
  
  // Remove non-digit, non-sep characters except , and . and -
  let num = s.replace(/[^0-9,\.\-]/g, '').trim();
  if (!num) return { price_display: s, price_value: null, currency };
  
  // Detect european format like 1.234,56 -> remove dots then replace comma with dot
  if (num.indexOf(',') > -1 && num.indexOf('.') > -1 && num.indexOf('.') < num.indexOf(',')) {
    num = num.replace(/\./g, '').replace(/,/g, '.');
  } else if (num.indexOf(',') > -1 && num.indexOf('.') === -1) {
    num = num.replace(/,/g, '.');
  }
  
  const parsed = parseFloat(num);
  const price_value = Number.isFinite(parsed) ? parsed : null;
  return { price_display: s, price_value, currency };
}

/**
 * Mappa un prodotto SerpApi al formato interno
 */
function mapSerpApiProduct(serpItem) {
  const id = serpItem.asin || serpItem.position || `product_${Date.now()}_${Math.random()}`;
  const title = serpItem.title || 'Prodotto';
  
  // SerpApi price handling
  const rawPrice = serpItem.price || null;
  const priceData = normalizePrice(rawPrice);
  
  // Rating
  const rating = serpItem.rating || null;
  const reviews = serpItem.reviews || 0;
  
  // Images
  const thumbnail = serpItem.thumbnail || '';
  const images = thumbnail ? [thumbnail] : [];
  
  // Link
  const url = serpItem.link_clean || serpItem.link || '';
  
  // Brand - cerca di estrarre il brand dal titolo o dai tags
  let brand = '';
  if (serpItem.title) {
    const brandMatch = serpItem.title.match(/^([A-Z][a-zA-Z]+)/);
    if (brandMatch) brand = brandMatch[1];
  }
  
  // Details - costruisce una descrizione dai campi disponibili
  let details = '';
  if (serpItem.tags && Array.isArray(serpItem.tags)) {
    details = serpItem.tags.join(', ');
  }
  if (serpItem.offers && Array.isArray(serpItem.offers)) {
    details += (details ? ' | ' : '') + serpItem.offers[0];
  }
  if (serpItem.prime) {
    details += (details ? ' | ' : '') + 'Prime';
  }
  
  return {
    id,
    title,
    price_display: priceData.price_display,
    price_value: priceData.price_value,
    currency: priceData.currency,
    brand,
    rating,
    reviews,
    image: thumbnail,
    images: images.filter(Boolean).map(String),
    url,
    details,
    source: 'serpapi',
    raw: serpItem
  };
}

/**
 * Mappa il paese dal codice al dominio Amazon
 */
function getAmazonDomain(country) {
  const domains = {
    'IT': 'amazon.it',
    'US': 'amazon.com',
    'DE': 'amazon.de',
    'FR': 'amazon.fr',
    'ES': 'amazon.es',
    'UK': 'amazon.co.uk',
    'JP': 'amazon.co.jp',
    'CA': 'amazon.ca'
  };
  return domains[country] || 'amazon.com';
}

/**
 * Cerca prodotti su Amazon tramite SerpApi
 */
async function searchProducts(query, country = 'IT', page = 1, limit = 24, opts = {}) {
  const { category, min_price, max_price, sort } = opts || {};
  const key = `serpapi|${query}|${country}|${page}|${limit}|${category||''}|${min_price||''}|${max_price||''}|${sort||''}`;
  
  const cached = cacheGet(SEARCH_CACHE, key);
  if (cached) return cached;

  try {
    const params = {
      engine: 'amazon',
      k: query,
      amazon_domain: getAmazonDomain(country),
      api_key: API_KEY,
      device: 'desktop',
      language: country === 'IT' ? 'it_IT' : (country === 'US' ? 'en_US' : 'en_US')
    };

    // Aggiungi filtri se specificati
    if (category) params.i = category;
    if (min_price) params.min_price = min_price;
    if (max_price) params.max_price = max_price;
    if (page > 1) params.page = page;

    console.log('SerpApi search params:', params);

    const response = await client.get('/search.json', { params });
    const data = response.data;

    if (!data.organic_results || !Array.isArray(data.organic_results)) {
      console.warn('SerpApi: No organic_results found in response');
      return [];
    }

    // Mappa i risultati
    const products = data.organic_results.slice(0, limit).map(mapSerpApiProduct);
    
    console.log(`SerpApi: Found ${products.length} products for query "${query}"`);
    
    cacheSet(SEARCH_CACHE, key, products);
    return products;

  } catch (error) {
    console.error('SerpApi search error:', error.message);
    return [];
  }
}

/**
 * Ottieni dettagli prodotto per ASIN
 */
async function getProductByAsin(asin, country = 'IT') {
  const key = `serpapi_product|${asin}|${country}`;
  const cached = cacheGet(PRODUCT_CACHE, key);
  if (cached) return cached;

  try {
    // Per ora cerca il prodotto nella cache di ricerca
    // SerpApi non ha un endpoint diretto per singolo prodotto, ma potremmo fare una ricerca per ASIN
    const searchResults = await searchProducts(asin, country, 1, 5);
    const product = searchResults.find(p => p.id === asin || p.raw?.asin === asin);
    
    if (product) {
      cacheSet(PRODUCT_CACHE, key, product);
      return product;
    }

    return null;
  } catch (error) {
    console.error(`SerpApi product details error for ${asin}:`, error.message);
    return null;
  }
}

/**
 * Ottieni informazioni sui prezzi (placeholder)
 */
async function getPricing(asin, country = 'IT') {
  const product = await getProductByAsin(asin, country);
  if (product) {
    return {
      price_display: product.price_display,
      price_value: product.price_value,
      currency: product.currency
    };
  }
  return {};
}

function clearCache() { 
  SEARCH_CACHE.clear(); 
  PRODUCT_CACHE.clear(); 
}

module.exports = { searchProducts, getProductByAsin, getPricing, clearCache };