/**
 * Script per applicare il nuovo design Figma alla pagina dieta
 * File Key: qEikXdYIE1SPArKu66qw0m
 * Mantiene tutte le funzioni esistenti (sidebar, ricette, calendario, etc.)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const FILE_KEY = 'qEikXdYIE1SPArKu66qw0m';
const NODE_ID = '0-1';
const PAGE_PATH = 'src/pages/dieta.html';

async function applyFigmaDesign() {
    try {
        console.log('🎨 Recuperando design Figma...');
        console.log(`📋 File Key: ${FILE_KEY}`);
        console.log(`📍 Node ID: ${NODE_ID}`);
        
        // Step 1: Recupera file Figma
        const fetchResponse = await axios.post(`${SERVER_URL}/api/figma/fetch-make-file`, {
            fileKey: FILE_KEY,
            nodeIds: [NODE_ID]
        });

        if (!fetchResponse.data.success) {
            throw new Error('Failed to fetch Figma file: ' + fetchResponse.data.error);
        }

        console.log('✅ Design Figma recuperato');

        // Step 2: Analizza componenti
        console.log('🔍 Analizzando componenti...');
        const analysisResponse = await axios.post(`${SERVER_URL}/api/figma/generate-code`, {
            fileKey: FILE_KEY,
            nodeId: NODE_ID,
            framework: 'html',
            useTailwind: false,
            outputPath: null // Non salvare ancora, vogliamo solo il codice
        });

        if (!analysisResponse.data.success) {
            throw new Error('Failed to generate code: ' + analysisResponse.data.error);
        }

        console.log('✅ Codice generato');

        // Step 3: Leggi pagina esistente per preservare funzioni
        const dietaPath = path.join(__dirname, '..', PAGE_PATH);
        const existingContent = fs.readFileSync(dietaPath, 'utf8');

        // Estrai funzioni JavaScript esistenti
        const jsFunctionsMatch = existingContent.match(/<script>([\s\S]*?)<\/script>/);
        const existingJS = jsFunctionsMatch ? jsFunctionsMatch[1] : '';

        // Estrai sidebar se presente
        const sidebarMatch = existingContent.match(/(<nav class="venus-sidebar"[\s\S]*?<\/nav>)/);
        const sidebar = sidebarMatch ? sidebarMatch[1] : '';

        // Step 4: Genera nuova pagina combinando design Figma + funzioni esistenti
        const figmaHTML = analysisResponse.data.code || '';
        
        // Estrai body content dal design Figma
        const bodyMatch = figmaHTML.match(/<body>([\s\S]*?)<\/body>/);
        const figmaBodyContent = bodyMatch ? bodyMatch[1] : '';

        // Costruisci nuova pagina
        const newPage = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cookin'Shappa - Dieta & Salute</title>
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/venus.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg">
    <!-- 
        Figma Design Reference:
        File: Health-Diet-Dashboard--Copy-
        File Key: ${FILE_KEY}
        URL: https://www.figma.com/make/${FILE_KEY}/Health-Diet-Dashboard--Copy-?node-id=${NODE_ID}
        Design applicato da FigmaAgent
    -->
    <style>
        ${extractCSSFromFigma(figmaHTML)}
        
        /* Mantieni stili esistenti per funzionalità */
        ${extractExistingStyles(existingContent)}
    </style>
</head>
<body>
    <div class="venus-dashboard-layout">
        ${sidebar || generateDefaultSidebar()}
        
        <main class="venus-main-content">
            ${figmaBodyContent}
        </main>
    </div>

    <script>
        ${existingJS}
        
        // Inizializza funzioni dopo caricamento
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof setupCalendar === 'function') setupCalendar();
            if (typeof renderCalendar === 'function') renderCalendar();
            if (typeof loadDinnerRecipes === 'function') {
                // Carica ricette automaticamente
                setTimeout(() => loadDinnerRecipes(), 1000);
            }
        });
    </script>
</body>
</html>`;

        // Step 5: Salva nuova pagina
        fs.writeFileSync(dietaPath, newPage, 'utf8');
        console.log(`✅ Pagina dieta aggiornata: ${dietaPath}`);
        console.log('📝 Design Figma applicato mantenendo tutte le funzioni esistenti');

    } catch (error) {
        console.error('❌ Errore:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        console.log('\n💡 Assicurati che:');
        console.log('   1. Il server sia in esecuzione (node server.js)');
        console.log('   2. FIGMA_API_KEY sia configurato in .env.private');
        process.exit(1);
    }
}

/**
 * Estrae CSS dal HTML generato da Figma
 */
function extractCSSFromFigma(html) {
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    return styleMatch ? styleMatch[1] : '';
}

/**
 * Estrae stili esistenti dalla pagina
 */
function extractExistingStyles(content) {
    const styleMatches = content.match(/<style>([\s\S]*?)<\/style>/g);
    if (!styleMatches) return '';
    
    // Combina tutti gli stili esistenti
    return styleMatches.map(match => {
        const styleContent = match.replace(/<\/?style>/g, '');
        return styleContent;
    }).join('\n');
}

/**
 * Genera sidebar di default se non presente
 */
function generateDefaultSidebar() {
    return `<nav class="venus-sidebar">
        <div class="venus-sidebar-header">
            <div class="venus-logo">
                <span class="venus-logo-text">Cookin'Shappa</span>
            </div>
        </div>
        <div class="venus-sidebar-menu">
            <a href="dashboard.html" class="venus-menu-item">Dashboard</a>
            <a href="dieta.html" class="venus-menu-item active">Dieta</a>
            <a href="sport.html" class="venus-menu-item">Sport</a>
            <a href="interessi.html" class="venus-menu-item">Interessi</a>
            <a href="settings.html" class="venus-menu-item">Impostazioni</a>
        </div>
    </nav>`;
}

if (require.main === module) {
    applyFigmaDesign();
}

module.exports = { applyFigmaDesign };

