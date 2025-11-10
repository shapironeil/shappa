/**
 * Test accesso file Figma (inclusi template /make/)
 */
require('dotenv').config({ path: '.env.private' });
const axios = require('axios');

const FIGMA_FILE_KEY = 'Wv47CueEm5hvw1eNfczGfE';
const FIGMA_API_KEY = process.env.FIGMA_API_KEY;

async function testFileAccess() {
    if (!FIGMA_API_KEY) {
        console.error('❌ FIGMA_API_KEY non trovata');
        return;
    }

    console.log('🔑 Token valido!');
    console.log('📁 File Key:', FIGMA_FILE_KEY);
    console.log('');

    // Tentativo 1: Endpoint files standard
    try {
        console.log('📡 Tentativo 1: Endpoint /files/...');
        const response = await axios.get(`https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`, {
            headers: { 'X-Figma-Token': FIGMA_API_KEY }
        });
        
        console.log('✅ File accessibile!');
        console.log('Nome:', response.data.name);
        console.log('Ultima modifica:', response.data.lastModified);
        return response.data;
    } catch (error1) {
        const errMsg = error1.response?.data?.err || error1.message;
        console.log('❌ Errore:', errMsg);
        
        if (errMsg.includes('File type not supported')) {
            console.log('');
            console.log('⚠️  Questo è un file template Figma (/make/)');
            console.log('📋 Per accedere via API, devi:');
            console.log('   1. Aprire il template in Figma');
            console.log('   2. Duplicarlo (File > Duplicate)');
            console.log('   3. Usare il fileKey del file duplicato');
            console.log('');
            console.log('💡 Alternativa: Posso creare la pagina basandomi su');
            console.log('   best practices per dashboard dieta/salute moderne');
        }
    }
}

testFileAccess().catch(console.error);

