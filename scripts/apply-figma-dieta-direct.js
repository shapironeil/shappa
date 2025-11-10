/**
 * Script per applicare design Figma direttamente alla pagina dieta
 * Usa API Figma direttamente senza passare dal server
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.private') });

const FIGMA_API_KEY = process.env.FIGMA_API_KEY;
const FILE_KEY = 'qEikXdYIE1SPArKu66qw0m';
const NODE_ID = '0-1';
const PAGE_PATH = 'src/pages/dieta.html';

async function applyFigmaDesign() {
    if (!FIGMA_API_KEY) {
        console.error('❌ FIGMA_API_KEY non configurato in .env.private');
        process.exit(1);
    }

    try {
        console.log('🎨 Recuperando design Figma...');
        console.log(`📋 File Key: ${FILE_KEY}`);
        console.log(`📍 Node ID: ${NODE_ID}`);

        // Step 1: Recupera file Figma
        const figmaUrl = `https://api.figma.com/v1/files/${FILE_KEY}${NODE_ID ? `?ids=${NODE_ID}` : ''}`;
        const figmaResponse = await axios.get(figmaUrl, {
            headers: {
                'X-Figma-Token': FIGMA_API_KEY
            }
        });

        const fileData = figmaResponse.data;
        console.log('✅ Design Figma recuperato');
        console.log(`📄 File: ${fileData.name}`);

        // Step 2: Salva file data per analisi
        const dataDir = path.join(__dirname, '..', 'data', 'figma');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(
            path.join(dataDir, `${FILE_KEY}.json`),
            JSON.stringify(fileData, null, 2),
            'utf8'
        );

        // Step 3: Usa FigmaAgent per generare codice
        const FigmaAgent = require('../agents/figma/FigmaAgent');
        const figmaAgent = new FigmaAgent({ figmaApiKey: FIGMA_API_KEY });

        console.log('🔍 Analizzando componenti...');
        const analysisResult = await figmaAgent.processTask({
            type: 'analyze_figma_components',
            fileKey: FILE_KEY,
            nodeId: NODE_ID
        });

        console.log(`✅ Trovati ${analysisResult.components.length} componenti`);

        // Step 4: Genera codice
        console.log('💻 Generando codice HTML/CSS...');
        const codeResult = await figmaAgent.processTask({
            type: 'generate_frontend_code',
            fileKey: FILE_KEY,
            nodeId: NODE_ID,
            pageName: 'dieta'
        });

        console.log('✅ Codice generato');

        // Step 5: Leggi pagina esistente per preservare funzioni
        const dietaPath = path.join(__dirname, '..', PAGE_PATH);
        const existingContent = fs.readFileSync(dietaPath, 'utf8');

        // Estrai funzioni JavaScript esistenti
        const jsMatches = existingContent.match(/<script>([\s\S]*?)<\/script>/g);
        const existingJS = jsMatches ? jsMatches.map(m => m.replace(/<\/?script>/g, '')).join('\n\n') : '';

        // Estrai sidebar
        const sidebarMatch = existingContent.match(/(<nav class="venus-sidebar"[\s\S]*?<\/nav>)/);
        const sidebar = sidebarMatch ? sidebarMatch[1] : generateDefaultSidebar();

        // Estrai stili esistenti (escludendo quelli generati da Figma)
        const existingStyles = extractExistingStyles(existingContent);

        // Step 6: Costruisci nuova pagina
        const figmaHTML = codeResult.code.html;
        const figmaCSS = codeResult.code.css;
        
        // Estrai body content dal design Figma
        const bodyMatch = figmaHTML.match(/<body>([\s\S]*?)<\/body>/);
        let figmaBodyContent = bodyMatch ? bodyMatch[1] : '';
        
        // Rimuovi script e style tags dal body se presenti
        figmaBodyContent = figmaBodyContent
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '');

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
        Design applicato da FigmaAgent - ${new Date().toISOString()}
    -->
    <style>
        /* Reset e Base */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: var(--venus-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
            background: linear-gradient(to bottom right, #f0fdf4, #eff6ff, #faf5ff);
            min-height: 100vh;
            color: var(--venus-text-primary, #1f2937);
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        /* Venus Dashboard Layout */
        .venus-dashboard-layout {
            display: flex;
            height: 100vh;
            background: linear-gradient(to bottom right, #f0fdf4, #eff6ff, #faf5ff);
        }

        .venus-main-content {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
        }

        /* Figma Generated Styles */
        ${figmaCSS}

        /* Existing Functionality Styles */
        ${existingStyles}
    </style>
</head>
<body>
    <div class="venus-dashboard-layout">
        ${sidebar}
        
        <main class="venus-main-content">
            ${figmaBodyContent}
        </main>
    </div>

    <script>
        ${existingJS}
        
        // Inizializza funzioni dopo caricamento
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🎨 Pagina dieta caricata con design Figma');
            
            // Inizializza funzioni esistenti
            if (typeof setupCalendar === 'function') {
                setupCalendar();
                renderCalendar();
            }
            
            if (typeof loadDinnerRecipes === 'function') {
                // Carica ricette automaticamente dopo 1 secondo
                setTimeout(() => {
                    console.log('🍽️ Caricamento ricette...');
                    loadDinnerRecipes();
                }, 1000);
            }
        });
    </script>
</body>
</html>`;

        // Step 7: Salva nuova pagina
        fs.writeFileSync(dietaPath, newPage, 'utf8');
        console.log(`✅ Pagina dieta aggiornata: ${dietaPath}`);
        console.log('📝 Design Figma applicato mantenendo tutte le funzioni esistenti');
        console.log(`📊 Componenti generati: ${codeResult.components}`);

    } catch (error) {
        console.error('❌ Errore:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

/**
 * Estrae stili esistenti dalla pagina (escludendo reset/base)
 */
function extractExistingStyles(content) {
    const styleMatches = content.match(/<style>([\s\S]*?)<\/style>/g);
    if (!styleMatches) return '';
    
    let styles = '';
    styleMatches.forEach(match => {
        const styleContent = match.replace(/<\/?style>/g, '');
        // Escludi reset e base styles, mantieni solo funzionalità specifiche
        if (!styleContent.includes('box-sizing: border-box') && 
            !styleContent.includes('Reset e Base')) {
            styles += styleContent + '\n';
        }
    });
    
    return styles;
}

/**
 * Genera sidebar di default
 */
function generateDefaultSidebar() {
    return `<nav class="venus-sidebar" style="width: 240px; min-width: 240px; background: var(--venus-bg-card, white); border-right: 1px solid var(--venus-border, #e5e7eb); display: flex !important; flex-direction: column; height: 100vh; position: relative; z-index: 100; flex-shrink: 0;">
        <div class="venus-sidebar-header" style="padding: 20px 16px; border-bottom: 1px solid var(--venus-border, #e5e7eb);">
            <div class="venus-logo" style="display: flex; align-items: center; justify-content: center;">
                <span class="venus-logo-text" style="font-size: 20px; font-weight: 700; color: var(--venus-text-primary, #1f2937);">Cookin'Shappa</span>
            </div>
        </div>
        <div class="venus-sidebar-menu" style="flex: 1; padding: 8px 0; overflow-y: auto;">
            <a href="dashboard.html" class="venus-menu-item" style="display: flex; align-items: center; padding: 10px 16px; margin: 2px 8px; border-radius: 6px; color: var(--venus-text-secondary, #6b7280); text-decoration: none; font-size: 14px; font-weight: 500;">Dashboard</a>
            <a href="dieta.html" class="venus-menu-item active" style="display: flex; align-items: center; padding: 10px 16px; margin: 2px 8px; border-radius: 6px; background: var(--venus-bg-gray, #f3f4f6); color: var(--venus-text-primary, #1f2937); text-decoration: none; font-size: 14px; font-weight: 500;">Dieta</a>
            <a href="sport.html" class="venus-menu-item" style="display: flex; align-items: center; padding: 10px 16px; margin: 2px 8px; border-radius: 6px; color: var(--venus-text-secondary, #6b7280); text-decoration: none; font-size: 14px; font-weight: 500;">Sport</a>
            <a href="interessi.html" class="venus-menu-item" style="display: flex; align-items: center; padding: 10px 16px; margin: 2px 8px; border-radius: 6px; color: var(--venus-text-secondary, #6b7280); text-decoration: none; font-size: 14px; font-weight: 500;">Interessi</a>
            <a href="settings.html" class="venus-menu-item" style="display: flex; align-items: center; padding: 10px 16px; margin: 2px 8px; border-radius: 6px; color: var(--venus-text-secondary, #6b7280); text-decoration: none; font-size: 14px; font-weight: 500;">Impostazioni</a>
        </div>
    </nav>`;
}

if (require.main === module) {
    applyFigmaDesign();
}

module.exports = { applyFigmaDesign };

