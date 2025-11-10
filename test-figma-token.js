/**
 * Test script per verificare che il token Figma funzioni
 * 
 * Esegui: node test-figma-token.js
 */

require('dotenv').config();
const axios = require('axios');

async function testFigmaToken() {
    console.log('🧪 Test Token Figma API\n');
    
    const token = process.env.FIGMA_API_KEY;
    
    if (!token) {
        console.error('❌ FIGMA_API_KEY non trovato nel file .env');
        console.log('\n📝 Aggiungi al file .env:');
        console.log('FIGMA_API_KEY=your_figma_api_key_here\n');
        return;
    }
    
    console.log('✅ Token trovato:', token.substring(0, 15) + '...');
    console.log('🔄 Test connessione API Figma...\n');
    
    try {
        // Test 1: Verifica token (endpoint /me)
        const meResponse = await axios.get('https://api.figma.com/v1/me', {
            headers: {
                'X-Figma-Token': token
            }
        });
        
        console.log('✅ Token valido!');
        console.log('👤 Email:', meResponse.data.email);
        console.log('🆔 User ID:', meResponse.data.id);
        console.log('📸 Avatar:', meResponse.data.img_url || 'N/A');
        console.log('\n🎉 Il token funziona correttamente!');
        console.log('\n💡 Ora puoi usare il sistema Agent AI per creare pagine da Figma!');
        
    } catch (error) {
        if (error.response) {
            console.error('❌ Errore API Figma:');
            console.error('   Status:', error.response.status);
            console.error('   Message:', error.response.data?.message || error.message);
            
            if (error.response.status === 403) {
                console.error('\n⚠️ Token non valido o scaduto');
                console.error('   Vai su https://www.figma.com/settings/security');
                console.error('   e rigenera il token');
            } else if (error.response.status === 401) {
                console.error('\n⚠️ Token non autorizzato');
                console.error('   Verifica che il token sia corretto');
            }
        } else {
            console.error('❌ Errore di connessione:', error.message);
        }
    }
}

// Test anche se il file è eseguito direttamente
if (require.main === module) {
    testFigmaToken();
}

module.exports = { testFigmaToken };

