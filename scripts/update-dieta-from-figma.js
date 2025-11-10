/**
 * Script per aggiornare dieta.html da design Figma
 * File Key: Wv47CueEm5hvw1eNfczGfE
 */

require('dotenv').config({ path: '.env.private' });
const { initializeAgents } = require('../agents');
const fs = require('fs');
const path = require('path');

const FIGMA_FILE_KEY = 'Wv47CueEm5hvw1eNfczGfE';
const NODE_ID = '0-1';
const OUTPUT_PATH = path.join(__dirname, '../src/pages/dieta.html');

async function updateDietaFromFigma() {
    console.log('🎨 Analizzando design Figma...');
    console.log(`File Key: ${FIGMA_FILE_KEY}`);
    
    // Inizializza agenti
    const { coordinator } = initializeAgents({
        figma: {
            figmaApiKey: process.env.FIGMA_API_KEY
        }
    });

    try {
        // 1. Analizza design Figma
        console.log('\n📊 Step 1: Analisi componenti Figma...');
        const analysisResult = await coordinator.assignTask({
            type: 'analyze_figma_components',
            fileKey: FIGMA_FILE_KEY,
            nodeId: NODE_ID
        });

        console.log('✅ Componenti trovati:', analysisResult.components.length);
        console.log('📋 Analisi:', JSON.stringify(analysisResult.analysis, null, 2));

        // 2. Genera codice HTML/CSS dal design
        console.log('\n💻 Step 2: Generazione codice da design...');
        const codeResult = await coordinator.assignTask({
            type: 'generate_frontend_code',
            fileKey: FIGMA_FILE_KEY,
            nodeId: NODE_ID,
            pageName: 'dieta',
            outputPath: OUTPUT_PATH
        });

        console.log('✅ Codice generato!');
        console.log(`📁 Path: ${codeResult.outputPath}`);

        // 3. Aggiorna pagina esistente mantenendo logica JS
        console.log('\n🔄 Step 3: Aggiornamento pagina esistente...');
        const existingContent = fs.readFileSync(OUTPUT_PATH, 'utf8');
        
        // Estrai script esistente
        const scriptMatch = existingContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
        const scripts = scriptMatch || [];
        
        // Combina nuovo HTML con script esistenti
        let newHTML = codeResult.code.html;
        
        // Aggiungi script esistenti prima di </body>
        if (scripts.length > 0) {
            const scriptsHTML = scripts.join('\n');
            newHTML = newHTML.replace('</body>', `\n${scriptsHTML}\n</body>`);
        }

        // Aggiungi CSS generato
        if (codeResult.code.css) {
            newHTML = newHTML.replace('</head>', `<style>${codeResult.code.css}</style>\n</head>`);
        }

        // Salva file aggiornato
        fs.writeFileSync(OUTPUT_PATH, newHTML, 'utf8');
        
        console.log('✅ Pagina aggiornata con successo!');
        console.log(`📄 File: ${OUTPUT_PATH}`);

        return {
            success: true,
            filePath: OUTPUT_PATH,
            components: codeResult.components,
            analysis: analysisResult.analysis
        };

    } catch (error) {
        console.error('❌ Errore:', error.message);
        
        if (error.message.includes('API key')) {
            console.error('\n⚠️  FIGMA_API_KEY non configurata!');
            console.error('Aggiungi FIGMA_API_KEY a .env.private');
            console.error('Ottieni la chiave su: https://www.figma.com/developers/api#access-tokens');
        }
        
        throw error;
    }
}

// Esegui script
if (require.main === module) {
    updateDietaFromFigma()
        .then(result => {
            console.log('\n✨ Completato!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Errore:', error);
            process.exit(1);
        });
}

module.exports = { updateDietaFromFigma };

