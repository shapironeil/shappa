/**
 * RecipeAgent - Gestisce integrazione con GialloZafferano.it
 * 
 * Responsabile di:
 * - Scraping ricette da GialloZafferano.it
 * - Conversione ricette nel formato database
 * - Download e salvataggio immagini ricette
 * - Integrazione con MongoDB per salvare ricette
 * - Mapping ingredienti con foodDatabase
 */

const AgentBase = require('../base/AgentBase');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const { getMongoDB } = require('../../lib/db/mongodb');

class RecipeAgent extends AgentBase {
    constructor(config = {}) {
        super('RecipeAgent', {
            priority: 7,
            ...config
        });

        this.capabilities = [
            'fetch_recipe_from_giallozafferano',
            'scrape_recipe_details',
            'convert_recipe_format',
            'download_recipe_image',
            'save_recipe_to_database',
            'get_recipe_from_database',
            'search_recipes_in_database',
            'search_giallozafferano_recipes',
            'batch_import_recipes'
        ];

        this.gialloZafferanoBase = 'https://www.giallozafferano.it';
        this.recipeDataDir = path.join(__dirname, '../../data/recipes');
        this.recipeImagesDir = path.join(__dirname, '../../data/recipe-images');
        this.mongoDB = getMongoDB(); // Usa helper MongoDB centralizzato
        
        this.ensureRecipeDirs();
    }

    /**
     * Assicura che le directory dati ricette esistano
     */
    async ensureRecipeDirs() {
        try {
            await fs.mkdir(this.recipeDataDir, { recursive: true });
            await fs.mkdir(this.recipeImagesDir, { recursive: true });
        } catch (error) {
            console.error(`[RecipeAgent] Error creating directories:`, error);
        }
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        return this.capabilities.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'fetch_recipe_from_giallozafferano':
                return await this.fetchRecipeFromGialloZafferano(task);
            case 'scrape_recipe_details':
                return await this.scrapeRecipeDetails(task);
            case 'convert_recipe_format':
                return await this.convertRecipeFormat(task);
            case 'download_recipe_image':
                return await this.downloadRecipeImage(task);
            case 'save_recipe_to_database':
                return await this.saveRecipeToDatabase(task);
            case 'search_giallozafferano_recipes':
                return await this.searchGialloZafferanoRecipes(task);
            case 'batch_import_recipes':
                return await this.batchImportRecipes(task);
            case 'get_recipe_from_database':
                return await this.getRecipeFromDatabase(task);
            case 'search_recipes_in_database':
                return await this.searchRecipesInDatabase(task);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Cerca ricette su GialloZafferano
     */
    async searchGialloZafferanoRecipes(task) {
        const { query, limit = 20 } = task;
        
        if (!query) {
            throw new Error('Query is required');
        }

        try {
            // GialloZafferano search URL
            const searchUrl = `${this.gialloZafferanoBase}/ricette-cerca/?q=${encodeURIComponent(query)}`;
            
            console.log(`[RecipeAgent] Searching recipes: ${query}`);
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const recipes = [];

            // Estrai ricette dai risultati di ricerca
            $('.recipe-card, .ricetta-card, article.recipe').each((index, element) => {
                if (recipes.length >= limit) return false;

                const $el = $(element);
                const title = $el.find('h2, h3, .recipe-title, .title').first().text().trim();
                const link = $el.find('a').first().attr('href');
                const image = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');
                const rating = $el.find('.rating, .stars').text().trim();
                const difficulty = $el.find('.difficulty, .difficolta').text().trim();

                if (title && link) {
                    const fullLink = link.startsWith('http') ? link : `${this.gialloZafferanoBase}${link}`;
                    recipes.push({
                        title,
                        url: fullLink,
                        image: image ? (image.startsWith('http') ? image : `${this.gialloZafferanoBase}${image}`) : null,
                        rating,
                        difficulty
                    });
                }
            });

            console.log(`[RecipeAgent] Found ${recipes.length} recipes for "${query}"`);

            return {
                success: true,
                query,
                recipes,
                count: recipes.length
            };
        } catch (error) {
            throw new Error(`Failed to search GialloZafferano: ${error.message}`);
        }
    }

    /**
     * Scraping dettagli ricetta da GialloZafferano
     */
    async scrapeRecipeDetails(task) {
        const { url } = task;
        
        if (!url) {
            throw new Error('Recipe URL is required');
        }

        try {
            console.log(`[RecipeAgent] Scraping recipe: ${url}`);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const $ = cheerio.load(response.data);
            const recipe = {};

            // Titolo
            recipe.name = $('h1.recipe-title, h1.title, .recipe-header h1').first().text().trim();
            
            // Descrizione
            recipe.description = $('.recipe-description, .description, .intro').first().text().trim();
            
            // Immagine principale
            const mainImage = $('.recipe-image img, .main-image img, .hero-image img').first();
            recipe.imageUrl = mainImage.attr('src') || mainImage.attr('data-src');
            if (recipe.imageUrl && !recipe.imageUrl.startsWith('http')) {
                recipe.imageUrl = `${this.gialloZafferanoBase}${recipe.imageUrl}`;
            }

            // Tempi
            const prepTimeText = $('.prep-time, .tempo-preparazione, [data-time="prep"]').first().text();
            const cookTimeText = $('.cook-time, .tempo-cottura, [data-time="cook"]').first().text();
            const totalTimeText = $('.total-time, .tempo-totale, [data-time="total"]').first().text();
            
            recipe.prepTime = this.parseTime(prepTimeText);
            recipe.cookTime = this.parseTime(cookTimeText);
            recipe.totalTime = this.parseTime(totalTimeText) || (recipe.prepTime + recipe.cookTime);

            // Porzioni
            const servingsText = $('.servings, .porzioni, [data-servings]').first().text();
            recipe.servings = this.parseServings(servingsText);

            // Difficoltà
            const difficultyText = $('.difficulty, .difficolta, [data-difficulty]').first().text();
            recipe.difficulty = this.parseDifficulty(difficultyText);

            // Ingredienti
            recipe.ingredients = [];
            $('.ingredients-list li, .ingredient, [data-ingredient]').each((index, element) => {
                const $el = $(element);
                const text = $el.text().trim();
                const parsed = this.parseIngredient(text);
                if (parsed) {
                    recipe.ingredients.push(parsed);
                }
            });

            // Istruzioni
            recipe.instructions = [];
            $('.instructions-list li, .step, [data-step]').each((index, element) => {
                const instruction = $(element).text().trim();
                if (instruction) {
                    recipe.instructions.push(instruction);
                }
            });

            // Categoria
            const categoryText = $('.category, .categoria, [data-category]').first().text();
            recipe.category = this.parseCategory(categoryText);

            // Tags
            recipe.tags = [];
            $('.tags a, .tag, [data-tag]').each((index, element) => {
                const tag = $(element).text().trim();
                if (tag) {
                    recipe.tags.push(tag.toLowerCase());
                }
            });

            // Source
            recipe.source = {
                url,
                site: 'GialloZafferano',
                scrapedAt: new Date().toISOString()
            };

            console.log(`[RecipeAgent] ✅ Scraped recipe: ${recipe.name}`);

            return {
                success: true,
                recipe,
                url
            };
        } catch (error) {
            throw new Error(`Failed to scrape recipe: ${error.message}`);
        }
    }

    /**
     * Parse tempo da testo (es: "30 min" -> 30)
     */
    parseTime(text) {
        if (!text) return 0;
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    /**
     * Parse porzioni da testo (es: "4 persone" -> 4)
     */
    parseServings(text) {
        if (!text) return 4;
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1]) : 4;
    }

