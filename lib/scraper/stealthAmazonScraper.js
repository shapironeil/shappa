const { chromium } = require('playwright');

/**
 * Alternative Amazon scraper with better stealth capabilities
 */
class StealthAmazonScraper {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ];
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  async createBrowser() {
    return await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor,VizHitTestSurfaceLayer',
        '--disable-ipc-flooding-protection',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
  }

  async createContext(browser, country = 'IT') {
    const context = await browser.newContext({
      userAgent: this.getRandomUserAgent(),
      locale: country.toLowerCase() === 'it' ? 'it-IT' : 'en-US',
      timezoneId: country.toLowerCase() === 'it' ? 'Europe/Rome' : 'America/New_York',
      viewport: { width: 1920, height: 1080 },
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': country.toLowerCase() === 'it' ? 'it-IT,it;q=0.8,en-US;q=0.5,en;q=0.3' : 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });

    // Enhanced stealth scripts
    await context.addInitScript(() => {
      // Remove webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['it-IT', 'it', 'en-US', 'en'],
      });

      // Mock permissions
      const originalQuery = window.navigator.permissions.query;
      return window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    return context;
  }

  async searchProducts(query, country = 'IT', limit = 24) {
    console.log(`[StealthScraper] Starting search for "${query}" in ${country}`);
    
    const domainMap = { 
      IT: 'amazon.it', 
      US: 'amazon.com', 
      DE: 'amazon.de', 
      FR: 'amazon.fr', 
      ES: 'amazon.es',
      UK: 'amazon.co.uk'
    };
    
    const domain = domainMap[country] || 'amazon.it';
    const searchUrl = `https://${domain}/s?k=${encodeURIComponent(query)}`;
    
    let browser = null;
    try {
      browser = await this.createBrowser();
      const context = await this.createContext(browser, country);
      const page = await context.newPage();

      console.log(`[StealthScraper] Navigating to ${searchUrl}...`);
      
      // Navigate directly to search results
      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });

      // Wait for search results or error page
      try {
        await page.waitForSelector('[data-component-type="s-search-result"], .s-no-results, .captcha-container', { timeout: 15000 });
      } catch (e) {
        console.log('[StealthScraper] No standard selectors found, trying alternative approach...');
      }

      // Check if we hit a captcha or error page
      const hasCaptcha = await page.locator('.captcha-container').count() > 0;
      const hasNoResults = await page.locator('.s-no-results').count() > 0;
      
      if (hasCaptcha) {
        throw new Error('Captcha detected - Amazon is blocking the request');
      }
      
      if (hasNoResults) {
        console.log('[StealthScraper] No results found for query');
        return [];
      }

      // Extract products with multiple selectors
      const products = await page.evaluate((limit) => {
        const results = [];
        
        // Try multiple selectors for product containers
        const selectors = [
          '[data-component-type="s-search-result"]',
          '[data-asin]:not([data-asin=""])',
          '.s-result-item[data-asin]'
        ];
        
        let items = [];
        let usedSelector = '';
        for (const selector of selectors) {
          items = Array.from(document.querySelectorAll(selector));
          console.log(`Selector "${selector}" found ${items.length} items`);
          if (items.length > 0) {
            usedSelector = selector;
            break;
          }
        }
        
        console.log(`Using selector: ${usedSelector}, Found ${items.length} items`);
        
        for (const item of items.slice(0, limit)) {
          try {
            const asin = item.getAttribute('data-asin') || item.getAttribute('data-uuid');
            if (!asin) {
              console.log('Item without ASIN found, skipping');
              continue;
            }
            
            // Title - miglioriamo l'estrazione escludendo elementi sponsorizzati
            const titleSelectors = [
              'h2 a span:not([aria-label*="Sponsored"]):not([data-component-type*="sponsored"])',
              'h2 span:not([aria-label*="Sponsored"]):not([data-component-type*="sponsored"])',
              '.s-title-instructions-style span:not([aria-label*="Sponsored"])',
              'h2 a[aria-label]:not([aria-label*="Sponsored"])',
              '[data-cy="title-recipe-title"]',
              '.s-size-mini .s-link-style a span'
            ];
            
            let title = '';
            for (const selector of titleSelectors) {
              const titleEl = item.querySelector(selector);
              if (titleEl && titleEl.textContent.trim() && !titleEl.textContent.trim().toLowerCase().includes('sponsorizzato')) {
                title = titleEl.textContent.trim();
                break;
              }
            }
            
            // Se non troviamo il titolo, proviamo con un approccio diverso
            if (!title) {
              const allTextElements = item.querySelectorAll('h2 span, h2 a span');
              for (const el of allTextElements) {
                const text = el.textContent.trim();
                if (text && text.length > 10 && !text.toLowerCase().includes('sponsorizzato') && !text.toLowerCase().includes('sponsored')) {
                  title = text;
                  break;
                }
              }
            }
            
            // URL
            const linkEl = item.querySelector('h2 a, .s-title-instructions-style a');
            let url = linkEl ? linkEl.href : '';
            if (!url && asin) {
              url = `${window.location.origin}/dp/${asin}`;
            }
            
            // Price information (more detailed)
            let price = '';
            let originalPrice = '';
            let discount = '';
            
            const priceSelectors = [
              '.a-price .a-offscreen',
              '.a-price-whole',
              '.a-price .a-price-symbol + .a-price-whole',
              '[data-a-price] .a-offscreen'
            ];
            
            for (const sel of priceSelectors) {
              const priceEl = item.querySelector(sel);
              if (priceEl) {
                price = priceEl.textContent.trim();
                break;
              }
            }
            
            // Original price (crossed out)
            const originalPriceEl = item.querySelector('.a-price.a-text-price .a-offscreen, .a-text-strike .a-offscreen');
            if (originalPriceEl) {
              originalPrice = originalPriceEl.textContent.trim();
            }
            
            // Discount percentage
            const discountEl = item.querySelector('.a-badge-text, .a-letter-space');
            if (discountEl && discountEl.textContent.includes('%')) {
              discount = discountEl.textContent.trim();
            }
            
            // Image
            const imgEl = item.querySelector('img.s-image, img[data-image-latency], .s-product-image img');
            const image = imgEl ? (imgEl.src || imgEl.getAttribute('data-src')) : '';
            
            // Rating and reviews
            const ratingEl = item.querySelector('.a-icon-star-small .a-icon-alt, .a-icon-star .a-icon-alt');
            const rating = ratingEl ? ratingEl.textContent.trim() : '';
            
            const reviewsEl = item.querySelector('.a-size-base');
            const reviewsCount = reviewsEl ? reviewsEl.textContent.match(/\(([\d.,]+)\)/)?.[1] || '' : '';
            
            // Brand/Byline
            const brandEl = item.querySelector('.a-row.a-size-base.a-color-secondary span, .s-size-mini span');
            const brand = brandEl ? brandEl.textContent.trim() : '';
            
            // Prime badge and shipping
            const isPrime = !!item.querySelector('.a-icon-prime');
            let shipping = '';
            const shippingEl = item.querySelector('.a-row.a-size-base.a-color-secondary');
            if (shippingEl && shippingEl.textContent.includes('Consegna')) {
              shipping = shippingEl.textContent.trim();
            } else if (isPrime) {
              shipping = 'Spedizione Prime GRATUITA';
            }
            
            // Badges (Best seller, Amazon's choice, etc.)
            const badges = [];
            const badgeSelectors = [
              '.a-badge-text',
              '.s-sponsored-label-text',
              '.a-size-mini .a-color-secondary'
            ];
            
            badgeSelectors.forEach(sel => {
              const badgeEl = item.querySelector(sel);
              if (badgeEl) {
                const badgeText = badgeEl.textContent.trim();
                if (badgeText && !badges.includes(badgeText)) {
                  badges.push(badgeText);
                }
              }
            });
            
            // Product snippet/description
            let snippet = '';
            const snippetEl = item.querySelector('.a-size-base-plus, .a-row.a-size-base.a-color-secondary');
            if (snippetEl) {
              snippet = snippetEl.textContent.trim();
            }
            
            if (title && asin) {
              results.push({
                asin,
                url,
                title,
                price,
                originalPrice,
                discount,
                brand,
                image,
                rating,
                reviewsCount,
                isPrime,
                shipping,
                badges,
                snippet,
                description: snippet || title
              });
            }
          } catch (e) {
            console.error('Error processing item:', e);
            continue;
          }
        }
        
        return results;
      }, limit);

      // Convert images to high resolution for all products
      products.forEach(product => {
        if (product.image) {
          product.image = this.getHighResImageUrl(product.image);
        }
      });

      console.log(`[StealthScraper] Extracted ${products.length} products`);
      return products;

    } catch (error) {
      console.error('[StealthScraper] Search failed:', error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async getProductDetails(asin, country = 'IT') {
    console.log(`[StealthScraper] Getting details for ASIN: ${asin} in ${country}`);
    
    const domainMap = { 
      IT: 'amazon.it', 
      US: 'amazon.com', 
      DE: 'amazon.de', 
      FR: 'amazon.fr', 
      ES: 'amazon.es',
      UK: 'amazon.co.uk'
    };
    
    const domain = domainMap[country] || 'amazon.it';
    const productUrl = `https://${domain}/dp/${asin}`;
    
    let browser = null;
    try {
      browser = await this.createBrowser();
      const context = await this.createContext(browser, country);
      const page = await context.newPage();

      console.log(`[StealthScraper] Navigating to ${productUrl}...`);
      
      await page.goto(productUrl, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });

      // Wait for product title
      try {
        await page.waitForSelector('#productTitle, h1', { timeout: 15000 });
      } catch (e) {
        console.log('[StealthScraper] Product title not found, page might be blocked');
      }

      // Extract detailed product information
      const productDetails = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : '';
        };
        
        const getAttr = (selector, attr) => {
          const el = document.querySelector(selector);
          return el ? el.getAttribute(attr) : '';
        };

        // Basic info
        const title = getText('#productTitle') || getText('h1');
        const brand = getText('#bylineInfo, .po-brand .a-span9, #brand');
        
        // Pricing
        const price = getText('.a-price .a-offscreen, #corePrice_feature_div .a-price .a-offscreen');
        const originalPrice = getText('.a-price.a-text-price .a-offscreen, #corePrice_feature_div .a-price.a-text-price .a-offscreen');
        
        // Rating and reviews
        const rating = getText('#acrPopover .a-icon-alt, .a-icon-star .a-icon-alt');
        const reviewsCount = getText('#acrCustomerReviewText');
        
        // Images - Extract high resolution images
        const mainImage = getAttr('#landingImage, #imgTagWrapperId img', 'data-old-hires') ||
                          getAttr('#landingImage, #imgTagWrapperId img', 'src') ||
                          getAttr('#main-image img', 'src');
        
        const images = [];
        
        // Get main product images from multiple selectors
        const imageSelectors = [
          '#altImages img', 
          '#imageBlock img', 
          '#leftCol img',
          '#main-image-container img',
          '.a-dynamic-image',
          '[data-a-dynamic-image]'
        ];
        
        imageSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(img => {
            // Cattura sia l'URL normale che quello hi-res
            const hiresUrl = img.getAttribute('data-old-hires') ||
                            img.getAttribute('data-a-hires');
            const normalUrl = img.getAttribute('data-src') || img.src;
            
            // Priorità all'URL hi-res se disponibile
            const bestUrl = hiresUrl || normalUrl;
            
            if (bestUrl && !images.includes(bestUrl) && bestUrl.includes('images/I/')) {
              console.log(`[Scraper] Immagine trovata: ${bestUrl}${hiresUrl ? ' (hi-res)' : ''}`);
              images.push(bestUrl);
            }
          });
        });
        
        // Remove duplicates and sort by quality
        const uniqueImages = [...new Set(images)];
        uniqueImages.sort((a, b) => {
          // Prefer images without size modifiers (higher quality)
          const aHasModifier = /\._[A-Z]{2}\d+_/.test(a);
          const bHasModifier = /\._[A-Z]{2}\d+_/.test(b);
          if (aHasModifier && !bHasModifier) return 1;
          if (!aHasModifier && bHasModifier) return -1;
          return 0;
        });
        
        // Product description and features
        const features = [];
        document.querySelectorAll('#feature-bullets li:not(.aok-hidden), #productDescription p').forEach(li => {
          const text = li.textContent.trim();
          if (text && !text.includes('Report') && text.length > 10) {
            features.push(text);
          }
        });
        
        // Technical details
        const techDetails = {};
        document.querySelectorAll('#productDetails_techSpec_section_1 tr, #productDetails_detailBullets_sections1 tr').forEach(tr => {
          const key = tr.querySelector('th, .a-text-bold');
          const value = tr.querySelector('td, .a-text-left');
          if (key && value) {
            techDetails[key.textContent.trim()] = value.textContent.trim();
          }
        });
        
        // Availability and delivery
        const availability = getText('#availability span, #deliveryMessageMirId');
        const delivery = getText('#mir-layout-DELIVERY_BLOCK span, #deliveryMessageMirId');
        
        // Prime status
        const isPrime = !!document.querySelector('#primeExclusive, .prime-logo');
        
        // Product variants (size, color, etc.)
        const variants = {};
        document.querySelectorAll('#twister .a-row').forEach(row => {
          const label = row.querySelector('.a-form-label');
          const options = [];
          row.querySelectorAll('.a-button-text, option').forEach(opt => {
            const text = opt.textContent.trim();
            if (text) options.push(text);
          });
          if (label && options.length > 0) {
            variants[label.textContent.trim().replace(':', '')] = options;
          }
        });
        
        // Category breadcrumbs
        const categories = [];
        document.querySelectorAll('#wayfinding-breadcrumbs_container a, .a-breadcrumb a').forEach(a => {
          const text = a.textContent.trim();
          if (text) categories.push(text);
        });

        return {
          asin: new URLSearchParams(window.location.search).get('asin') || window.location.pathname.split('/dp/')[1]?.split('/')[0],
          title,
          brand,
          price,
          originalPrice,
          rating,
          reviewsCount,
          mainImage,
          images: uniqueImages,
          features,
          techDetails,
          availability,
          delivery,
          isPrime,
          variants,
          categories,
          url: window.location.href
        };
      });

      // Convert images to high resolution after extraction
      if (productDetails.mainImage) {
        productDetails.mainImage = this.getHighResImageUrl(productDetails.mainImage);
      }
      
      if (productDetails.images && productDetails.images.length > 0) {
        productDetails.images = productDetails.images.map(img => this.getHighResImageUrl(img));
      }

      console.log(`[StealthScraper] Extracted detailed info for ${asin}`);
      return productDetails;

    } catch (error) {
      console.error('[StealthScraper] Product details failed:', error.message);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Convert Amazon image URL to high resolution version
   * @param {string} imageUrl - Original image URL
   * @returns {string} High resolution image URL
   */
  getHighResImageUrl(imageUrl) {
    if (!imageUrl) return '';
    
    try {
      // Amazon image URLs - get MAXIMUM resolution for eBay listings
      let highResUrl = imageUrl;
      
      // FIRST: Try to get original uncompressed image by removing ALL modifiers
      if (highResUrl.includes('._') && highResUrl.includes('images/I/')) {
        const imageId = highResUrl.match(/images\/I\/([^._]+)/);
        if (imageId && imageId[1]) {
          const baseUrl = highResUrl.split('images/I/')[0];
          const extension = highResUrl.includes('.jpg') ? '.jpg' : 
                           highResUrl.includes('.png') ? '.png' : 
                           highResUrl.includes('.webp') ? '.jpg' : '.jpg';
          
          // Return original uncompressed image (highest quality possible)
          const originalUrl = `${baseUrl}images/I/${imageId[1]}${extension}`;
          console.log(`[ImageOptimizer] Original URL: ${originalUrl}`);
          return originalUrl;
        }
      }
      
      // FALLBACK: If original not available, use MAXIMUM dimensions
      // Replace ALL size parameters with MAXIMUM resolution (2000px+)
      highResUrl = highResUrl.replace(/\._AC_UL\d+_/, '._AC_UL2000_');
      highResUrl = highResUrl.replace(/\._AC_SX\d+_/, '._AC_SX2000_');
      highResUrl = highResUrl.replace(/\._AC_SY\d+_/, '._AC_SY2000_');
      highResUrl = highResUrl.replace(/\._SX\d+_/, '._SX2000_');
      highResUrl = highResUrl.replace(/\._SY\d+_/, '._SY2000_');
      highResUrl = highResUrl.replace(/\._UL\d+_/, '._UL2000_');
      highResUrl = highResUrl.replace(/\._UX\d+_/, '._UX2000_');
      highResUrl = highResUrl.replace(/\._UY\d+_/, '._UY2000_');
      highResUrl = highResUrl.replace(/\._SL\d+_/, '._SL2000_');
      
      // Remove ALL size constraints, cropping and quality compression
      highResUrl = highResUrl.replace(/\._CR\d+,\d+,\d+,\d+_/, '');
      highResUrl = highResUrl.replace(/\._SS\d+_/, '');
      highResUrl = highResUrl.replace(/\._QL\d+_/, '');
      highResUrl = highResUrl.replace(/\._TTW_/, '');
      highResUrl = highResUrl.replace(/\._FMwebp_/, '');
      highResUrl = highResUrl.replace(/\._PIbundle-\d+,TopRight,\d+,\d+_/, '');
      highResUrl = highResUrl.replace(/\._BIMAGE_/, '');
      
      // Clean up double dots and invalid characters
      highResUrl = highResUrl.replace(/\.\./, '.');
      highResUrl = highResUrl.replace(/\._$/, '');
      
      console.log(`[ImageOptimizer] High-res URL: ${highResUrl}`);
      
      // If no modifiers to remove, this might already be original
      if (!highResUrl.includes('._') && highResUrl.includes('images/I/')) {
        console.log(`[ImageOptimizer] Already original quality: ${highResUrl}`);
        return highResUrl;  // Already original quality
      }
      
      return highResUrl;
    } catch (error) {
      console.warn('[StealthScraper] Error converting image URL:', error);
      return imageUrl; // Return original if conversion fails
    }
  }
}

module.exports = { StealthAmazonScraper };