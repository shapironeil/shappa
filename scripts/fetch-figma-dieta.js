/**
 * Script per recuperare design Figma e applicarlo alla pagina dieta
 * File Key: rvmn64S4Tj8xmpGzBd6a6T
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FIGMA_API_KEY = process.env.FIGMA_API_KEY;
const FILE_KEY = 'rvmn64S4Tj8xmpGzBd6a6T';

async function fetchFigmaDesign() {
    if (!FIGMA_API_KEY) {
        console.error('❌ FIGMA_API_KEY non configurato in .env.private');
        return;
    }

    try {
        console.log('📥 Recuperando design Figma...');
        const response = await axios.get(`https://api.figma.com/v1/files/${FILE_KEY}`, {
            headers: {
                'X-Figma-Token': FIGMA_API_KEY
            }
        });

        const fileData = response.data;
        
        // Salva il design in data/figma
        const dataDir = path.join(__dirname, '../data/figma');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        const outputPath = path.join(dataDir, `${FILE_KEY}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(fileData, null, 2));
        
        console.log('✅ Design Figma salvato in:', outputPath);
        console.log('📋 Nome file:', fileData.name);
        console.log('📄 Document:', fileData.document.name);
        
        return fileData;
    } catch (error) {
        console.error('❌ Errore nel recupero design Figma:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

// Esegui se chiamato direttamente
if (require.main === module) {
    fetchFigmaDesign();
}

module.exports = { fetchFigmaDesign };

