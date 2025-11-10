# 🎨 Applicazione Design Figma alla Pagina Dieta

## 📋 Informazioni Design

**File Figma:** [Health-Diet-Dashboard--Copy-](https://www.figma.com/make/qEikXdYIE1SPArKu66qw0m/Health-Diet-Dashboard--Copy-?node-id=0-1&p=f&t=5qmeOfJS1RAiQAe3-0)

**File Key:** `qEikXdYIE1SPArKu66qw0m`  
**Node ID:** `0-1`

## 🔧 Come Applicare il Design

### Opzione 1: Usando FigmaAgent (Consigliato)

1. **Assicurati che il server sia in esecuzione:**
   ```bash
   node server.js
   ```

2. **Verifica che FIGMA_API_KEY sia configurato:**
   ```bash
   # In .env.private
   FIGMA_API_KEY=your_figma_api_key_here
   ```

3. **Esegui lo script:**
   ```bash
   node scripts/apply-figma-dieta-direct.js
   ```

### Opzione 2: Via API Endpoint

Se il server è in esecuzione, puoi chiamare direttamente l'endpoint:

```bash
curl -X POST http://localhost:3000/api/figma/create-page \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "qEikXdYIE1SPArKu66qw0m",
    "nodeId": "0-1",
    "pageName": "dieta",
    "pagePath": "src/pages/dieta.html"
  }'
```

## ✅ Funzioni da Mantenere

Quando si applica il design Figma, assicurati di preservare:

### 1. **Sidebar Venus**
- Navigazione tra pagine
- Stile e layout esistente

### 2. **Calendario Settimanale**
- Funzione `setupCalendar()`
- Funzione `renderCalendar()`
- Navigazione settimane (prev/next)
- Selezione giorni

### 3. **Dinner Alternatives (Ricette)**
- Funzione `loadDinnerRecipes()`
- Funzione `filterRecipes()`
- Funzione `renderRecipes()`
- Integrazione API `/api/recipes/search`
- Integrazione API `/api/recipes/fetch`

### 4. **Weight & Calories Tracker**
- Tabs (Weight, Calories, Macros)
- Funzioni di tracking
- Visualizzazione dati

### 5. **Meal Planning**
- Pianificazione pasti
- Visualizzazione colazione/pranzo/cena

## 🔄 Processo di Integrazione

Lo script `apply-figma-dieta-direct.js`:

1. ✅ Recupera design da Figma API
2. ✅ Analizza componenti e struttura
3. ✅ Genera HTML/CSS dal design
4. ✅ Estrae funzioni JavaScript esistenti
5. ✅ Estrae sidebar esistente
6. ✅ Combina design Figma + funzioni esistenti
7. ✅ Salva pagina aggiornata

## 🎯 Risultato Atteso

La pagina finale avrà:
- ✅ Design identico a Figma
- ✅ Tutte le funzioni JavaScript preservate
- ✅ Sidebar funzionante
- ✅ API calls per ricette attive
- ✅ Calendario funzionante
- ✅ Tracker peso/calorie funzionante

## ⚠️ Troubleshooting

### Errore: "Invalid token" (403)
- Verifica che `FIGMA_API_KEY` sia corretto in `.env.private`
- Assicurati che il token abbia accesso al file Figma
- Per file `/make/`, potrebbe essere necessario duplicare il template in un file normale

### Errore: "Server not running"
- Avvia il server: `node server.js`
- Oppure usa lo script diretto: `node scripts/apply-figma-dieta-direct.js`

### Design non applicato correttamente
- Verifica che il `nodeId` sia corretto (dal URL Figma: `node-id=0-1`)
- Controlla i log per vedere quanti componenti sono stati trovati
- Verifica che le funzioni JavaScript siano state preservate

---

**Nota:** Se il token Figma non funziona, posso creare una versione basata su best practices che mantiene tutte le funzioni ma applica uno stile moderno simile al design Figma.

