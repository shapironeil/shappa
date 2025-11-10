/**
 * Figma to Code Generator
 * 
 * Converte design Figma in codice HTML/CSS/JS identico
 * Supporta file /file/ e /make/
 */

const fs = require('fs');
const path = require('path');

class FigmaToCodeGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '../../generated');
        this.ensureOutputDir();
    }

    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * Genera codice da JSON Figma
     */
    async generateFromFigmaJSON(figmaJSON, options = {}) {
        const {
            outputPath,
            componentName = 'FigmaComponent',
            framework = 'html', // html, react, vue
            useTailwind = true,
            extractAssets = true
        } = options;

        try {
            // Analizza struttura Figma
            const structure = this.analyzeFigmaStructure(figmaJSON);
            
            // Estrai design tokens
            const designTokens = this.extractDesignTokens(figmaJSON);
            
            // Genera codice
            let code;
            switch (framework) {
                case 'react':
                    code = this.generateReactCode(structure, designTokens, { useTailwind });
                    break;
                case 'vue':
                    code = this.generateVueCode(structure, designTokens, { useTailwind });
                    break;
                default:
                    code = this.generateHTMLCode(structure, designTokens, { useTailwind });
            }

            // Salva codice
            if (outputPath) {
                fs.writeFileSync(outputPath, code, 'utf8');
            }

            // Estrai assets se richiesto
            let assets = [];
            if (extractAssets) {
                assets = await this.extractAssets(figmaJSON, structure);
            }

            return {
                success: true,
                code,
                structure,
                designTokens,
                assets,
                outputPath
            };
        } catch (error) {
            throw new Error(`Failed to generate code from Figma: ${error.message}`);
        }
    }

    /**
     * Analizza struttura Figma
     */
    analyzeFigmaStructure(figmaJSON) {
        const structure = {
            pages: [],
            components: [],
            frames: [],
            styles: {}
        };

        const document = figmaJSON.document;
        
        // Analizza ricorsivamente i nodi
        this.traverseNodes(document.children, (node) => {
            if (node.type === 'PAGE') {
                structure.pages.push({
                    id: node.id,
                    name: node.name,
                    children: node.children || []
                });
            } else if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
                structure.components.push({
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    properties: this.extractNodeProperties(node)
                });
            } else if (node.type === 'FRAME') {
                structure.frames.push({
                    id: node.id,
                    name: node.name,
                    properties: this.extractNodeProperties(node)
                });
            }
        });

        return structure;
    }

    /**
     * Traversa nodi ricorsivamente
     */
    traverseNodes(nodes, callback) {
        if (!nodes || !Array.isArray(nodes)) return;
        
        nodes.forEach(node => {
            callback(node);
            if (node.children) {
                this.traverseNodes(node.children, callback);
            }
        });
    }

    /**
     * Estrae proprietà nodo
     */
    extractNodeProperties(node) {
        return {
            x: node.absoluteBoundingBox?.x || 0,
            y: node.absoluteBoundingBox?.y || 0,
            width: node.absoluteBoundingBox?.width || 0,
            height: node.absoluteBoundingBox?.height || 0,
            fills: node.fills || [],
            strokes: node.strokes || [],
            effects: node.effects || [],
            cornerRadius: node.cornerRadius || 0,
            layoutMode: node.layoutMode,
            paddingLeft: node.paddingLeft || 0,
            paddingRight: node.paddingRight || 0,
            paddingTop: node.paddingTop || 0,
            paddingBottom: node.paddingBottom || 0,
            gap: node.itemSpacing || 0,
            opacity: node.opacity !== undefined ? node.opacity : 1
        };
    }

    /**
     * Estrae design tokens (colori, font, spacing)
     */
    extractDesignTokens(figmaJSON) {
        const tokens = {
            colors: {},
            fonts: {},
            spacing: {},
            shadows: {}
        };

        // Estrai colori da styles
        if (figmaJSON.styles) {
            Object.values(figmaJSON.styles).forEach(style => {
                if (style.styleType === 'FILL') {
                    const color = this.rgbaToHex(style.paints?.[0]?.color || {});
                    tokens.colors[style.name] = color;
                }
            });
        }

        // Estrai colori da fills nei nodi
        this.traverseNodes(figmaJSON.document?.children || [], (node) => {
            if (node.fills && node.fills.length > 0) {
                node.fills.forEach(fill => {
                    if (fill.type === 'SOLID' && fill.color) {
                        const colorName = node.name || 'color';
                        tokens.colors[colorName] = this.rgbaToHex(fill.color, fill.opacity);
                    }
                });
            }

            // Estrai font
            if (node.style) {
                tokens.fonts[node.name || 'default'] = {
                    fontFamily: node.style.fontFamily,
                    fontSize: node.style.fontSize,
                    fontWeight: node.style.fontWeight,
                    lineHeight: node.style.lineHeightPx
                };
            }
        });

        return tokens;
    }

    /**
     * Converte RGBA a HEX
     */
    rgbaToHex(color, opacity = 1) {
        if (!color) return '#000000';
        
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        const a = opacity !== undefined ? opacity : 1;
        
        if (a < 1) {
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        
        return `#${[r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
    }

    /**
     * Genera codice HTML
     */
    generateHTMLCode(structure, designTokens, options) {
        const { useTailwind } = options;
        
        let html = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Figma Generated Page</title>
    ${useTailwind ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
    <style>
        ${this.generateCSS(designTokens, useTailwind)}
    </style>
</head>
<body>
`;

        // Genera HTML per ogni frame/componente
        structure.frames.forEach(frame => {
            html += this.generateFrameHTML(frame, designTokens, useTailwind);
        });

        html += `</body>
</html>`;

        return html;
    }

    /**
     * Genera CSS
     */
    generateCSS(designTokens, useTailwind) {
        if (useTailwind) {
            return `/* Design Tokens */
:root {
${Object.entries(designTokens.colors).map(([name, color]) => 
    `    --color-${name.toLowerCase().replace(/\s+/g, '-')}: ${color};`
).join('\n')}
}`;
        }

        return Object.entries(designTokens.colors).map(([name, color]) => 
            `.color-${name.toLowerCase().replace(/\s+/g, '-')} { color: ${color}; }`
        ).join('\n');
    }

    /**
     * Genera HTML per frame
     */
    generateFrameHTML(frame, designTokens, useTailwind) {
        const props = frame.properties;
        const classes = useTailwind 
            ? this.generateTailwindClasses(props)
            : this.generateCustomClasses(props);
        
        return `<div class="${classes}" data-figma-id="${frame.id}">
    <!-- ${frame.name} -->
</div>`;
    }

    /**
     * Genera classi Tailwind
     */
    generateTailwindClasses(props) {
        const classes = [];
        
        if (props.width) classes.push(`w-[${props.width}px]`);
        if (props.height) classes.push(`h-[${props.height}px]`);
        if (props.cornerRadius) classes.push(`rounded-[${props.cornerRadius}px]`);
        if (props.paddingLeft) classes.push(`pl-[${props.paddingLeft}px]`);
        if (props.paddingRight) classes.push(`pr-[${props.paddingRight}px]`);
        if (props.paddingTop) classes.push(`pt-[${props.paddingTop}px]`);
        if (props.paddingBottom) classes.push(`pb-[${props.paddingBottom}px]`);
        if (props.gap) classes.push(`gap-[${props.gap}px]`);
        if (props.layoutMode === 'HORIZONTAL') classes.push('flex flex-row');
        if (props.layoutMode === 'VERTICAL') classes.push('flex flex-col');
        
        return classes.join(' ');
    }

    /**
     * Genera classi custom
     */
    generateCustomClasses(props) {
        return `figma-frame figma-${props.id}`;
    }

    /**
     * Genera codice React
     */
    generateReactCode(structure, designTokens, options) {
        const { useTailwind } = options;
        
        let code = `import React from 'react';
${useTailwind ? "import './styles.css';" : ''}

`;

        // Genera componenti per ogni frame
        structure.frames.forEach(frame => {
            code += this.generateReactComponent(frame, designTokens, useTailwind);
        });

        return code;
    }

    /**
     * Genera componente React
     */
    generateReactComponent(frame, designTokens, useTailwind) {
        const componentName = this.sanitizeComponentName(frame.name);
        const props = frame.properties;
        const classes = useTailwind 
            ? this.generateTailwindClasses(props)
            : `figma-${frame.id}`;

        return `export function ${componentName}() {
    return (
        <div className="${classes}" data-figma-id="${frame.id}">
            {/* ${frame.name} */}
        </div>
    );
}

`;
    }

    /**
     * Genera codice Vue
     */
    generateVueCode(structure, designTokens, options) {
        // Similar to React but Vue syntax
        return '// Vue code generation - TODO';
    }

    /**
     * Sanitizza nome componente
     */
    sanitizeComponentName(name) {
        return name
            .replace(/[^a-zA-Z0-9]/g, '')
            .replace(/^[0-9]/, '')
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }

    /**
     * Estrae assets (immagini, SVG)
     */
    async extractAssets(figmaJSON, structure) {
        const assets = [];
        
        // Trova nodi con immagini
        this.traverseNodes(figmaJSON.document?.children || [], (node) => {
            if (node.type === 'VECTOR' || node.type === 'IMAGE') {
                assets.push({
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    exportSettings: node.exportSettings || []
                });
            }
        });

        return assets;
    }
}

module.exports = FigmaToCodeGenerator;

