/**
 * FigmaAgent - Gestisce integrazione con Figma
 * 
 * Responsabile di:
 * - Connettersi all'API Figma
 * - Leggere design e componenti da Figma
 * - Analizzare strutture UI
 * - Generare codice frontend basato su design
 * - Collega design a funzionalità backend
 * - Gestire versioning dei design
 */

const AgentBase = require('../base/AgentBase');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FigmaAgent extends AgentBase {
    constructor(config = {}) {
        super('FigmaAgent', {
            priority: 8,
            ...config
        });

        this.capabilities = [
            'fetch_figma_file',
            'analyze_figma_components',
            'generate_frontend_code',
            'link_figma_to_backend',
            'sync_figma_design',
            'export_figma_assets',
            'create_page_from_figma'
        ];

        // Configurazione Figma API
        this.figmaApiKey = process.env.FIGMA_API_KEY || config.figmaApiKey;
        this.figmaApiBase = 'https://api.figma.com/v1';
        this.figmaDataDir = path.join(__dirname, '../../data/figma');
        this.ensureFigmaDataDir();
    }

    /**
     * Assicura che la directory dati Figma esista
     */
    ensureFigmaDataDir() {
        if (!fs.existsSync(this.figmaDataDir)) {
            fs.mkdirSync(this.figmaDataDir, { recursive: true });
        }
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const figmaTasks = [
            'fetch_figma_file',
            'analyze_figma_components',
            'generate_frontend_code',
            'link_figma_to_backend',
            'sync_figma_design',
            'export_figma_assets',
            'create_page_from_figma',
            'update_page_from_figma',
            'get_figma_file_info'
        ];

        return figmaTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        if (!this.figmaApiKey) {
            throw new Error('Figma API key not configured. Set FIGMA_API_KEY environment variable.');
        }

        switch (task.type) {
            case 'fetch_figma_file':
                return await this.fetchFigmaFile(task);
            
            case 'analyze_figma_components':
                return await this.analyzeFigmaComponents(task);
            
            case 'generate_frontend_code':
                return await this.generateFrontendCode(task);
            
            case 'link_figma_to_backend':
                return await this.linkFigmaToBackend(task);
            
            case 'sync_figma_design':
                return await this.syncFigmaDesign(task);
            
            case 'export_figma_assets':
                return await this.exportFigmaAssets(task);
            
            case 'create_page_from_figma':
                return await this.createPageFromFigma(task);
            
            case 'update_page_from_figma':
                return await this.updatePageFromFigma(task);
            
            case 'get_figma_file_info':
                return await this.getFigmaFileInfo(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Recupera file Figma
     */
    async fetchFigmaFile(task) {
        const { fileKey, nodeIds } = task;
        
        if (!fileKey) {
            throw new Error('fileKey required');
        }

        try {
            const url = `${this.figmaApiBase}/files/${fileKey}${nodeIds ? `?ids=${nodeIds.join(',')}` : ''}`;
            const response = await axios.get(url, {
                headers: {
                    'X-Figma-Token': this.figmaApiKey
                }
            });

            const fileData = response.data;
            
            // Salva file data per cache
            const cachePath = path.join(this.figmaDataDir, `${fileKey}.json`);
            fs.writeFileSync(cachePath, JSON.stringify(fileData, null, 2));
            
            this.emit('figmaFileFetched', { fileKey, fileData });
            
            return {
                success: true,
                fileKey,
                fileData,
                cached: true
            };
        } catch (error) {
            throw new Error(`Failed to fetch Figma file: ${error.message}`);
        }
    }

    /**
     * Analizza componenti Figma
     */
    async analyzeFigmaComponents(task) {
        const { fileKey, nodeId } = task;
        
        if (!fileKey) {
            throw new Error('fileKey required');
        }

        // Recupera file se non in cache
        const cachePath = path.join(this.figmaDataDir, `${fileKey}.json`);
        let fileData;
        
        if (fs.existsSync(cachePath)) {
            fileData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        } else {
            const fetchResult = await this.fetchFigmaFile({ fileKey });
            fileData = fetchResult.fileData;
        }

        // Analizza componenti
        const components = this.extractComponents(fileData, nodeId);
        const analysis = this.analyzeComponentsStructure(components);
        
        return {
            success: true,
            components,
            analysis,
            fileKey
        };
    }

    /**
     * Estrae componenti dal file Figma
     */
    extractComponents(fileData, targetNodeId = null) {
        const components = [];
        
        const traverse = (node) => {
            if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
                components.push({
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    properties: node.componentProperties || {},
                    styles: this.extractStyles(node),
                    children: node.children ? node.children.map(child => traverse(child)).filter(Boolean) : []
                });
            }
            
            if (node.children) {
                node.children.forEach(child => traverse(child));
            }
        };

        if (targetNodeId) {
            // Cerca nodo specifico
            const findNode = (node, id) => {
                if (node.id === id) return node;
                if (node.children) {
                    for (const child of node.children) {
                        const found = findNode(child, id);
                        if (found) return found;
                    }
                }
                return null;
            };
            
            const targetNode = findNode(fileData.document, targetNodeId);
            if (targetNode) {
                traverse(targetNode);
            }
        } else {
            traverse(fileData.document);
        }

        return components;
    }

    /**
     * Estrae stili da un nodo Figma
     */
    extractStyles(node) {
        const styles = {
            layout: node.layoutMode || 'NONE',
            padding: node.paddingLeft || 0,
            gap: node.itemSpacing || 0,
            fills: node.fills || [],
            strokes: node.strokes || [],
            effects: node.effects || [],
            cornerRadius: node.cornerRadius || 0,
            opacity: node.opacity !== undefined ? node.opacity : 1
        };

        // Estrai dimensioni
        if (node.absoluteBoundingBox) {
            styles.width = node.absoluteBoundingBox.width;
            styles.height = node.absoluteBoundingBox.height;
        }

        // Estrai typography
        if (node.style) {
            styles.typography = {
                fontFamily: node.style.fontFamily,
                fontSize: node.style.fontSize,
                fontWeight: node.style.fontWeight,
                lineHeight: node.style.lineHeightPx,
                textAlign: node.style.textAlign
            };
        }

        return styles;
    }

    /**
     * Analizza struttura componenti
     */
    analyzeComponentsStructure(components) {
        const analysis = {
            totalComponents: components.length,
            componentTypes: {},
            layouts: {},
            interactiveElements: [],
            dataRequirements: []
        };

        components.forEach(component => {
            // Conta tipi di componenti
            analysis.componentTypes[component.type] = 
                (analysis.componentTypes[component.type] || 0) + 1;

            // Analizza layout
            if (component.styles.layout !== 'NONE') {
                analysis.layouts[component.styles.layout] = 
                    (analysis.layouts[component.styles.layout] || 0) + 1;
            }

            // Identifica elementi interattivi (buttons, inputs, etc.)
            if (component.name.toLowerCase().includes('button') ||
                component.name.toLowerCase().includes('input') ||
                component.name.toLowerCase().includes('form')) {
                analysis.interactiveElements.push({
                    id: component.id,
                    name: component.name,
                    type: this.guessElementType(component.name)
                });
            }

            // Identifica requisiti dati
            if (component.name.toLowerCase().includes('list') ||
                component.name.toLowerCase().includes('table') ||
                component.name.toLowerCase().includes('card')) {
                analysis.dataRequirements.push({
                    componentId: component.id,
                    componentName: component.name,
                    suggestedEndpoint: this.suggestEndpoint(component.name)
                });
            }
        });

        return analysis;
    }

    /**
     * Indovina tipo di elemento da nome
     */
    guessElementType(name) {
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes('button') || lowerName.includes('btn')) {
            return 'button';
        } else if (lowerName.includes('input') || lowerName.includes('textfield')) {
            return 'input';
        } else if (lowerName.includes('select') || lowerName.includes('dropdown')) {
            return 'select';
        } else if (lowerName.includes('checkbox')) {
            return 'checkbox';
        } else if (lowerName.includes('radio')) {
            return 'radio';
        } else if (lowerName.includes('card')) {
            return 'card';
        } else if (lowerName.includes('modal') || lowerName.includes('dialog')) {
            return 'modal';
        }
        
        return 'div';
    }

    /**
     * Suggerisce endpoint basato su nome componente
     */
    suggestEndpoint(componentName) {
        const lowerName = componentName.toLowerCase();
        
        // Mappa nomi comuni a endpoint
        const endpointMap = {
            'product': '/api/products',
            'user': '/api/users',
            'sport': '/api/sport',
            'workout': '/api/sport/workout',
            'interest': '/api/interests',
            'monitor': '/api/monitors',
            'dashboard': '/api/dashboard',
            'settings': '/api/settings'
        };

        for (const [key, endpoint] of Object.entries(endpointMap)) {
            if (lowerName.includes(key)) {
                return endpoint;
            }
        }

        return '/api/data';
    }

    /**
     * Genera codice frontend da design Figma
     */
    async generateFrontendCode(task) {
        const { fileKey, nodeId, pageName, outputPath } = task;
        
        if (!fileKey) {
            throw new Error('fileKey required');
        }

        // Analizza componenti
        const analysisResult = await this.analyzeFigmaComponents({ fileKey, nodeId });
        const { components, analysis } = analysisResult;

        // Genera codice HTML/CSS/JS
        const code = this.generateCodeFromComponents(components, analysis, pageName);
        
        // Salva codice se outputPath specificato
        if (outputPath) {
            const fullPath = path.join(__dirname, '../../', outputPath);
            const dir = path.dirname(fullPath);
            
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, code.html, 'utf8');
            
            // Salva CSS se presente
            if (code.css) {
                const cssPath = fullPath.replace('.html', '.css');
                fs.writeFileSync(cssPath, code.css, 'utf8');
            }
            
            // Salva JS se presente
            if (code.js) {
                const jsPath = fullPath.replace('.html', '.js');
                fs.writeFileSync(jsPath, code.js, 'utf8');
            }
        }
        
        this.emit('frontendCodeGenerated', { fileKey, nodeId, code });
        
        return {
            success: true,
            code,
            components: components.length,
            outputPath: outputPath || null
        };
    }

    /**
     * Genera codice da componenti
     */
    generateCodeFromComponents(components, analysis, pageName = 'page') {
        const htmlParts = [];
        const cssParts = [];
        const jsParts = [];

        // Genera HTML
        htmlParts.push('<!DOCTYPE html>');
        htmlParts.push('<html lang="it">');
        htmlParts.push('<head>');
        htmlParts.push('    <meta charset="UTF-8">');
        htmlParts.push('    <meta name="viewport" content="width=device-width, initial-scale=1.0">');
        htmlParts.push(`    <title>${pageName}</title>`);
        htmlParts.push(`    <link rel="stylesheet" href="${pageName}.css">`);
        htmlParts.push('</head>');
        htmlParts.push('<body>');

        // Genera componenti
        components.forEach(component => {
            const componentCode = this.generateComponentCode(component);
            htmlParts.push(componentCode.html);
            cssParts.push(componentCode.css);
            jsParts.push(componentCode.js);
        });

        htmlParts.push(`    <script src="${pageName}.js"></script>`);
        htmlParts.push('</body>');
        htmlParts.push('</html>');

        return {
            html: htmlParts.join('\n'),
            css: cssParts.join('\n'),
            js: jsParts.join('\n')
        };
    }

    /**
     * Genera codice per un singolo componente
     */
    generateComponentCode(component) {
        const elementType = this.guessElementType(component.name);
        const className = this.sanitizeClassName(component.name);
        
        const html = `    <${elementType} class="${className}" data-component-id="${component.id}">${component.name}</${elementType}>`;
        
        const css = this.generateComponentCSS(component, className);
        const js = this.generateComponentJS(component, className);
        
        return { html, css, js };
    }

    /**
     * Genera CSS per componente
     */
    generateComponentCSS(component, className) {
        const styles = component.styles;
        const cssParts = [];
        
        cssParts.push(`.${className} {`);
        
        if (styles.width) {
            cssParts.push(`    width: ${styles.width}px;`);
        }
        if (styles.height) {
            cssParts.push(`    height: ${styles.height}px;`);
        }
        if (styles.padding) {
            cssParts.push(`    padding: ${styles.padding}px;`);
        }
        if (styles.cornerRadius) {
            cssParts.push(`    border-radius: ${styles.cornerRadius}px;`);
        }
        if (styles.opacity !== undefined) {
            cssParts.push(`    opacity: ${styles.opacity};`);
        }
        
        // Layout
        if (styles.layout === 'HORIZONTAL') {
            cssParts.push('    display: flex;');
            cssParts.push('    flex-direction: row;');
        } else if (styles.layout === 'VERTICAL') {
            cssParts.push('    display: flex;');
            cssParts.push('    flex-direction: column;');
        }
        
        if (styles.gap) {
            cssParts.push(`    gap: ${styles.gap}px;`);
        }
        
        // Typography
        if (styles.typography) {
            const typo = styles.typography;
            if (typo.fontFamily) {
                cssParts.push(`    font-family: ${typo.fontFamily};`);
            }
            if (typo.fontSize) {
                cssParts.push(`    font-size: ${typo.fontSize}px;`);
            }
            if (typo.fontWeight) {
                cssParts.push(`    font-weight: ${typo.fontWeight};`);
            }
            if (typo.lineHeight) {
                cssParts.push(`    line-height: ${typo.lineHeight}px;`);
            }
            if (typo.textAlign) {
                cssParts.push(`    text-align: ${typo.textAlign.toLowerCase()};`);
            }
        }
        
        cssParts.push('}');
        
        return cssParts.join('\n');
    }

    /**
     * Genera JS per componente
     */
    generateComponentJS(component, className) {
        const elementType = this.guessElementType(component.name);
        const jsParts = [];
        
        // Aggiungi event listeners per elementi interattivi
        if (elementType === 'button') {
            jsParts.push(`document.querySelector('.${className}')?.addEventListener('click', function() {`);
            jsParts.push(`    console.log('${component.name} clicked');`);
            jsParts.push(`    // TODO: Implement click handler`);
            jsParts.push(`});`);
        } else if (elementType === 'input') {
            jsParts.push(`document.querySelector('.${className}')?.addEventListener('input', function(e) {`);
            jsParts.push(`    console.log('${component.name} input:', e.target.value);`);
            jsParts.push(`    // TODO: Implement input handler`);
            jsParts.push(`});`);
        }
        
        return jsParts.join('\n');
    }

    /**
     * Sanitizza nome per classe CSS
     */
    sanitizeClassName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Collega design Figma a backend
     */
    async linkFigmaToBackend(task) {
        const { fileKey, nodeId, backendConfig } = task;
        
        if (!fileKey || !backendConfig) {
            throw new Error('fileKey and backendConfig required');
        }

        // Analizza componenti
        const analysisResult = await this.analyzeFigmaComponents({ fileKey, nodeId });
        const { analysis } = analysisResult;

        // Collega componenti a endpoint backend
        const links = analysis.dataRequirements.map(req => {
            const endpoint = backendConfig.endpoints && backendConfig.endpoints[req.componentName] 
                ? backendConfig.endpoints[req.componentName]
                : req.suggestedEndpoint;
            
            return {
                componentId: req.componentId,
                componentName: req.componentName,
                endpoint,
                method: backendConfig.method || 'GET',
                dataMapping: this.generateDataMapping(req.componentName, endpoint)
            };
        });

        // Genera codice di integrazione
        const integrationCode = this.generateIntegrationCode(links, backendConfig);

        this.emit('figmaLinkedToBackend', { fileKey, links, integrationCode });
        
        return {
            success: true,
            links,
            integrationCode,
            componentsLinked: links.length
        };
    }

    /**
     * Genera data mapping
     */
    generateDataMapping(componentName, endpoint) {
        // Mappa comune di mapping dati
        const mapping = {
            userId: 'user.id',
            timestamp: 'new Date().toISOString()',
            page: 'window.location.pathname'
        };

        // Aggiungi mapping specifici basati su endpoint
        if (endpoint.includes('/api/sport')) {
            mapping.workoutId = 'workout.id';
            mapping.exercises = 'workout.exercises';
        } else if (endpoint.includes('/api/products')) {
            mapping.asin = 'product.asin';
            mapping.price = 'product.price';
        } else if (endpoint.includes('/api/interests')) {
            mapping.interestId = 'interest.id';
            mapping.url = 'interest.url';
        }

        return mapping;
    }

    /**
     * Genera codice di integrazione
     */
    generateIntegrationCode(links, backendConfig) {
        const apiBase = backendConfig.apiBase || 'https://shapiro.ninja';
        const jsParts = [];

        jsParts.push('// Auto-generated integration code from Figma');
        jsParts.push(`const API_BASE = '${apiBase}';`);
        jsParts.push('');

        links.forEach(link => {
            const functionName = `load${this.sanitizeClassName(link.componentName).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
            
            jsParts.push(`async function ${functionName}() {`);
            jsParts.push(`    try {`);
            jsParts.push(`        const response = await fetch(\`\${API_BASE}${link.endpoint}\`);`);
            jsParts.push(`        const data = await response.json();`);
            jsParts.push(`        `);
            jsParts.push(`        // Update component with data`);
            jsParts.push(`        const component = document.querySelector('[data-component-id="${link.componentId}"]');`);
            jsParts.push(`        if (component && data.success) {`);
            jsParts.push(`            // TODO: Render data in component`);
            jsParts.push(`            console.log('Data loaded for ${link.componentName}:', data);`);
            jsParts.push(`        }`);
            jsParts.push(`    } catch (error) {`);
            jsParts.push(`        console.error('Error loading ${link.componentName}:', error);`);
            jsParts.push(`    }`);
            jsParts.push(`}`);
            jsParts.push('');
        });

        jsParts.push('// Initialize on page load');
        jsParts.push('document.addEventListener("DOMContentLoaded", function() {');
        links.forEach(link => {
            const functionName = `load${this.sanitizeClassName(link.componentName).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
            jsParts.push(`    ${functionName}();`);
        });
        jsParts.push('});');

        return jsParts.join('\n');
    }

    /**
     * Sincronizza design Figma
     */
    async syncFigmaDesign(task) {
        const { fileKey, nodeId } = task;
        
        // Recupera ultima versione da Figma
        const fileResult = await this.fetchFigmaFile({ fileKey });
        
        // Analizza cambiamenti
        const analysisResult = await this.analyzeFigmaComponents({ fileKey, nodeId });
        
        this.emit('figmaDesignSynced', { fileKey, fileData: fileResult.fileData });
        
        return {
            success: true,
            fileKey,
            syncedAt: new Date().toISOString(),
            components: analysisResult.components.length
        };
    }

    /**
     * Esporta assets da Figma
     */
    async exportFigmaAssets(task) {
        const { fileKey, nodeIds, format = 'png', scale = 2 } = task;
        
        if (!fileKey || !nodeIds || nodeIds.length === 0) {
            throw new Error('fileKey and nodeIds required');
        }

        try {
            const url = `${this.figmaApiBase}/images/${fileKey}`;
            const params = {
                ids: nodeIds.join(','),
                format,
                scale
            };

            const response = await axios.get(url, {
                params,
                headers: {
                    'X-Figma-Token': this.figmaApiKey
                }
            });

            const images = response.data.images;
            
            // Salva immagini
            const assetsDir = path.join(this.figmaDataDir, 'assets', fileKey);
            if (!fs.existsSync(assetsDir)) {
                fs.mkdirSync(assetsDir, { recursive: true });
            }

            const exportedAssets = [];
            for (const [nodeId, imageUrl] of Object.entries(images)) {
                const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                const imagePath = path.join(assetsDir, `${nodeId}.${format}`);
                fs.writeFileSync(imagePath, imageResponse.data);
                exportedAssets.push({ nodeId, path: imagePath, url: imageUrl });
            }
            
            this.emit('figmaAssetsExported', { fileKey, assets: exportedAssets });
            
            return {
                success: true,
                assets: exportedAssets,
                count: exportedAssets.length
            };
        } catch (error) {
            throw new Error(`Failed to export Figma assets: ${error.message}`);
        }
    }

    /**
     * Crea pagina da design Figma
     */
    async createPageFromFigma(task) {
        const { fileKey, nodeId, pageName, pagePath, backendConfig } = task;
        
        if (!fileKey || !pageName) {
            throw new Error('fileKey and pageName required');
        }

        // Genera codice frontend
        const codeResult = await this.generateFrontendCode({
            fileKey,
            nodeId,
            pageName,
            outputPath: pagePath || `src/pages/${pageName}.html`
        });

        // Collega a backend se config fornita
        let integrationCode = null;
        if (backendConfig) {
            const linkResult = await this.linkFigmaToBackend({
                fileKey,
                nodeId,
                backendConfig
            });
            integrationCode = linkResult.integrationCode;
        }

        // Esporta assets se necessario
        let assets = [];
        if (task.exportAssets) {
            const assetsResult = await this.exportFigmaAssets({
                fileKey,
                nodeIds: task.assetNodeIds || [],
                format: task.assetFormat || 'png'
            });
            assets = assetsResult.assets;
        }

        this.emit('pageCreatedFromFigma', {
            fileKey,
            pageName,
            pagePath: codeResult.outputPath,
            integrationCode,
            assets
        });
        
        return {
            success: true,
            pageName,
            pagePath: codeResult.outputPath,
            code: codeResult.code,
            integrationCode,
            assets,
            components: codeResult.components
        };
    }

    /**
     * Aggiorna pagina da design Figma
     */
    async updatePageFromFigma(task) {
        const { fileKey, nodeId, pageName, pagePath } = task;
        
        // Sincronizza design
        await this.syncFigmaDesign({ fileKey, nodeId });
        
        // Rigenera codice
        return await this.createPageFromFigma({
            fileKey,
            nodeId,
            pageName,
            pagePath,
            backendConfig: task.backendConfig
        });
    }

    /**
     * Ottiene informazioni file Figma
     */
    async getFigmaFileInfo(task) {
        const { fileKey } = task;
        
        if (!fileKey) {
            throw new Error('fileKey required');
        }

        const fileResult = await this.fetchFigmaFile({ fileKey });
        const fileData = fileResult.fileData;
        
        return {
            success: true,
            fileKey,
            name: fileData.name,
            lastModified: fileData.lastModified,
            version: fileData.version,
            thumbnailUrl: fileData.thumbnailUrl,
            document: {
                id: fileData.document.id,
                name: fileData.document.name,
                type: fileData.document.type
            }
        };
    }
}

module.exports = FigmaAgent;

