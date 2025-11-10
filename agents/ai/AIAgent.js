/**
 * AIAgent - Agente AI per Estrapolare Dati da Foto e Testi
 * 
 * Responsabile di:
 * - Analizzare immagini e estrarre informazioni
 * - Processare testi e estrarre dati strutturati
 * - OCR (Optical Character Recognition)
 * - Analisi sentiment e classificazione
 * - Estrazione entità (nomi, date, numeri, etc.)
 * - Conversione immagini in testo
 * - Analisi documenti
 * 
 * Supporta:
 * - OpenAI Vision API (GPT-4 Vision)
 * - Google Cloud Vision API
 * - Tesseract OCR (locale)
 * - Claude Vision API
 */

const AgentBase = require('../base/AgentBase');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AIAgent extends AgentBase {
    constructor(config = {}) {
        super('AIAgent', {
            priority: 8,
            ...config
        });

        this.capabilities = [
            'extract_text_from_image',
            'analyze_image',
            'extract_data_from_text',
            'ocr_image',
            'classify_text',
            'extract_entities',
            'analyze_sentiment',
            'process_document',
            'extract_tables_from_image',
            'extract_qr_code'
        ];

        // Configurazione API AI
        this.openaiApiKey = process.env.OPENAI_API_KEY || config.openaiApiKey;
        this.googleVisionApiKey = process.env.GOOGLE_VISION_API_KEY || config.googleVisionApiKey;
        this.claudeApiKey = process.env.CLAUDE_API_KEY || config.claudeApiKey;
        
        // Provider gratuiti
        this.qwenApiKey = process.env.QWEN_API_KEY || config.qwenApiKey;
        this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY || config.huggingfaceApiKey;
        
        // API Bases
        this.anthropicApiBase = 'https://api.anthropic.com/v1';
        this.openaiApiBase = 'https://api.openai.com/v1';
        this.googleVisionApiBase = 'https://vision.googleapis.com/v1';
        this.qwenApiBase = 'https://api.qwen-ai.net/v1';
        this.huggingfaceApiBase = 'https://api-inference.huggingface.co';

        // Cache risultati
        this.resultCache = new Map();
    }

    /**
     * Determina se può gestire un task
     */
    canHandle(task) {
        const aiTasks = [
            'extract_text_from_image',
            'analyze_image',
            'extract_data_from_text',
            'ocr_image',
            'classify_text',
            'extract_entities',
            'analyze_sentiment',
            'process_document',
            'extract_tables_from_image',
            'extract_qr_code',
            'extract_structured_data'
        ];

        return aiTasks.includes(task.type);
    }

    /**
     * Processa un task
     */
    async processTask(task) {
        switch (task.type) {
            case 'extract_text_from_image':
                return await this.extractTextFromImage(task);
            
            case 'analyze_image':
                return await this.analyzeImage(task);
            
            case 'extract_data_from_text':
                return await this.extractDataFromText(task);
            
            case 'ocr_image':
                return await this.ocrImage(task);
            
            case 'classify_text':
                return await this.classifyText(task);
            
            case 'extract_entities':
                return await this.extractEntities(task);
            
            case 'analyze_sentiment':
                return await this.analyzeSentiment(task);
            
            case 'process_document':
                return await this.processDocument(task);
            
            case 'extract_tables_from_image':
                return await this.extractTablesFromImage(task);
            
            case 'extract_qr_code':
                return await this.extractQRCode(task);
            
            case 'extract_structured_data':
                return await this.extractStructuredData(task);
            
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }

    /**
     * Estrae testo da immagine usando OCR o Vision API
     */
    async extractTextFromImage(task) {
        const { imagePath, imageUrl, imageBase64, provider = 'openai' } = task;
        
        if (!imagePath && !imageUrl && !imageBase64) {
            throw new Error('imagePath, imageUrl, or imageBase64 required');
        }

        try {
            let imageData = imageBase64;
            
            if (imagePath) {
                const imageBuffer = fs.readFileSync(imagePath);
                imageData = imageBuffer.toString('base64');
            } else if (imageUrl) {
                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                imageData = Buffer.from(response.data).toString('base64');
            }

            switch (provider) {
                case 'openai':
                    if (this.openaiApiKey) {
                        return await this.extractTextWithOpenAI(imageData);
                    }
                    break;
                
                case 'google':
                    if (this.googleVisionApiKey) {
                        return await this.extractTextWithGoogleVision(imageData);
                    }
                    break;
                
                case 'claude':
                    if (this.claudeApiKey) {
                        return await this.extractTextWithClaude(imageData);
                    }
                    break;
                
                case 'qwen':
                    if (this.qwenApiKey) {
                        return await this.extractTextWithQwen(imageData);
                    }
                    break;
                
                case 'huggingface':
                    if (this.huggingfaceApiKey) {
                        return await this.extractTextWithHuggingFace(imageData);
                    }
                    break;
            }
            
            // Fallback: prova provider gratuiti in ordine
            if (this.qwenApiKey) {
                return await this.extractTextWithQwen(imageData);
            }
            if (this.huggingfaceApiKey) {
                return await this.extractTextWithHuggingFace(imageData);
            }
            if (this.googleVisionApiKey) {
                return await this.extractTextWithGoogleVision(imageData);
            }
            
            throw new Error('No AI provider configured');
        } catch (error) {
            throw new Error(`Failed to extract text from image: ${error.message}`);
        }
    }

    /**
     * Estrae testo usando OpenAI Vision API
     */
    async extractTextWithOpenAI(imageBase64) {
        if (!this.openaiApiKey) {
            throw new Error('OPENAI_API_KEY not configured');
        }

        const response = await axios.post(
            `${this.openaiApiBase}/chat/completions`,
            {
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Extract all text from this image. Return only the text, no explanations.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            text: response.data.choices[0].message.content,
            provider: 'openai'
        };
    }

    /**
     * Estrae testo usando Qwen AI (GRATUITO)
     */
    async extractTextWithQwen(imageBase64) {
        if (!this.qwenApiKey) {
            throw new Error('QWEN_API_KEY not configured');
        }

        const response = await axios.post(
            `${this.qwenApiBase}/chat/completions`,
            {
                model: 'qwen-vl-plus',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`
                                }
                            },
                            {
                                type: 'text',
                                text: 'Extract all text from this image. Return only the text, no explanations.'
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.qwenApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            text: response.data.choices[0].message.content,
            provider: 'qwen'
        };
    }

    /**
     * Estrae testo usando Hugging Face (GRATUITO)
     */
    async extractTextWithHuggingFace(imageBase64) {
        if (!this.huggingfaceApiKey) {
            throw new Error('HUGGINGFACE_API_KEY not configured');
        }

        // Usa modello OCR di Hugging Face
        const response = await axios.post(
            `${this.huggingfaceApiBase}/models/microsoft/trocr-base-printed`,
            {
                inputs: {
                    image: `data:image/jpeg;base64,${imageBase64}`
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.huggingfaceApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            text: response.data.generated_text || response.data.text || '',
            provider: 'huggingface'
        };
    }

    /**
     * Estrae testo usando Google Cloud Vision API
     */
    async extractTextWithGoogleVision(imageBase64) {
        if (!this.googleVisionApiKey) {
            throw new Error('GOOGLE_VISION_API_KEY not configured');
        }

        const response = await axios.post(
            `${this.googleVisionApiBase}/images:annotate?key=${this.googleVisionApiKey}`,
            {
                requests: [
                    {
                        image: {
                            content: imageBase64
                        },
                        features: [
                            {
                                type: 'TEXT_DETECTION',
                                maxResults: 10
                            }
                        ]
                    }
                ]
            }
        );

        const textAnnotations = response.data.responses[0].textAnnotations || [];
        const fullText = textAnnotations[0]?.description || '';

        return {
            success: true,
            text: fullText,
            provider: 'google',
            annotations: textAnnotations
        };
    }

    /**
     * Estrae testo usando Claude Vision API
     */
    async extractTextWithClaude(imageBase64) {
        if (!this.claudeApiKey) {
            throw new Error('CLAUDE_API_KEY not configured');
        }

        const response = await axios.post(
            `${this.anthropicApiBase}/messages`,
            {
                model: 'claude-3-opus-20240229',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: 'image/jpeg',
                                    data: imageBase64
                                }
                            },
                            {
                                type: 'text',
                                text: 'Extract all text from this image. Return only the text.'
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'x-api-key': this.claudeApiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            text: response.data.content[0].text,
            provider: 'claude'
        };
    }

    /**
     * Analizza immagine e estrae informazioni strutturate
     */
    async analyzeImage(task) {
        const { imagePath, imageUrl, imageBase64, prompt, provider = 'openai' } = task;
        
        if (!imagePath && !imageUrl && !imageBase64) {
            throw new Error('imagePath, imageUrl, or imageBase64 required');
        }

        const analysisPrompt = prompt || 'Analyze this image and extract all relevant information. Return structured data in JSON format.';

        try {
            let imageData = imageBase64;
            
            if (imagePath) {
                const imageBuffer = fs.readFileSync(imagePath);
                imageData = imageBuffer.toString('base64');
            } else if (imageUrl) {
                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                imageData = Buffer.from(response.data).toString('base64');
            }

            if (provider === 'openai' && this.openaiApiKey) {
                return await this.analyzeImageWithOpenAI(imageData, analysisPrompt);
            } else if (provider === 'claude' && this.claudeApiKey) {
                return await this.analyzeImageWithClaude(imageData, analysisPrompt);
            } else {
                throw new Error('No AI provider configured');
            }
        } catch (error) {
            throw new Error(`Failed to analyze image: ${error.message}`);
        }
    }

    /**
     * Analizza immagine con OpenAI
     */
    async analyzeImageWithOpenAI(imageBase64, prompt) {
        const response = await axios.post(
            `${this.openaiApiBase}/chat/completions`,
            {
                model: 'gpt-4-vision-preview',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: prompt
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;
        
        // Prova a parsare come JSON se possibile
        let structuredData = content;
        try {
            structuredData = JSON.parse(content);
        } catch (e) {
            // Non è JSON, ritorna come testo
        }

        return {
            success: true,
            data: structuredData,
            provider: 'openai'
        };
    }

    /**
     * Analizza immagine con Claude
     */
    async analyzeImageWithClaude(imageBase64, prompt) {
        const response = await axios.post(
            `${this.anthropicApiBase}/messages`,
            {
                model: 'claude-3-opus-20240229',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: 'image/jpeg',
                                    data: imageBase64
                                }
                            },
                            {
                                type: 'text',
                                text: prompt
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'x-api-key': this.claudeApiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.content[0].text;
        
        let structuredData = content;
        try {
            structuredData = JSON.parse(content);
        } catch (e) {
            // Non è JSON
        }

        return {
            success: true,
            data: structuredData,
            provider: 'claude'
        };
    }

    /**
     * Estrae dati strutturati da testo
     */
    async extractDataFromText(task) {
        const { text, schema, format = 'json' } = task;
        
        if (!text) {
            throw new Error('text required');
        }

        try {
            if (this.openaiApiKey) {
                return await this.extractDataWithOpenAI(text, schema, format);
            } else if (this.claudeApiKey) {
                return await this.extractDataWithClaude(text, schema, format);
            } else {
                throw new Error('No AI provider configured');
            }
        } catch (error) {
            throw new Error(`Failed to extract data from text: ${error.message}`);
        }
    }

    /**
     * Estrae dati con OpenAI
     */
    async extractDataWithOpenAI(text, schema, format) {
        const schemaPrompt = schema 
            ? `Extract data matching this schema: ${JSON.stringify(schema)}`
            : 'Extract all relevant structured data from this text.';

        const response = await axios.post(
            `${this.openaiApiBase}/chat/completions`,
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a data extraction expert. Extract structured data from text and return it in JSON format.'
                    },
                    {
                        role: 'user',
                        content: `${schemaPrompt}\n\nText:\n${text}\n\nReturn data in ${format} format.`
                    }
                ],
                response_format: format === 'json' ? { type: 'json_object' } : undefined,
                max_tokens: 2000
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;
        let data = content;
        
        if (format === 'json') {
            try {
                data = JSON.parse(content);
            } catch (e) {
                // Fallback: prova a estrarre JSON dal testo
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    data = JSON.parse(jsonMatch[0]);
                }
            }
        }

        return {
            success: true,
            data,
            format,
            provider: 'openai'
        };
    }

    /**
     * Estrae dati con Claude
     */
    async extractDataWithClaude(text, schema, format) {
        const schemaPrompt = schema 
            ? `Extract data matching this schema: ${JSON.stringify(schema)}`
            : 'Extract all relevant structured data from this text.';

        const response = await axios.post(
            `${this.anthropicApiBase}/messages`,
            {
                model: 'claude-3-opus-20240229',
                max_tokens: 2000,
                messages: [
                    {
                        role: 'user',
                        content: `${schemaPrompt}\n\nText:\n${text}\n\nReturn data in ${format} format.`
                    }
                ]
            },
            {
                headers: {
                    'x-api-key': this.claudeApiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.content[0].text;
        let data = content;
        
        if (format === 'json') {
            try {
                data = JSON.parse(content);
            } catch (e) {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    data = JSON.parse(jsonMatch[0]);
                }
            }
        }

        return {
            success: true,
            data,
            format,
            provider: 'claude'
        };
    }

    /**
     * OCR immagine (wrapper per extractTextFromImage)
     */
    async ocrImage(task) {
        return await this.extractTextFromImage({ ...task, provider: task.provider || 'google' });
    }

    /**
     * Classifica testo
     */
    async classifyText(task) {
        const { text, categories } = task;
        
        if (!text) {
            throw new Error('text required');
        }

        const categoriesPrompt = categories
            ? `Classify this text into one of these categories: ${categories.join(', ')}`
            : 'Classify this text and return the category.';

        return await this.extractDataFromText({
            text: `${categoriesPrompt}\n\nText: ${text}`,
            schema: { category: 'string', confidence: 'number' },
            format: 'json'
        });
    }

    /**
     * Estrae entità (nomi, date, numeri, etc.)
     */
    async extractEntities(task) {
        const { text, entityTypes = ['person', 'date', 'number', 'location'] } = task;
        
        if (!text) {
            throw new Error('text required');
        }

        const entityPrompt = `Extract entities from this text. Entity types: ${entityTypes.join(', ')}. Return as JSON array with type and value.`;

        return await this.extractDataFromText({
            text: `${entityPrompt}\n\nText: ${text}`,
            schema: { entities: [{ type: 'string', value: 'string' }] },
            format: 'json'
        });
    }

    /**
     * Analizza sentiment
     */
    async analyzeSentiment(task) {
        const { text } = task;
        
        if (!text) {
            throw new Error('text required');
        }

        return await this.extractDataFromText({
            text: `Analyze the sentiment of this text and return sentiment (positive, negative, neutral) and score (0-1).\n\nText: ${text}`,
            schema: { sentiment: 'string', score: 'number' },
            format: 'json'
        });
    }

    /**
     * Processa documento completo
     */
    async processDocument(task) {
        const { documentPath, documentUrl, documentBase64, extractType = 'all' } = task;
        
        // Se è un'immagine, usa analyzeImage
        if (documentPath && /\.(jpg|jpeg|png|gif|bmp)$/i.test(documentPath)) {
            return await this.analyzeImage({
                imagePath: documentPath,
                prompt: `Extract all information from this document. Extract: ${extractType}`
            });
        }

        // Se è testo, usa extractDataFromText
        if (documentPath && /\.(txt|md)$/i.test(documentPath)) {
            const text = fs.readFileSync(documentPath, 'utf8');
            return await this.extractDataFromText({
                text,
                schema: null,
                format: 'json'
            });
        }

        throw new Error('Unsupported document type');
    }

    /**
     * Estrae tabelle da immagine
     */
    async extractTablesFromImage(task) {
        return await this.analyzeImage({
            ...task,
            prompt: 'Extract all tables from this image. Return as JSON array with rows and columns.'
        });
    }

    /**
     * Estrae QR code da immagine
     */
    async extractQRCode(task) {
        return await this.analyzeImage({
            ...task,
            prompt: 'Extract QR code data from this image. Return the decoded QR code content.'
        });
    }

    /**
     * Estrae dati strutturati (wrapper generico)
     */
    async extractStructuredData(task) {
        const { source, sourceType, schema, format = 'json' } = task;
        
        if (sourceType === 'image' || sourceType === 'photo') {
            return await this.analyzeImage({
                imageBase64: source,
                prompt: schema ? `Extract data matching this schema: ${JSON.stringify(schema)}` : 'Extract all structured data from this image.',
                provider: task.provider
            });
        } else if (sourceType === 'text') {
            return await this.extractDataFromText({
                text: source,
                schema,
                format
            });
        } else {
            throw new Error('Unsupported source type');
        }
    }
}

module.exports = AIAgent;

