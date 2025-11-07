/**
 * StandardMonitor - Modulo per monitoraggio HTML standard
 * 
 * Funziona cercando selettori CSS specifici nella pagina:
 * - Bottone Add to Cart
 * - Prezzo
 * - Stock indicator
 * - Immagine prodotto
 * 
 * Ideale per: siti e-commerce standard senza protezioni complesse
 */

const MonitorBase = require('../base/MonitorBase');

class StandardMonitor extends MonitorBase {
    constructor(config) {
        super(config);
        
        // Selettori di default (possono essere sovrascritti dal target)
        this.defaultSelectors = {
            addToCart: [
                'button[name="add"]',
                '.add-to-cart',
                '#add-to-cart',
                'button.product-form__submit',
                'button[type="submit"].btn-cart',
                '.product-form__submit',
                'input[type="submit"][name="add"]'
            ],
            price: [
                '.price',
                '.product-price',
                '.money',
                '[data-price]',
                '.price__current',
                'span.amount'
            ],
            stock: [
                '.stock',
                '.inventory',
                '.availability',
                '[data-stock]',
                '.product-availability'
            ],
            image: [
                '.product-image img',
                '.product__photo img',
                'meta[property="og:image"]',
                '[data-product-image]'
            ]
        };
    }

    /**
     * Verifica disponibilità prodotto
     */
    async check() {
        try {
            const html = await this.fetchHTML(this.productUrl);
            const $ = this.extractWithSelector(html, 'body');

            // Determina disponibilità
            const available = this.checkAvailability($);
            
            // Estrai dati prodotto
            const data = await this.extractData($);

            return {
                available,
                data
            };

        } catch (error) {
            console.error(`[StandardMonitor] Errore:`, error.message);
            throw error;
        }
    }

    /**
     * Verifica disponibilità tramite button ATC
     */
    checkAvailability($) {
        // Usa target custom se specificato, altrimenti prova tutti i selettori default
        const selectors = this.target ? [this.target] : this.defaultSelectors.addToCart;

        for (const selector of selectors) {
            const button = $(selector).first();
            
            if (button.length > 0) {
                // Verifica se il bottone è disabilitato
                const isDisabled = button.prop('disabled') || 
                                 button.attr('disabled') !== undefined ||
                                 button.hasClass('disabled') ||
                                 button.hasClass('sold-out');

                // Verifica testo bottone
                const buttonText = button.text().toLowerCase().trim();
                const unavailableTexts = [
                    'sold out',
                    'esaurito',
                    'non disponibile',
                    'out of stock',
                    'coming soon',
                    'notify me',
                    'avvisami'
                ];

                const hasUnavailableText = unavailableTexts.some(text => buttonText.includes(text));

                // Disponibile se: bottone trovato, NON disabled, NON ha testo "sold out"
                if (!isDisabled && !hasUnavailableText) {
                    console.log(`[StandardMonitor] ✅ Button ATC trovato e DISPONIBILE: "${buttonText}"`);
                    return true;
                }

                console.log(`[StandardMonitor] ❌ Button ATC trovato ma NON disponibile: disabled=${isDisabled}, text="${buttonText}"`);
                return false;
            }
        }

        // Se non trova bottone ATC, cerca indicatori di stock
        return this.checkStockIndicators($);
    }

    /**
     * Verifica disponibilità tramite indicatori stock
     */
    checkStockIndicators($) {
        const selectors = this.defaultSelectors.stock;

        for (const selector of selectors) {
            const stockEl = $(selector).first();
            
            if (stockEl.length > 0) {
                const stockText = stockEl.text().toLowerCase().trim();
                
                // Parole chiave disponibilità
                const availableKeywords = ['in stock', 'disponibile', 'available'];
                const unavailableKeywords = ['out of stock', 'esaurito', 'sold out', 'non disponibile'];

                if (availableKeywords.some(kw => stockText.includes(kw))) {
                    console.log(`[StandardMonitor] ✅ Stock indicator: DISPONIBILE`);
                    return true;
                }

                if (unavailableKeywords.some(kw => stockText.includes(kw))) {
                    console.log(`[StandardMonitor] ❌ Stock indicator: NON DISPONIBILE`);
                    return false;
                }
            }
        }

        // Default: se non trova indicatori, assume NON disponibile (conservativo)
        console.log(`[StandardMonitor] ⚠️ Nessun indicatore trovato - assume NON disponibile`);
        return false;
    }

    /**
     * Estrae dati prodotto dalla pagina
     */
    async extractData($) {
        const data = {
            price: null,
            stock: null,
            image: null,
            variants: null
        };

        // Estrai prezzo
        for (const selector of this.defaultSelectors.price) {
            const priceEl = $(selector).first();
            if (priceEl.length > 0) {
                data.price = priceEl.text().trim();
                break;
            }
        }

        // Estrai stock
        for (const selector of this.defaultSelectors.stock) {
            const stockEl = $(selector).first();
            if (stockEl.length > 0) {
                data.stock = stockEl.text().trim();
                break;
            }
        }

        // Estrai immagine
        for (const selector of this.defaultSelectors.image) {
            let imageUrl = null;

            if (selector.includes('meta')) {
                imageUrl = $(selector).attr('content');
            } else {
                imageUrl = $(selector).attr('src') || $(selector).attr('data-src');
            }

            if (imageUrl) {
                // Converti URL relativo in assoluto
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                } else if (imageUrl.startsWith('/')) {
                    const urlObj = new URL(this.productUrl);
                    imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
                }
                
                data.image = imageUrl;
                break;
            }
        }

        // Estrai varianti (se esistono select/radio)
        const variants = [];
        $('select[name*="variant"], select[id*="variant"]').each((i, el) => {
            $(el).find('option').each((j, opt) => {
                const text = $(opt).text().trim();
                if (text && !text.toLowerCase().includes('select')) {
                    variants.push(text);
                }
            });
        });

        if (variants.length > 0) {
            data.variants = variants.join(', ');
        }

        return data;
    }

    /**
     * FUTURO: Acquisto automatico per siti standard
     */
    async autoCheckout(userProfile) {
        console.log(`[StandardMonitor] 🛒 Auto-checkout non ancora implementato`);
        // TODO: Puppeteer automation
        // 1. Click ATC button
        // 2. Go to checkout
        // 3. Fill shipping info
        // 4. Fill payment info
        // 5. Submit order
        throw new Error('autoCheckout() coming in Phase 5');
    }
}

module.exports = StandardMonitor;