    /**
     * Parse difficoltà da testo
     */
    parseDifficulty(text) {
        if (!text) return 'Media';
        const lower = text.toLowerCase();
        if (lower.includes('facile') || lower.includes('easy')) return 'Facile';
        if (lower.includes('media') || lower.includes('medium')) return 'Media';
        if (lower.includes('difficile') || lower.includes('hard')) return 'Difficile';
        return 'Media';
    }

    /**
     * Parse categoria da testo
     */
    parseCategory(text) {
        if (!text) return 'primo';
        const lower = text.toLowerCase();
        if (lower.includes('antipasto') || lower.includes('starter')) return 'antipasto';
        if (lower.includes('primo') || lower.includes('first')) return 'primo';
        if (lower.includes('secondo') || lower.includes('main') || lower.includes('second')) return 'secondo';
        if (lower.includes('contorno') || lower.includes('side')) return 'contorno';
        if (lower.includes('dolce') || lower.includes('dessert')) return 'dolce';
        if (lower.includes('colazione') || lower.includes('breakfast')) return 'colazione';
        return 'primo';
    }

    /**
     * Parse ingrediente da testo (es: "200g di pomodori" -> {name: "pomodori", quantity: 200, unit: "g"})
     */
    parseIngredient(text) {
        if (!text) return null;

        // Pattern comuni: "200g pomodori", "2 cucchiai olio", "1 spicchio aglio"
        const patterns = [
            /(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl)\s+(?:di\s+)?(.+)/i,
            /(\d+)\s+(cucchiaio|cucc|tbsp|tsp|spicchio|spicchi|foglia|foglie|pezzo|pezzi|pz)\s+(?:di\s+)?(.+)/i,
            /(\d+(?:[.,]\d+)?)\s+(?:di\s+)?(.+)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const quantity = parseFloat(match[1].replace(',', '.'));
                const unit = match[2] || 'g';
                const name = match[3] || match[2];
                
                return {
                    name: name.trim(),
                    quantity,
                    unit: unit.toLowerCase()
                };
            }
        }

