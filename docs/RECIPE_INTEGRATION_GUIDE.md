# 🍝 Guida Integrazione Ricette GialloZafferano

Guida completa per utilizzare il sistema di integrazione con GialloZafferano.it nella pagina dieta.

## 🎯 Funzionalità

Il sistema integra ricette reali da GialloZafferano.it nella sezione "Alternative per Stasera" della pagina dieta:

- ✅ **Ricerca automatica** ricette per cena (primi e secondi)
- ✅ **Visualizzazione** ricette con immagini, difficoltà, tempi
- ✅ **Filtro** per ingredienti disponibili
- ✅ **Dettagli completi** con ingredienti e istruzioni
- ✅ **Aggiunta ingredienti mancanti** alla lista spesa

## 🚀 Come Funziona

### 1. Caricamento Automatico

All'apertura della pagina, il sistema:
1. Cerca automaticamente ricette su GialloZafferano (query: "pasta", "risotto")
2. Fetcha i dettagli completi delle prime 10 ricette
3. Filtra solo ricette di categoria "primo" o "secondo"
4. Mostra le ricette nella sezione "Alternative per Stasera"

### 2. Ricerca e Filtro

- **Barra di ricerca**: Digita per filtrare ricette per nome, descrizione o tag
- **Filtro ingredienti**: Le ricette vengono marcate come "Puoi prepararlo" se hai tutti gli ingredienti

### 3. Dettagli Ricetta

Clicca su una ricetta per vedere:
- Nome e descrizione
- Lista completa ingredienti con quantità
- Istruzioni passo-passo
- Tempo totale e porzioni

### 4. Aggiunta alla Lista Spesa

Per ricette con ingredienti mancanti:
- Clicca "Aggiungi X ingredienti alla lista"
- Gli ingredienti mancanti vengono aggiunti alla lista spesa

## 📡 API Utilizzate

Il sistema utilizza gli endpoint API del RecipeAgent:

```javascript
// Cerca ricette
POST /api/recipes/search
{
  "query": "pasta carbonara",
  "limit": 10
}

// Fetch ricetta completa
POST /api/recipes/fetch
{
  "url": "https://www.giallozafferano.it/ricette/...",
  "saveToDatabase": false,
  "downloadImage": false
}
```

## 🔧 Configurazione

### Variabili Ambiente

Aggiungi in `.env.private`:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB_NAME=lifemanager
```

### Dipendenze

Le dipendenze necessarie sono già installate:
- `axios` - Per richieste HTTP
- `cheerio` - Per scraping HTML
- `mongodb` - Per database

## 🎨 Personalizzazione

### Modificare Query di Ricerca

In `src/pages/dieta.html`, funzione `loadDinnerRecipes()`:

```javascript
const searchQueries = ['pasta', 'risotto', 'secondo piatto', 'pesce', 'pollo'];
```

### Modificare Numero Ricette

```javascript
const recipesToFetch = allResults.slice(0, 10); // Cambia 10 con il numero desiderato
```

### Aggiungere Filtri

Modifica la funzione `filterRecipes()` per aggiungere filtri personalizzati (difficoltà, tempo, etc.)

## 🐛 Troubleshooting

### Ricette non si caricano

1. Verifica che il server sia avviato: `node server.js`
2. Controlla la console browser per errori
3. Verifica che gli endpoint API rispondano: `curl http://localhost:3000/api/recipes/search`

### Errori di scraping

- GialloZafferano potrebbe aver cambiato struttura HTML
- Verifica `agents/recipe/RecipeAgent.js` e aggiorna i selettori CSS se necessario

### Immagini non caricano

- Le immagini vengono caricate direttamente da GialloZafferano
- Se ci sono problemi CORS, considera di scaricare le immagini localmente

## 📝 Note

- Il sistema rispetta le policy di GialloZafferano
- Le ricette vengono cacheate in memoria durante la sessione
- Per persistenza, configura MongoDB e usa `saveToDatabase: true`

## 🔄 Prossimi Miglioramenti

- [ ] Cache ricette in localStorage
- [ ] Integrazione completa con lista spesa
- [ ] Filtri avanzati (difficoltà, tempo, calorie)
- [ ] Salvataggio ricette preferite
- [ ] Suggerimenti basati su ingredienti disponibili

