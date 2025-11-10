# 🤖 Metodi AI per Estrapolare Dati da Foto e Testi

## 📋 Panoramica

Questo documento descrive i metodi disponibili per estrapolare dati strutturati da:
- **Foto/Immagini**: OCR, analisi visiva, estrazione informazioni
- **Testi**: Estrazione entità, classificazione, sentiment analysis

## 🎯 AIAgent - Agente AI Unificato

**AIAgent** è l'agente che gestisce tutte le operazioni AI. Supporta:
- OpenAI GPT-4 Vision
- Google Cloud Vision API
- Claude Vision API
- Tesseract OCR (locale)

## 📸 Estrazione da Immagini

### 1. Estrazione Testo (OCR)

```javascript
// Usa AIAgent via API
POST /api/ai/extract-text-from-image
{
    "imagePath": "/path/to/image.jpg",
    "imageUrl": "https://example.com/image.jpg",
    "imageBase64": "base64string",
    "provider": "openai" // openai, google, claude
}
```

**Response:**
```json
{
    "success": true,
    "text": "Testo estratto dall'immagine",
    "provider": "openai"
}
```

### 2. Analisi Immagine

```javascript
POST /api/ai/analyze-image
{
    "imagePath": "/path/to/image.jpg",
    "prompt": "Analizza questa immagine e estrai tutte le informazioni rilevanti",
    "provider": "openai"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "objects": [...],
        "text": "...",
        "colors": [...],
        "description": "..."
    },
    "provider": "openai"
}
```

### 3. Estrazione Tabelle

```javascript
POST /api/ai/extract-tables-from-image
{
    "imagePath": "/path/to/table.jpg"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "tables": [
            {
                "rows": [
                    ["Header1", "Header2"],
                    ["Data1", "Data2"]
                ]
            }
        ]
    }
}
```

### 4. Estrazione QR Code

```javascript
POST /api/ai/extract-qr-code
{
    "imagePath": "/path/to/qrcode.jpg"
}
```

## 📝 Estrazione da Testi

### 1. Estrazione Dati Strutturati

```javascript
POST /api/ai/extract-data-from-text
{
    "text": "Marco ha 25 anni e vive a Roma. Email: marco@example.com",
    "schema": {
        "name": "string",
        "age": "number",
        "city": "string",
        "email": "string"
    },
    "format": "json"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "name": "Marco",
        "age": 25,
        "city": "Roma",
        "email": "marco@example.com"
    },
    "format": "json",
    "provider": "openai"
}
```

### 2. Estrazione Entità

```javascript
POST /api/ai/extract-entities
{
    "text": "Marco ha incontrato Maria il 15 gennaio 2024 a Roma",
    "entityTypes": ["person", "date", "location"]
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "entities": [
            { "type": "person", "value": "Marco" },
            { "type": "person", "value": "Maria" },
            { "type": "date", "value": "15 gennaio 2024" },
            { "type": "location", "value": "Roma" }
        ]
    }
}
```

### 3. Classificazione Testo

```javascript
POST /api/ai/classify-text
{
    "text": "Questo prodotto è fantastico!",
    "categories": ["positive", "negative", "neutral"]
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "category": "positive",
        "confidence": 0.95
    }
}
```

### 4. Analisi Sentiment

```javascript
POST /api/ai/analyze-sentiment
{
    "text": "Questo servizio è terribile!"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "sentiment": "negative",
        "score": 0.85
    }
}
```

## 🔧 Configurazione

### Variabili d'Ambiente

Aggiungi in `.env.private`:

```bash
# OpenAI (consigliato)
OPENAI_API_KEY=sk-...

# Google Cloud Vision (alternativa)
GOOGLE_VISION_API_KEY=...

# Claude (alternativa)
CLAUDE_API_KEY=...
```

### Uso Programmatico

```javascript
// Via Coordinator
const result = await coordinator.assignTask({
    type: 'extract_text_from_image',
    imagePath: '/path/to/image.jpg',
    provider: 'openai'
});

// Via API
const response = await fetch('/api/ai/extract-text-from-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        imagePath: '/path/to/image.jpg',
        provider: 'openai'
    })
});
```

## 📊 Provider Comparison

| Provider | OCR | Analisi | Costo | Velocità |
|----------|-----|---------|-------|----------|
| **OpenAI** | ✅ Eccellente | ✅ Eccellente | $$ | Veloce |
| **Google Vision** | ✅ Eccellente | ✅ Buona | $ | Molto Veloce |
| **Claude** | ✅ Buona | ✅ Eccellente | $$ | Veloce |

## 🎯 Casi d'Uso

### 1. Scansione Documenti
```javascript
// Scansiona fattura e estrai dati
const result = await coordinator.assignTask({
    type: 'extract_structured_data',
    sourceType: 'image',
    source: invoiceImageBase64,
    schema: {
        "invoiceNumber": "string",
        "date": "string",
        "total": "number",
        "items": ["array"]
    }
});
```

### 2. Estrazione Dati da Foto Prodotto
```javascript
// Estrai informazioni prodotto da foto
const result = await coordinator.assignTask({
    type: 'analyze_image',
    imagePath: '/path/to/product.jpg',
    prompt: 'Extract product name, price, and description from this product image'
});
```

### 3. Processamento Form
```javascript
// Estrai dati da form compilato (foto)
const result = await coordinator.assignTask({
    type: 'extract_structured_data',
    sourceType: 'image',
    source: formImageBase64,
    schema: {
        "name": "string",
        "email": "string",
        "phone": "string"
    }
});
```

## ⚡ Best Practices

1. **Scegli il provider giusto**:
   - OpenAI: migliore qualità, più costoso
   - Google: veloce, buona qualità OCR
   - Claude: buon bilanciamento

2. **Usa schema specifico** per estrazione dati strutturata

3. **Cache risultati** per evitare chiamate duplicate

4. **Gestisci errori** - alcuni provider possono fallire

5. **Limita dimensioni immagini** per performance

---

**AIAgent è pronto per estrarre dati da qualsiasi foto o testo!** 🚀