        // Se non matcha, ritorna solo il nome
        return {
            name: text.trim(),
            quantity: 1,
            unit: 'pz'
        };
    }

    /**
     * Converti ricetta nel formato database
     */
    async convertRecipeFormat(task) {
        const { recipe, foodDatabase } = task;
        
        if (!recipe) {
            throw new Error('Recipe is required');
        }

        // Carica foodDatabase se non fornito
        let foodDb = foodDatabase;
        if (!foodDb) {
            const foodDbPath = path.join(__dirname, '../../zipfile/Healty/src/data/foodDatabase.ts');
            // In produzione, caricheresti da MongoDB o da un file JSON
        }

        // Genera ID univoco
        const recipeId = this.generateRecipeId(recipe.name);

        // Converti ingredienti usando foodDatabase
        const convertedIngredients = recipe.ingredients.map(ing => {
            // Cerca match nel foodDatabase
            const foodMatch = this.findFoodMatch(ing.name, foodDb);
            
            return {
                foodId: foodMatch?.id || ing.name.toLowerCase().replace(/\s+/g, '-'),
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                originalText: `${ing.quantity}${ing.unit} ${ing.name}`
            };
        });

        const convertedRecipe = {
            id: recipeId,
            name: recipe.name,
            description: recipe.description || '',
            difficulty: recipe.difficulty || 'Media',
            prepTime: recipe.prepTime || 0,
            cookTime: recipe.cookTime || 0,
            servings: recipe.servings || 4,
            category: recipe.category || 'primo',
            cuisine: 'italiana', // GialloZafferano è principalmente italiano
            ingredients: convertedIngredients,
            instructions: recipe.instructions || [],
            tags: recipe.tags || [],
            imageUrl: recipe.imageUrl,
            source: recipe.source,
            createdAt: new Date().toISOString()
        };

        return {
            success: true,
            recipe: convertedRecipe
        };
    }

    /**
     * Genera ID univoco per ricetta
     */
    generateRecipeId(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Trova match ingrediente nel foodDatabase
     */
    findFoodMatch(ingredientName, foodDatabase) {
        if (!foodDatabase || !Array.isArray(foodDatabase)) return null;

        const lowerName = ingredientName.toLowerCase();
        
        // Cerca match esatto o parziale
        return foodDatabase.find(food => {
            const foodName = food.name.toLowerCase();
            return foodName === lowerName || 
                   foodName.includes(lowerName) || 
                   lowerName.includes(foodName);
        });
    }

    /**
     * Download immagine ricetta
     */
    async downloadRecipeImage(task) {
        const { imageUrl, recipeId } = task;
        
        if (!imageUrl || !recipeId) {
            throw new Error('Image URL and recipe ID are required');
        }

        try {
            const recipeImageDir = path.join(this.recipeImagesDir, recipeId);
            await fs.mkdir(recipeImageDir, { recursive: true });

            const imagePath = path.join(recipeImageDir, 'main.jpg');
            
            console.log(`[RecipeAgent] Downloading image: ${imageUrl}`);
            
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            await fs.writeFile(imagePath, response.data);

            // Salva URL locale
            const localImageUrl = `/api/recipes/images/${recipeId}/main.jpg`;

            return {
                success: true,
                imagePath,
                localImageUrl,
                originalUrl: imageUrl
            };
        } catch (error) {
            throw new Error(`Failed to download image: ${error.message}`);
        }
    }

    /**
     * Salva ricetta nel database MongoDB
     */
    async saveRecipeToDatabase(task) {
        const { recipe } = task;
        
        if (!recipe) {
            throw new Error('Recipe is required');
        }

        try {
            // Verifica che MongoDB sia disponibile
            if (!this.mongoDB || !process.env.MONGODB_URI) {
                console.warn('[RecipeAgent] MongoDB not configured. Recipe will not be saved to database.');
                return {
                    success: false,
                    error: 'MongoDB not configured',
                    recipe: recipe // Ritorna comunque la ricetta
                };
            }

            // Usa helper MongoDB centralizzato
            const existing = await this.mongoDB.findOne('recipes', { id: recipe.id });
            
            if (existing) {
                // Aggiorna
                await this.mongoDB.updateOne('recipes', { id: recipe.id }, recipe);
                console.log(`[RecipeAgent] Updated recipe: ${recipe.name}`);
                return {
                    success: true,
                    recipeId: recipe.id,
                    action: 'updated'
                };
            } else {
                // Inserisci
                await this.mongoDB.insertOne('recipes', recipe);
                console.log(`[RecipeAgent] Saved recipe: ${recipe.name}`);
                return {
                    success: true,
                    recipeId: recipe.id,
                    action: 'created'
                };
            }
        } catch (error) {
            // Non bloccare il flusso se MongoDB fallisce
            console.error(`[RecipeAgent] Failed to save recipe to database: ${error.message}`);
            return {
                success: false,
                error: error.message,
                recipe: recipe // Ritorna comunque la ricetta
            };
        }
    }

    /**
     * Fetch completa ricetta da GialloZafferano
     */
    async fetchRecipeFromGialloZafferano(task) {
        const { url, saveToDatabase = false, downloadImage = false } = task;
        
        if (!url) {
            throw new Error('Recipe URL is required');
        }

        try {
            // 1. Scraping dettagli
            const scrapeResult = await this.scrapeRecipeDetails({ url });
            let recipe = scrapeResult.recipe;

            // 2. Download immagine se richiesto
            if (downloadImage && recipe.imageUrl) {
                const imageResult = await this.downloadRecipeImage({
                    imageUrl: recipe.imageUrl,
                    recipeId: this.generateRecipeId(recipe.name)
                });
                recipe.localImageUrl = imageResult.localImageUrl;
            }

            // 3. Converti formato
            const convertResult = await this.convertRecipeFormat({ recipe });
            recipe = convertResult.recipe;

            // 4. Salva nel database se richiesto
            if (saveToDatabase) {
                await this.saveRecipeToDatabase({ recipe });
            }

            return {
                success: true,
                recipe,
                url
            };
        } catch (error) {
            throw new Error(`Failed to fetch recipe: ${error.message}`);
        }
    }

    /**
     * Import batch di ricette
     */
    async batchImportRecipes(task) {
        const { urls, saveToDatabase = true, downloadImages = true } = task;
        
        if (!urls || !Array.isArray(urls)) {
            throw new Error('URLs array is required');
        }

        const results = [];
        const errors = [];

        for (const url of urls) {
            try {
                const result = await this.fetchRecipeFromGialloZafferano({
                    url,
                    saveToDatabase,
                    downloadImage: downloadImages
                });
                results.push(result);
            } catch (error) {
                errors.push({ url, error: error.message });
            }
        }

        return {
            success: true,
            imported: results.length,
            failed: errors.length,
            results,
            errors
        };
    }

    /**
     * Recupera una ricetta dal database
     */
    async getRecipeFromDatabase(task) {
        const { recipeId, url } = task;
        
        if (!recipeId && !url) {
            throw new Error('recipeId or url is required');
        }

        try {
            if (!this.mongoDB || !process.env.MONGODB_URI) {
                return {
                    success: false,
                    error: 'MongoDB not configured'
                };
            }

            const query = recipeId ? { id: recipeId } : { url };
            const recipe = await this.mongoDB.findOne('recipes', query);
            
            if (!recipe) {
                return {
                    success: false,
                    error: 'Recipe not found'
                };
            }

            return {
                success: true,
                recipe
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get recipe from database: ${error.message}`
            };
        }
    }

    /**
     * Cerca ricette nel database
     */
    async searchRecipesInDatabase(task) {
        const { query, limit = 20, skip = 0 } = task;
        
        try {
            if (!this.mongoDB || !process.env.MONGODB_URI) {
                return {
                    success: true,
                    recipes: [],
                    total: 0,
                    limit,
                    skip,
                    message: 'MongoDB not configured'
                };
            }

            let searchQuery = {};
            
            // Se c'è un query string, cerca nel nome o negli ingredienti
            if (query) {
                searchQuery = {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { 'ingredients.name': { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } }
                    ]
                };
            }

            const recipes = await this.mongoDB.findMany('recipes', searchQuery, {
                limit,
                skip,
                sort: { createdAt: -1 }
            });

            const total = await this.mongoDB.count('recipes', searchQuery);

            return {
                success: true,
                recipes,
                total,
                limit,
                skip
            };
        } catch (error) {
            console.error(`[RecipeAgent] Search error: ${error.message}`);
            return {
                success: true,
                recipes: [],
                total: 0,
                limit,
                skip,
                error: error.message
            };
        }
    }
}

module.exports = RecipeAgent;

