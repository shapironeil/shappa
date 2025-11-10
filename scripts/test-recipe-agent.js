/**
 * Script di test per RecipeAgent
 * Testa le funzionalità di ricerca e fetch ricette da GialloZafferano
 */

require('dotenv').config({ path: '.env.private' });
const { initializeAgents } = require('../agents');

async function testRecipeAgent() {
    console.log('🧪 Testing RecipeAgent...\n');

    // Inizializza agenti
    const { coordinator } = initializeAgents({
        recipe: {
            mongoUri: process.env.MONGODB_URI,
            priority: 7
        }
    });

    try {
        // Test 1: Cerca ricette
        console.log('📋 Test 1: Cerca ricette "pasta carbonara"');
        const searchResult = await coordinator.assignTask({
            type: 'search_giallozafferano_recipes',
            query: 'pasta carbonara',
            limit: 5
        });

        if (searchResult.success) {
            console.log(`✅ Trovate ${searchResult.result.recipes.length} ricette`);
            searchResult.result.recipes.slice(0, 3).forEach((recipe, idx) => {
                console.log(`   ${idx + 1}. ${recipe.title}`);
            });
        } else {
            console.log('❌ Errore nella ricerca:', searchResult.error);
            return;
        }

        // Test 2: Fetch ricetta completa (se disponibile)
        if (searchResult.result.recipes.length > 0) {
            const firstRecipe = searchResult.result.recipes[0];
            console.log(`\n📥 Test 2: Fetch ricetta completa: ${firstRecipe.title}`);
            
            const fetchResult = await coordinator.assignTask({
                type: 'fetch_recipe_from_giallozafferano',
                url: firstRecipe.url,
                saveToDatabase: false,
                downloadImage: false
            });

            if (fetchResult.success) {
                const recipe = fetchResult.result.recipe;
                console.log(`✅ Ricetta caricata: ${recipe.name}`);
                console.log(`   - Difficoltà: ${recipe.difficulty}`);
                console.log(`   - Tempo: ${recipe.prepTime + recipe.cookTime} min`);
                console.log(`   - Porzioni: ${recipe.servings}`);
                console.log(`   - Ingredienti: ${recipe.ingredients.length}`);
                console.log(`   - Istruzioni: ${recipe.instructions.length} passaggi`);
            } else {
                console.log('❌ Errore nel fetch:', fetchResult.error);
            }
        }

        console.log('\n✅ Test completati!');

    } catch (error) {
        console.error('❌ Errore durante i test:', error);
    }
}

// Esegui test
if (require.main === module) {
    testRecipeAgent().then(() => {
        console.log('\n🏁 Test terminati');
        process.exit(0);
    }).catch(error => {
        console.error('Errore fatale:', error);
        process.exit(1);
    });
}

module.exports = { testRecipeAgent };

