const { chromium } = require('playwright');

/**
 * Scrape Amazon search results for a query and country.
 * Returns array of products: { asin, url, title, price, brand, image, rating }
 */
async function scrapeAmazonSearch({ query, country = 'IT', page = 1, limit = 24 }) {
  console.log(`[AmazonScraper] Starting search for "${query}" in ${country}, limit=${limit}`);
  
  const domainMap = { IT: 'amazon.it', US: 'amazon.com', DE: 'amazon.de', FR: 'amazon.fr', ES: 'amazon.es' };
  const domain = domainMap[country] || 'amazon.it';
  const homeUrl = `https://${domain}/`;

  console.log(`[AmazonScraper] Using domain: ${domain}`);
  
  let browser = null;
  try {
    console.log('[AmazonScraper] Launching Chromium...');
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    console.log('[AmazonScraper] Creating browser context...');
    const context = await browser.newContext({ 
      locale: country.toLowerCase() === 'it' ? 'it-IT' : country.toLowerCase() + '-' + country.toUpperCase(),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      extraHTTPHeaders: {
        'Accept-Language': country.toLowerCase() === 'it' ? 'it-IT,it;q=0.9,en;q=0.8' : 'en-US,en;q=0.9'
      },
      viewport: { width: 1366, height: 768 }
    });
    
    // Add stealth scripts
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['it-IT', 'it', 'en'] });
    });
    
    console.log('[AmazonScraper] Opening new page...');
    const pageObj = await context.newPage();
    
    console.log(`[AmazonScraper] Navigating to ${homeUrl}...`);
    await pageObj.goto(homeUrl, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait a bit to simulate human behavior
    await pageObj.waitForTimeout(2000);

    // Accept cookies if banner appears
    console.log('[AmazonScraper] Checking for cookie banner...');
    try {
      const acceptBtn = await pageObj.locator('button:has-text("Accetta")').first();
      if (await acceptBtn.isVisible()) {
        console.log('[AmazonScraper] Accepting cookies...');
        await acceptBtn.click();
      }
    } catch (e) { 
      console.log('[AmazonScraper] No cookie banner found or error:', e.message);
    }

    // Inserisci la query nella barra di ricerca e invia il form
    console.log(`[AmazonScraper] Searching for "${query}"...`);
    
    // Wait for search box to be available
    await pageObj.waitForSelector('#twotabsearchtextbox', { timeout: 10000 });
    
    // Clear and type slowly to simulate human behavior
    await pageObj.click('#twotabsearchtextbox');
    await pageObj.fill('#twotabsearchtextbox', '');
    await pageObj.type('#twotabsearchtextbox', query, { delay: 100 });
    
    // Wait a bit before pressing enter
    await pageObj.waitForTimeout(1000);
    await pageObj.keyboard.press('Enter');
    
    console.log('[AmazonScraper] Waiting for search results...');
    await pageObj.waitForSelector('[data-asin]', { timeout: 30000 });

    console.log('[AmazonScraper] Extracting product data...');
    const products = await pageObj.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-asin]')).filter(el => el.getAttribute('data-asin'));
      console.log(`Found ${items.length} products with data-asin`);
      
      return items.map(el => {
        const asin = el.getAttribute('data-asin');
        let url = null;
        try {
          const href = el.querySelector('h2 a')?.getAttribute('href') || null;
          url = href ? (href.startsWith('http') ? href : (location.origin + href)) : (asin ? location.origin + '/dp/' + asin : null);
        } catch { url = asin ? location.origin + '/dp/' + asin : null; }
        const title = el.querySelector('h2 span, h2 a span')?.textContent.trim() || '';
        // Prezzo con fallback: offscreen, whole+fraction
        let price = el.querySelector('.a-price .a-offscreen')?.textContent.trim() || '';
        if (!price) {
          const whole = el.querySelector('.a-price .a-price-whole')?.textContent.trim() || '';
          const fraction = el.querySelector('.a-price .a-price-fraction')?.textContent.trim() || '';
          if (whole) price = fraction ? `${whole},${fraction}€` : `${whole}€`;
        }
        const brand = el.querySelector('.a-row.a-size-base.a-color-secondary')?.textContent.trim() || '';
        const image = el.querySelector('img.s-image')?.src || '';
        const rating = el.querySelector('.a-icon-star-small .a-icon-alt')?.textContent.trim() || '';
        // Spedizione
        let shipping = '';
        const shipEl = el.querySelector('.a-row.a-size-base.a-color-secondary span, .a-row.a-size-base.a-color-secondary .a-text-bold');
        if (shipEl) shipping = shipEl.textContent.trim();
        // Badge Prime
        const isPrime = !!el.querySelector('.a-icon-prime');
        // Descrizione breve
        let description = '';
        const descEl = el.querySelector('.a-row.a-size-base.a-color-secondary, .a-row.a-size-base.a-color-base');
        if (descEl) description = descEl.textContent.trim();
        return { asin, url, title, price, brand, image, rating, shipping, isPrime, description };
      });
    });

    console.log(`[AmazonScraper] Found ${products.length} products, filtering to ${limit}...`);
    const filteredProducts = products.filter(p => p.asin).slice(0, limit);
    
    console.log(`[AmazonScraper] Returning ${filteredProducts.length} products`);
    return filteredProducts;
    
  } catch (error) {
    console.error('[AmazonScraper] Error during scraping:', error);
    throw error;
  } finally {
    if (browser) {
      console.log('[AmazonScraper] Closing browser...');
      await browser.close();
    }
  }
}



