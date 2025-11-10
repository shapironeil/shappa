/**
 * FrontendAgent - Gestisce generazione e integrazione frontend
 * 
 * Responsabile di:
 * - Generare codice frontend da design
 * - Collegare componenti UI alle API backend
 * - Gestire stato e gestione dati
 * - Integrare con DataManager
 * - Gestire routing e navigazione
 * - Ottimizzare performance frontend
 */

const AgentBase = require('../base/AgentBase');
const fs = require('fs');
const path = require('path');

class FrontendAgent extends AgentBase {
    constructor(config = {}) {
        super('FrontendAgent', {
            priority: 7,
            ...config
        });

        this.capabilities = [
            'generate_component',
            'integrate_with_backend',
            'generate_api_client',
            'create_data_manager_integration',
            'optimize_frontend',
            'generate_routing',
            'create_form_handler',
            'generate_state_management'
        ];

        this.frontendDir = path.join(__dirname, '../../frontend/src');
        this.pagesDir = path.join(__dirname, '../../src/pages');
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const frontendTasks = [
            'generate_component',
            'integrate_with_backend',
            'generate_api_client',
            'create_data_manager_integration',
            'optimize_frontend',
            'generate_routing',
            'create_form_handler',
            'generate_state_management',
            'link_page_to_api',
            'create_page_integration'
        ];

        return frontendTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'generate_component':
                return await this.generateComponent(task);
            
            case 'integrate_with_backend':
                return await this.integrateWithBackend(task);
            
            case 'generate_api_client':
                return await this.generateApiClient(task);
            
            case 'create_data_manager_integration':
                return await this.createDataManagerIntegration(task);
            
            case 'optimize_frontend':
                return await this.optimizeFrontend(task);
            
            case 'generate_routing':
                return await this.generateRouting(task);
            
            case 'create_form_handler':
                return await this.createFormHandler(task);
            
            case 'generate_state_management':
                return await this.generateStateManagement(task);
            
            case 'link_page_to_api':
                return await this.linkPageToApi(task);
            
            case 'create_page_integration':
                return await this.createPageIntegration(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Genera componente frontend
     */
    async generateComponent(task) {
        const { componentName, componentType, props, outputPath } = task;
        
        if (!componentName) {
            throw new Error('componentName required');
        }

        const componentCode = this.generateComponentCode(componentName, componentType, props);
        
        if (outputPath) {
            const fullPath = path.join(__dirname, '../../', outputPath);
            const dir = path.dirname(fullPath);
            
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, componentCode, 'utf8');
        }
        
        return {
            success: true,
            componentName,
            code: componentCode,
            outputPath: outputPath || null
        };
    }

    /**
     * Genera codice componente
     */
    generateComponentCode(componentName, componentType = 'div', props = {}) {
        const className = this.sanitizeClassName(componentName);
        const parts = [];

        if (componentType === 'react') {
            // React component
            parts.push(`import React from 'react';`);
            parts.push('');
            parts.push(`const ${componentName} = (props) => {`);
            parts.push(`    return (`);
            parts.push(`        <div className="${className}">`);
            parts.push(`            {/* ${componentName} component */}`);
            parts.push(`        </div>`);
            parts.push(`    );`);
            parts.push(`};`);
            parts.push('');
            parts.push(`export default ${componentName};`);
        } else {
            // Vanilla JS component
            parts.push(`class ${componentName} {`);
            parts.push(`    constructor(props = {}) {`);
            parts.push(`        this.props = props;`);
            parts.push(`        this.element = null;`);
            parts.push(`    }`);
            parts.push('');
            parts.push(`    render() {`);
            parts.push(`        this.element = document.createElement('${componentType}');`);
            parts.push(`        this.element.className = '${className}';`);
            parts.push(`        return this.element;`);
            parts.push(`    }`);
            parts.push('');
            parts.push(`    update(props) {`);
            parts.push(`        this.props = { ...this.props, ...props };`);
            parts.push(`        // TODO: Update component`);
            parts.push(`    }`);
            parts.push('}');
            parts.push('');
            parts.push(`export default ${componentName};`);
        }

        return parts.join('\n');
    }

    /**
     * Integra con backend
     */
    async integrateWithBackend(task) {
        const { pagePath, apiEndpoints, integrationType = 'fetch' } = task;
        
        if (!pagePath || !apiEndpoints) {
            throw new Error('pagePath and apiEndpoints required');
        }

        const integrationCode = this.generateBackendIntegration(apiEndpoints, integrationType);
        
        // Leggi file esistente
        const fullPath = path.join(__dirname, '../../', pagePath);
        let existingContent = '';
        
        if (fs.existsSync(fullPath)) {
            existingContent = fs.readFileSync(fullPath, 'utf8');
        }
        
        // Aggiungi integrazione
        const updatedContent = this.addIntegrationToPage(existingContent, integrationCode);
        
        // Salva file aggiornato
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        
        // Notifica altri agenti (es. DataAgent) che una pagina è stata integrata
        this.notifyDataChange('pageIntegration', { pagePath, apiEndpoints }, ['DataAgent']);
        
        return {
            success: true,
            pagePath,
            integrationCode,
            endpoints: apiEndpoints.length
        };
    }

    /**
     * Genera integrazione backend
     */
    generateBackendIntegration(apiEndpoints, integrationType = 'fetch') {
        const apiBase = process.env.API_BASE || 'https://shapiro.ninja';
        const parts = [];

        parts.push('// Auto-generated backend integration');
        parts.push(`const API_BASE = '${apiBase}';`);
        parts.push('');

        if (integrationType === 'fetch') {
            apiEndpoints.forEach(endpoint => {
                const functionName = this.endpointToFunctionName(endpoint.path);
                const method = endpoint.method || 'GET';
                
                parts.push(`async function ${functionName}(params = {}) {`);
                parts.push(`    try {`);
                
                if (method === 'GET') {
                    const queryString = endpoint.params ? 
                        `?${endpoint.params.map(p => `${p}=\${params.${p}}`).join('&')}` : '';
                    parts.push(`        const response = await fetch(\`\${API_BASE}${endpoint.path}${queryString}\`);`);
                } else {
                    parts.push(`        const response = await fetch(\`\${API_BASE}${endpoint.path}\`, {`);
                    parts.push(`            method: '${method}',`);
                    parts.push(`            headers: { 'Content-Type': 'application/json' },`);
                    parts.push(`            body: JSON.stringify(params)`);
                    parts.push(`        });`);
                }
                
                parts.push(`        const data = await response.json();`);
                parts.push(`        return data;`);
                parts.push(`    } catch (error) {`);
                parts.push(`        console.error('Error calling ${endpoint.path}:', error);`);
                parts.push(`        throw error;`);
                parts.push(`    }`);
                parts.push(`}`);
                parts.push('');
            });
        }

        return parts.join('\n');
    }

    /**
     * Converte endpoint a nome funzione
     */
    endpointToFunctionName(endpoint) {
        return endpoint
            .replace(/^\/api\//, '')
            .replace(/\//g, '_')
            .replace(/[^a-z0-9_]/gi, '')
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
            .replace(/^[A-Z]/, match => match.toLowerCase());
    }

    /**
     * Aggiunge integrazione a pagina
     */
    addIntegrationToPage(pageContent, integrationCode) {
        // Cerca tag script esistente
        if (pageContent.includes('</body>')) {
            return pageContent.replace(
                '</body>',
                `    <script>\n${integrationCode}\n    </script>\n</body>`
            );
        } else if (pageContent.includes('</html>')) {
            return pageContent.replace(
                '</html>',
                `    <script>\n${integrationCode}\n    </script>\n</html>`
            );
        } else {
            return pageContent + '\n\n<script>\n' + integrationCode + '\n</script>';
        }
    }

    /**
     * Genera API client
     */
    async generateApiClient(task) {
        const { apiEndpoints, outputPath } = task;
        
        if (!apiEndpoints) {
            throw new Error('apiEndpoints required');
        }

        const apiClientCode = this.generateApiClientCode(apiEndpoints);
        
        if (outputPath) {
            const fullPath = path.join(__dirname, '../../', outputPath);
            const dir = path.dirname(fullPath);
            
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, apiClientCode, 'utf8');
        }
        
        return {
            success: true,
            apiClientCode,
            outputPath: outputPath || null,
            endpoints: apiEndpoints.length
        };
    }

    /**
     * Genera codice API client
     */
    generateApiClientCode(apiEndpoints) {
        const apiBase = process.env.API_BASE || 'https://shapiro.ninja';
        const parts = [];

        parts.push('/**');
        parts.push(' * Auto-generated API Client');
        parts.push(' * Generated by FrontendAgent');
        parts.push(' */');
        parts.push('');
        parts.push(`const API_BASE = '${apiBase}';`);
        parts.push('');
        parts.push('class ApiClient {');
        parts.push('    constructor(baseUrl = API_BASE) {');
        parts.push('        this.baseUrl = baseUrl;');
        parts.push('    }');
        parts.push('');
        parts.push('    async request(method, path, data = null) {');
        parts.push('        const options = {');
        parts.push('            method,');
        parts.push('            headers: { \'Content-Type\': \'application/json\' }');
        parts.push('        };');
        parts.push('');
        parts.push('        if (data) {');
        parts.push('            options.body = JSON.stringify(data);');
        parts.push('        }');
        parts.push('');
        parts.push('        const response = await fetch(`${this.baseUrl}${path}`, options);');
        parts.push('        return await response.json();');
        parts.push('    }');
        parts.push('');

        apiEndpoints.forEach(endpoint => {
            const method = endpoint.method || 'GET';
            const functionName = this.endpointToFunctionName(endpoint.path);
            
            parts.push(`    async ${functionName}(params = {}) {`);
            if (method === 'GET') {
                const queryString = endpoint.params ? 
                    `?${endpoint.params.map(p => `${p}=\${params.${p}}`).join('&')}` : '';
                parts.push(`        return await this.request('${method}', \`${endpoint.path}${queryString}\`);`);
            } else {
                parts.push(`        return await this.request('${method}', '${endpoint.path}', params);`);
            }
            parts.push(`    }`);
            parts.push('');
        });

        parts.push('}');
        parts.push('');
        parts.push('const apiClient = new ApiClient();');
        parts.push('export default apiClient;');

        return parts.join('\n');
    }

    /**
     * Crea integrazione DataManager
     */
    async createDataManagerIntegration(task) {
        const { pagePath, dataRequirements } = task;
        
        if (!pagePath || !dataRequirements) {
            throw new Error('pagePath and dataRequirements required');
        }

        const integrationCode = this.generateDataManagerIntegration(dataRequirements);
        
        // Leggi file esistente
        const fullPath = path.join(__dirname, '../../', pagePath);
        let existingContent = '';
        
        if (fs.existsSync(fullPath)) {
            existingContent = fs.readFileSync(fullPath, 'utf8');
        }
        
        // Aggiungi integrazione DataManager
        const updatedContent = this.addDataManagerIntegration(existingContent, integrationCode);
        
        // Salva file aggiornato
        fs.writeFileSync(fullPath, updatedContent, 'utf8');
        
        return {
            success: true,
            pagePath,
            integrationCode,
            dataRequirements: dataRequirements.length
        };
    }

    /**
     * Genera integrazione DataManager
     */
    generateDataManagerIntegration(dataRequirements) {
        const parts = [];

        parts.push('// DataManager integration');
        parts.push('if (window.DataManager) {');
        parts.push('    const dataManager = window.DataManager;');
        parts.push('');
        parts.push('    // Load data on page load');
        parts.push('    document.addEventListener("DOMContentLoaded", async function() {');

        dataRequirements.forEach(req => {
            const dataType = req.type; // 'sport', 'interests', 'products', etc.
            const functionName = `get${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`;
            
            parts.push(`        try {`);
            parts.push(`            const ${dataType}Data = await dataManager.${functionName}();`);
            parts.push(`            // TODO: Render ${dataType}Data in UI`);
            parts.push(`            console.log('${dataType} data loaded:', ${dataType}Data);`);
            parts.push(`        } catch (error) {`);
            parts.push(`            console.error('Error loading ${dataType} data:', error);`);
            parts.push(`        }`);
        });

        parts.push('    });');
        parts.push('}');

        return parts.join('\n');
    }

    /**
     * Aggiunge integrazione DataManager
     */
    addDataManagerIntegration(pageContent, integrationCode) {
        return this.addIntegrationToPage(pageContent, integrationCode);
    }

    /**
     * Collega pagina a API
     */
    async linkPageToApi(task) {
        const { pagePath, apiConfig } = task;
        
        if (!pagePath || !apiConfig) {
            throw new Error('pagePath and apiConfig required');
        }

        // Genera integrazione backend
        const backendResult = await this.integrateWithBackend({
            pagePath,
            apiEndpoints: apiConfig.endpoints,
            integrationType: apiConfig.integrationType || 'fetch'
        });

        // Crea integrazione DataManager se necessario
        if (apiConfig.dataRequirements) {
            await this.createDataManagerIntegration({
                pagePath,
                dataRequirements: apiConfig.dataRequirements
            });
        }

        return {
            success: true,
            pagePath,
            backendIntegration: backendResult,
            linked: true
        };
    }

    /**
     * Crea integrazione pagina completa
     */
    async createPageIntegration(task) {
        const { pagePath, figmaData, backendConfig } = task;
        
        if (!pagePath) {
            throw new Error('pagePath required');
        }

        // Estrai endpoint da analisi Figma
        const apiEndpoints = [];
        if (figmaData && figmaData.analysis && figmaData.analysis.dataRequirements) {
            figmaData.analysis.dataRequirements.forEach(req => {
                apiEndpoints.push({
                    path: req.suggestedEndpoint,
                    method: 'GET',
                    params: req.params || []
                });
            });
        }

        // Aggiungi endpoint da backendConfig
        if (backendConfig && backendConfig.endpoints) {
            apiEndpoints.push(...backendConfig.endpoints);
        }

        // Collega pagina a API
        return await this.linkPageToApi({
            pagePath,
            apiConfig: {
                endpoints: apiEndpoints,
                integrationType: backendConfig?.integrationType || 'fetch',
                dataRequirements: figmaData?.analysis?.dataRequirements || []
            }
        });
    }

    /**
     * Ottimizza frontend
     */
    async optimizeFrontend(task) {
        const { pagePath, optimizations = [] } = task;
        
        if (!pagePath) {
            throw new Error('pagePath required');
        }

        const fullPath = path.join(__dirname, '../../', pagePath);
        
        if (!fs.existsSync(fullPath)) {
            throw new Error('Page not found');
        }

        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Applica ottimizzazioni
        if (optimizations.includes('lazy-loading')) {
            content = this.addLazyLoading(content);
        }
        
        if (optimizations.includes('code-splitting')) {
            content = this.addCodeSplitting(content);
        }
        
        if (optimizations.includes('caching')) {
            content = this.addCaching(content);
        }
        
        // Salva file ottimizzato
        fs.writeFileSync(fullPath, content, 'utf8');
        
        return {
            success: true,
            pagePath,
            optimizations: optimizations.length
        };
    }

    /**
     * Aggiunge lazy loading
     */
    addLazyLoading(content) {
        // Aggiungi loading="lazy" a immagini
        return content.replace(/<img/g, '<img loading="lazy"');
    }

    /**
     * Aggiunge code splitting
     */
    addCodeSplitting(content) {
        // Aggiungi dynamic import per script
        return content.replace(
            /<script src="([^"]+)"><\/script>/g,
            '<script type="module" src="$1"></script>'
        );
    }

