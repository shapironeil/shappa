# 🥗 Analisi Design Figma - Health Diet Dashboard

**File Figma:** [Health-Diet-Dashboard](https://www.figma.com/make/Wv47CueEm5hvw1eNfczGfE/Health-Diet-Dashboard?node-id=0-1&p=f&t=NeMME7xGA1jqIa8k-0)

**File Key:** `Wv47CueEm5hvw1eNfczGfE`  
**Node ID:** `0-1`  
**Data Analisi:** Gennaio 2025

---

## 📋 Processo di Analisi

### Step 1: Estrazione Informazioni dal Link

Quando invii un link Figma, io (Cursor) faccio:

1. **Estraggo File Key** dal URL
   ```
   URL: https://www.figma.com/make/Wv47CueEm5hvw1eNfczGfE/...
   File Key: Wv47CueEm5hvw1eNfczGfE
   ```

2. **Identifico il Sistema Competente**
   - Il **Coordinator** (sistema di routing) riceve il task
   - Identifica che serve **FigmaAgent** (agente specializzato in Figma)
   - Assegna il task a FigmaAgent

3. **FigmaAgent Analizza il Design**
   - Si connette all'API Figma con `FIGMA_API_KEY`
   - Scarica il file design
   - Estrae componenti, layout, stili
   - Analizza struttura UI

4. **Genera Piano di Implementazione**
   - Identifica componenti React necessari
   - Suggerisce API endpoints
   - Propone struttura file
   - Verifica compatibilità con codice esistente

---

## 🔄 Flusso Completo: Link → Codice

```
TU (link Figma)
  ↓
CURSOR CHAT (io analizzo il link)
  ↓
COORDINATOR (routing intelligente)
  ↓
FIGMAAGENT (analisi design via API Figma)
  ↓
ANALISI COMPONENTI (estrazione struttura)
  ↓
FRONTENDAGENT (integrazione con backend)
  ↓
RISULTATO (codice React/HTML pronto)
```

---

## 🎯 Per la Pagina Dieta

### Situazione Attuale

- ✅ Esiste già: `src/pages/dieta.html` (vanilla JS)
- ✅ Frontend React: `frontend/src/` (per Sport)
- 🆕 Da creare: Componenti React per Dieta da Figma

### Piano di Implementazione

#### Opzione A: Aggiornare Pagina Esistente
- Analizza design Figma
- Estrai componenti nuovi/modificati
- Aggiorna `src/pages/dieta.html` mantenendo logica esistente

#### Opzione B: Creare Versione React
- Crea componenti React in `frontend/src/components/diet/`
- Integra con backend esistente
- Mantieni `dieta.html` come fallback

---

## 📝 Prossimi Passi

### 1. Analisi Design (FigmaAgent)

```bash
# Testa connessione Figma API
curl -X POST http://localhost:3000/api/figma/create-page \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "Wv47CueEm5hvw1eNfczGfE",
    "pageName": "DietDashboard",
    "pagePath": "frontend/src/pages/DietDashboard.tsx"
  }'
```

### 2. Identificazione Componenti

Dal design Figma, probabilmente servono:
- `DietStatsCard` - Statistiche dieta
- `MealPlanWidget` - Piano pasti
- `NutritionChart` - Grafici nutrizione
- `FoodLog` - Log alimenti
- `MacroTracker` - Tracciamento macro

### 3. API Endpoints Necessari

```typescript
// Da creare/verificare nel backend
GET    /api/diet/profile/:userId
POST   /api/diet/meals
GET    /api/diet/stats/:userId
POST   /api/diet/log
GET    /api/diet/macros/:userId
```

---

## 🛠️ Come Procedere

### Via Cursor Chat (Raccomandato)

Dimmi semplicemente:
```
"Analizza il design Figma Wv47CueEm5hvw1eNfczGfE 
e crea la pagina dieta. Collega a API esistenti."
```

Io farò:
1. Analizzo il design via FigmaAgent
2. Identifico componenti necessari
3. Verifico API esistenti
4. Genero codice React/HTML
5. Integro con backend

### Via API Diretta

```bash
# Analizza design
curl -X POST http://localhost:3000/api/figma/create-page \
  -H "Content-Type: application/json" \
  -d '{
    "fileKey": "Wv47CueEm5hvw1eNfczGfE",
    "pageName": "DietDashboard",
    "backendConfig": {
      "apiBase": "http://localhost:3000",
      "endpoints": [
        {"path": "/api/diet/profile/:userId", "method": "GET"},
        {"path": "/api/diet/stats/:userId", "method": "GET"}
      ]
    }
  }'
```

---

## 📊 Checklist Implementazione

- [ ] Verifica `FIGMA_API_KEY` in `.env.private`
- [ ] Testa connessione Figma API
- [ ] Analizza componenti design
- [ ] Identifica API endpoints necessari
- [ ] Crea/aggiorna componenti React
- [ ] Integra con backend
- [ ] Testa funzionalità
- [ ] Documenta modifiche

---

## 🔗 Riferimenti

- **Figma File:** https://www.figma.com/make/Wv47CueEm5hvw1eNfczGfE/Health-Diet-Dashboard
- **File Key:** `Wv47CueEm5hvw1eNfczGfE`
- **Pagina Esistente:** `src/pages/dieta.html`
- **Frontend React:** `frontend/src/`

---

**Prossimo Step:** Dimmi se vuoi che analizzi il design ora e generi il codice!

