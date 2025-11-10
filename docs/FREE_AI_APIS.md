# 🤖 AI Gratuite per Estrazione Dati

## Panoramica

Questo documento elenca servizi AI gratuiti che possono essere utilizzati per estrarre dati da foto e testi, senza necessità di token o con token gratuiti.

## 🆓 Servizi Completamente Gratuiti

### 1. Qwen AI (Alibaba Cloud)
- **URL**: https://www.qwen-ai.net/
- **Caratteristiche**:
  - 1000 chiamate API gratuite al mese
  - Supporta vision (analisi immagini)
  - Supporta text extraction
  - Modelli open-weight (Apache-2.0)
- **API Endpoint**: `https://api.qwen-ai.net/v1/chat/completions`
- **Uso**: Richiede API key (gratuita)
- **Limiti**: 1000 chiamate/mese

### 2. Puter.js - Qwen API Gratuita
- **URL**: https://developer.puter.com/tutorials/free-unlimited-qwen-api
- **Caratteristiche**:
  - Accesso gratuito e illimitato ai modelli Qwen
  - Nessuna chiave API richiesta
  - Supporta vision e text
- **Uso**: Tramite Puter.js SDK
- **Limiti**: Nessuno (gratuito)

### 3. Hugging Face Inference API
- **URL**: https://huggingface.co/inference-api
- **Caratteristiche**:
  - Modelli gratuiti per OCR e vision
  - API pubblica disponibile
  - Modelli come: `microsoft/trocr-base-printed`, `facebook/detr-resnet-50`
- **Uso**: Richiede token Hugging Face (gratuito)
- **Limiti**: Rate limit generoso

### 4. Google Cloud Vision API (Free Tier)
- **URL**: https://cloud.google.com/vision/docs
- **Caratteristiche**:
  - 1000 richieste/mese gratuite
  - OCR eccellente
  - Text detection
  - Label detection
- **Uso**: Richiede account Google Cloud (free tier)
- **Limiti**: 1000 richieste/mese

### 5. Tesseract OCR (Locale)
- **URL**: https://github.com/tesseract-ocr/tesseract
- **Caratteristiche**:
  - Completamente gratuito e open source
  - Funziona localmente (no API)
  - Supporta molte lingue
- **Uso**: Installazione locale, nessuna API
- **Limiti**: Nessuno (locale)

## 💰 Servizi con Free Tier Generoso

### 6. OpenAI (Free Tier Limitato)
- **Free Tier**: Molto limitato
- **Consigliato**: Solo per test, non produzione gratuita

### 7. Anthropic Claude (Free Tier Limitato)
- **Free Tier**: Molto limitato
- **Consigliato**: Solo per test

## 🎯 Raccomandazioni per LifeManager

### Per OCR e Estrazione Testo da Immagini:
1. **Prima scelta**: **Qwen AI** (1000 chiamate/mese gratuite)
2. **Seconda scelta**: **Google Cloud Vision** (1000 richieste/mese)
3. **Terza scelta**: **Tesseract OCR** (locale, illimitato)

### Per Analisi Immagini:
1. **Prima scelta**: **Qwen AI** (vision models)
2. **Seconda scelta**: **Hugging Face Inference API**

### Implementazione Consigliata:

```javascript
// Configurazione AIAgent con provider gratuiti
const aiConfig = {
    providers: {
        qwen: {
            apiKey: process.env.QWEN_API_KEY, // Gratuita
            apiBase: 'https://api.qwen-ai.net/v1',
            freeLimit: 1000 // chiamate/mese
        },
        huggingface: {
            apiKey: process.env.HUGGINGFACE_API_KEY, // Gratuita
            apiBase: 'https://api-inference.huggingface.co',
            models: {
                ocr: 'microsoft/trocr-base-printed',
                vision: 'facebook/detr-resnet-50'
            }
        },
        tesseract: {
            // Locale, nessuna API key
            enabled: true
        }
    }
};
```

## 📝 Note Implementative

1. **Fallback Chain**: Implementare fallback tra provider gratuiti
2. **Rate Limiting**: Rispettare i limiti dei free tier
3. **Caching**: Cache risultati per evitare chiamate duplicate
4. **Locale First**: Usare Tesseract per operazioni semplici

## 🔗 Link Utili

- Qwen AI: https://www.qwen-ai.net/
- Puter.js Qwen: https://developer.puter.com/tutorials/free-unlimited-qwen-api
- Hugging Face: https://huggingface.co/inference-api
- Google Cloud Vision: https://cloud.google.com/vision/docs
- Tesseract OCR: https://github.com/tesseract-ocr/tesseract

---

**Aggiornato**: Novembre 2024