/**
 * Scrape complete product details from an Amazon product page.
 * Input: url (string) or asin + country
 * Output: rich product object with title, price, images, details, badges, delivery, variants.
 */
async function scrapeAmazonProduct({ url, asin, country = 'IT' }) {
  const domainMap = { IT: 'amazon.it', US: 'amazon.com', DE: 'amazon.de', FR: 'amazon.fr', ES: 'amazon.es' };
  if (!url && asin) url = `https://${domainMap[country]}/dp/${asin}`;
  if (!url) throw new Error('scrapeAmazonProduct: url or asin required');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: country.toLowerCase() + '_' + country, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36 ShappaBot/1.0' });
  const page = await context.newPage();

  // Basic anti-bot: slow mouse, wait for network idle, avoid immediate selectors
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

  // Accept cookies if banner appears
  try {
    const acceptBtn = await page.locator('button:has-text("Accetta")').first();
    if (await acceptBtn.isVisible()) await acceptBtn.click();
  } catch { /* ignore */ }

  // Wait for title
  await page.waitForSelector('#productTitle, h1 span', { timeout: 30000 });

  const data = await page.evaluate(() => {
    const text = sel => { const el = document.querySelector(sel); return el ? el.textContent.trim() : null; };
    const attr = (el, name) => el ? el.getAttribute(name) : null;

    const title = text('#productTitle') || text('h1 span');
    const brand = text('#bylineInfo') || text('#brand, .po-brand .a-span9');
    const price = text('#corePrice_feature_div .a-price .a-offscreen') || text('#priceblock_ourprice') || text('#priceblock_dealprice');
    const oldPrice = text('#corePrice_feature_div .a-price.a-text-price .a-offscreen') || null;
    const rating = text('#acrPopover .a-icon-alt') || null;
    const reviews = text('#acrCustomerReviewText');

    // Images
    const imgMain = document.querySelector('#landingImage, #imgTagWrapperId img');
    const image = imgMain ? (attr(imgMain, 'src') || attr(imgMain, 'data-old-hires') || attr(imgMain, 'data-a-dynamic-image') || '') : '';
    const gallery = Array.from(document.querySelectorAll('#altImages img')).map(i => i.src).filter(Boolean);

    // Details/bullets
    const bullets = Array.from(document.querySelectorAll('#feature-bullets li')).map(li => li.textContent.trim()).filter(Boolean);
    const details = bullets.join('\n');

    // Categorie
    const breadcrumbs = Array.from(document.querySelectorAll('#wayfinding-breadcrumbs_container ul li a')).map(a => a.textContent.trim()).filter(Boolean);
    // Materiali/tessuti
    let materials = '';
    const techTable = document.querySelectorAll('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr');
    techTable.forEach(tr => {
      const th = tr.querySelector('th');
      const td = tr.querySelector('td');
      if (th && td) {
        const key = th.textContent.trim().toLowerCase();
        if (key.includes('materiale') || key.includes('tessuto') || key.includes('composition') || key.includes('fabric')) {
          materials += td.textContent.trim() + '\n';
        }
      }
    });
    // Dettagli tecnici
    const techDetails = {};
    techTable.forEach(tr => {
      const th = tr.querySelector('th');
      const td = tr.querySelector('td');
      if (th && td) techDetails[th.textContent.trim()] = td.textContent.trim();
    });

    // Badges and meta
    const prime = !!document.querySelector('#primeExclusive, .prime-logo, #priceblock_ourprice + .a-icon-prime');
    const sponsored = !!document.querySelector('[data-component-type="s-search-results"] [aria-label^="Sponsored"]');
    const delivery = Array.from(document.querySelectorAll('#deliveryMessageMirId, #mir-layout-DELIVERY_BLOCK span, #availability span')).map(el => el.textContent.trim()).filter(Boolean);

    // Variants
    const variants = Array.from(document.querySelectorAll('#twister .a-row')).map(row => row.textContent.trim()).filter(v => v.length > 0);

    return {
      title, brand, price, oldPrice, rating, reviews,
      image, images: gallery, details,
      categories: breadcrumbs,
      materials,
      techDetails,
      raw: { prime, sponsored, delivery, variants }
    };
  });

  await browser.close();
  return data;
}

module.exports = { scrapeAmazonSearch, scrapeAmazonProduct };