    /**
     * Aggiunge caching
     */
    addCaching(content) {
        // Aggiungi cache headers
        if (!content.includes('Cache-Control')) {
            return content.replace(
                '<head>',
                '<head>\n    <meta http-equiv="Cache-Control" content="public, max-age=3600">'
            );
        }
        return content;
    }

    /**
     * Genera routing
     */
    async generateRouting(task) {
        const { routes, outputPath } = task;
        
        if (!routes) {
            throw new Error('routes required');
        }

        const routingCode = this.generateRoutingCode(routes);
        
        if (outputPath) {
            const fullPath = path.join(__dirname, '../../', outputPath);
            const dir = path.dirname(fullPath);
            
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, routingCode, 'utf8');
        }
        
        return {
            success: true,
            routingCode,
            outputPath: outputPath || null,
            routes: routes.length
        };
    }

    /**
     * Genera codice routing
     */
    generateRoutingCode(routes) {
        const parts = [];

        parts.push('// Auto-generated routing');
        parts.push('class Router {');
        parts.push('    constructor() {');
        parts.push('        this.routes = {};');
        parts.push('        this.currentRoute = null;');
        parts.push('    }');
        parts.push('');
        parts.push('    register(path, handler) {');
        parts.push('        this.routes[path] = handler;');
        parts.push('    }');
        parts.push('');
        parts.push('    navigate(path) {');
        parts.push('        if (this.routes[path]) {');
        parts.push('            this.currentRoute = path;');
        parts.push('            this.routes[path]();');
        parts.push('        }');
        parts.push('    }');
        parts.push('}');
        parts.push('');
        parts.push('const router = new Router();');
        parts.push('');

        routes.forEach(route => {
            parts.push(`router.register('${route.path}', function() {`);
            parts.push(`    // Load ${route.page}`);
            parts.push(`    window.location.href = '${route.page}';`);
            parts.push(`});`);
            parts.push('');
        });

        parts.push('export default router;');

        return parts.join('\n');
    }

    /**
     * Crea form handler
     */
    async createFormHandler(task) {
        const { formId, formConfig, outputPath } = task;
        
        if (!formId || !formConfig) {
            throw new Error('formId and formConfig required');
        }

        const formHandlerCode = this.generateFormHandlerCode(formId, formConfig);
        
        if (outputPath) {
            const fullPath = path.join(__dirname, '../../', outputPath);
            const dir = path.dirname(fullPath);
            
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, formHandlerCode, 'utf8');
        }
        
        return {
            success: true,
            formId,
            formHandlerCode,
            outputPath: outputPath || null
        };
    }

    /**
     * Genera codice form handler
     */
    generateFormHandlerCode(formId, formConfig) {
        const apiBase = process.env.API_BASE || 'https://shapiro.ninja';
        const parts = [];

        parts.push(`// Form handler for ${formId}`);
        parts.push(`document.addEventListener('DOMContentLoaded', function() {`);
        parts.push(`    const form = document.getElementById('${formId}');`);
        parts.push(`    if (!form) return;`);
        parts.push('');
        parts.push(`    form.addEventListener('submit', async function(e) {`);
        parts.push(`        e.preventDefault();`);
        parts.push('');
        parts.push(`        const formData = new FormData(form);`);
        parts.push(`        const data = Object.fromEntries(formData);`);
        parts.push('');
        parts.push(`        try {`);
        parts.push(`            const response = await fetch(\`\${API_BASE}${formConfig.endpoint}\`, {`);
        parts.push(`                method: '${formConfig.method || 'POST'}',`);
        parts.push(`                headers: { 'Content-Type': 'application/json' },`);
        parts.push(`                body: JSON.stringify(data)`);
        parts.push(`            });`);
        parts.push('');
        parts.push(`            const result = await response.json();`);
        parts.push('');
        parts.push(`            if (result.success) {`);
        parts.push(`                // TODO: Handle success`);
        parts.push(`                console.log('Form submitted successfully:', result);`);
        parts.push(`            } else {`);
        parts.push(`                // TODO: Handle error`);
        parts.push(`                console.error('Form submission failed:', result.error);`);
        parts.push(`            }`);
        parts.push(`        } catch (error) {`);
        parts.push(`            console.error('Error submitting form:', error);`);
        parts.push(`        }`);
        parts.push(`    });`);
        parts.push(`});`);

        return parts.join('\n');
    }

    /**
     * Genera state management
     */
    async generateStateManagement(task) {
        const { stateConfig, outputPath } = task;
        
        if (!stateConfig) {
            throw new Error('stateConfig required');
        }

        const stateManagementCode = this.generateStateManagementCode(stateConfig);
        
        if (outputPath) {
            const fullPath = path.join(__dirname, '../../', outputPath);
            const dir = path.dirname(fullPath);
            
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(fullPath, stateManagementCode, 'utf8');
        }
        
        return {
            success: true,
            stateManagementCode,
            outputPath: outputPath || null
        };
    }

    /**
     * Genera codice state management
     */
    generateStateManagementCode(stateConfig) {
        const parts = [];

        parts.push('// Auto-generated state management');
        parts.push('class StateManager {');
        parts.push('    constructor(initialState = {}) {');
        parts.push('        this.state = initialState;');
        parts.push('        this.listeners = [];');
        parts.push('    }');
        parts.push('');
        parts.push('    setState(newState) {');
        parts.push('        this.state = { ...this.state, ...newState };');
        parts.push('        this.notifyListeners();');
        parts.push('    }');
        parts.push('');
        parts.push('    getState() {');
        parts.push('        return this.state;');
        parts.push('    }');
        parts.push('');
        parts.push('    subscribe(listener) {');
        parts.push('        this.listeners.push(listener);');
        parts.push('        return () => {');
        parts.push('            this.listeners = this.listeners.filter(l => l !== listener);');
        parts.push('        };');
        parts.push('    }');
        parts.push('');
        parts.push('    notifyListeners() {');
        parts.push('        this.listeners.forEach(listener => listener(this.state));');
        parts.push('    }');
        parts.push('}');
        parts.push('');

        const initialState = stateConfig.initialState || {};
        parts.push(`const initialState = ${JSON.stringify(initialState, null, 2)};`);
        parts.push('const stateManager = new StateManager(initialState);');
        parts.push('export default stateManager;');

        return parts.join('\n');
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
}

module.exports = FrontendAgent;

