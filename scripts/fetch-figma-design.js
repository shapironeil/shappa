/**
 * Script semplificato per fetch design Figma
 */
require('dotenv').config({ path: '.env.private' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FIGMA_FILE_KEY = 'Wv47CueEm5hvw1eNfczGfE';
const FIGMA_API_KEY = process.env.FIGMA_API_KEY;

async function fetchFigmaDesign() {
    if (!FIGMA_API_KEY) {
        console.error('❌ FIGMA_API_KEY non trovata in .env.private');
        console.error('Ottieni la chiave su: https://www.figma.com/developers/api#access-tokens');
        return null;
    }

    try {
        console.log('📡 Connessione a Figma API...');
        const response = await axios.get(`https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`, {
            headers: {
                'X-Figma-Token': FIGMA_API_KEY
            }
        });

        const fileData = response.data;
        
        // Salva per analisi
        const dataDir = path.join(__dirname, '../data/figma');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const cachePath = path.join(dataDir, `${FIGMA_FILE_KEY}.json`);
        fs.writeFileSync(cachePath, JSON.stringify(fileData, null, 2));
        
        console.log('✅ Design scaricato!');
        console.log(`📁 Salvato in: ${cachePath}`);
        
        return fileData;
    } catch (error) {
        console.error('❌ Errore:', error.response?.data || error.message);
        return null;
    }
}

if (require.main === module) {
    fetchFigmaDesign();
}

module.exports = { fetchFigmaDesign };

