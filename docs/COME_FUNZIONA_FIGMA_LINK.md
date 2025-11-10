# 🔗 Come Funziona: Invio Link Figma a Cursor

**Domanda:** Quando invii un link Figma, come funziona? Chi è competente?

---

## 🎯 Risposta Rapida

Quando invii un link Figma, il processo è:

```
TU → CURSOR CHAT → COORDINATOR → FIGMAAGENT → RISULTATO
```

**Chi è competente:** **FigmaAgent** (gestito da **Coordinator**)

---

## 📋 Processo Dettagliato

### 1️⃣ TU Invii il Link

```
https://www.figma.com/make/Wv47CueEm5hvw1eNfczGfE/Health-Diet-Dashboard?node-id=0-1
```

### 2️⃣ IO (Cursor) Analizzo il Link

Faccio automaticamente:
- ✅ Estraggo **File Key**: `Wv47CueEm5hvw1eNfczGfE`
- ✅ Identifico **Nome**: `Health-Diet-Dashboard`
- ✅ Estraggo **Node ID**: `0-1` (se presente)
- ✅ Capisco che serve analisi design Figma

### 3️⃣ Routing al Sistema Competente

**Coordinator** (sistema di routing intelligente):
- Riceve il task: "analizza design Figma"
- Identifica che serve **FigmaAgent**
- Assegna il task a FigmaAgent

**FigmaAgent** è competente perché:
- ✅ Ha accesso all'API Figma
- ✅ Sa analizzare design e componenti
- ✅ Può generare codice frontend
- ✅ Può collegare design a backend

### 4️⃣ FigmaAgent Lavora

FigmaAgent fa:
1. **Si connette all'API Figma**
   ```javascript
   // Usa FIGMA_API_KEY da .env.private
   GET https://api.figma.com/v1/files/Wv47CueEm5hvw1eNfczGfE
   ```

2. **Scarica il Design**
   - Ottiene struttura completa
   - Estrae componenti
   - Analizza layout e stili

3. **Analizza Componenti**
   - Identifica elementi UI (buttons, cards, etc.)
   - Estrae stili (colori, font, spacing)
   - Identifica struttura dati necessaria

4. **Genera Piano**
   - Componenti React/HTML da creare
   - API endpoints necessari
   - File da modificare/creare

### 5️⃣ FrontendAgent (se necessario)

Se serve integrazione backend:
- **FrontendAgent** collega componenti alle API
- Genera codice di integrazione
- Verifica compatibilità

### 6️⃣ Risultato

Ti propongo:
- ✅ Codice generato (React/HTML)
- ✅ Componenti identificati
- ✅ API endpoints suggeriti
- ✅ File da creare/modificare

---

## 🎨 Esempio Pratico

### Scenario: Pagina Dieta

**TU invii:**
```
https://www.figma.com/make/Wv47CueEm5hvw1eNfczGfE/Health-Diet-Dashboard
```

**IO faccio:**
1. Estraggo: `Wv47CueEm5hvw1eNfczGfE`
2. Chiedo a Coordinator: "Chi gestisce Figma?"
3. Coordinator: "FigmaAgent!"
4. FigmaAgent analizza il design
5. Ti mostro:
   - Componenti trovati (DietStatsCard, MealPlanWidget, etc.)
   - Codice React generato
   - API endpoints necessari

**TU approvi:**
- Io creo i file
- Integro con backend
- Testo funzionalità

---

## 🔧 Chi Fa Cosa

### Coordinator
- **Ruolo:** Router intelligente
- **Fa:** Assegna task agli agenti giusti
- **File:** `agents/coordinator/Coordinator.js`

### FigmaAgent
- **Ruolo:** Specialista Figma
- **Fa:** Analizza design, genera codice
- **File:** `agents/figma/FigmaAgent.js`
- **Capacità:**
  - `fetch_figma_file` - Scarica design
  - `analyze_figma_components` - Analizza componenti
  - `generate_frontend_code` - Genera codice
  - `create_page_from_figma` - Crea pagina completa

### FrontendAgent
- **Ruolo:** Integrazione UI-Backend
- **Fa:** Collega componenti alle API
- **File:** `agents/frontend/FrontendAgent.js`

---

## 💬 Come Comunicare con Me

### Opzione 1: Link Semplice
```
"Ecco il design: https://www.figma.com/make/..."
```
Io analizzo automaticamente.

### Opzione 2: Link + Istruzioni
```
"Analizza questo design Figma [LINK] 
e crea la pagina dieta collegata a /api/diet/*"
```

### Opzione 3: Link + Dettagli
```
"Crea pagina da Figma [LINK]:
- Nome: DietDashboard
- Path: frontend/src/pages/DietDashboard.tsx
- Collega a: /api/diet/profile, /api/diet/stats"
```

---

## 🚀 Workflow Completo

### Step 1: Tu Invii Link
```
https://www.figma.com/make/Wv47CueEm5hvw1eNfczGfE/...
```

### Step 2: Io Analizzo
- Estraggo File Key
- Identifico sistema competente (FigmaAgent)
- Analizzo design

### Step 3: Ti Mostro Piano
- Componenti da creare
- API necessarie
- File da modificare

### Step 4: Tu Approvi
- Confermi o modifichi
- Io implemento

### Step 5: Risultato
- Codice generato
- Integrato con backend
- Testato e funzionante

---

## ⚙️ Configurazione Necessaria

Per far funzionare tutto:

1. **Figma API Key** in `.env.private`:
   ```env
   FIGMA_API_KEY=figd_xxxxxxxxxxxxx
   ```

2. **Server in esecuzione:**
   ```bash
   node server.js
   ```

3. **Agenti inizializzati:**
   - Coordinator registra FigmaAgent
   - FigmaAgent ha accesso a API Figma

---

## 📊 Diagramma Flusso

```
┌─────────────┐
│   TU        │
│  (Link)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CURSOR CHAT │
│  (Analisi)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ COORDINATOR │
│  (Routing)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│FIGMAAGENT   │
│ (Analisi)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│FRONTENDAGENT│
│(Integrazione)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  RISULTATO  │
│  (Codice)   │
└─────────────┘
```

---

## ✅ Checklist

Prima di inviare link Figma:

- [ ] Hai `FIGMA_API_KEY` configurata?
- [ ] Il file Figma è pubblico o hai accesso?
- [ ] Sai quale pagina/componente vuoi creare?
- [ ] Hai identificato API endpoints necessari?

---

## 🎯 Prossimi Passi

**Per la tua pagina Dieta:**

1. **Verifica Configurazione:**
   ```bash
   # Controlla che FIGMA_API_KEY sia presente
   cat .env.private | grep FIGMA_API_KEY
   ```

2. **Testa Connessione:**
   ```bash
   # Avvia server
   node server.js
   
   # In un altro terminale, testa API
   curl http://localhost:3000/api/agents/stats
   ```

3. **Invia Link a Me:**
   ```
   "Analizza questo design Figma: [LINK]
   e crea la pagina dieta"
   ```

4. **Io Analizzo e Genero:**
   - Componenti React
   - Integrazione backend
   - Codice pronto

---

## 💡 Tips

✅ **DO:**
- Invia link completo Figma
- Specifica cosa vuoi creare
- Indica API endpoints se li conosci

❌ **DON'T:**
- Non inviare screenshot (non posso analizzarli)
- Non dimenticare di configurare API Key
- Non aspettare che io modifichi `.env.private` senza permesso

---

**In sintesi:** Quando invii un link Figma, io lo analizzo automaticamente, identifico FigmaAgent come competente, e genero il codice necessario. Tu approvi e io implemento! 🚀

