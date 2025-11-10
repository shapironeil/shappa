/**
 * Script per applicare design Figma alla pagina dieta
 * Usa l'API del server (deve essere in esecuzione)
 */

const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const FILE_KEY = 'rvmn64S4Tj8xmpGzBd6a6T';
const PAGE_NAME = 'dieta';
const PAGE_PATH = 'src/pages/dieta.html';

async function applyFigmaDesign() {
    try {
        console.log('📥 Recuperando design Figma dal server...');
        
        // Prima recupera il file Figma
        const fetchResponse = await axios.post(`${SERVER_URL}/api/figma/fetch`, {
            fileKey: FILE_KEY
        });
        
        console.log('✅ Design Figma recuperato');
        
        // Poi crea/aggiorna la pagina
        console.log('🔄 Applicando design alla pagina dieta...');
        const createResponse = await axios.post(`${SERVER_URL}/api/figma/create-page`, {
            fileKey: FILE_KEY,
            pageName: PAGE_NAME,
            pagePath: PAGE_PATH,
            nodeId: '0-1', // node-id dal URL Figma
            exportAssets: true
        });
        
        console.log('✅ Pagina dieta aggiornata con design Figma!');
        console.log('📋 Risultato:', createResponse.data);
        
    } catch (error) {
        console.error('❌ Errore:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        console.log('\n💡 Assicurati che:');
        console.log('   1. Il server sia in esecuzione (node server.js)');
        console.log('   2. FIGMA_API_KEY sia configurato in .env.private');
    }
}

if (require.main === module) {
    applyFigmaDesign();
}

module.exports = { applyFigmaDesign };

