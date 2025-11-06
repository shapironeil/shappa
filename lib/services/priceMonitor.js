const cron = require('node-cron');
const axios = require('axios');

// Simple in-memory monitor registry: { asin: { country, lastPrice, subscribers: [target], schedule } }
const registry = new Map();

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function monitorJob() {
  // Coda asin/country, jitter random per comportamento umano
  for (const [asin, info] of registry.entries()) {
    try {
      // Jitter random tra 2 e 10 secondi
      await sleep(2000 + Math.random() * 8000);
      // TODO: implementare scraping diretto con Playwright
      // const product = await scrapeAmazonProduct({ asin, country: info.country });
      // const price = normalizePrice(product.price);
      const price = null; // stub

      if (price != null && info.lastPrice != null && price !== info.lastPrice) {
        // Price changed -> notify subscribers
        info.subscribers.forEach(sub => {
          if (typeof sub === 'function') sub({ asin, oldPrice: info.lastPrice, newPrice: price, product: null });
        });
        // TODO: invia notifica (email/webhook) qui
      }
      info.lastPrice = price != null ? price : info.lastPrice;
    } catch (err) {
      // best-effort; continue
    }
  }
}

function startPriceMonitor() {
  // Run every 30 minutes con jitter
  cron.schedule('*/30 * * * *', async () => {
    await monitorJob();
  });
}

function domainFor(country = 'IT') {
  const map = { IT: 'amazon.it', US: 'amazon.com', DE: 'amazon.de', FR: 'amazon.fr', ES: 'amazon.es' };
  return map[country] || 'amazon.it';
}

function normalizePrice(p) {
  if (!p) return null;
  if (typeof p === 'number') return p;
  const n = parseFloat(String(p).replace(/[^\d,.]/g, '').replace(',', '.'));
  return isNaN(n) ? null : n;
}

function addMonitor({ asin, country = 'IT', onChange }) {
  if (!asin) throw new Error('asin required');
  const item = registry.get(asin) || { country, lastPrice: null, subscribers: [] };
  if (onChange) item.subscribers.push(onChange);
  registry.set(asin, item);
  return { asin, country };
}

function removeMonitor(asin) {
  registry.delete(asin);
}

function listMonitors() {
  return Array.from(registry.entries()).map(([asin, info]) => ({ asin, country: info.country, lastPrice: info.lastPrice, subscribers: info.subscribers.length }));
}

module.exports = { startPriceMonitor, addMonitor, removeMonitor, listMonitors };
